import express from 'express';

import { Services } from '../../utils/types';
import { errorHandler } from '../middlewares/errorHandler';
import { criaBatidaHandlerFactory } from './criaBatidaHandlerFactory';
import { gerarRelatorioHandlerFactory } from './gerarRelatorioHandlerFactory';

function setRouter(services: Services): express.Router {
  const router = express.Router();

  router.post(
    '/batidas',
    criaBatidaHandlerFactory(services.batida, services.relatorio)
  );

  router.get(
    '/folhas-de-ponto/:anoMes',
    gerarRelatorioHandlerFactory(services.relatorio)
  );

  router.use(errorHandler);

  return router;
}

export { setRouter };
