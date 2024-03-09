import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    console.log(exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    try {
      let { statusCode, message } = exception.getResponse() as any;

      message = typeof message === 'string' ? message : message.join(',');
      response.status(statusCode).json({
        status: statusCode,
        message: 'error',
        errors: [message],
        data: null
      });
    } catch (error) {
      let message = exception.message;
      response.status(500).json({
        status: 500,
        message: 'Failed to process the request',
        error: [message],
        data: null
      });
    }
  }
}