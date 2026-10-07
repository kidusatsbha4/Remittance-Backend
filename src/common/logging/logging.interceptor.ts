import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { PerformanceLogService } from './performance.service';
import { ErrorLogService } from './error.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private performanceLog: PerformanceLogService,
    private errorLog: ErrorLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const { method, url, headers } = request;
    const userId = (request as any).user?.sub;

    let requestSize = 0;
    if (request.body) {
      requestSize = JSON.stringify(request.body).length;
    }

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;
        const responseSize = data ? JSON.stringify(data).length : 0;

        this.performanceLog.logRequest(
          url,
          method,
          statusCode,
          duration,
          requestSize,
          responseSize,
          userId,
          {
            headers: this.sanitizeHeaders(headers),
          },
        );
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error?.status || 500;

        this.errorLog.logException(
          error,
          url,
          method,
          statusCode,
          userId,
          {
            headers: this.sanitizeHeaders(headers),
            body: this.sanitizeBody(request.body),
            query: request.query as Record<string, any>,
          },
        );

        throw error;
      }),
    );
  }

  private sanitizeHeaders(headers: any): Record<string, any> {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];

    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  private sanitizeBody(body: any): Record<string, any> {
    if (!body) return {};

    const sensitiveFields = [
      'password',
      'pin',
      'otp',
      'apiKey',
      'token',
      'secret',
      'creditCard',
      'cardNumber',
      'cvv',
      'ssn',
    ];

    const sanitized = JSON.parse(JSON.stringify(body));

    const sanitizeObject = (obj: any) => {
      if (typeof obj !== 'object' || obj === null) return;

      for (const key in obj) {
        if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
          obj[key] = '***REDACTED***';
        } else if (typeof obj[key] === 'object') {
          sanitizeObject(obj[key]);
        }
      }
    };

    sanitizeObject(sanitized);
    return sanitized;
  }
}
