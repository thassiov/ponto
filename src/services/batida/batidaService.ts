import { isWeekend } from 'date-fns';

import { IBatidaDto } from '../../models';
import { BatidaRepository } from '../../repos/batida';
import {
  MensagensDeErro,
  ServiceError,
  ValidationError,
} from '../../utils/error';

class BatidaService {
  constructor(private readonly repo: BatidaRepository) {}

  async criar(batida: IBatidaDto): Promise<number> {
    try {
      batida.momentoDate = new Date(batida.momento);

      if (this.eFimDeSemana(batida.momentoDate)) {
        throw new ValidationError(
          MensagensDeErro.ERRO_CRIACAO_BATIDA_FIM_DE_SEMANA,
          {
            details: { input: batida },
          }
        );
      }

      return this.repo.criar(batida);
    } catch (error) {
      throw new ServiceError('Erro ao criar batida', {
        cause: error as Error,
        details: { input: batida },
      });
    }
  }

  private eFimDeSemana(data: Date): boolean {
    return isWeekend(data);
  }
}

export { BatidaService };
