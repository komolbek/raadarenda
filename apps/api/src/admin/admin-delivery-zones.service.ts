import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AdminDeliveryZonesService {
  constructor(private prisma: PrismaService) {}

  async listZones() {
    const zones = await this.prisma.deliveryZone.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return { zones };
  }

  async createZone(data: {
    name: string;
    price?: number;
    isFree?: boolean;
    isActive?: boolean;
  }) {
    const zone = await this.prisma.deliveryZone.create({
      data: {
        name: data.name,
        ...(data.price !== undefined && { price: data.price }),
        ...(data.isFree !== undefined && { isFree: data.isFree }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return { zone };
  }

  async updateZone(
    id: string,
    data: {
      name?: string;
      price?: number;
      isFree?: boolean;
      isActive?: boolean;
    },
  ) {
    const existing = await this.prisma.deliveryZone.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Delivery zone not found');
    }

    const zone = await this.prisma.deliveryZone.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.isFree !== undefined && { isFree: data.isFree }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return { zone };
  }

  async deleteZone(id: string) {
    const existing = await this.prisma.deliveryZone.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Delivery zone not found');
    }

    await this.prisma.deliveryZone.delete({ where: { id } });

    return { success: true };
  }
}
