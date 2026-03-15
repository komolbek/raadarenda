import prisma from '@/lib/db'
import { withErrorHandler, ApiError } from '@/lib/api/error-handler'
import { createTranslator } from '@/lib/i18n'

export default withErrorHandler({ methods: ['GET'] }, async (req, res) => {
  const t = createTranslator(req)
  const { id, start_date, end_date } = req.query

  const productId = id as string
  const startDate = new Date(start_date as string)
  const endDate = new Date(end_date as string)

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new ApiError(400, t('invalidDates'))
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product || !product.isActive) {
    throw new ApiError(404, t('productNotFound'))
  }

  // Calculate reserved quantity for the date range
  const overlappingOrders = await prisma.order.findMany({
    where: {
      status: { in: ['CONFIRMED', 'PREPARING', 'DELIVERED'] },
      rentalStartDate: { lte: endDate },
      rentalEndDate: { gte: startDate },
      items: {
        some: { productId }
      }
    },
    include: {
      items: {
        where: { productId }
      }
    }
  })

  const reservedQuantity = overlappingOrders.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
  }, 0)

  const availableQuantity = Math.max(0, product.totalStock - reservedQuantity)

  return res.status(200).json({
    success: true,
    data: {
      product_id: productId,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      available_quantity: availableQuantity,
    },
  })
})
