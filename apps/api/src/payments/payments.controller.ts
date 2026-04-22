import {
  Controller,
  Post,
  Param,
  Body,
  Logger,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma.service';
import { UserAuthGuard } from '../common/guards/user-auth.guard';
import { UserId } from '../common/decorators';
import { MulticardService, WebhookPayload } from './multicard.service';

@ApiTags('Payments')
@Controller('payments/multicard')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly multicard: MulticardService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('checkout/:orderId')
  @ApiBearerAuth()
  @UseGuards(UserAuthGuard)
  @ApiOperation({ summary: 'Create or reuse a Multicard invoice for an order' })
  async createCheckout(
    @UserId() userId: string,
    @Param('orderId') orderId: string,
  ) {
    if (!this.multicard.isConfigured()) {
      throw new BadRequestException('Payment gateway is not configured');
    }

    const order = await this.prisma.order.findFirst({
      where: { id: orderId, deletedAt: null },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) {
      throw new ForbiddenException('You can only pay for your own orders');
    }
    if (order.paymentStatus === 'PAID') {
      throw new BadRequestException('Order is already paid');
    }
    if (order.paymentMethod !== 'RAHMAT') {
      throw new BadRequestException(
        'This order is not set to be paid via Rahmat',
      );
    }

    // Idempotent: reuse existing checkout_url if we already created one.
    if (order.multicardInvoiceUuid && order.multicardCheckoutUrl) {
      return { checkout_url: order.multicardCheckoutUrl };
    }

    const { uuid, checkoutUrl } = await this.multicard.createInvoice({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amountUzs: order.totalAmount,
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        multicardInvoiceUuid: uuid,
        multicardCheckoutUrl: checkoutUrl,
      },
    });

    return { checkout_url: checkoutUrl };
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Multicard payment status webhook' })
  async webhook(@Body() body: WebhookPayload) {
    this.logger.log(
      `[multicard-webhook] received uuid=${body?.uuid} invoice_id=${body?.invoice_id} status=${body?.status}`,
    );

    if (!body?.uuid || !body?.invoice_id || body?.amount == null || !body?.sign) {
      this.logger.warn('[multicard-webhook] malformed payload');
      return { success: true }; // still 2xx so Multicard stops retrying
    }

    if (!this.multicard.verifySignature(body)) {
      this.logger.warn(
        `[multicard-webhook] signature mismatch for uuid=${body.uuid}`,
      );
      return { success: true };
    }

    const order = await this.prisma.order.findFirst({
      where: { id: body.invoice_id, deletedAt: null },
    });
    if (!order) {
      this.logger.warn(`[multicard-webhook] no order for invoice_id=${body.invoice_id}`);
      return { success: true };
    }

    if (order.multicardInvoiceUuid && order.multicardInvoiceUuid !== body.uuid) {
      this.logger.warn(
        `[multicard-webhook] uuid mismatch for order=${order.orderNumber} (stored=${order.multicardInvoiceUuid}, got=${body.uuid})`,
      );
      return { success: true };
    }

    const expectedAmountTiyin = order.totalAmount * 100;
    if (body.amount !== expectedAmountTiyin) {
      this.logger.warn(
        `[multicard-webhook] amount mismatch for order=${order.orderNumber} (expected=${expectedAmountTiyin}, got=${body.amount})`,
      );
      return { success: true };
    }

    let nextPaymentStatus = order.paymentStatus;
    let note: string | null = null;
    switch (body.status) {
      case 'success':
        nextPaymentStatus = 'PAID';
        note = `Rahmat: payment successful (${body.ps || 'unknown'} ${body.card_pan || ''})`.trim();
        break;
      case 'revert':
        nextPaymentStatus = 'REFUNDED';
        note = 'Rahmat: payment reverted/refunded';
        break;
      case 'error':
        nextPaymentStatus = 'PENDING';
        note = 'Rahmat: payment failed';
        break;
      case 'progress':
      case 'hold':
      case 'draft':
        nextPaymentStatus = 'PENDING';
        note = `Rahmat: status=${body.status}`;
        break;
    }

    // Idempotency: if status hasn't changed, just record the callback time.
    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: nextPaymentStatus,
        multicardWebhookAt: new Date(),
        ...(note && nextPaymentStatus !== order.paymentStatus
          ? {
              adminNotes: order.adminNotes
                ? `${order.adminNotes}\n${note}`
                : note,
            }
          : {}),
      },
    });

    this.logger.log(
      `[multicard-webhook] order=${order.orderNumber} paymentStatus=${nextPaymentStatus}`,
    );

    return { success: true };
  }
}
