import express from 'express';

import { Services } from '../../utils/types';
import { errorHandler } from '../middlewares/errorHandler';
import { criaBatidaHandlerFactory } from './criaBatidaHandlerFactory';

function setRouter(services: Services): express.Router {
  const router = express.Router();

  router.post(
    '/batidas',
    criaBatidaHandlerFactory(services.batida, services.relatorio)
  );

  router.use(errorHandler);

  return router;
}

export { setRouter };
