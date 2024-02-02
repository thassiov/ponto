import { IAnoMes, IRelatorio, anoMesSchema } from '../../models';
import { BatidaRepository } from '../../repos/batida';
import { ServiceError } from '../../utils/error';

class RelatorioService {
  constructor(private readonly repo: BatidaRepository) {}

  async gerarRelatorio(
    anoMes: IAnoMes,
    idDeUsuario: number
  ): Promise<IRelatorio> {
    try {
      return {} as IRelatorio;
    } catch (error) {
      throw new ServiceError('Falha ao gerar relatorio', {
        cause: error as Error,
        details: { input: { anoMes, idDeUsuario } },
      });
    }
  }
}

export { RelatorioService };
