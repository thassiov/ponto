import express, { Express } from 'express';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yaml';

import { configs } from '../utils/configs';
import { logger } from '../utils/logger';
import { Services } from '../utils/types';
import { setRouter } from './routers';

require('express-async-errors');

async function startApi(
  services: Services,
  listen = true
): Promise<Express | void> {
  const api = express();

  api.use(express.json());
  api.use(express.urlencoded({ extended: true }));
  const router = setRouter(services);
  api.use('/v1', router);

  if (!listen) {
    // helper para os testes de integracao
    return api;
  }

  api.use(pinoHttp());
  const path = resolve('api.yaml');
  const file = await readFile(path, 'utf8');
  const swaggerDocument = yaml.parse(file);
  api.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  api.listen(configs.API_PORT, () => {
    const endereco = `http://0.0.0.0:${configs.API_PORT}`;
    logger.info(`API REST iniciada no endereco ${endereco}/v1`);
    logger.info(
      `Para acessar a documentacao da API, acesse ${endereco}/api-docs`
    );
  });
}

export { startApi };
