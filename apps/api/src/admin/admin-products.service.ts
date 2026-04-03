import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Prisma } from '@4event/db';

@Injectable()
export class AdminProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    categoryId?: string;
  }) {
    const { page, limit, search, categoryId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true } },
          pricingTiers: { orderBy: { days: 'asc' } },
          quantityPricing: { orderBy: { quantity: 'asc' } },
          _count: { select: { orderItems: true, reviews: true, favorites: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: { select: { id: true, name: true } },
        pricingTiers: { orderBy: { days: 'asc' } },
        quantityPricing: { orderBy: { quantity: 'asc' } },
        _count: { select: { orderItems: true, reviews: true, favorites: true } },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async create(data: {
    name: string;
    description?: string;
    categoryId: string;
    photos?: string[];
    dailyPrice: number;
    totalStock?: number;
    isActive?: boolean;
    specWidth?: string;
    specHeight?: string;
    specDepth?: string;
    specWeight?: string;
    specColor?: string;
    specMaterial?: string;
    minRentalDays?: number;
    maxRentalDays?: number;
    depositAmount?: number;
    pricingTiers?: { days: number; totalPrice: number }[];
    quantityPricing?: { quantity: number; totalPrice: number }[];
  }) {
    const category = await this.prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    const {
      pricingTiers,
      quantityPricing,
      ...productData
    } = data;

    return this.prisma.product.create({
      data: {
        ...productData,
        photos: productData.photos ?? [],
        pricingTiers: pricingTiers?.length
          ? { createMany: { data: pricingTiers } }
          : undefined,
        quantityPricing: quantityPricing?.length
          ? { createMany: { data: quantityPricing } }
          : undefined,
      },
      include: {
        category: { select: { id: true, name: true } },
        pricingTiers: { orderBy: { days: 'asc' } },
        quantityPricing: { orderBy: { quantity: 'asc' } },
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      categoryId?: string;
      photos?: string[];
      dailyPrice?: number;
      totalStock?: number;
      isActive?: boolean;
      specWidth?: string;
      specHeight?: string;
      specDepth?: string;
      specWeight?: string;
      specColor?: string;
      specMaterial?: string;
      minRentalDays?: number;
      maxRentalDays?: number;
      depositAmount?: number;
      pricingTiers?: { days: number; totalPrice: number }[];
      quantityPricing?: { quantity: number; totalPrice: number }[];
    },
  ) {
    const existing = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    if (data.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    const { pricingTiers, quantityPricing, ...productData } = data;

    return this.prisma.$transaction(async (tx) => {
      if (pricingTiers !== undefined) {
        await tx.pricingTier.deleteMany({ where: { productId: id } });
        if (pricingTiers.length > 0) {
          await tx.pricingTier.createMany({
            data: pricingTiers.map((t) => ({ ...t, productId: id })),
          });
        }
      }

      if (quantityPricing !== undefined) {
        await tx.quantityPricing.deleteMany({ where: { productId: id } });
        if (quantityPricing.length > 0) {
          await tx.quantityPricing.createMany({
            data: quantityPricing.map((q) => ({ ...q, productId: id })),
          });
        }
      }

      return tx.product.update({
        where: { id },
        data: productData,
        include: {
          category: { select: { id: true, name: true } },
          pricingTiers: { orderBy: { days: 'asc' } },
          quantityPricing: { orderBy: { quantity: 'asc' } },
        },
      });
    });
  }

  async delete(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: { _count: { select: { orderItems: true } } },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product._count.orderItems > 0) {
      // Soft delete: product has orders
      await this.prisma.product.update({
        where: { id },
        data: { deletedAt: new Date(), isActive: false },
      });
      return { deleted: true, soft: true };
    }

    // Hard delete: no orders
    await this.prisma.product.delete({ where: { id } });
    return { deleted: true, soft: false };
  }
}
