import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/db'
import { createTranslator } from '@/lib/i18n'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const t = createTranslator(req)
  const { id } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: t('methodNotAllowed'),
    })
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: id as string },
      include: {
        pricingTiers: true,
        quantityPricing: true,
        category: true,
      },
    })

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: t('productNotFound'),
      })
    }

    return res.status(200).json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        category_id: product.categoryId,
        photos: product.photos,
        specifications: {
          width: product.specWidth,
          height: product.specHeight,
          depth: product.specDepth,
          weight: product.specWeight,
          color: product.specColor,
          material: product.specMaterial,
        },
        daily_price: product.dailyPrice,
        pricing_tiers: product.pricingTiers.map((tier) => ({
          days: tier.days,
          total_price: tier.totalPrice,
        })),
        quantity_pricing: product.quantityPricing.map((qp) => ({
          quantity: qp.quantity,
          total_price: qp.totalPrice,
        })),
        total_stock: product.totalStock,
        is_active: product.isActive,
        created_at: product.createdAt,
      },
    })
  } catch (error) {
    console.error('Get product error:', error)
    return res.status(500).json({
      success: false,
      message: t('internalServerError'),
    })
  }
}
