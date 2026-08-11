import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

interface EventInput {
  title?: string;
  title_uz?: string | null;
  title_en?: string | null;
  description?: string | null;
  description_uz?: string | null;
  description_en?: string | null;
  image_url?: string | null;
  venue?: string | null;
  city?: string | null;
  start_date?: string;
  end_date?: string | null;
  website_url?: string | null;
  is_active?: boolean;
  display_order?: number;
}

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  private toRow(e: any) {
    return {
      id: e.id,
      title: e.title,
      title_uz: e.titleUz ?? null,
      title_en: e.titleEn ?? null,
      description: e.description ?? null,
      description_uz: e.descriptionUz ?? null,
      description_en: e.descriptionEn ?? null,
      image_url: e.imageUrl ?? null,
      venue: e.venue ?? null,
      city: e.city ?? null,
      start_date: e.startDate,
      end_date: e.endDate ?? null,
      website_url: e.websiteUrl ?? null,
      is_active: e.isActive,
      display_order: e.displayOrder,
      created_at: e.createdAt,
    };
  }

  private mapInput(body: EventInput) {
    const out: Record<string, unknown> = {};
    const set = (v: unknown, key: string) => {
      if (v !== undefined) out[key] = v;
    };
    set(body.title, 'title');
    set(body.title_uz ?? undefined, 'titleUz');
    set(body.title_en ?? undefined, 'titleEn');
    set(body.description ?? undefined, 'description');
    set(body.description_uz ?? undefined, 'descriptionUz');
    set(body.description_en ?? undefined, 'descriptionEn');
    set(body.image_url ?? undefined, 'imageUrl');
    set(body.venue ?? undefined, 'venue');
    set(body.city ?? undefined, 'city');
    if (body.start_date !== undefined) out.startDate = new Date(body.start_date);
    if (body.end_date !== undefined)
      out.endDate = body.end_date ? new Date(body.end_date) : null;
    set(body.website_url ?? undefined, 'websiteUrl');
    set(body.is_active, 'isActive');
    set(body.display_order, 'displayOrder');
    return out;
  }

  /** Public: active events, upcoming first (by start date, then manual order). */
  async findAllPublic() {
    const events = await this.prisma.event.findMany({
      where: { isActive: true },
      orderBy: [{ startDate: 'asc' }, { displayOrder: 'asc' }],
    });
    return { items: events.map((e) => this.toRow(e)) };
  }

  async findOnePublic(id: string) {
    const event = await this.prisma.event.findFirst({
      where: { id, isActive: true },
    });
    if (!event) throw new NotFoundException('Event not found');
    return this.toRow(event);
  }

  // ── Admin ──────────────────────────────────────────────────────────────
  async findAll() {
    const events = await this.prisma.event.findMany({
      orderBy: [{ startDate: 'asc' }, { displayOrder: 'asc' }],
    });
    return { items: events.map((e) => this.toRow(e)) };
  }

  async create(body: EventInput) {
    if (!body.title) throw new BadRequestException('title is required');
    if (!body.start_date) throw new BadRequestException('start_date is required');
    const created = await this.prisma.event.create({
      data: {
        ...(this.mapInput(body) as any),
        title: body.title,
        startDate: new Date(body.start_date),
      },
    });
    return this.toRow(created);
  }

  async update(id: string, body: EventInput) {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Event not found');
    const updated = await this.prisma.event.update({
      where: { id },
      data: this.mapInput(body),
    });
    return this.toRow(updated);
  }

  async delete(id: string) {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Event not found');
    await this.prisma.event.delete({ where: { id } });
    return { deleted: true };
  }

  async reorder(orderedIds: string[]) {
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      throw new BadRequestException('orderedIds must be a non-empty array');
    }
    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.event.update({
          where: { id },
          data: { displayOrder: index },
        }),
      ),
    );
    return { reordered: true };
  }
}
