import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    })
  }

  try {
    // Try to get from database, fallback to defaults
    let settings = await prisma.businessSettings.findUnique({
      where: { id: 'default' },
    })

    // If no settings in DB, create defaults
    if (!settings) {
      settings = await prisma.businessSettings.upsert({
        where: { id: 'default' },
        update: {},
        create: {
          id: 'default',
          name: '4Event',
          phone: '+998888008002',
          address: 'Ташкент, Узбекистан',
          workingHours: '09:00 - 18:00',
          telegramUrl: null,
        },
      })
    }

    return res.status(200).json({
      success: true,
      data: {
        name: settings.name,
        phone: settings.phone,
        address: settings.address,
        latitude: settings.latitude ? Number(settings.latitude) : null,
        longitude: settings.longitude ? Number(settings.longitude) : null,
        working_hours: settings.workingHours,
        telegram_url: settings.telegramUrl,
        delivery_info: {
          available_city: 'Ташкент',
          delivery_fee: 0,
          note: 'Бесплатная доставка по Ташкенту',
        },
      },
    })
  } catch (error) {
    console.error('Get business info error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}
