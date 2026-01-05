import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/db'
import { requireAdminAuth } from '@/lib/auth/admin-middleware'
import { createTranslator } from '@/lib/i18n'
import { z } from 'zod'

const categorySchema = z.object({
  id: z.string().optional(), // For updates
  name: z.string().min(1),
  image_url: z.string().optional().nullable(),
  icon_name: z.string().optional().nullable(),
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
          icon_name: cat.iconName,
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
          iconName: body.icon_name,
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
          icon_name: category.iconName,
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

  if (req.method === 'PUT') {
    try {
      const body = categorySchema.parse(req.body)

      if (!body.id) {
        return res.status(400).json({
          success: false,
          message: 'Category ID is required for update',
        })
      }

      const category = await prisma.category.update({
        where: { id: body.id },
        data: {
          name: body.name,
          imageUrl: body.image_url,
          iconName: body.icon_name,
          displayOrder: body.display_order,
          isActive: body.is_active,
        },
      })

      return res.status(200).json({
        success: true,
        data: {
          id: category.id,
          name: category.name,
          image_url: category.imageUrl,
          icon_name: category.iconName,
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

      console.error('Admin update category error:', error)
      return res.status(500).json({
        success: false,
        message: t('internalServerError'),
      })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id, force } = req.query

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Category ID is required',
        })
      }

      // Check if category exists and get product count
      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          _count: { select: { products: true } },
        },
      })

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Категория не найдена',
        })
      }

      // If category has products, require force=true or return warning
      if (category._count.products > 0) {
        if (force !== 'true') {
          return res.status(400).json({
            success: false,
            message: `Категория содержит ${category._count.products} товар(ов). Все товары будут удалены вместе с категорией.`,
            products_count: category._count.products,
            requires_confirmation: true,
          })
        }

        // Force delete: delete all products first, then category
        await prisma.$transaction(async (tx) => {
          // Get all products in this category
          const products = await tx.product.findMany({
            where: { categoryId: id },
            select: { id: true },
          })

          const productIds = products.map((p) => p.id)

          // Delete related data for all products
          await tx.pricingTier.deleteMany({ where: { productId: { in: productIds } } })
          await tx.quantityPricing.deleteMany({ where: { productId: { in: productIds } } })
          await tx.favorite.deleteMany({ where: { productId: { in: productIds } } })

          // Check for products with orders - deactivate instead of delete
          const productsWithOrders = await tx.orderItem.findMany({
            where: { productId: { in: productIds } },
            select: { productId: true },
            distinct: ['productId'],
          })
          const productIdsWithOrders = productsWithOrders.map((p) => p.productId)
          const productIdsToDelete = productIds.filter((id) => !productIdsWithOrders.includes(id))

          // Deactivate products with orders
          if (productIdsWithOrders.length > 0) {
            await tx.product.updateMany({
              where: { id: { in: productIdsWithOrders } },
              data: { isActive: false, categoryId: id }, // Keep in category for now
            })
          }

          // Delete products without orders
          if (productIdsToDelete.length > 0) {
            await tx.product.deleteMany({
              where: { id: { in: productIdsToDelete } },
            })
          }

          // Finally delete the category
          await tx.category.delete({ where: { id } })
        })

        return res.status(200).json({
          success: true,
          message: 'Категория и все товары удалены',
        })
      }

      // No products, safe to delete
      await prisma.category.delete({
        where: { id },
      })

      return res.status(200).json({
        success: true,
        message: 'Категория удалена',
      })
    } catch (error) {
      console.error('Admin delete category error:', error)
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
