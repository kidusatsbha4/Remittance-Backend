import { Injectable } from '@nestjs/common';
import { logger } from './logger';
import { RequestContextService } from './request-context.service';

export enum IntegrationEvent {
  REQUEST_SENT = 'REQUEST_SENT',
  RESPONSE_RECEIVED = 'RESPONSE_RECEIVED',
  REQUEST_FAILED = 'REQUEST_FAILED',
  TIMEOUT = 'TIMEOUT',
  RETRY_ATTEMPT = 'RETRY_ATTEMPT',
  WEBHOOK_RECEIVED = 'WEBHOOK_RECEIVED',
  WEBHOOK_PROCESSED = 'WEBHOOK_PROCESSED',
  CONNECTION_ESTABLISHED = 'CONNECTION_ESTABLISHED',
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
}

export interface IntegrationLog {
  event: IntegrationEvent;
  provider: string; // CyberSource, Visa Direct, Core Banking, etc.
  endpoint: string;
  method: string;
  requestId: string;
  status: 'SUCCESS' | 'FAILURE';
  httpStatusCode?: number;
  duration: number; // in ms
  request?: Record<string, any>;
  response?: Record<string, any>;
  error?: string;
  reason?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class IntegrationLogService {
  constructor(private requestContext: RequestContextService) {}

  log(integrationLog: IntegrationLog): void {
    const context = this.requestContext.getMetadata();

    logger.info('INTEGRATION_LOG', {
      ...integrationLog,
      ...context,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  }

  logRequestSent(
    provider: string,
    endpoint: string,
    method: string,
    requestId: string,
    request: Record<string, any>,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      event: IntegrationEvent.REQUEST_SENT,
      provider,
      endpoint,
      method,
      requestId,
      status: 'SUCCESS',
      request,
      duration: 0,
      metadata,
    });
  }

  logResponseReceived(
    provider: string,
    endpoint: string,
    method: string,
    requestId: string,
    httpStatusCode: number,
    duration: number,
    response: Record<string, any>,
    metadata?: Record<string, any>,
  ): void {
    const status = httpStatusCode >= 200 && httpStatusCode < 300 ? 'SUCCESS' : 'FAILURE';

    this.log({
      event: IntegrationEvent.RESPONSE_RECEIVED,
      provider,
      endpoint,
      method,
      requestId,
      status,
      httpStatusCode,
      duration,
      response,
      metadata,
    });
  }

  logRequestFailed(
    provider: string,
    endpoint: string,
    method: string,
    requestId: string,
    error: string,
    reason: string,
    duration: number,
    httpStatusCode?: number,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      event: IntegrationEvent.REQUEST_FAILED,
      provider,
      endpoint,
      method,
      requestId,
      status: 'FAILURE',
      httpStatusCode,
      duration,
      error,
      reason,
      metadata,
    });
  }

  logTimeout(
    provider: string,
    endpoint: string,
    method: string,
    requestId: string,
    timeout: number,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      event: IntegrationEvent.TIMEOUT,
      provider,
      endpoint,
      method,
      requestId,
      status: 'FAILURE',
      duration: timeout,
      reason: `Request timeout after ${timeout}ms`,
      metadata,
    });
  }

  logRetryAttempt(
    provider: string,
    endpoint: string,
    method: string,
    requestId: string,
    attempt: number,
    reason: string,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      event: IntegrationEvent.RETRY_ATTEMPT,
      provider,
      endpoint,
      method,
      requestId,
      status: 'SUCCESS',
      duration: 0,
      reason,
      metadata: { ...metadata, attempt },
    });
  }

  logWebhookReceived(
    provider: string,
    endpoint: string,
    requestId: string,
    payload: Record<string, any>,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      event: IntegrationEvent.WEBHOOK_RECEIVED,
      provider,
      endpoint,
      method: 'POST',
      requestId,
      status: 'SUCCESS',
      request: payload,
      duration: 0,
      metadata,
    });
  }

  logWebhookProcessed(
    provider: string,
    endpoint: string,
    requestId: string,
    processingTime: number,
    status: 'SUCCESS' | 'FAILURE',
    result: Record<string, any>,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      event: IntegrationEvent.WEBHOOK_PROCESSED,
      provider,
      endpoint,
      method: 'POST',
      requestId,
      status,
      duration: processingTime,
      response: result,
      metadata,
    });
  }

  logConnectionEstablished(
    provider: string,
    endpoint: string,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      event: IntegrationEvent.CONNECTION_ESTABLISHED,
      provider,
      endpoint,
      method: 'CONNECT',
      requestId: 'system',
      status: 'SUCCESS',
      duration: 0,
      metadata,
    });
  }

  logConnectionFailed(
    provider: string,
    endpoint: string,
    reason: string,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      event: IntegrationEvent.CONNECTION_FAILED,
      provider,
      endpoint,
      method: 'CONNECT',
      requestId: 'system',
      status: 'FAILURE',
      duration: 0,
      reason,
      metadata,
    });
  }

  logAuthenticationFailed(
    provider: string,
    endpoint: string,
    reason: string,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      event: IntegrationEvent.AUTHENTICATION_FAILED,
      provider,
      endpoint,
      method: 'AUTH',
      requestId: 'system',
      status: 'FAILURE',
      duration: 0,
      reason,
      metadata,
    });
  }
}
