import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findActiveWithChildren() {
    const categories = await this.prisma.category.findMany({
      where: {
        isActive: true,
        parentCategoryId: null,
      },
      orderBy: { displayOrder: 'asc' },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
          include: {
            _count: {
              select: {
                products: { where: { isActive: true } },
              },
            },
          },
        },
        _count: {
          select: {
            products: { where: { isActive: true } },
          },
        },
      },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      imageUrl: category.imageUrl,
      iconName: category.iconName,
      displayOrder: category.displayOrder,
      productCount: category._count.products,
      children: category.children.map((child) => ({
        id: child.id,
        name: child.name,
        imageUrl: child.imageUrl,
        iconName: child.iconName,
        displayOrder: child.displayOrder,
        productCount: child._count.products,
      })),
    }));
  }
}
