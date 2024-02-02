import { differenceInMinutes, endOfDay, startOfDay } from 'date-fns';
import { ModelStatic, Op, Sequelize, Transaction } from 'sequelize';

import { Batida, IBatida, IBatidaDto } from '../../models';
import { configs } from '../../utils/configs';
import { RepositoryError } from '../../utils/error';

class BatidaRepository {
  db: ModelStatic<Batida>;
  constructor(private readonly sequelize: Sequelize) {
    this.db = this.sequelize.model('batida');
  }

  async criar(batidaDto: IBatidaDto): Promise<number> {
    const transaction = await this.getTransaction();
    try {
      const result = await this.db.create<Batida>(batidaDto, { transaction });
      await transaction.commit();
      return result.get('id') as number;
    } catch (error) {
      await transaction.rollback();
      throw new RepositoryError(
        'Erro ao criar uma nova batida no banco de dados',
        {
          cause: error as Error,
          details: {
            input: batidaDto,
          },
        }
      );
    }
  }

  async listarPontosDeUsuarioEmPeriodo(
    idDeUsuario: number,
    de: Date,
    ate: Date
  ): Promise<IBatida[]> {
    try {
      const result = await this.db.findAll<Batida>({
        where: {
          idDeUsuario: {
            [Op.eq]: idDeUsuario,
          },
          momentoDate: {
            [Op.between]: [de, ate],
          },
        },
      });

      return result.map((b) => b.toJSON() as IBatida);
    } catch (error) {
      throw new RepositoryError('Erro ao listar pontos durante periodo', {
        cause: error as Error,
        details: {
          input: { idDeUsuario, de, ate },
        },
      });
    }
  }

  async jaFoiRegistrada(batidaDto: IBatidaDto): Promise<boolean> {
    try {
      const result = await this.db.findOne<Batida>({
        where: {
          idDeUsuario: {
            [Op.eq]: batidaDto.idDeUsuario,
          },
          momentoDate: {
            [Op.eq]: batidaDto.momentoDate,
          },
        },
      });

      if (!result) {
        return false;
      }

      return true;
    } catch (error) {
      throw new RepositoryError(
        'Erro ao verificar se uma batida ja foi registrada',
        {
          cause: error as Error,
          details: {
            input: batidaDto,
          },
        }
      );
    }
  }

  async jaPossuiNumeroMaximoDeBatidas(batidaDto: IBatidaDto): Promise<boolean> {
    try {
      const result = await this.db.count<Batida>({
        where: {
          idDeUsuario: {
            [Op.eq]: batidaDto.idDeUsuario,
          },
          momentoDate: {
            [Op.between]: [
              startOfDay(batidaDto.momentoDate as Date),
              endOfDay(batidaDto.momentoDate as Date),
            ],
          },
        },
      });

      if (result < configs.NUMERO_MAXIMO_DE_BATIDAS_NO_DIA) {
        return false;
      }

      return true;
    } catch (error) {
      throw new RepositoryError(
        'Erro ao verificar se o usuario ja fez o numero maximo de batidas no dia',
        {
          cause: error as Error,
          details: {
            input: batidaDto,
          },
        }
      );
    }
  }

  // esse nome e meio grande mas foi o que deu
  async aindaEstaEmHorarioObrigatorioDeAlmoco(
    batidaDto: IBatidaDto
  ): Promise<boolean> {
    try {
      const result = await this.db.findAll<Batida>({
        where: {
          idDeUsuario: {
            [Op.eq]: batidaDto.idDeUsuario,
          },
          momentoDate: {
            [Op.between]: [
              startOfDay(batidaDto.momentoDate as Date),
              endOfDay(batidaDto.momentoDate as Date),
            ],
          },
        },
      });

      // o usuario ainda nao saiu para o almoco (1 batida) ou ja voltou do
      // almoco (3 batidas)
      if (result.length !== 2) {
        return false;
      }

      const inicioDoAlmoco = (result[1] as Batida).get('momentoDate') as Date;
      const finalDoAlmoco = batidaDto.momentoDate as Date;

      // o tempo minimo (em minutos) ja passou
      if (
        differenceInMinutes(inicioDoAlmoco, finalDoAlmoco) >=
        configs.TEMPO_MINIMO_OBRIGATORIO_DE_ALMOCO
      ) {
        return false;
      }

      return true;
    } catch (error) {
      throw new RepositoryError(
        'Erro ao verificar se o tempo minimo de almoco do usuario ja decorreu',
        {
          cause: error as Error,
          details: {
            input: batidaDto,
          },
        }
      );
    }
  }

  private async getTransaction(): Promise<Transaction> {
    const t = await this.sequelize.transaction();
    return t;
  }
}

export { BatidaRepository };
