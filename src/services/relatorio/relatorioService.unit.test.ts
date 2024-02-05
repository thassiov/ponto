import { hoursToSeconds } from 'date-fns';

import { IAnoMes, IBatida } from '../../models';
import { BatidaRepository } from '../../repos/batida';
import { MensagensDeErro } from '../../utils/error';
import { segundosParaIsoDuration } from '../../utils/segundosParaIsoDuration';
import { geraPontosDoMesComHorasDevidas } from '../../utils/testes/mocks/geraPontosDoMesComHorasDevidas';
import { geraPontosDoMesComHorasExcedentes } from '../../utils/testes/mocks/geraPontosDoMesComHorasExcedentes';
import { geraPontosDoMesComHorasUteisCompletas } from '../../utils/testes/mocks/geraPontosDoMesComHorasUteisCompletas';
import { RelatorioService } from './relatorioService';

describe('relatorioService', () => {
  const mockBatidaRepo = {
    criar: jest.fn(),
    jaFoiRegistrada: jest.fn(),
    jaPossuiNumeroMaximoDeBatidas: jest.fn(),
    aindaEstaEmHorarioObrigatorioDeAlmoco: jest.fn(),
    eAnteriorAUltimaBatidaNoMesmoDia: jest.fn(),
    listarPontosDeUsuarioEmPeriodo: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('criacao', () => {
    it('cria um relatorio do mes com todas as horas uteis trabalhadas', async () => {
      const mockAnoMes = '2018-08' as IAnoMes;
      const diasUteisEmAnoMes = 23;
      const horasUteis = 184;
      const mockIdDeUsuario = 1;

      (
        mockBatidaRepo.listarPontosDeUsuarioEmPeriodo as jest.Mock
      ).mockResolvedValueOnce(
        geraPontosDoMesComHorasUteisCompletas(mockAnoMes, mockIdDeUsuario)
      );

      const relatorioService = new RelatorioService(
        mockBatidaRepo as any as BatidaRepository
      );

      const result = await relatorioService.gerarRelatorio(
        mockAnoMes,
        mockIdDeUsuario
      );

      expect(result.anoMes).toEqual(mockAnoMes);
      expect(result.expedientes.length).toEqual(diasUteisEmAnoMes);
      expect(result.horasTrabalhadas).toEqual(
        segundosParaIsoDuration(hoursToSeconds(horasUteis))
      );
      expect(result.horasExcedentes).toEqual(
        segundosParaIsoDuration(hoursToSeconds(0))
      );
      expect(result.horasDevidas).toEqual(
        segundosParaIsoDuration(hoursToSeconds(0))
      );
    });

    it('cria um relatorio do mes com 10 horas excedentes', async () => {
      const mockAnoMes = '2018-08' as IAnoMes;
      const diasUteisEmAnoMes = 23;
      const horasUteis = 184;
      const mockIdDeUsuario = 1;
      const dezHorasEmSegundos = 36000;

      (
        mockBatidaRepo.listarPontosDeUsuarioEmPeriodo as jest.Mock
      ).mockResolvedValueOnce(
        geraPontosDoMesComHorasExcedentes(
          mockAnoMes,
          dezHorasEmSegundos,
          mockIdDeUsuario
        )
      );

      const relatorioService = new RelatorioService(
        mockBatidaRepo as any as BatidaRepository
      );

      const result = await relatorioService.gerarRelatorio(
        mockAnoMes,
        mockIdDeUsuario
      );

      expect(result.anoMes).toEqual(mockAnoMes);
      expect(result.expedientes.length).toEqual(diasUteisEmAnoMes);
      expect(result.horasTrabalhadas).toEqual(
        segundosParaIsoDuration(hoursToSeconds(horasUteis) + dezHorasEmSegundos)
      );
      expect(result.horasExcedentes).toEqual(
        segundosParaIsoDuration(dezHorasEmSegundos)
      );
      expect(result.horasDevidas).toEqual(
        segundosParaIsoDuration(hoursToSeconds(0))
      );
    });

    it('cria um relatorio do mes com 14 horas devidas', async () => {
      const mockAnoMes = '2018-08' as IAnoMes;
      const diasUteisEmAnoMes = 23;
      const horasUteis = 184;
      const mockIdDeUsuario = 1;
      const quatorzeHorasEmSegundos = 50400;

      (
        mockBatidaRepo.listarPontosDeUsuarioEmPeriodo as jest.Mock
      ).mockResolvedValueOnce(
        geraPontosDoMesComHorasDevidas(
          mockAnoMes,
          quatorzeHorasEmSegundos,
          mockIdDeUsuario
        )
      );

      const relatorioService = new RelatorioService(
        mockBatidaRepo as any as BatidaRepository
      );

      const result = await relatorioService.gerarRelatorio(
        mockAnoMes,
        mockIdDeUsuario
      );

      expect(result.anoMes).toEqual(mockAnoMes);
      expect(result.expedientes.length).toEqual(diasUteisEmAnoMes);
      expect(result.horasTrabalhadas).toEqual(
        segundosParaIsoDuration(
          hoursToSeconds(horasUteis) - quatorzeHorasEmSegundos
        )
      );
      expect(result.horasExcedentes).toEqual(segundosParaIsoDuration(0));
      expect(result.horasDevidas).toEqual(
        segundosParaIsoDuration(quatorzeHorasEmSegundos)
      );
    });

    it('cria um relatorio do mes com 3 dias trabalhados, um deles somente meio periodo', async () => {
      const mockAnoMes = '2018-08' as IAnoMes;
      const horasUteis = 184;
      const mockIdDeUsuario = 1;
      // dois dias inteiros (16) + meio periodo (4)
      const horasTrabalhadas = 20;
      const horasDevidas = horasUteis - horasTrabalhadas;
      // manha do segundo dia
      const remover = [4, 5];

      const mesDeTresDias = geraPontosDoMesComHorasUteisCompletas(
        mockAnoMes,
        mockIdDeUsuario
      )
        .slice(0, 12)
        .map((batida: IBatida, index: number) => {
          if (remover.includes(index)) {
            return;
          }
          return batida;
        })
        .filter((b) => b);

      (
        mockBatidaRepo.listarPontosDeUsuarioEmPeriodo as jest.Mock
      ).mockResolvedValueOnce(mesDeTresDias);

      const relatorioService = new RelatorioService(
        mockBatidaRepo as any as BatidaRepository
      );

      const result = await relatorioService.gerarRelatorio(
        mockAnoMes,
        mockIdDeUsuario
      );

      expect(result.anoMes).toEqual(mockAnoMes);
      expect(result.expedientes.length).toEqual(3);
      expect(result.horasTrabalhadas).toEqual(
        segundosParaIsoDuration(hoursToSeconds(horasTrabalhadas))
      );
      expect(result.horasExcedentes).toEqual(
        segundosParaIsoDuration(hoursToSeconds(0))
      );
      expect(result.horasDevidas).toEqual(
        segundosParaIsoDuration(hoursToSeconds(horasDevidas))
      );
    });

    it('cria um relatorio do mes com 4 dias trabalhados, um deles a pessoa nao bateu o ultimo ponto (4)', async () => {
      // a ideia desse teste e verificar os periodos validos (abre e fecha ponto)
      // se a pessoa nao fechou o ponto, aquele periodo nao e valido, entao nao
      // conta no relatorio
      const mockAnoMes = '2018-08' as IAnoMes;
      const horasUteis = 184;
      const mockIdDeUsuario = 1;
      // dois dias inteiros (16) + meio periodo (4)
      const horasTrabalhadas = 28;
      const horasDevidas = horasUteis - horasTrabalhadas;
      // nao bateu o ponto de saida no segundo dia
      const remover = [7];

      const mesDeTresDias = geraPontosDoMesComHorasUteisCompletas(
        mockAnoMes,
        mockIdDeUsuario
      )
        .slice(0, 16)
        .map((batida: IBatida, index: number) => {
          if (remover.includes(index)) {
            return;
          }
          return batida;
        })
        .filter((b) => b);

      (
        mockBatidaRepo.listarPontosDeUsuarioEmPeriodo as jest.Mock
      ).mockResolvedValueOnce(mesDeTresDias);

      const relatorioService = new RelatorioService(
        mockBatidaRepo as any as BatidaRepository
      );

      const result = await relatorioService.gerarRelatorio(
        mockAnoMes,
        mockIdDeUsuario
      );

      expect(result.anoMes).toEqual(mockAnoMes);
      expect(result.expedientes.length).toEqual(4);
      expect(result.horasTrabalhadas).toEqual(
        segundosParaIsoDuration(hoursToSeconds(horasTrabalhadas))
      );
      expect(result.horasExcedentes).toEqual(
        segundosParaIsoDuration(hoursToSeconds(0))
      );
      expect(result.horasDevidas).toEqual(
        segundosParaIsoDuration(hoursToSeconds(horasDevidas))
      );
    });

    it('falha ao tentar criar um relatorio sem registros', async () => {
      const mockAnoMes = '2018-08' as IAnoMes;
      const mockIdDeUsuario = 1;

      (
        mockBatidaRepo.listarPontosDeUsuarioEmPeriodo as jest.Mock
      ).mockResolvedValueOnce([]);

      const relatorioService = new RelatorioService(
        mockBatidaRepo as any as BatidaRepository
      );

      expect(() =>
        relatorioService.gerarRelatorio(mockAnoMes, mockIdDeUsuario)
      ).rejects.toThrow(MensagensDeErro.ERRO_CRIACAO_RELATORIO_NAO_ENCONTRADO);
    });
  });
});
