import { DatabaseInstanceError } from '../utils/error';
import {
  Batida,
  IBatida,
  IBatidaDto,
  pontoDtoSchema,
  pontoSchema,
} from './batida';
import { sequelize } from './db';

async function initDB(): Promise<void> {
  try {
    await sequelize.sync();
  } catch (error) {
    throw new DatabaseInstanceError('Erro ao inicializar o banco de dados', {
      cause: error as Error,
    });
  }
}

export {
  IBatida,
  pontoSchema,
  IBatidaDto,
  pontoDtoSchema,
  Batida,
  sequelize,
  initDB,
};
