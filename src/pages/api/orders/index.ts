import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/db'
import { withAuth } from '@/lib/auth/middleware'
import { createTranslator } from '@/lib/i18n'
import { z } from 'zod'

const createOrderSchema = z.object({
  items: z.array(z.object({
    product_id: z.string(),
    quantity: z.number().int().positive(),
  })).min(1),
  delivery_type: z.enum(['DELIVERY', 'SELF_PICKUP']),
  delivery_address_id: z.string().optional().nullable(),
  rental_start_date: z.string(),
  rental_end_date: z.string(),
  payment_method: z.enum(['PAYME', 'CLICK', 'UZUM']),
  card_id: z.string().optional().nullable(), // For future use with saved cards
  notes: z.string().optional().nullable(),
})

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const t = createTranslator(req)

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: t('methodNotAllowed'),
    })
  }

  try {
    const body = createOrderSchema.parse(req.body)

    const startDate = new Date(body.rental_start_date)
    const endDate = new Date(body.rental_end_date)

    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        message: t('invalidDates'),
      })
    }

    // Validate delivery address if delivery type is DELIVERY
    if (body.delivery_type === 'DELIVERY') {
      if (!body.delivery_address_id) {
        return res.status(400).json({
          success: false,
          message: t('addressRequired'),
        })
      }

      const address = await prisma.address.findFirst({
        where: { id: body.delivery_address_id, userId },
      })

      if (!address) {
        return res.status(400).json({
          success: false,
          message: t('addressRequired'),
        })
      }
    }

    // For now, online payments (Payme, Click, Uzum) are mock
    // In production, this would redirect to payment provider or process via API
    // Card validation is optional for future saved cards feature
    let userCard = null
    if (body.card_id) {
      userCard = await prisma.card.findFirst({
        where: { id: body.card_id, userId },
      })
    }

    // Get products and validate availability
    const productIds = body.items.map((item) => item.product_id)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: {
        pricingTiers: true,
        quantityPricing: true,
      },
    })

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: t('productNotFound'),
      })
    }

    // Calculate rental days
    const rentalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (rentalDays < 1) {
      return res.status(400).json({
        success: false,
        message: t('minRentalDays'),
      })
    }

    // Calculate prices and check availability
    let subtotal = 0
    let totalSavings = 0
    const orderItems: any[] = []

    for (const item of body.items) {
      const product = products.find((p) => p.id === item.product_id)!

      // Check availability
      const reservedQty = await getReservedQuantity(
        item.product_id,
        startDate,
        endDate
      )
      if (product.totalStock - reservedQty < item.quantity) {
        return res.status(400).json({
          success: false,
          message: t('insufficientStock'),
        })
      }

      // Calculate price
      const { totalPrice, savings } = calculateItemPrice(
        product,
        item.quantity,
        rentalDays
      )

      subtotal += totalPrice
      totalSavings += savings

      orderItems.push({
        productId: item.product_id,
        productName: product.name,
        productPhoto: product.photos[0] || null,
        quantity: item.quantity,
        dailyPrice: product.dailyPrice,
        totalPrice,
        savings,
      })
    }

    // Calculate delivery fee
    let deliveryFee = 0
    if (body.delivery_type === 'DELIVERY' && body.delivery_address_id) {
      // Check if Tashkent (free) or region (paid)
      const address = await prisma.address.findUnique({
        where: { id: body.delivery_address_id },
      })
      if (address && address.city.toLowerCase() !== 'ташкент' && address.city.toLowerCase() !== 'tashkent') {
        // Get regional delivery price
        const zone = await prisma.deliveryZone.findFirst({
          where: { name: address.city, isActive: true },
        })
        deliveryFee = zone?.price || 0
      }
    }

    // Generate order number
    const orderNumber = await generateOrderNumber()

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        status: 'CONFIRMED',
        deliveryType: body.delivery_type,
        deliveryAddressId: body.delivery_address_id,
        deliveryFee,
        subtotal,
        totalAmount: subtotal + deliveryFee,
        totalSavings,
        rentalStartDate: startDate,
        rentalEndDate: endDate,
        paymentMethod: body.payment_method,
        paymentStatus: 'PENDING', // Will be updated when payment is completed
        notes: body.notes,
        items: {
          create: orderItems,
        },
        statusHistory: {
          create: {
            status: 'CONFIRMED',
            notes: 'Order created',
          },
        },
      },
      include: {
        items: true,
        deliveryAddress: true,
      },
    })

    return res.status(201).json({
      success: true,
      message: t('orderCreated'),
      data: formatOrder(order),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: t('validationError'),
        errors: error.errors,
      })
    }

    console.error('Create order error:', error)
    return res.status(500).json({
      success: false,
      message: t('internalServerError'),
    })
  }
}

async function getReservedQuantity(
  productId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const overlappingOrders = await prisma.order.findMany({
    where: {
      status: { in: ['CONFIRMED', 'PREPARING', 'DELIVERED'] },
      rentalStartDate: { lte: endDate },
      rentalEndDate: { gte: startDate },
      items: { some: { productId } },
    },
    include: {
      items: { where: { productId } },
    },
  })

  return overlappingOrders.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
  }, 0)
}

function calculateItemPrice(
  product: any,
  quantity: number,
  rentalDays: number
): { totalPrice: number; savings: number } {
  const fullPrice = product.dailyPrice * quantity * rentalDays

  if (rentalDays === 1) {
    // Use quantity pricing
    const tier = product.quantityPricing?.find((qp: any) => qp.quantity === quantity)
    if (tier) {
      return {
        totalPrice: tier.totalPrice,
        savings: fullPrice - tier.totalPrice,
      }
    }
  } else {
    // Use day pricing
    const tier = product.pricingTiers?.find((pt: any) => pt.days === rentalDays)
    if (tier) {
      const totalPrice = tier.totalPrice * quantity
      return {
        totalPrice,
        savings: fullPrice - totalPrice,
      }
    }
  }

  return { totalPrice: fullPrice, savings: 0 }
}

async function generateOrderNumber(): Promise<string> {
  const date = new Date()
  const prefix = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`

  const lastOrder = await prisma.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: 'desc' },
  })

  let sequence = 1
  if (lastOrder) {
    const lastSeq = parseInt(lastOrder.orderNumber.slice(-4), 10)
    sequence = lastSeq + 1
  }

  return `${prefix}${String(sequence).padStart(4, '0')}`
}

function formatOrder(order: any) {
  return {
    id: order.id,
    order_number: order.orderNumber,
    user_id: order.userId,
    status: order.status,
    items: order.items.map((item: any) => ({
      id: item.id,
      product_id: item.productId,
      product_name: item.productName,
      product_photo: item.productPhoto,
      quantity: item.quantity,
      daily_price: item.dailyPrice,
      total_price: item.totalPrice,
      savings: item.savings,
    })),
    delivery_type: order.deliveryType,
    delivery_address: order.deliveryAddress ? {
      id: order.deliveryAddress.id,
      user_id: order.deliveryAddress.userId,
      title: order.deliveryAddress.title,
      full_address: order.deliveryAddress.fullAddress,
      city: order.deliveryAddress.city,
      district: order.deliveryAddress.district,
      street: order.deliveryAddress.street,
      building: order.deliveryAddress.building,
      apartment: order.deliveryAddress.apartment,
      entrance: order.deliveryAddress.entrance,
      floor: order.deliveryAddress.floor,
      latitude: order.deliveryAddress.latitude,
      longitude: order.deliveryAddress.longitude,
      is_default: order.deliveryAddress.isDefault,
      created_at: order.deliveryAddress.createdAt,
    } : null,
    delivery_fee: order.deliveryFee,
    subtotal: order.subtotal,
    total_amount: order.totalAmount,
    total_savings: order.totalSavings,
    rental_start_date: order.rentalStartDate,
    rental_end_date: order.rentalEndDate,
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus,
    notes: order.notes,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  }
}

export default withAuth(handler)
