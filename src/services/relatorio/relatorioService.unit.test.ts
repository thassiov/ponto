import { hoursToSeconds } from 'date-fns';

import { IAnoMes } from '../../models';
import { BatidaRepository } from '../../repos/batida';
import { segundosParaIsoDuration } from '../../utils/segundosParaIsoDuration';
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
    it('cria um relatorio do mes', async () => {
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
  });
});
