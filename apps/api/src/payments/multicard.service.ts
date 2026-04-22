import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import * as crypto from 'crypto';

interface MulticardConfig {
  apiUrl: string;
  appId: string;
  secret: string;
  storeId: string;
  callbackUrl: string;
  webBaseUrl: string;
}

interface MulticardAuthResponse {
  success: boolean;
  data?: { token: string; expiry: string };
  error?: { code: string; details: string };
}

interface MulticardInvoiceResponse {
  success: boolean;
  data?: {
    uuid: string;
    checkout_url: string;
    short_link?: string;
    deeplink?: string;
  };
  error?: { code: string; details: string };
}

export interface CreateInvoiceInput {
  orderId: string;
  orderNumber: string;
  amountUzs: number;
  lang?: 'ru' | 'uz' | 'en';
}

export interface WebhookPayload {
  uuid: string;
  invoice_id: string;
  amount: number;
  status: 'draft' | 'progress' | 'success' | 'error' | 'revert' | 'hold';
  sign: string;
  card_pan?: string;
  ps?: string;
  card_token?: string;
  payment_time?: string;
  refund_time?: string | null;
  phone?: string;
}

@Injectable()
export class MulticardService {
  private readonly logger = new Logger(MulticardService.name);
  private cachedToken: { token: string; expiresAtMs: number } | null = null;

  getConfig(): MulticardConfig | null {
    const apiUrl = process.env.MULTICARD_API_URL;
    const appId = process.env.MULTICARD_APP_ID;
    const secret = process.env.MULTICARD_SECRET;
    const storeId = process.env.MULTICARD_STORE_ID;
    const callbackUrl = process.env.MULTICARD_CALLBACK_URL;
    const webBaseUrl = process.env.MULTICARD_WEB_BASE_URL;

    if (!apiUrl || !appId || !secret || !storeId || !callbackUrl || !webBaseUrl) {
      return null;
    }

    return {
      apiUrl: apiUrl.replace(/\/+$/, ''),
      appId,
      secret,
      storeId,
      callbackUrl,
      webBaseUrl: webBaseUrl.replace(/\/+$/, ''),
    };
  }

  isConfigured(): boolean {
    return this.getConfig() !== null;
  }

  private async getToken(cfg: MulticardConfig): Promise<string> {
    const now = Date.now();
    if (this.cachedToken && this.cachedToken.expiresAtMs - 60_000 > now) {
      return this.cachedToken.token;
    }

    const res = await fetch(`${cfg.apiUrl}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_id: cfg.appId,
        secret: cfg.secret,
      }),
    });

    const body = (await res.json().catch(() => null)) as MulticardAuthResponse | null;
    if (!res.ok || !body?.success || !body.data?.token) {
      const err = body?.error?.details || `HTTP ${res.status}`;
      this.logger.error(`[multicard] auth failed: ${err}`);
      throw new InternalServerErrorException('Payment gateway authentication failed');
    }

    const expiresAtMs = body.data.expiry
      ? new Date(body.data.expiry).getTime()
      : now + 23 * 60 * 60 * 1000;
    this.cachedToken = { token: body.data.token, expiresAtMs };
    return body.data.token;
  }

  async createInvoice(input: CreateInvoiceInput): Promise<{
    uuid: string;
    checkoutUrl: string;
  }> {
    const cfg = this.getConfig();
    if (!cfg) {
      throw new InternalServerErrorException('Multicard is not configured');
    }

    const token = await this.getToken(cfg);
    const amountTiyin = input.amountUzs * 100;

    const payload = {
      store_id: cfg.storeId,
      amount: amountTiyin,
      invoice_id: input.orderId,
      callback_url: cfg.callbackUrl,
      return_url: `${cfg.webBaseUrl}/orders/${input.orderId}?paid=1`,
      return_error_url: `${cfg.webBaseUrl}/orders/${input.orderId}?paid=0`,
      lang: input.lang || 'ru',
    };

    this.logger.log(
      `[multicard] creating invoice for order=${input.orderNumber} amount_tiyin=${amountTiyin}`,
    );

    const res = await fetch(`${cfg.apiUrl}/payment/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const body = (await res.json().catch(() => null)) as MulticardInvoiceResponse | null;
    if (!res.ok || !body?.success || !body.data?.uuid || !body.data?.checkout_url) {
      const err = body?.error?.details || `HTTP ${res.status}`;
      this.logger.error(`[multicard] invoice create failed: ${err}`);
      throw new InternalServerErrorException(`Payment gateway error: ${err}`);
    }

    this.logger.log(
      `[multicard] invoice created uuid=${body.data.uuid} for order=${input.orderNumber}`,
    );
    return { uuid: body.data.uuid, checkoutUrl: body.data.checkout_url };
  }

  verifySignature(payload: Pick<WebhookPayload, 'uuid' | 'invoice_id' | 'amount' | 'sign'>): boolean {
    const cfg = this.getConfig();
    if (!cfg) return false;

    const raw = `${payload.uuid}${payload.invoice_id}${payload.amount}${cfg.secret}`;
    const expected = crypto.createHash('sha1').update(raw).digest('hex');

    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from((payload.sign || '').toLowerCase(), 'utf8');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  }
}
