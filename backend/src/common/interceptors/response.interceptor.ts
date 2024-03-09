import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    let statusCode = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      map((res) => {
        return {
          status: statusCode,
          message: res.message,
          errors: [],
          data: res.data,
        };
      })
    );
  }
}