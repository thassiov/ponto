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

      await this.validarBatida(batida);

      const result = await this.repo.criar(batida);

      return result;
    } catch (error) {
      throw new ServiceError('Erro ao criar batida', {
        cause: error as Error,
        details: { input: batida },
      });
    }
  }

  private async validarBatida(batida: IBatidaDto): Promise<void> {
    if (this.eFimDeSemana(batida.momentoDate as Date)) {
      throw new ValidationError(
        MensagensDeErro.ERRO_CRIACAO_BATIDA_FIM_DE_SEMANA,
        {
          details: { input: batida },
        }
      );
    }

    const jaRegistrada = await this.repo.jaFoiRegistrada(batida);

    if (jaRegistrada) {
      throw new ValidationError(
        MensagensDeErro.ERRO_CRIACAO_BATIDA_JA_REGISTRADA,
        {
          details: { input: batida },
        }
      );
    }
  }

  private eFimDeSemana(data: Date): boolean {
    return isWeekend(data);
  }
}

export { BatidaService };
