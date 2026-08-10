import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

// Shape the admin panel expects (snake_case, flattened counts).
interface CategoryRow {
  id: string;
  name: string;
  image_url: string | null;
  icon_name: string | null;
  parent_category_id: string | null;
  parent: { id: string; name: string } | null;
  display_order: number;
  is_active: boolean;
  products_count: number;
  children_count: number;
  created_at: Date;
}

interface CategoryInput {
  name?: string;
  image_url?: string | null;
  icon_name?: string | null;
  parent_category_id?: string | null;
  display_order?: number;
  is_active?: boolean;
}

const CATEGORY_INCLUDE = {
  parent: { select: { id: true, name: true } },
  _count: { select: { products: true, children: true } },
} as const;

@Injectable()
export class AdminCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  private toRow(c: {
    id: string;
    name: string;
    imageUrl: string | null;
    iconName: string | null;
    parentCategoryId: string | null;
    parent: { id: string; name: string } | null;
    displayOrder: number;
    isActive: boolean;
    createdAt: Date;
    _count: { products: number; children: number };
  }): CategoryRow {
    return {
      id: c.id,
      name: c.name,
      image_url: c.imageUrl,
      icon_name: c.iconName,
      parent_category_id: c.parentCategoryId,
      parent: c.parent ? { id: c.parent.id, name: c.parent.name } : null,
      display_order: c.displayOrder,
      is_active: c.isActive,
      products_count: c._count?.products ?? 0,
      children_count: c._count?.children ?? 0,
      created_at: c.createdAt,
    };
  }

  async findAll() {
    const categories = await this.prisma.category.findMany({
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      include: CATEGORY_INCLUDE,
    });
    return { items: categories.map((c) => this.toRow(c)) };
  }

  async reorder(orderedIds: string[]) {
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      throw new BadRequestException('orderedIds must be a non-empty array');
    }

    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.category.update({
          where: { id },
          data: { displayOrder: index },
        }),
      ),
    );

    return { reordered: true };
  }

  async create(data: CategoryInput & { name: string }) {
    await this.assertValidParent(data.parent_category_id);

    const created = await this.prisma.category.create({
      data: {
        name: data.name,
        imageUrl: data.image_url ?? null,
        iconName: data.icon_name ?? null,
        parentCategoryId: data.parent_category_id ?? null,
        displayOrder: data.display_order ?? 0,
        isActive: data.is_active ?? true,
      },
      include: CATEGORY_INCLUDE,
    });
    return this.toRow(created);
  }

  async update(id: string, data: CategoryInput) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    if (data.parent_category_id) {
      if (data.parent_category_id === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }
      await this.assertValidParent(data.parent_category_id);
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.image_url !== undefined && { imageUrl: data.image_url }),
        ...(data.icon_name !== undefined && { iconName: data.icon_name }),
        ...(data.parent_category_id !== undefined && {
          parentCategoryId: data.parent_category_id,
        }),
        ...(data.display_order !== undefined && {
          displayOrder: data.display_order,
        }),
        ...(data.is_active !== undefined && { isActive: data.is_active }),
      },
      include: CATEGORY_INCLUDE,
    });
    return this.toRow(updated);
  }

  async delete(id: string, force = false) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const productsCount = category._count.products;

    // Graceful, non-throwing signal so the admin can show its confirm modal.
    if (productsCount > 0 && !force) {
      return { requires_confirmation: true, products_count: productsCount };
    }

    if (productsCount > 0 && force) {
      // Products carry a required categoryId and may be referenced by orders,
      // so we soft-delete + deactivate them rather than hard-delete, then
      // deactivate the category (categories have no soft-delete column).
      await this.prisma.product.updateMany({
        where: { categoryId: id, deletedAt: null },
        data: { deletedAt: new Date(), isActive: false },
      });
      await this.prisma.category.update({
        where: { id },
        data: { isActive: false },
      });
      return { deleted: true, deactivated_products: productsCount };
    }

    await this.prisma.category.delete({ where: { id } });
    return { deleted: true };
  }

  private async assertValidParent(parentId?: string | null) {
    if (!parentId) return;
    const parent = await this.prisma.category.findUnique({
      where: { id: parentId },
    });
    if (!parent) {
      throw new BadRequestException('Parent category not found');
    }
  }
}
