import { config } from 'dotenv';

config();

const configs = {
  DB_FILE: process.env.DB_FILE || '/data/database.sqlite3',
  API_PORT: process.env.API_PORT || 8080,
};

export { configs };
