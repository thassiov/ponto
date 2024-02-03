import { NextFunction, Request, Response } from 'express';

import { logger } from '../../utils/logger';

function errorHandler(
  err: Error,
  _r: Request,
  res: Response,
  _n: NextFunction
): void {
  logger.error(err.stack);

  const statusCode = (err as any).statusCode || 500;

  res.status(statusCode).json({
    error: {
      message: err.message,
      status: statusCode,
    },
  });
}

export { errorHandler };
