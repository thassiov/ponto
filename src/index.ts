import { initDB, sequelize } from './models';
import { BatidaRepository } from './repos/batida';
import { startApi } from './rest-api';
import { BatidaService } from './services/batida';
import { RelatorioService } from './services/relatorio';
import { logger } from './utils/logger';
import { Services } from './utils/types';

const batidaRepository = new BatidaRepository(sequelize);
const batidaService = new BatidaService(batidaRepository);
const relatorioService = new RelatorioService(batidaRepository);

(async () => {
  try {
    logger.info('Inicializando banco de dados');
    await initDB();

    const services: Services = {
      batida: batidaService,
      relatorio: relatorioService,
    };

    logger.info('Inicializando api rest');
    startApi(services);
  } catch (error) {
    logger.error((error as Error).message);
    logger.error((error as Error).stack);
    logger.error('Erro na execucao da aplicacao. Saindo...');
    process.exit(1);
  }
})();
