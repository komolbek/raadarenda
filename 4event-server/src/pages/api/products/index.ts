import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/db'
import { createTranslator } from '@/lib/i18n'
import { logRequest, logResponse } from '@/lib/logger'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const startTime = Date.now()
  const t = createTranslator(req)

  logRequest(req)

  if (req.method !== 'GET') {
    logResponse(req, 405, startTime, 'Method not allowed')
    return res.status(405).json({
      success: false,
      message: t('methodNotAllowed'),
    })
  }

  try {
    const {
      category_id,
      search,
      page = '1',
      limit = '20',
      sort = 'newest', // Frontend uses: newest, popular, price_asc, price_desc
      sort_by,
      sort_order = 'asc',
    } = req.query

    const pageNum = parseInt(page as string, 10)
    const limitNum = Math.min(parseInt(limit as string, 10), 50)
    const skip = (pageNum - 1) * limitNum

    const where: any = { isActive: true }

    if (category_id) {
      where.categoryId = category_id as string
    }

    if (search) {
      where.name = { contains: search as string, mode: 'insensitive' }
    }

    // Handle both old (sort_by/sort_order) and new (sort) parameter styles
    let orderBy: any = {}
    const sortValue = sort as string

    if (sort_by) {
      // Legacy support for sort_by/sort_order params
      if (sort_by === 'price') {
        orderBy.dailyPrice = sort_order === 'desc' ? 'desc' : 'asc'
      } else if (sort_by === 'name') {
        orderBy.name = sort_order === 'desc' ? 'desc' : 'asc'
      } else {
        orderBy.createdAt = 'desc'
      }
    } else {
      // New sort param handling
      switch (sortValue) {
        case 'price_asc':
          orderBy.dailyPrice = 'asc'
          break
        case 'price_desc':
          orderBy.dailyPrice = 'desc'
          break
        case 'popular':
          // Will be handled separately with order count
          orderBy = undefined
          break
        case 'newest':
        default:
          orderBy.createdAt = 'desc'
          break
      }
    }

    let products: any[]
    let totalCount: number

    if (sortValue === 'popular' && !sort_by) {
      // For popularity sort, count orders per product using aggregation
      // First get all products with their order counts
      const productsWithOrderCount = await prisma.product.findMany({
        where,
        include: {
          pricingTiers: true,
          quantityPricing: true,
          _count: {
            select: { orderItems: true }
          }
        },
      })

      // Sort by order count (descending), then by createdAt
      productsWithOrderCount.sort((a, b) => {
        const countDiff = b._count.orderItems - a._count.orderItems
        if (countDiff !== 0) return countDiff
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })

      totalCount = productsWithOrderCount.length

      // Apply pagination
      products = productsWithOrderCount.slice(skip, skip + limitNum)
    } else {
      // Standard query with ordering
      [products, totalCount] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            pricingTiers: true,
            quantityPricing: true,
          },
          orderBy,
          skip,
          take: limitNum,
        }),
        prisma.product.count({ where }),
      ])
    }

    const totalPages = Math.ceil(totalCount / limitNum)

    logResponse(req, 200, startTime)
    return res.status(200).json({
      success: true,
      data: products.map((p) => formatProduct(p)),
      pagination: {
        current_page: pageNum,
        limit: limitNum,
        total_count: totalCount,
        total_pages: totalPages,
        has_more: pageNum < totalPages,
      },
    })
  } catch (error) {
    console.error('Get products error:', error)
    logResponse(req, 500, startTime, error instanceof Error ? error.message : 'Unknown error')
    return res.status(500).json({
      success: false,
      message: t('internalServerError'),
    })
  }
}

function formatProduct(product: any) {
  return {
    id: product.id,
    name: product.name,
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
    pricing_tiers: product.pricingTiers?.map((tier: any) => ({
      days: tier.days,
      total_price: tier.totalPrice,
    })) || [],
    quantity_pricing: product.quantityPricing?.map((qp: any) => ({
      quantity: qp.quantity,
      total_price: qp.totalPrice,
    })) || [],
    total_stock: product.totalStock,
    is_active: product.isActive,
    created_at: product.createdAt,
  }
}
