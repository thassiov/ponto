import { nextSaturday, nextSunday } from 'date-fns';

import { IBatidaDto } from '../../models';
import { BatidaRepository } from '../../repos/batida';
import { MensagensDeErro } from '../../utils/error';
import { BatidaService } from './batidaService';

function getIsoDateString(data = new Date()): string {
  data.setMilliseconds(0);
  return data.toISOString();
}

describe('batida service', () => {
  const mockBatidaRepo = {
    criar: jest.fn(),
    jaFoiRegistrada: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('criacao', () => {
    it('cria uma nova batida de ponto', async () => {
      const mockBatida = {
        idDeUsuario: 1,
        momento: getIsoDateString(),
      } as IBatidaDto;

      (mockBatidaRepo.criar as jest.Mock).mockResolvedValueOnce(1);

      const batidaService = new BatidaService(
        mockBatidaRepo as any as BatidaRepository
      );

      const result = await batidaService.criar(mockBatida);

      expect(result).toEqual(1);
      expect(mockBatidaRepo.criar).toHaveBeenCalledWith(mockBatida);
    });

    it('falha ao tentar criar uma batida no dia de sabado', async () => {
      const mockBatida = {
        idDeUsuario: 1,
        momento: getIsoDateString(nextSaturday(new Date())),
      } as IBatidaDto;

      const batidaService = new BatidaService(
        mockBatidaRepo as any as BatidaRepository
      );

      expect(() => batidaService.criar(mockBatida)).rejects.toThrow(
        MensagensDeErro.ERRO_CRIACAO_BATIDA_FIM_DE_SEMANA
      );
    });

    it('falha ao tentar criar uma batida no dia de domingo', async () => {
      const mockBatida = {
        idDeUsuario: 1,
        momento: getIsoDateString(nextSunday(new Date())),
      } as IBatidaDto;

      const batidaService = new BatidaService(
        mockBatidaRepo as any as BatidaRepository
      );

      expect(() => batidaService.criar(mockBatida)).rejects.toThrow(
        MensagensDeErro.ERRO_CRIACAO_BATIDA_FIM_DE_SEMANA
      );
    });

    it('falha ao tentar criar uma mesma batida mais de uma vez', async () => {
      const mockData = new Date();
      const mockIsoData = getIsoDateString(mockData);

      const mockBatida = {
        idDeUsuario: 1,
        momento: mockIsoData,
      } as IBatidaDto;

      (mockBatidaRepo.jaFoiRegistrada as jest.Mock).mockResolvedValueOnce(true);

      const batidaService = new BatidaService(
        mockBatidaRepo as any as BatidaRepository
      );

      expect(() => batidaService.criar(mockBatida)).rejects.toThrow(
        MensagensDeErro.ERRO_CRIACAO_BATIDA_JA_REGISTRADA
      );
    });

    it.todo('falha ao tentar criar mais de 4 batidas em um dia');
    it.todo('falha ao tentar criar batidas sem ter no minimo 1 hora de almoco');
    it.todo('falha ao tentar criar uma batida para um dia que nao e o atual');
  });
});
