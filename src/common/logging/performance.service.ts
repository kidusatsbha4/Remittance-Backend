import { Injectable } from '@nestjs/common';
import { logger } from './logger';
import { RequestContextService } from './request-context.service';

export interface PerformanceLog {
  endpoint: string;
  method: string;
  statusCode: number;
  duration: number; // in ms
  requestSize: number; // in bytes
  responseSize: number; // in bytes
  userId?: number;
  slow: boolean;
  threshold?: 'CRITICAL' | 'SLOW';
  memoryUsed?: number;
  cpuUsage?: number;
  metadata?: Record<string, any>;
}

@Injectable()
export class PerformanceLogService {
  private readonly SLOW_REQUEST_THRESHOLD = 1000; // 1 second in ms
  private readonly CRITICAL_THRESHOLD = 5000; // 5 seconds in ms

  constructor(private requestContext: RequestContextService) {}

  log(performanceLog: PerformanceLog): void {
    const context = this.requestContext.getMetadata();

    logger.info('PERFORMANCE_LOG', {
      ...performanceLog,
      ...context,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  }

  logRequest(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    requestSize: number = 0,
    responseSize: number = 0,
    userId?: number,
    metadata?: Record<string, any>,
  ): void {
    const slow = duration > this.SLOW_REQUEST_THRESHOLD;
    let threshold: 'CRITICAL' | 'SLOW' | null = null;

    if (duration > this.CRITICAL_THRESHOLD) {
      threshold = 'CRITICAL';
    } else if (slow) {
      threshold = 'SLOW';
    }

    this.log({
      endpoint,
      method,
      statusCode,
      duration,
      requestSize,
      responseSize,
      userId,
      slow,
      threshold: threshold ? threshold : undefined,
      metadata,
    });

    // Log warning for slow requests
    if (slow) {
      const level = duration > this.CRITICAL_THRESHOLD ? 'error' : 'warn';
      const context = this.requestContext.getMetadata();
      logger[level](`SLOW_REQUEST_${threshold}`, {
        endpoint,
        method,
        duration,
        threshold,
        statusCode,
        ...context,
      });
    }
  }

  logDatabaseQuery(
    query: string,
    duration: number,
    rowsAffected: number,
    success: boolean,
    error?: string,
    metadata?: Record<string, any>,
  ): void {
    const slow = duration > 500; // Database queries slower than 500ms

    logger.info('DATABASE_QUERY_LOG', {
      query,
      duration,
      rowsAffected,
      success,
      error,
      slow,
      ...this.requestContext.getMetadata(),
      metadata,
      timestamp: new Date().toISOString(),
    });

    if (slow) {
      logger.warn('SLOW_DATABASE_QUERY', {
        query,
        duration,
        rowsAffected,
        ...this.requestContext.getMetadata(),
      });
    }
  }

  logCacheOperation(
    operation: 'GET' | 'SET' | 'DELETE' | 'INVALIDATE',
    key: string,
    duration: number,
    hit: boolean,
    size?: number,
    metadata?: Record<string, any>,
  ): void {
    logger.debug('CACHE_OPERATION_LOG', {
      operation,
      key,
      duration,
      hit,
      size,
      ...this.requestContext.getMetadata(),
      metadata,
      timestamp: new Date().toISOString(),
    });
  }

  logExternalApiCall(
    provider: string,
    endpoint: string,
    duration: number,
    statusCode: number,
    success: boolean,
    error?: string,
    metadata?: Record<string, any>,
  ): void {
    const slow = duration > this.SLOW_REQUEST_THRESHOLD;

    logger.info('EXTERNAL_API_CALL_LOG', {
      provider,
      endpoint,
      duration,
      statusCode,
      success,
      error,
      slow,
      ...this.requestContext.getMetadata(),
      metadata,
      timestamp: new Date().toISOString(),
    });

    if (slow) {
      logger.warn('SLOW_EXTERNAL_API_CALL', {
        provider,
        endpoint,
        duration,
        statusCode,
        ...this.requestContext.getMetadata(),
      });
    }
  }

  logMemoryUsage(
    heapUsed: number,
    heapTotal: number,
    external: number,
    rss: number,
    metadata?: Record<string, any>,
  ): void {
    logger.debug('MEMORY_USAGE_LOG', {
      heapUsed,
      heapTotal,
      external,
      rss,
      percentageUsed: ((heapUsed / heapTotal) * 100).toFixed(2),
      ...this.requestContext.getMetadata(),
      metadata,
      timestamp: new Date().toISOString(),
    });
  }

  logSystemMetrics(
    cpu: number,
    memory: number,
    uptime: number,
    metadata?: Record<string, any>,
  ): void {
    logger.info('SYSTEM_METRICS_LOG', {
      cpu,
      memory,
      uptime,
      timestamp: new Date().toISOString(),
      ...this.requestContext.getMetadata(),
      metadata,
    });
  }
}
