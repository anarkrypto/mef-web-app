import { NextResponse } from 'next/server';
import { AppError } from './errors';
import { HTTPStatus } from '@/constants/errors';
import logger from '@/logging';

export class ApiResponse {
  static success<T>(data: T) {
    return NextResponse.json(data);
  }

  static error(error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    logger.error('Unhandled error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: HTTPStatus.INTERNAL_ERROR }
    );
  }
} 