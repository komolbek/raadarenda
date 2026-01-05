import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/db'
import { withAuth } from '@/lib/auth/middleware'
import { createTranslator } from '@/lib/i18n'
import { z } from 'zod'

const addressSchema = z.object({
  title: z.string().min(1),
  full_address: z.string().min(1),
  city: z.string().min(1),
  district: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  building: z.string().optional().nullable(),
  apartment: z.string().optional().nullable(),
  entrance: z.string().optional().nullable(),
  floor: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
})

const MAX_ADDRESSES = 5

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const t = createTranslator(req)

  if (req.method === 'GET') {
    try {
      const addresses = await prisma.address.findMany({
        where: { userId },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      })

      return res.status(200).json({
        success: true,
        data: addresses.map(formatAddress),
      })
    } catch (error) {
      console.error('Get addresses error:', error)
      return res.status(500).json({
        success: false,
        message: t('internalServerError'),
      })
    }
  }

  if (req.method === 'POST') {
    try {
      const body = addressSchema.parse(req.body)

      // Check max addresses
      const count = await prisma.address.count({ where: { userId } })
      if (count >= MAX_ADDRESSES) {
        return res.status(400).json({
          success: false,
          message: t('maxAddressesReached'),
        })
      }

      // If this is the first address, make it default
      const isFirst = count === 0

      const address = await prisma.address.create({
        data: {
          userId,
          title: body.title,
          fullAddress: body.full_address,
          city: body.city,
          district: body.district,
          street: body.street,
          building: body.building,
          apartment: body.apartment,
          entrance: body.entrance,
          floor: body.floor,
          latitude: body.latitude,
          longitude: body.longitude,
          isDefault: isFirst,
        },
      })

      return res.status(201).json({
        success: true,
        message: t('addressCreated'),
        data: formatAddress(address),
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: t('validationError'),
          errors: error.errors,
        })
      }

      console.error('Create address error:', error)
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

function formatAddress(address: any) {
  return {
    id: address.id,
    user_id: address.userId,
    title: address.title,
    full_address: address.fullAddress,
    city: address.city,
    district: address.district,
    street: address.street,
    building: address.building,
    apartment: address.apartment,
    entrance: address.entrance,
    floor: address.floor,
    latitude: address.latitude ? Number(address.latitude) : null,
    longitude: address.longitude ? Number(address.longitude) : null,
    is_default: address.isDefault,
    created_at: address.createdAt,
  }
}

export default withAuth(handler)
