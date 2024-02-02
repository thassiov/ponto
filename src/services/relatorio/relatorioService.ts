import {
  differenceInBusinessDays,
  differenceInSeconds,
  endOfMonth,
  formatISODuration,
  format as formatTime,
  hoursToSeconds,
  startOfMonth,
} from 'date-fns';

import { IAnoMes, IBatida, IExpediente, IRelatorio } from '../../models';
import { BatidaRepository } from '../../repos/batida';
import { MensagensDeErro, ServiceError } from '../../utils/error';

class RelatorioService {
  constructor(private readonly repo: BatidaRepository) {}

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

      const segundosUteis = this.segundosUteisDurantePeriodo(de, ate);
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
        horasTrabalhadas: formatISODuration({ seconds: segundosTrabalhados }),
        horasExcedentes: formatISODuration({ seconds: excedente }),
        horasDevidas: formatISODuration({ seconds: devidas }),
      };

      return relatorio;
    } catch (error) {
      throw new ServiceError('Falha ao gerar relatorio', {
        cause: error as Error,
        details: { input: { anoMes, idDeUsuario } },
      });
    }
  }

  // ao inves de contar as horas uteis, vamos contar os segundos uteis
  // para ter uma acuracia maior durante a criacao dos reports em ISO
  private segundosUteisDurantePeriodo(de: Date, ate: Date): number {
    const diasUteis = differenceInBusinessDays(ate, de);
    const segundosUteis = hoursToSeconds(diasUteis * 8);
    return segundosUteis;
  }

  // presume-se que um periodo valido de trabalho ocorre entre dois pontos (entrada e saida).
  // portanto vai ser levado em consideracao apenas pares de pontos para o calculo de duracao
  // de horas trabalhadas
  segundosTrabalhados(batidas: IBatida[]): number {
    // a ideia e usar a propriedade 'par' como uma flag para controlar
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
