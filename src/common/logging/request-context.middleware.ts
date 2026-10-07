import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestContextService } from './request-context.service';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private requestContext: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const requestId = this.requestContext.generateRequestId();
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      this.requestContext.generateCorrelationId();

    const context = {
      requestId,
      correlationId,
      timestamp: new Date(),
      ipAddress: this.getClientIp(req),
      userAgent: req.headers['user-agent'],
    };

    // Store correlation ID in response headers
    res.setHeader('x-request-id', requestId);
    res.setHeader('x-correlation-id', correlationId);

    // Set context for this request
    this.requestContext.setContext(context);

    next();
  }

  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress || 'unknown';
  }
}
