import { Injectable } from '@nestjs/common';
import { logger } from './logger';
import { RequestContextService } from './request-context.service';

export enum TransactionLifecycleEvent {
  INITIATED = 'INITIATED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  VERIFIED = 'VERIFIED',
  PROCESSING = 'PROCESSING',
  FUNDS_RESERVED = 'FUNDS_RESERVED',
  SUBMITTED_TO_GATEWAY = 'SUBMITTED_TO_GATEWAY',
  SETTLEMENT_PENDING = 'SETTLEMENT_PENDING',
  COMPLETED = 'COMPLETED',
  SETTLED = 'SETTLED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  REVERSED = 'REVERSED',
}

export interface TransactionLog {
  event: TransactionLifecycleEvent;
  transactionId: string;
  transactionRef: string;
  transactionType: 'PAYMENT' | 'TRANSFER' | 'CASH_PICKUP' | 'WITHDRAWAL';
  amount: number;
  currency: string;
  sender?: {
    id: number;
    accountNumber?: string;
    bankCode?: string;
  };
  recipient?: {
    id: number;
    accountNumber?: string;
    bankCode?: string;
  };
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  reason?: string;
  externalRef?: string;
  gatewayResponse?: Record<string, any>;
  metadata?: Record<string, any>;
}

@Injectable()
export class TransactionLogService {
  constructor(private requestContext: RequestContextService) {}

  log(transactionLog: TransactionLog): void {
    const context = this.requestContext.getMetadata();

    logger.info('TRANSACTION_LOG', {
      ...transactionLog,
      ...context,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  }

  logInitiated(
    transactionId: string,
    transactionRef: string,
    transactionType: 'PAYMENT' | 'TRANSFER' | 'CASH_PICKUP' | 'WITHDRAWAL',
    amount: number,
    currency: string,
    sender: { id: number; accountNumber?: string },
    recipient: { id: number; accountNumber?: string },
    metadata?: Record<string, any>,
  ): void {
    this.log({
      event: TransactionLifecycleEvent.INITIATED,
      transactionId,
      transactionRef,
      transactionType,
      amount,
      currency,
      sender,
      recipient,
      status: 'SUCCESS',
      metadata,
    });
  }

  logPendingVerification(
    transactionId: string,
    transactionRef: string,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      event: TransactionLifecycleEvent.PENDING_VERIFICATION,
      transactionId,
      transactionRef,
      transactionType: 'PAYMENT',
      amount: 0,
      currency: 'USD',
      status: 'PENDING',
      metadata,
    });
  }

  logVerified(
    transactionId: string,
    transactionRef: string,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      event: TransactionLifecycleEvent.VERIFIED,
      transactionId,
      transactionRef,
      transactionType: 'PAYMENT',
      amount: 0,
      currency: 'USD',
      status: 'SUCCESS',
      metadata,
    });
  }

  logProcessing(
    transactionId: string,
    transactionRef: string,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      event: TransactionLifecycleEvent.PROCESSING,
      transactionId,
      transactionRef,
      transactionType: 'PAYMENT',
      amount: 0,
      currency: 'USD',
      status: 'PENDING',
      metadata,
    });
  }

  logFundsReserved(
    transactionId: string,
    transactionRef: string,
    amount: number,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      event: TransactionLifecycleEvent.FUNDS_RESERVED,
      transactionId,
      transactionRef,
      transactionType: 'PAYMENT',
      amount,
      currency: 'USD',
      status: 'SUCCESS',
      metadata,
    });
  }

  logSubmittedToGateway(
    transactionId: string,
    transactionRef: string,
    gatewayName: string,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      event: TransactionLifecycleEvent.SUBMITTED_TO_GATEWAY,
      transactionId,
      transactionRef,
      transactionType: 'PAYMENT',
      amount: 0,
      currency: 'USD',
      status: 'PENDING',
      metadata: { ...metadata, gatewayName },
    });
  }

  logSettlementPending(
    transactionId: string,
    transactionRef: string,
    expectedSettlementDate: Date,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      event: TransactionLifecycleEvent.SETTLEMENT_PENDING,
      transactionId,
      transactionRef,
      transactionType: 'PAYMENT',
      amount: 0,
      currency: 'USD',
      status: 'PENDING',
      metadata: { ...metadata, expectedSettlementDate },
    });
  }

  logCompleted(
    transactionId: string,
    transactionRef: string,
    externalRef: string,
    amount: number,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      event: TransactionLifecycleEvent.COMPLETED,
      transactionId,
      transactionRef,
      transactionType: 'PAYMENT',
      amount,
      currency: 'USD',
      externalRef,
      status: 'SUCCESS',
      metadata,
    });
  }

  logSettled(
    transactionId: string,
    transactionRef: string,
    externalRef: string,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      event: TransactionLifecycleEvent.SETTLED,
      transactionId,
      transactionRef,
      transactionType: 'PAYMENT',
      amount: 0,
      currency: 'USD',
      externalRef,
      status: 'SUCCESS',
      metadata,
    });
  }

  logFailed(
    transactionId: string,
    transactionRef: string,
    reason: string,
    errorCode?: string,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      event: TransactionLifecycleEvent.FAILED,
      transactionId,
      transactionRef,
      transactionType: 'PAYMENT',
      amount: 0,
      currency: 'USD',
      status: 'FAILURE',
      reason,
      metadata: { ...metadata, errorCode },
    });
  }

  logCancelled(
    transactionId: string,
    transactionRef: string,
    reason: string,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      event: TransactionLifecycleEvent.CANCELLED,
      transactionId,
      transactionRef,
      transactionType: 'PAYMENT',
      amount: 0,
      currency: 'USD',
      status: 'SUCCESS',
      reason,
      metadata,
    });
  }

  logRefunded(
    transactionId: string,
    transactionRef: string,
    originalExternalRef: string,
    refundAmount: number,
    reason: string,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      event: TransactionLifecycleEvent.REFUNDED,
      transactionId,
      transactionRef,
      transactionType: 'PAYMENT',
      amount: refundAmount,
      currency: 'USD',
      status: 'SUCCESS',
      reason,
      metadata: { ...metadata, originalExternalRef },
    });
  }

  logReversed(
    transactionId: string,
    transactionRef: string,
    externalRef: string,
    reason: string,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      event: TransactionLifecycleEvent.REVERSED,
      transactionId,
      transactionRef,
      transactionType: 'PAYMENT',
      amount: 0,
      currency: 'USD',
      externalRef,
      status: 'SUCCESS',
      reason,
      metadata,
    });
  }
}
