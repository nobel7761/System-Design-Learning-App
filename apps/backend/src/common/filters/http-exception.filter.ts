import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';

/** Duplicate key (11000) errors include keyPattern at runtime */
interface MongoDuplicateKeyError extends MongoError {
  keyPattern?: Record<string, unknown>;
}

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
  stack?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | string[];
    let error: string | undefined;

    // Handle NestJS HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        error = responseObj.error;
      } else {
        message = exception.message;
      }
    }
    // Handle MongoDB/Mongoose errors
    else if (exception instanceof MongoError) {
      status = HttpStatus.BAD_REQUEST;
      const mongoError = exception as MongoError & { code?: number };

      switch (mongoError.code) {
        case 11000: // Duplicate key error
          const field = Object.keys(
            (exception as MongoDuplicateKeyError).keyPattern || {},
          )[0];
          message = `${field} already exists`;
          error = 'Duplicate Entry';
          break;
        case 11001:
          message = 'Duplicate entry detected';
          error = 'Duplicate Entry';
          break;
        default:
          message = 'Database operation failed';
          error = 'Database Error';
      }
    }
    // Handle Mongoose validation errors
    else if (
      exception &&
      typeof exception === 'object' &&
      'name' in exception &&
      (exception.name === 'ValidationError' || exception.name === 'CastError')
    ) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Validation failed';
      error = 'Validation Error';
    }
    // Handle Validation errors (class-validator)
    else if (
      exception &&
      typeof exception === 'object' &&
      'name' in exception &&
      exception.name === 'ValidationError'
    ) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Validation failed';
      error = 'Validation Error';
    }
    // Handle unknown errors
    else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'Internal Server Error';

      // Log unexpected errors
      this.logger.error(
        `Unexpected error: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(error && { error }),
    };

    // Include stack trace in development
    if (process.env.NODE_ENV !== 'production' && exception instanceof Error) {
      errorResponse.stack = exception.stack;
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${JSON.stringify(message)}`,
    );

    response.status(status).json(errorResponse);
  }
}
