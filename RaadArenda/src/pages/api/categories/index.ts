import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/db'
import { createTranslator } from '@/lib/i18n'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const t = createTranslator(req)

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: t('methodNotAllowed'),
    })
  }

  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
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
        created_at: cat.createdAt,
      })),
    })
  } catch (error) {
    console.error('Get categories error:', error)
    return res.status(500).json({
      success: false,
      message: t('internalServerError'),
    })
  }
}
