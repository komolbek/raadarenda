import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

const TASHKENT_BOUNDS = {
  lat: { min: 41.15, max: 41.45 },
  lng: { min: 69.05, max: 69.45 },
};

const MAX_ADDRESSES = 5;
const MAX_CARDS = 5;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ==================== PROFILE ====================

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phoneNumber: true,
        name: true,
        language: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, name: string) {
    if (!name || name.trim().length === 0) {
      throw new BadRequestException('Name is required');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { name: name.trim() },
      select: {
        id: true,
        phoneNumber: true,
        name: true,
        language: true,
        createdAt: true,
      },
    });

    return user;
  }

  // ==================== ADDRESSES ====================

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createAddress(
    userId: string,
    data: {
      title: string;
      full_address: string;
      city: string;
      district?: string;
      street?: string;
      building?: string;
      apartment?: string;
      entrance?: string;
      floor?: string;
      latitude?: number;
      longitude?: number;
      is_default?: boolean;
    },
  ) {
    const count = await this.prisma.address.count({ where: { userId } });
    if (count >= MAX_ADDRESSES) {
      throw new BadRequestException(`Maximum of ${MAX_ADDRESSES} addresses allowed`);
    }

    if (data.latitude !== undefined && data.longitude !== undefined) {
      this.validateTashkentBounds(data.latitude, data.longitude);
    }

    const isFirst = count === 0;
    const isDefault = data.is_default ?? isFirst;

    if (isDefault && count > 0) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: {
        userId,
        title: data.title,
        fullAddress: data.full_address,
        city: data.city,
        district: data.district,
        street: data.street,
        building: data.building,
        apartment: data.apartment,
        entrance: data.entrance,
        floor: data.floor,
        latitude: data.latitude,
        longitude: data.longitude,
        isDefault: isDefault,
      },
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.prisma.address.delete({ where: { id: addressId } });

    if (address.isDefault) {
      const nextDefault = await this.prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      if (nextDefault) {
        await this.prisma.address.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        });
      }
    }

    return { success: true };
  }

  async setDefaultAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.prisma.$transaction([
      this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      }),
      this.prisma.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      }),
    ]);

    return { success: true };
  }

  // ==================== CARDS ====================

  async getCards(userId: string) {
    return this.prisma.card.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async addCard(
    userId: string,
    data: {
      card_number: string;
      card_holder: string;
      expiry_month: number;
      expiry_year: number;
    },
  ) {
    const count = await this.prisma.card.count({ where: { userId } });
    if (count >= MAX_CARDS) {
      throw new BadRequestException(`Maximum of ${MAX_CARDS} cards allowed`);
    }

    const cleanNumber = data.card_number.replace(/\s+/g, '');

    if (!/^\d{16}$/.test(cleanNumber)) {
      throw new BadRequestException('Card number must be 16 digits');
    }

    if (!this.luhnCheck(cleanNumber)) {
      throw new BadRequestException('Invalid card number');
    }

    if (
      data.expiry_month < 1 ||
      data.expiry_month > 12 ||
      data.expiry_year < new Date().getFullYear() % 100
    ) {
      throw new BadRequestException('Invalid expiry date');
    }

    const cardType = this.detectCardType(cleanNumber);
    const maskedNumber = `**** **** **** ${cleanNumber.slice(-4)}`;

    const isFirst = count === 0;

    if (isFirst) {
      await this.prisma.card.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.card.create({
      data: {
        userId,
        cardNumber: maskedNumber,
        cardHolder: data.card_holder.trim(),
        expiryMonth: data.expiry_month,
        expiryYear: data.expiry_year,
        cardType,
        isDefault: isFirst,
      },
    });
  }

  async deleteCard(userId: string, cardId: string) {
    const card = await this.prisma.card.findFirst({
      where: { id: cardId, userId },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    await this.prisma.card.delete({ where: { id: cardId } });

    if (card.isDefault) {
      const nextDefault = await this.prisma.card.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      if (nextDefault) {
        await this.prisma.card.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        });
      }
    }

    return { success: true };
  }

  async setDefaultCard(userId: string, cardId: string) {
    const card = await this.prisma.card.findFirst({
      where: { id: cardId, userId },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    await this.prisma.$transaction([
      this.prisma.card.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      }),
      this.prisma.card.update({
        where: { id: cardId },
        data: { isDefault: true },
      }),
    ]);

    return { success: true };
  }

  // ==================== FAVORITES ====================

  async getFavorites(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            photos: true,
            dailyPrice: true,
            isActive: true,
          },
        },
      },
    });

    return favorites.map((fav) => ({
      id: fav.id,
      createdAt: fav.createdAt,
      product: fav.product,
    }));
  }

  async addFavorite(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    try {
      const favorite = await this.prisma.favorite.create({
        data: { userId, productId },
      });
      return favorite;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Product is already in favorites');
      }
      throw error;
    }
  }

  async removeFavorite(userId: string, productId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.prisma.favorite.delete({
      where: { id: favorite.id },
    });

    return { success: true };
  }

  // ==================== HELPERS ====================

  private validateTashkentBounds(latitude: number, longitude: number) {
    if (
      latitude < TASHKENT_BOUNDS.lat.min ||
      latitude > TASHKENT_BOUNDS.lat.max ||
      longitude < TASHKENT_BOUNDS.lng.min ||
      longitude > TASHKENT_BOUNDS.lng.max
    ) {
      throw new BadRequestException(
        'Address coordinates must be within Tashkent bounds',
      );
    }
  }

  private luhnCheck(cardNumber: string): boolean {
    let sum = 0;
    let alternate = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let n = parseInt(cardNumber[i], 10);

      if (alternate) {
        n *= 2;
        if (n > 9) {
          n -= 9;
        }
      }

      sum += n;
      alternate = !alternate;
    }

    return sum % 10 === 0;
  }

  private detectCardType(cardNumber: string): string {
    if (cardNumber.startsWith('9860')) return 'HUMO';
    if (cardNumber.startsWith('8600')) return 'UZCARD';
    if (cardNumber.startsWith('4')) return 'VISA';
    if (cardNumber.startsWith('5')) return 'MASTERCARD';
    return 'UNKNOWN';
  }
}
