import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorLogService } from './error.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private errorLog: ErrorLogService) {}

  catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const path = request.url;
    const method = request.method;
    const userId = (request as any).user?.sub;

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const errorResponse = exception.getResponse();

      if (typeof errorResponse === 'object') {
        message = (errorResponse as any).message || exception.message;
        errorCode = (errorResponse as any).error || 'HTTP_EXCEPTION';
      } else {
        message = errorResponse as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errorCode = exception.constructor.name;
    }

    // Log the error
    const errorId = this.errorLog.logException(
      exception,
      path,
      method,
      statusCode,
      userId,
      {
        headers: this.sanitizeHeaders(request.headers as Record<string, any>),
        body: request.body,
        query: request.query as Record<string, any>,
      },
    );

    // Send response
    response.status(statusCode).json({
      statusCode,
      message,
      errorCode,
      errorId,
      timestamp: new Date().toISOString(),
      path,
    });
  }

  private sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];

    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '***REDACTED***';
      }
    }

    return sanitized;
  }
}
