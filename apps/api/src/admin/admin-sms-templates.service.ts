import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AdminSmsTemplatesService {
  constructor(private prisma: PrismaService) {}

  async listTemplates() {
    const templates = await this.prisma.smsTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return { templates };
  }

  async createTemplate(data: {
    slug: string;
    name: string;
    bodyRu: string;
    bodyUz?: string;
    bodyEn?: string;
    variables?: string[];
    isActive?: boolean;
  }) {
    const existing = await this.prisma.smsTemplate.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new ConflictException(`Template with slug "${data.slug}" already exists`);
    }

    const template = await this.prisma.smsTemplate.create({
      data: {
        slug: data.slug,
        name: data.name,
        bodyRu: data.bodyRu,
        ...(data.bodyUz !== undefined && { bodyUz: data.bodyUz }),
        ...(data.bodyEn !== undefined && { bodyEn: data.bodyEn }),
        ...(data.variables !== undefined && { variables: data.variables }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return { template };
  }

  async updateTemplate(
    id: string,
    data: {
      slug?: string;
      name?: string;
      bodyRu?: string;
      bodyUz?: string;
      bodyEn?: string;
      variables?: string[];
      isActive?: boolean;
    },
  ) {
    const existing = await this.prisma.smsTemplate.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('SMS template not found');
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugTaken = await this.prisma.smsTemplate.findUnique({
        where: { slug: data.slug },
      });
      if (slugTaken) {
        throw new ConflictException(`Template with slug "${data.slug}" already exists`);
      }
    }

    const template = await this.prisma.smsTemplate.update({
      where: { id },
      data: {
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.bodyRu !== undefined && { bodyRu: data.bodyRu }),
        ...(data.bodyUz !== undefined && { bodyUz: data.bodyUz }),
        ...(data.bodyEn !== undefined && { bodyEn: data.bodyEn }),
        ...(data.variables !== undefined && { variables: data.variables }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return { template };
  }

  async deleteTemplate(id: string) {
    const existing = await this.prisma.smsTemplate.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('SMS template not found');
    }

    await this.prisma.smsTemplate.delete({ where: { id } });

    return { success: true };
  }
}
