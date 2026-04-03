import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AdminCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.category.findMany({
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      include: {
        children: {
          orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
          include: {
            _count: { select: { products: true } },
          },
        },
        _count: { select: { products: true } },
      },
    });

    return { items: categories };
  }

  async create(data: {
    name: string;
    imageUrl?: string;
    iconName?: string;
    parentCategoryId?: string;
    displayOrder?: number;
    isActive?: boolean;
  }) {
    if (data.parentCategoryId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: data.parentCategoryId },
      });
      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }
    }

    return this.prisma.category.create({ data });
  }

  async update(data: {
    id: string;
    name?: string;
    imageUrl?: string;
    iconName?: string;
    parentCategoryId?: string;
    displayOrder?: number;
    isActive?: boolean;
  }) {
    const { id, ...updateData } = data;

    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    if (updateData.parentCategoryId) {
      if (updateData.parentCategoryId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }
      const parent = await this.prisma.category.findUnique({
        where: { id: updateData.parentCategoryId },
      });
      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(data: { id: string }) {
    const category = await this.prisma.category.findUnique({
      where: { id: data.id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category._count.products > 0) {
      throw new BadRequestException(
        'Cannot delete category with existing products. Move or delete products first.',
      );
    }

    await this.prisma.category.delete({ where: { id: data.id } });
    return { deleted: true };
  }
}
