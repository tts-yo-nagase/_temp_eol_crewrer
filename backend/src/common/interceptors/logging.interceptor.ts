import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { consola } from 'consola';
import { Request, Response } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    sub?: string;
    email?: string;
    name?: string;
  };
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const method: string = request.method;
    const url: string = request.url;
    const user = request.user;
    const startTime = Date.now();

    // Extract user info if authenticated
    const userId: string = user?.id || user?.sub || 'anonymous';
    const userInfo: string = user ? ` | User: ${userId}` : '';

    // Log request start
    consola.info(`→ ${method} ${url}${userInfo}`);

    return next.handle().pipe(
      tap(() => {
        // Log successful response
        const response = context.switchToHttp().getResponse<Response>();
        const statusCode: number = response.statusCode;
        const duration = Date.now() - startTime;

        consola.success(`← ${method} ${url} | ${statusCode} | ${duration}ms`);
      }),
      catchError((error: Error) => {
        // Log error response
        const duration = Date.now() - startTime;
        const statusCode = error instanceof HttpException ? error.getStatus() : 500;
        const message = error instanceof HttpException ? error.message : 'Internal server error';

        consola.error(`✖ ${method} ${url} | ${statusCode} | ${message} | ${duration}ms`);

        return throwError(() => error);
      })
    );
  }
}
