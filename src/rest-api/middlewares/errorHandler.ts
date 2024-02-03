import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { logger } from '../../utils/logger';

function errorHandler(
  err: Error,
  _r: Request,
  res: Response,
  _n: NextFunction
): void {
  logger.error(err.stack);

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: {
      message: err.message,
    },
  });
  return;
}

export { errorHandler };
