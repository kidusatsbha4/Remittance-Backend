import { Injectable } from '@nestjs/common';
import { logger } from './logger';
import { RequestContextService } from './request-context.service';
import * as crypto from 'crypto';

export interface ErrorLog {
  errorId: string;
  errorCode: string;
  message: string;
  statusCode: number;
  statusText: string;
  path: string;
  method: string;
  userId?: number;
  stack?: string;
  cause?: string;
  context?: string;
  request?: {
    headers?: Record<string, any>;
    body?: Record<string, any>;
    query?: Record<string, any>;
  };
  metadata?: Record<string, any>;
}

@Injectable()
export class ErrorLogService {
  constructor(private requestContext: RequestContextService) {}

  generateErrorId(): string {
    return `ERR-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }

  log(errorLog: ErrorLog): void {
    const context = this.requestContext.getMetadata();

    logger.error('ERROR_LOG', {
      ...errorLog,
      ...context,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  }

  logException(
    exception: any,
    path: string,
    method: string,
    statusCode: number,
    userId?: number,
    request?: {
      headers?: Record<string, any>;
      body?: Record<string, any>;
      query?: Record<string, any>;
    },
    metadata?: Record<string, any>,
  ): string {
    const errorId = this.generateErrorId();
    const message = exception?.message || 'Unknown error';
    const stack = exception?.stack;
    const cause = exception?.cause;

    this.log({
      errorId,
      errorCode: exception?.code || 'INTERNAL_ERROR',
      message,
      statusCode,
      statusText: this.getStatusText(statusCode),
      path,
      method,
      userId,
      stack,
      cause,
      context: exception?.constructor?.name,
      request,
      metadata,
    });

    return errorId;
  }

  logValidationError(
    path: string,
    method: string,
    errors: any[],
    userId?: number,
    metadata?: Record<string, any>,
  ): string {
    const errorId = this.generateErrorId();

    this.log({
      errorId,
      errorCode: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      statusCode: 400,
      statusText: 'Bad Request',
      path,
      method,
      userId,
      metadata: { ...metadata, errors },
    });

    return errorId;
  }

  logDatabaseError(
    path: string,
    method: string,
    query: string,
    error: any,
    userId?: number,
    metadata?: Record<string, any>,
  ): string {
    const errorId = this.generateErrorId();

    this.log({
      errorId,
      errorCode: 'DATABASE_ERROR',
      message: error?.message || 'Database operation failed',
      statusCode: 500,
      statusText: 'Internal Server Error',
      path,
      method,
      userId,
      stack: error?.stack,
      context: 'DatabaseError',
      metadata: { ...metadata, query, errorType: error?.constructor?.name },
    });

    return errorId;
  }

  logExternalServiceError(
    path: string,
    method: string,
    provider: string,
    endpoint: string,
    statusCode: number,
    response: any,
    userId?: number,
    metadata?: Record<string, any>,
  ): string {
    const errorId = this.generateErrorId();

    this.log({
      errorId,
      errorCode: 'EXTERNAL_SERVICE_ERROR',
      message: `Error from ${provider}`,
      statusCode,
      statusText: this.getStatusText(statusCode),
      path,
      method,
      userId,
      context: `${provider}Error`,
      metadata: { ...metadata, provider, endpoint, response },
    });

    return errorId;
  }

  logAuthenticationError(
    path: string,
    method: string,
    reason: string,
    userId?: number,
    metadata?: Record<string, any>,
  ): string {
    const errorId = this.generateErrorId();

    this.log({
      errorId,
      errorCode: 'AUTHENTICATION_ERROR',
      message: reason,
      statusCode: 401,
      statusText: 'Unauthorized',
      path,
      method,
      userId,
      context: 'AuthenticationError',
      metadata,
    });

    return errorId;
  }

  logAuthorizationError(
    path: string,
    method: string,
    reason: string,
    userId?: number,
    metadata?: Record<string, any>,
  ): string {
    const errorId = this.generateErrorId();

    this.log({
      errorId,
      errorCode: 'AUTHORIZATION_ERROR',
      message: reason,
      statusCode: 403,
      statusText: 'Forbidden',
      path,
      method,
      userId,
      context: 'AuthorizationError',
      metadata,
    });

    return errorId;
  }

  logNotFoundError(
    path: string,
    method: string,
    resource: string,
    userId?: number,
    metadata?: Record<string, any>,
  ): string {
    const errorId = this.generateErrorId();

    this.log({
      errorId,
      errorCode: 'NOT_FOUND',
      message: `${resource} not found`,
      statusCode: 404,
      statusText: 'Not Found',
      path,
      method,
      userId,
      context: 'NotFoundError',
      metadata,
    });

    return errorId;
  }

  logConflictError(
    path: string,
    method: string,
    reason: string,
    userId?: number,
    metadata?: Record<string, any>,
  ): string {
    const errorId = this.generateErrorId();

    this.log({
      errorId,
      errorCode: 'CONFLICT',
      message: reason,
      statusCode: 409,
      statusText: 'Conflict',
      path,
      method,
      userId,
      context: 'ConflictError',
      metadata,
    });

    return errorId;
  }

  private getStatusText(statusCode: number): string {
    const statusTexts: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
    };

    return statusTexts[statusCode] || 'Unknown Error';
  }
}
