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
      throw new ServiceError('Falha ao criar batida: ', {
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

    if (await this.repo.jaFoiRegistrada(batida)) {
      throw new ValidationError(
        MensagensDeErro.ERRO_CRIACAO_BATIDA_JA_REGISTRADA,
        {
          details: { input: batida },
        }
      );
    }

    if (await this.repo.eAnteriorAUltimaBatidaNoMesmoDia(batida)) {
      throw new ValidationError(
        MensagensDeErro.ERRO_CRIACAO_BATIDA_ANTERIOR_A_BATIDA_PREVIA,
        {
          details: { input: batida },
        }
      );
    }

    if (await this.repo.jaPossuiNumeroMaximoDeBatidas(batida)) {
      throw new ValidationError(
        MensagensDeErro.ERRO_CRIACAO_BATIDA_NUMERO_MAXIMO_REGISTRADO,
        {
          details: { input: batida },
        }
      );
    }

    // isso deve ocorrer na terceira batida, presumindo que o usuario
    // saiu para o almoco (tem a primeira entrada e saida do dia ja registradas)
    if (await this.repo.aindaEstaEmHorarioObrigatorioDeAlmoco(batida)) {
      throw new ValidationError(
        MensagensDeErro.ERRO_CRIACAO_BATIDA_TEMPO_MINIMO_DE_ALMOCO,
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
