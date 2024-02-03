import { addHours, subHours } from 'date-fns';
import { Sequelize, Transaction } from 'sequelize';

import { Batida, IBatidaDto } from '../../models';
import { getIsoDateString } from '../../utils/testes/mocks/getIsoDateString';
import { BatidaRepository } from './batidaRepository';

jest.mock('sequelize');

describe('Batida repo', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('criacao', () => {
    it('cria uma nova batida', async () => {
      // eu sei que isso parece redundante, mas a ideia e usar
      // o mesmo mecanismo que o service usa: recebe uma string
      // e entao a transforma em um objeto date
      const mockDateString = getIsoDateString();
      const mockDate = new Date(mockDateString);

      const mockBatida = {
        idDeUsuario: 1,
        momento: mockDateString,
        momentoDate: mockDate,
      } as IBatidaDto;

      const sequelize = new Sequelize();
      const mockTransaction = new Transaction(sequelize, {});
      jest
        .spyOn(sequelize, 'transaction')
        .mockResolvedValueOnce(mockTransaction);

      jest.spyOn(Batida, 'create').mockResolvedValueOnce({
        get: () => 1,
      });

      jest.spyOn(sequelize, 'model').mockReturnValueOnce(Batida);

      const batidaRepository = new BatidaRepository(sequelize);

      const result = await batidaRepository.criar(mockBatida);

      expect(result).toEqual(1);
    });
  });

  describe('metodos de validacao de batida', () => {
    describe('verificacao de duplicatas', () => {
      it('verifica que batida ja foi registrada', async () => {
        const mockBatida = {
          idDeUsuario: 1,
          momento: getIsoDateString(),
          momentoDate: new Date(),
        } as IBatidaDto;

        const sequelize = new Sequelize();
        jest.spyOn(Batida, 'findOne').mockResolvedValueOnce({} as Batida);

        jest.spyOn(sequelize, 'model').mockReturnValueOnce(Batida);

        const batidaRepository = new BatidaRepository(sequelize);

        const result = await batidaRepository.jaFoiRegistrada(mockBatida);

        expect(result).toEqual(true);
      });

      it('verifica que batida nao foi registrada', async () => {
        const mockBatida = {
          idDeUsuario: 1,
          momento: getIsoDateString(),
          momentoDate: new Date(),
        } as IBatidaDto;

        const sequelize = new Sequelize();

        jest.spyOn(Batida, 'findOne').mockResolvedValueOnce(null);

        jest.spyOn(sequelize, 'model').mockReturnValueOnce(Batida);

        const batidaRepository = new BatidaRepository(sequelize);

        const result = await batidaRepository.jaFoiRegistrada(mockBatida);

        expect(result).toEqual(false);
      });
    });

    describe('verificacao de viagem no tempo (nao sei como nomear essa suite)', () => {
      it('verifica que a batida enviada tem tempo anterior a ultima batida registrada no dia', async () => {
        const mockBatida = {
          idDeUsuario: 1,
          momento: getIsoDateString(),
          momentoDate: new Date(),
        } as IBatidaDto;

        const sequelize = new Sequelize();

        jest.spyOn(Batida, 'findAll').mockResolvedValueOnce([
          {
            get: () => addHours(mockBatida.momentoDate as Date, 1),
          } as Batida,
        ]);

        jest.spyOn(sequelize, 'model').mockReturnValueOnce(Batida);

        const batidaRepository = new BatidaRepository(sequelize);

        const result =
          await batidaRepository.eAnteriorAUltimaBatidaNoMesmoDia(mockBatida);

        expect(result).toEqual(true);
      });

      it('verifica que a batida enviada nao tem tempo anterior a ultima batida registrada no dia (primeira batida do dia)', async () => {
        const mockBatida = {
          idDeUsuario: 1,
          momento: getIsoDateString(),
          momentoDate: new Date(),
        } as IBatidaDto;

        const sequelize = new Sequelize();
        jest.spyOn(Batida, 'findAll').mockResolvedValueOnce([]);

        jest.spyOn(sequelize, 'model').mockReturnValueOnce(Batida);

        const batidaRepository = new BatidaRepository(sequelize);

        const result =
          await batidaRepository.eAnteriorAUltimaBatidaNoMesmoDia(mockBatida);

        expect(result).toEqual(false);
      });

      it('verifica que a batida enviada nao tem tempo anterior a ultima batida registrada no dia (primeira batida do dia)', async () => {
        const mockBatida = {
          idDeUsuario: 1,
          momento: getIsoDateString(),
          momentoDate: new Date(),
        } as IBatidaDto;

        const sequelize = new Sequelize();
        jest.spyOn(Batida, 'findAll').mockResolvedValueOnce([
          {
            get: () => subHours(mockBatida.momentoDate as Date, 1),
          } as Batida,
        ]);

        jest.spyOn(sequelize, 'model').mockReturnValueOnce(Batida);

        const batidaRepository = new BatidaRepository(sequelize);

        const result =
          await batidaRepository.eAnteriorAUltimaBatidaNoMesmoDia(mockBatida);

        expect(result).toEqual(false);
      });
    });

    describe('verificacao de numero maximo de batidas', () => {
      it('verifica que o usuario ja fez o numero maximo de batidas no dia', async () => {
        const mockBatida = {
          idDeUsuario: 1,
          momento: getIsoDateString(),
          momentoDate: new Date(),
        } as IBatidaDto;

        const sequelize = new Sequelize();

        jest.spyOn(Batida, 'count').mockResolvedValueOnce(4);

        jest.spyOn(sequelize, 'model').mockReturnValueOnce(Batida);

        const batidaRepository = new BatidaRepository(sequelize);

        const result =
          await batidaRepository.jaPossuiNumeroMaximoDeBatidas(mockBatida);

        expect(result).toEqual(true);
      });

      it('verifica que o usuario nao fez o numero maximo de batidas no dia', async () => {
        const mockBatida = {
          idDeUsuario: 1,
          momento: getIsoDateString(),
          momentoDate: new Date(),
        } as IBatidaDto;

        const sequelize = new Sequelize();

        jest.spyOn(Batida, 'count').mockResolvedValueOnce(3);

        jest.spyOn(sequelize, 'model').mockReturnValueOnce(Batida);

        const batidaRepository = new BatidaRepository(sequelize);

        const result =
          await batidaRepository.jaPossuiNumeroMaximoDeBatidas(mockBatida);

        expect(result).toEqual(false);
      });
    });

    describe('verificacao de horario de almoco', () => {
      it('verifica que o usuario nao tem o tempo minimo de almoco decorrido', async () => {
        const mockBatida = {
          idDeUsuario: 1,
          momento: getIsoDateString(),
          momentoDate: new Date(2018, 7, 3, 8, 0, 0),
        } as IBatidaDto;

        const sequelize = new Sequelize();

        jest.spyOn(Batida, 'findAll').mockResolvedValueOnce([
          {} as any as Batida,
          {
            get: () => new Date(2018, 7, 3, 7, 59, 0),
          } as any as Batida,
        ]);

        jest.spyOn(sequelize, 'model').mockReturnValueOnce(Batida);

        const batidaRepository = new BatidaRepository(sequelize);

        const result =
          await batidaRepository.aindaEstaEmHorarioObrigatorioDeAlmoco(
            mockBatida
          );

        expect(result).toEqual(true);
      });

      it('verifica que o usuario tem o tempo minimo de almoco decorrido', async () => {
        const mockBatida = {
          idDeUsuario: 1,
          momento: getIsoDateString(),
          momentoDate: new Date(2018, 7, 3, 8, 0, 0),
        } as IBatidaDto;

        const sequelize = new Sequelize();

        jest.spyOn(Batida, 'findAll').mockResolvedValueOnce([
          {} as any as Batida,
          {
            get: () => new Date(2018, 7, 3, 9, 0, 0),
          } as any as Batida,
        ]);

        jest.spyOn(sequelize, 'model').mockReturnValueOnce(Batida);

        const batidaRepository = new BatidaRepository(sequelize);

        const result =
          await batidaRepository.aindaEstaEmHorarioObrigatorioDeAlmoco(
            mockBatida
          );

        expect(result).toEqual(false);
      });

      it('verifica que o usuario ainda nao saiu para o almoco', async () => {
        const mockBatidaDate = new Date();
        const mockBatida = {
          idDeUsuario: 1,
          momento: getIsoDateString(),
          momentoDate: mockBatidaDate,
        } as IBatidaDto;

        const sequelize = new Sequelize();

        jest
          .spyOn(Batida, 'findAll')
          .mockResolvedValueOnce([{} as any as Batida]);

        jest.spyOn(sequelize, 'model').mockReturnValueOnce(Batida);

        const batidaRepository = new BatidaRepository(sequelize);

        const result =
          await batidaRepository.aindaEstaEmHorarioObrigatorioDeAlmoco(
            mockBatida
          );

        expect(result).toEqual(false);
      });

      it('verifica que o usuario ja voltou do almoco', async () => {
        const mockBatidaDate = new Date();
        const mockBatida = {
          idDeUsuario: 1,
          momento: getIsoDateString(),
          momentoDate: mockBatidaDate,
        } as IBatidaDto;

        const sequelize = new Sequelize();

        jest
          .spyOn(Batida, 'findAll')
          .mockResolvedValueOnce([
            {} as any as Batida,
            {} as any as Batida,
            {} as any as Batida,
          ]);

        jest.spyOn(sequelize, 'model').mockReturnValueOnce(Batida);

        const batidaRepository = new BatidaRepository(sequelize);

        const result =
          await batidaRepository.aindaEstaEmHorarioObrigatorioDeAlmoco(
            mockBatida
          );

        expect(result).toEqual(false);
      });
    });
  });
});
