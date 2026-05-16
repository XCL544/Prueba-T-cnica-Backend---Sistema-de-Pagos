import { ServerResponse } from 'http';
import { BaseException } from '../exceptions/base.exception';
import { logger } from './logger';

export const handleError = (res: ServerResponse, error: unknown) => {
  if (error instanceof BaseException) {
    logger.warn(`Exception Handled: ${error.message}`, { code: error.code, statusCode: error.statusCode });
    res.writeHead(error.statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(error.toJSON()));
    return;
  }

  // Handle generic errors
  logger.error('Unhandled Error:', error);
  const statusCode = 500;
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      statusCode: statusCode.toString(),
      code: 'INTERNAL_SERVER_ERROR',
      message:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    }),
  );
};
