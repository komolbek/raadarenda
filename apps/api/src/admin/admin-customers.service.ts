import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AdminCustomersService {
  constructor(private prisma: PrismaService) {}

  async listCustomers(query: { page?: number; limit?: number; search?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { phoneNumber: { contains: query.search } },
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          phoneNumber: true,
          name: true,
          isActive: true,
          createdAt: true,
          _count: { select: { orders: true } },
          orders: {
            select: { totalAmount: true },
            where: { deletedAt: null },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    const data = customers.map((c) => ({
      id: c.id,
      phoneNumber: c.phoneNumber,
      name: c.name,
      isActive: c.isActive,
      createdAt: c.createdAt,
      orderCount: c._count.orders,
      totalSpending: c.orders.reduce((sum, o) => sum + o.totalAmount, 0),
    }));

    return {
      customers: data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getCustomerById(id: string) {
    const customer = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        phoneNumber: true,
        name: true,
        language: true,
        isActive: true,
        createdAt: true,
        addresses: {
          select: {
            id: true,
            title: true,
            fullAddress: true,
            city: true,
            isDefault: true,
          },
        },
        orders: {
          where: { deletedAt: null },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return { customer };
  }

  async updateCustomer(id: string, data: { name?: string; is_active?: boolean }) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Customer not found');
    }

    const customer = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.is_active !== undefined && { isActive: data.is_active }),
      },
      select: {
        id: true,
        phoneNumber: true,
        name: true,
        isActive: true,
        createdAt: true,
      },
    });

    return { customer };
  }
}
