import { Express } from 'express';
import { Sequelize } from 'sequelize';

import { startApi } from '..';
import { sequelize } from '../../models';
import { BatidaRepository } from '../../repos/batida';
import { BatidaService } from '../../services/batida';
import { RelatorioService } from '../../services/relatorio';
import { Services } from '../../utils/types';

type IntegrationTestServerHelpers = {
  api: Express;
  db: Sequelize;
};

async function setupServer(): Promise<IntegrationTestServerHelpers> {
  const batidaRepository = new BatidaRepository(sequelize);
  const batidaService = new BatidaService(batidaRepository);
  const relatorioService = new RelatorioService(batidaRepository);

  await sequelize.sync();

  const services: Services = {
    batida: batidaService,
    relatorio: relatorioService,
  };

  const api = (await startApi(services, false)) as Express;

  return { api, db: sequelize };
}

export { setupServer };
