import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/db'
import { requireAdminAuth } from '@/lib/auth/admin-middleware'
import { createTranslator } from '@/lib/i18n'
import { OrderStatus } from '@prisma/client'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const t = createTranslator(req)
  const { id } = req.query

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: t('methodNotAllowed'),
    })
  }

  try {
    const { status, notes } = req.body

    if (!status || !Object.values(OrderStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: t('badRequest'),
      })
    }

    const order = await prisma.order.findUnique({
      where: { id: id as string },
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: t('orderNotFound'),
      })
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: id as string },
      data: {
        status,
        statusHistory: {
          create: {
            status,
            notes,
            createdBy: 'admin',
          },
        },
      },
      include: {
        items: true,
        user: true,
        deliveryAddress: true,
      },
    })

    return res.status(200).json({
      success: true,
      message: t('orderUpdated'),
      data: {
        id: updatedOrder.id,
        order_number: updatedOrder.orderNumber,
        status: updatedOrder.status,
      },
    })
  } catch (error) {
    console.error('Update order status error:', error)
    return res.status(500).json({
      success: false,
      message: t('internalServerError'),
    })
  }
}

export default requireAdminAuth(handler)
