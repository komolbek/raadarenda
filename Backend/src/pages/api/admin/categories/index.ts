import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/db'
import { requireAdminAuth } from '@/lib/auth/admin-middleware'
import { createTranslator } from '@/lib/i18n'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1),
  image_url: z.string().optional().nullable(),
  display_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
})

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const t = createTranslator(req)

  if (req.method === 'GET') {
    try {
      const categories = await prisma.category.findMany({
        include: {
          _count: { select: { products: true } },
        },
        orderBy: { displayOrder: 'asc' },
      })

      return res.status(200).json({
        success: true,
        data: categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          image_url: cat.imageUrl,
          display_order: cat.displayOrder,
          is_active: cat.isActive,
          products_count: cat._count.products,
          created_at: cat.createdAt,
        })),
      })
    } catch (error) {
      console.error('Admin get categories error:', error)
      return res.status(500).json({
        success: false,
        message: t('internalServerError'),
      })
    }
  }

  if (req.method === 'POST') {
    try {
      const body = categorySchema.parse(req.body)

      // Get max display order
      const maxOrder = await prisma.category.aggregate({
        _max: { displayOrder: true },
      })

      const category = await prisma.category.create({
        data: {
          name: body.name,
          imageUrl: body.image_url,
          displayOrder: body.display_order ?? (maxOrder._max.displayOrder ?? 0) + 1,
          isActive: body.is_active ?? true,
        },
      })

      return res.status(201).json({
        success: true,
        data: {
          id: category.id,
          name: category.name,
          image_url: category.imageUrl,
          display_order: category.displayOrder,
          is_active: category.isActive,
          created_at: category.createdAt,
        },
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: t('validationError'),
          errors: error.errors,
        })
      }

      console.error('Admin create category error:', error)
      return res.status(500).json({
        success: false,
        message: t('internalServerError'),
      })
    }
  }

  return res.status(405).json({
    success: false,
    message: t('methodNotAllowed'),
  })
}

export default requireAdminAuth(handler)
