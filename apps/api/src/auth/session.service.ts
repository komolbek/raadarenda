import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as crypto from 'crypto';

const SESSION_DURATION_DAYS = 30;

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    deviceId: string,
    deviceInfo?: string,
  ): Promise<string> {
    await this.prisma.session.deleteMany({
      where: { userId, deviceId },
    });

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setDate(expires.getDate() + SESSION_DURATION_DAYS);

    await this.prisma.session.create({
      data: { sessionToken, userId, deviceId, deviceInfo, expires },
    });

    return sessionToken;
  }

  async invalidate(sessionToken: string): Promise<void> {
    await this.prisma.session
      .delete({ where: { sessionToken } })
      .catch(() => {});
  }

  async invalidateAll(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { userId } });
  }

  async getUser(sessionToken: string) {
    const session = await this.prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session) return null;
    if (new Date() > session.expires) {
      await this.prisma.session.delete({ where: { id: session.id } });
      return null;
    }

    return session.user;
  }
}
