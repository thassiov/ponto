import { config } from 'dotenv';

config();

const configs = {
  DB_FILE: process.env.DB_FILE || '/data/database.sqlite3',
  API_PORT: process.env.API_PORT || 8080,
  NUMERO_MAXIMO_DE_BATIDAS_NO_DIA:
    parseInt(process.env.NUMERO_MAXIMO_DE_BATIDAS_NO_DIA as string) || 4,
  TEMPO_MINIMO_OBRIGATORIO_DE_ALMOCO:
    parseInt(process.env.TEMPO_MINIMO_OBRIGATORIO_DE_ALMOCO as string) || 60,
};

export { configs };
