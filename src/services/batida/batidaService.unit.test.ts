import { nextSaturday, nextSunday } from 'date-fns';

import { IBatidaDto } from '../../models';
import { BatidaRepository } from '../../repos/batida';
import { MensagensDeErro } from '../../utils/error';
import { BatidaService } from './batidaService';

describe('batida service', () => {
  const mockBatidaRepo = {
    criar: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('criacao', () => {
    it('cria uma nova batida de ponto', async () => {
      const mockBatida = {
        momento: new Date(),
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
        momento: nextSaturday(new Date()),
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
        momento: nextSunday(new Date()),
      } as IBatidaDto;

      const batidaService = new BatidaService(
        mockBatidaRepo as any as BatidaRepository
      );

      expect(() => batidaService.criar(mockBatida)).rejects.toThrow(
        MensagensDeErro.ERRO_CRIACAO_BATIDA_FIM_DE_SEMANA
      );
    });

    it.todo('falha ao tentar criar uma mesma batida mais de uma vez');
    it.todo('falha ao tentar criar mais de 4 batidas em um dia');
    it.todo('falha ao tentar criar uma batida para um dia que nao e o atual');
  });
});
