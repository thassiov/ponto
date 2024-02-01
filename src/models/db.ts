import { Sequelize } from 'sequelize';

import { configs } from '../utils/configs';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: configs.DB_FILE,
});

export { sequelize };
