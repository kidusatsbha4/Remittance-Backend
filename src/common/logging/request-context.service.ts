import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import * as crypto from 'crypto';

export interface RequestContext {
  requestId: string;
  correlationId: string;
  transactionId?: string;
  userId?: number;
  merchantId?: number;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class RequestContextService {
  private asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

  generateRequestId(): string {
    return crypto.randomUUID();
  }

  generateCorrelationId(): string {
    return crypto.randomUUID();
  }

  setContext(context: RequestContext): void {
    this.asyncLocalStorage.enterWith(context);
  }

  getContext(): RequestContext | undefined {
    return this.asyncLocalStorage.getStore();
  }

  getRequestId(): string {
    return this.getContext()?.requestId || 'unknown';
  }

  getCorrelationId(): string {
    return this.getContext()?.correlationId || 'unknown';
  }

  getTransactionId(): string | undefined {
    return this.getContext()?.transactionId;
  }

  setTransactionId(transactionId: string): void {
    const context = this.getContext();
    if (context) {
      context.transactionId = transactionId;
    }
  }

  setUserId(userId: number): void {
    const context = this.getContext();
    if (context) {
      context.userId = userId;
    }
  }

  setMerchantId(merchantId: number): void {
    const context = this.getContext();
    if (context) {
      context.merchantId = merchantId;
    }
  }

  getMetadata(): Record<string, any> {
    const context = this.getContext();
    return {
      requestId: context?.requestId,
      correlationId: context?.correlationId,
      transactionId: context?.transactionId,
      userId: context?.userId,
      merchantId: context?.merchantId,
      timestamp: context?.timestamp,
    };
  }
}
