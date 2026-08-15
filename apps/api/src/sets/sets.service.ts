import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

interface SetItemInput {
  product_id: string;
  quantity?: number;
}

interface SetInput {
  name?: string;
  name_uz?: string | null;
  name_en?: string | null;
  description?: string | null;
  description_uz?: string | null;
  description_en?: string | null;
  photos?: string[];
  is_active?: boolean;
  display_order?: number;
  items?: SetItemInput[];
}

const SET_INCLUDE = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          nameUz: true,
          nameEn: true,
          dailyPrice: true,
          photos: true,
          totalStock: true,
          category: { select: { id: true, name: true } },
        },
      },
    },
  },
} as const;

@Injectable()
export class SetsService {
  constructor(private readonly prisma: PrismaService) {}

  private toRow(s: any) {
    const items = (s.items ?? []).map((it: any) => ({
      id: it.id,
      product_id: it.productId,
      quantity: it.quantity,
      product: it.product
        ? {
            id: it.product.id,
            name: it.product.name,
            name_uz: it.product.nameUz ?? null,
            name_en: it.product.nameEn ?? null,
            daily_price: it.product.dailyPrice,
            photos: it.product.photos ?? [],
            total_stock: it.product.totalStock,
            category_name: it.product.category?.name ?? null,
          }
        : null,
    }));
    const dailyPrice = items.reduce(
      (sum: number, it: any) => sum + (it.product?.daily_price ?? 0) * it.quantity,
      0,
    );
    return {
      id: s.id,
      name: s.name,
      name_uz: s.nameUz ?? null,
      name_en: s.nameEn ?? null,
      description: s.description ?? null,
      description_uz: s.descriptionUz ?? null,
      description_en: s.descriptionEn ?? null,
      photos: s.photos ?? [],
      is_active: s.isActive,
      display_order: s.displayOrder,
      daily_price: dailyPrice,
      items_count: items.length,
      items,
      created_at: s.createdAt,
    };
  }

  private mapInput(body: SetInput) {
    const out: Record<string, unknown> = {};
    const set = (v: unknown, key: string) => {
      if (v !== undefined) out[key] = v;
    };
    set(body.name, 'name');
    set(body.name_uz ?? undefined, 'nameUz');
    set(body.name_en ?? undefined, 'nameEn');
    set(body.description ?? undefined, 'description');
    set(body.description_uz ?? undefined, 'descriptionUz');
    set(body.description_en ?? undefined, 'descriptionEn');
    set(body.photos, 'photos');
    set(body.is_active, 'isActive');
    set(body.display_order, 'displayOrder');
    return out;
  }

  async findAllPublic() {
    const sets = await this.prisma.set.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      include: SET_INCLUDE,
    });
    return { items: sets.map((s) => this.toRow(s)) };
  }

  async findOnePublic(id: string) {
    const s = await this.prisma.set.findFirst({
      where: { id, isActive: true },
      include: SET_INCLUDE,
    });
    if (!s) throw new NotFoundException('Set not found');
    return this.toRow(s);
  }

  async findAll() {
    const sets = await this.prisma.set.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      include: SET_INCLUDE,
    });
    return { items: sets.map((s) => this.toRow(s)) };
  }

  async findOne(id: string) {
    const s = await this.prisma.set.findUnique({ where: { id }, include: SET_INCLUDE });
    if (!s) throw new NotFoundException('Set not found');
    return this.toRow(s);
  }

  async create(body: SetInput) {
    if (!body.name) throw new BadRequestException('name is required');
    const items = (body.items ?? []).filter((i) => i.product_id);
    const created = await this.prisma.set.create({
      data: {
        ...(this.mapInput(body) as any),
        name: body.name,
        photos: body.photos ?? [],
        items: items.length
          ? {
              createMany: {
                data: items.map((i) => ({
                  productId: i.product_id,
                  quantity: i.quantity && i.quantity > 0 ? i.quantity : 1,
                })),
              },
            }
          : undefined,
      },
      include: SET_INCLUDE,
    });
    return this.toRow(created);
  }

  async update(id: string, body: SetInput) {
    const existing = await this.prisma.set.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Set not found');
    const items = body.items?.filter((i) => i.product_id);

    const result = await this.prisma.$transaction(async (tx) => {
      if (items !== undefined) {
        await tx.setItem.deleteMany({ where: { setId: id } });
        if (items.length) {
          await tx.setItem.createMany({
            data: items.map((i) => ({
              setId: id,
              productId: i.product_id,
              quantity: i.quantity && i.quantity > 0 ? i.quantity : 1,
            })),
          });
        }
      }
      return tx.set.update({
        where: { id },
        data: this.mapInput(body),
        include: SET_INCLUDE,
      });
    });
    return this.toRow(result);
  }

  async delete(id: string) {
    const existing = await this.prisma.set.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Set not found');
    await this.prisma.set.delete({ where: { id } });
    return { deleted: true };
  }

  async reorder(orderedIds: string[]) {
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      throw new BadRequestException('orderedIds must be a non-empty array');
    }
    await this.prisma.$transaction(
      orderedIds.map((sid, index) =>
        this.prisma.set.update({ where: { id: sid }, data: { displayOrder: index } }),
      ),
    );
    return { reordered: true };
  }
}
