import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

/**
 * Global interceptor that wraps all successful responses in { success: true, data: ... }
 * If the response already has a `success` property, it's returned as-is.
 */
@Injectable()
export class ResponseWrapperInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Already wrapped (e.g. auth endpoints that return { success: true, token, ... })
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }
        // Wrap raw data
        return { success: true, data };
      }),
    );
  }
}
