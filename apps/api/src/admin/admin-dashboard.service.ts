import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
      ordersByStatus,
      totalCustomers,
      totalProducts,
      recentOrders,
    ] = await Promise.all([
      this.getRevenue(startOfDay),
      this.getRevenue(startOfWeek),
      this.getRevenue(startOfMonth),
      this.getOrderCountsByStatus(),
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.product.count({ where: { deletedAt: null, isActive: true } }),
      this.getRecentOrders(),
    ]);

    return {
      revenue: {
        daily: dailyRevenue,
        weekly: weeklyRevenue,
        monthly: monthlyRevenue,
      },
      ordersByStatus,
      totalCustomers,
      totalProducts,
      recentOrders,
    };
  }

  private async getRevenue(since: Date): Promise<number> {
    const result = await this.prisma.order.aggregate({
      where: {
        createdAt: { gte: since },
        deletedAt: null,
        paymentStatus: 'PAID',
      },
      _sum: { totalAmount: true },
    });
    return result._sum.totalAmount || 0;
  }

  private async getOrderCountsByStatus(): Promise<Record<string, number>> {
    const counts = await this.prisma.order.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: { id: true },
    });

    const result: Record<string, number> = {};
    for (const item of counts) {
      result[item.status] = item._count.id;
    }
    return result;
  }

  private async getRecentOrders() {
    return this.prisma.order.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalAmount: true,
        paymentStatus: true,
        createdAt: true,
        user: {
          select: { id: true, name: true, phoneNumber: true },
        },
      },
    });
  }
}
