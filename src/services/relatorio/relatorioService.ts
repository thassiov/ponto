import {
  differenceInSeconds,
  endOfDay,
  endOfMonth,
  format as formatTime,
  startOfDay,
  startOfMonth,
} from 'date-fns';

import { IAnoMes, IBatida, IExpediente, IRelatorio } from '../../models';
import { BatidaRepository } from '../../repos/batida';
import { MensagensDeErro, ServiceError } from '../../utils/error';
import { segundosParaIsoDuration } from '../../utils/segundosParaIsoDuration';
import { segundosUteisEmMes } from '../../utils/segundosUteisEmMes';

class RelatorioService {
  constructor(private readonly repo: BatidaRepository) {}

  async gerarRelatorioDoDia(
    dia: Date,
    idDeUsuario: number
  ): Promise<IExpediente> {
    try {
      const de = startOfDay(dia);
      const ate = endOfDay(dia);

      const pontos = await this.repo.listarPontosDeUsuarioEmPeriodo(
        idDeUsuario,
        de,
        ate
      );

      if (!pontos.length) {
        throw new Error(MensagensDeErro.ERRO_CRIACAO_RELATORIO_NAO_ENCONTRADO);
      }

      const expedientes = this.gerarExpedientes(pontos);

      if (!expedientes.length) {
        throw new Error('Nao foi possivel gerar o relatorio');
      }

      return expedientes[0] as IExpediente;
    } catch (error) {
      throw new ServiceError('Falha ao gerar relatorio do dia', {
        cause: error as Error,
        details: { input: { dia, idDeUsuario } },
      });
    }
  }

  async gerarRelatorio(
    anoMes: IAnoMes,
    idDeUsuario: number
  ): Promise<IRelatorio> {
    try {
      const de = startOfMonth(anoMes);
      const ate = endOfMonth(anoMes);

      const pontos = await this.repo.listarPontosDeUsuarioEmPeriodo(
        idDeUsuario,
        de,
        ate
      );

      if (!pontos.length) {
        throw new Error(MensagensDeErro.ERRO_CRIACAO_RELATORIO_NAO_ENCONTRADO);
      }

      const segundosUteis = segundosUteisEmMes(anoMes);
      const segundosTrabalhados = this.segundosTrabalhados(pontos);

      const diferenca = this.diferencaEntreSegundosTrabalhadosEUteis(
        segundosTrabalhados,
        segundosUteis
      );
      let excedente = 0;
      let devidas = 0;

      if (diferenca < 0) {
        devidas = diferenca * -1;
      } else {
        excedente = diferenca;
      }

      const expedientes = this.gerarExpedientes(pontos);

      const relatorio: IRelatorio = {
        anoMes,
        expedientes,
        horasTrabalhadas: segundosParaIsoDuration(segundosTrabalhados),
        horasExcedentes: segundosParaIsoDuration(excedente),
        horasDevidas: segundosParaIsoDuration(devidas),
      };

      return relatorio;
    } catch (error) {
      throw new ServiceError('Falha ao gerar relatorio', {
        cause: error as Error,
        details: { input: { anoMes, idDeUsuario } },
      });
    }
  }

  // presume-se que um periodo valido de trabalho ocorre entre dois pontos (entrada e saida).
  // portanto vai ser levado em consideracao apenas pares de pontos para o calculo de duracao
  // de horas trabalhadas
  private segundosTrabalhados(batidas: IBatida[]): number {
    // a ideia e usar a propriedade 'ponto' como uma flag para controlar
    // os pares de pontos. o primeiro elemento abre (true) e o segundo fecha (false).
    // na iteracao onde o ponto estiver aberto, sera feito o calculo entre o que
    // esta na vez ('batida') e o que esta na propriedade 'momento'. so entao o ponto
    // sera fechado
    const registro = {
      momento: null,
      dia: 0,
      ponto: false,
      segundos: 0,
    } as {
      momento: Date | null;
      dia: number;
      ponto: boolean;
      segundos: number;
    };

    for (const batida of batidas) {
      const dia = batida.momentoDate.getDate();
      // so vai acontecer na primeira iteracao
      if (!registro.dia) {
        registro.dia = dia;
        registro.momento = batida.momentoDate;
        registro.ponto = true;
        continue;
      }

      if (dia !== registro.dia) {
        registro.dia = dia;
        registro.momento = batida.momentoDate;
        registro.ponto = true;
        continue;
      }

      if (registro.ponto === true) {
        registro.segundos += differenceInSeconds(
          batida.momentoDate,
          registro.momento as Date
        );
        registro.momento = null;
        registro.ponto = false;
        continue;
      }

      registro.momento = batida.momentoDate;
      registro.ponto = true;
    }

    return registro.segundos;
  }

  private diferencaEntreSegundosTrabalhadosEUteis(
    segundosTrabalhados: number,
    segundosUteis: number
  ): number {
    return segundosTrabalhados - segundosUteis;
  }

  private gerarExpedientes(batidas: IBatida[]): IExpediente[] {
    if (!batidas.length) {
      return [];
    }

    const expedientes: { [diaDoMes: string]: IExpediente } = {};

    batidas.forEach((batida: IBatida) => {
      const diaDoMes = batida.momentoDate.getDate().toString();
      const horaDaBatida = formatTime(batida.momentoDate, 'HH:mm:ss');

      if (!expedientes[diaDoMes]) {
        expedientes[diaDoMes] = {
          dia: formatTime(batida.momentoDate, 'dd/MM/yyyy'),
          pontos: [horaDaBatida],
        };
        return;
      }
      (expedientes[diaDoMes] as IExpediente).pontos.push(horaDaBatida);
    });

    return Object.values(expedientes) as IExpediente[];
  }
}

export { RelatorioService };
