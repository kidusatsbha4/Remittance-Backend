// src/common/interceptors/transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
  const request = context.switchToHttp().getRequest();

  const skip = this.reflector.get<boolean>(
      'skip_transform',
      context.getHandler(),
    );
   // ✅ 2. OR auto-skip CyberSource/payment routes
    if (skip || request.url.includes('/payments')) {
      return next.handle(); // 🔥 return raw response
    }

  return next.handle().pipe(
    map((response) => {
      // If response is paginated object
      if (response?.data && Array.isArray(response.data)) {
        const { data, total, page, pageSize } = response;

        const totalPages = Math.ceil(total / pageSize);

        const baseUrl = request.protocol + '://' + request.get('host') + request.path;

        return {
          status: 'success',
          count: total,
          total_pages: totalPages,
          current_page: page,
          next:
            page < totalPages
              ? `${baseUrl}?page=${page + 1}&page_size=${pageSize}`
              : null,
          previous:
            page > 1
              ? `${baseUrl}?page=${page - 1}&page_size=${pageSize}`
              : null,
          page_size: pageSize,
          data: data,
        };
      }

      // Single object
      if (response && typeof response === 'object') {
        return {
          status: 'success',
          data: response,
        };
      }

      return {
        status: 'success',
        data: response,
      };
    }),
  );
}
}