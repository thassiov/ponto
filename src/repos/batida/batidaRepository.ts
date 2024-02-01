import { ModelStatic, Sequelize, Transaction } from 'sequelize';

import { Batida, IBatidaDto } from '../../models';

class BatidaRepository {
  db: ModelStatic<Batida>;
  constructor(private readonly sequelize: Sequelize) {
    this.db = this.sequelize.model('batida');
  }

  async criar(_: IBatidaDto): Promise<number> {
    this.getTransaction();
    return 1;
  }

  async jaFoiRegistrada(_: IBatidaDto): Promise<boolean> {
    return false;
  }

  private async getTransaction(): Promise<Transaction> {
    const t = await this.sequelize.transaction();
    return t;
  }
}

export { BatidaRepository };
