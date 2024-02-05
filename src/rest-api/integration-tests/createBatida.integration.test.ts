import { Express } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ModelStatic, Sequelize } from 'sequelize';
import Supertest from 'supertest';

import { Batida, IBatidaDto } from '../../models';
import { MensagensDeErro } from '../../utils/error';
import { getIsoDateString } from '../../utils/testes/mocks/getIsoDateString';
import { setupServer } from './setupServer';

describe('INTEGRATION: POST /batidas', () => {
  let api: Express, db: Sequelize, batidaModel: ModelStatic<Batida>;

  beforeAll(async () => {
    const server = await setupServer();
    api = server.api;
    db = server.db;
    batidaModel = db.model('batida');
  });

  afterEach(async () => {
    //cleanup
    await db.truncate();
  });

  it('cria uma nova batida', async () => {
    const mockBatida = {
      idDeUsuario: 1,
      momento: getIsoDateString(new Date(2018, 7, 6, 8, 0, 0)),
    } as IBatidaDto;

    const response = await Supertest(api)
      .post('/v1/batidas')
      .send(mockBatida)
      .set('Accept', 'application/json');

    expect(response.headers['content-type']).toMatch('application/json');
    expect(response.status).toEqual(StatusCodes.CREATED);
    expect(response.body.dia).toEqual('06/08/2018');
    expect(response.body.pontos[0]).toEqual('08:00:00');
  });

  it('falha ao tentar criar uma batida com sem o campo de momento (obrigatorio)', async () => {
    const mockBatida = {
      idDeUsuario: 1,
    } as IBatidaDto;

    const response = await Supertest(api)
      .post('/v1/batidas')
      .send(mockBatida)
      .set('Accept', 'application/json');

    expect(response.headers['content-type']).toMatch('application/json');
    expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.body.mensagem).toEqual(
      MensagensDeErro.ERRO_ENDPOINT_CRIACAO_BATIDA_CAMPO_OBRIGATORIO
    );
  });

  it('falha ao tentar criar uma batida com formato de tempo (ISO) invalido', async () => {
    const mockBatida = {
      idDeUsuario: 1,
      momento: '2018-08-22T108:00:00',
    } as IBatidaDto;

    const response = await Supertest(api)
      .post('/v1/batidas')
      .send(mockBatida)
      .set('Accept', 'application/json');

    expect(response.headers['content-type']).toMatch('application/json');
    expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.body.mensagem).toEqual(
      MensagensDeErro.ERRO_ENDPOINT_GERAR_RELATORIO_ANOMES_FORMATO_INVALIDO
    );
  });

  it('falha ao tentar criar uma batida no fim de semana', async () => {
    const mockDate = new Date(2018, 7, 4, 8, 0, 0);
    const mockBatida = {
      idDeUsuario: 1,
      momento: getIsoDateString(mockDate),
    } as IBatidaDto;

    const response = await Supertest(api)
      .post('/v1/batidas')
      .send(mockBatida)
      .set('Accept', 'application/json');

    expect(response.headers['content-type']).toMatch('application/json');
    expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.body.mensagem).toEqual(
      MensagensDeErro.ERRO_CRIACAO_BATIDA_FIM_DE_SEMANA
    );
  });

  it('falha ao tentar criar uma batida com tempo anterior a outra batida ja registrada (viagem no tempo)', async () => {
    const mockDate = new Date(2018, 7, 6, 8, 0, 0);
    const mockBatida = {
      idDeUsuario: 1,
      momento: getIsoDateString(mockDate),
    } as IBatidaDto;

    await batidaModel.create({ ...mockBatida, momentoDate: mockDate });

    const mockDatePassado = new Date(2018, 7, 6, 7, 59, 0);
    const mockBatidaPassado = {
      idDeUsuario: 1,
      momento: getIsoDateString(mockDatePassado),
    } as IBatidaDto;

    const response = await Supertest(api)
      .post('/v1/batidas')
      .send(mockBatidaPassado)
      .set('Accept', 'application/json');

    expect(response.headers['content-type']).toMatch('application/json');
    expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.body.mensagem).toEqual(
      MensagensDeErro.ERRO_CRIACAO_BATIDA_ANTERIOR_A_BATIDA_PREVIA
    );
  });

  it('falha ao tentar criar uma batida depois de bater ponto 4 vezes no dia', async () => {
    const batidas = [
      {
        idDeUsuario: 1,
        momento: getIsoDateString(new Date(2018, 7, 6, 8, 0, 0)),
        momentoDate: new Date(2018, 7, 6, 8, 0, 0),
      },
      {
        idDeUsuario: 1,
        momento: getIsoDateString(new Date(2018, 7, 6, 12, 0, 0)),
        momentoDate: new Date(2018, 7, 6, 12, 0, 0),
      },
      {
        idDeUsuario: 1,
        momento: getIsoDateString(new Date(2018, 7, 6, 13, 0, 0)),
        momentoDate: new Date(2018, 7, 6, 13, 0, 0),
      },
      {
        idDeUsuario: 1,
        momento: getIsoDateString(new Date(2018, 7, 6, 18, 0, 0)),
        momentoDate: new Date(2018, 7, 6, 18, 0, 0),
      },
    ];

    await batidaModel.create(batidas[0]);
    await batidaModel.create(batidas[1]);
    await batidaModel.create(batidas[2]);
    await batidaModel.create(batidas[3]);

    const mockDate = new Date(2018, 7, 6, 19, 0, 0);
    const mockBatida = {
      idDeUsuario: 1,
      momento: getIsoDateString(mockDate),
    } as IBatidaDto;

    const response = await Supertest(api)
      .post('/v1/batidas')
      .send(mockBatida)
      .set('Accept', 'application/json');

    expect(response.headers['content-type']).toMatch('application/json');
    expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.body.mensagem).toEqual(
      MensagensDeErro.ERRO_CRIACAO_BATIDA_NUMERO_MAXIMO_REGISTRADO
    );
  });

  it('falha ao tentar criar uma batida antes do tempo minimo de almoco', async () => {
    const batidas = [
      {
        idDeUsuario: 1,
        momento: getIsoDateString(new Date(2018, 7, 6, 8, 0, 0)),
        momentoDate: new Date(2018, 7, 6, 8, 0, 0),
      },
      {
        idDeUsuario: 1,
        momento: getIsoDateString(new Date(2018, 7, 6, 12, 0, 0)),
        momentoDate: new Date(2018, 7, 6, 12, 0, 0),
      },
    ];

    await batidaModel.create(batidas[0]);
    await batidaModel.create(batidas[1]);

    const mockDate = new Date(2018, 7, 6, 12, 59, 0);
    const mockBatida = {
      idDeUsuario: 1,
      momento: getIsoDateString(mockDate),
    } as IBatidaDto;

    const response = await Supertest(api)
      .post('/v1/batidas')
      .send(mockBatida)
      .set('Accept', 'application/json');

    expect(response.headers['content-type']).toMatch('application/json');
    expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
    expect(response.body.mensagem).toEqual(
      MensagensDeErro.ERRO_CRIACAO_BATIDA_TEMPO_MINIMO_DE_ALMOCO
    );
  });

  it('falha ao criar uma batida que ja foi registrada (duplicacao)', async () => {
    const mockDate = new Date(2018, 7, 6, 8, 0, 0);
    const mockBatida = {
      idDeUsuario: 1,
      momento: getIsoDateString(mockDate),
    } as IBatidaDto;

    await batidaModel.create({ ...mockBatida, momentoDate: mockDate });

    const response = await Supertest(api)
      .post('/v1/batidas')
      .send(mockBatida)
      .set('Accept', 'application/json');

    expect(response.headers['content-type']).toMatch('application/json');
    expect(response.status).toEqual(StatusCodes.CONFLICT);
    expect(response.body.mensagem).toEqual(
      MensagensDeErro.ERRO_CRIACAO_BATIDA_JA_REGISTRADA
    );
  });
});
