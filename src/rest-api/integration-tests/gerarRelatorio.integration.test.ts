import { hoursToSeconds } from 'date-fns';
import { Express } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ModelStatic, Sequelize } from 'sequelize';
import Supertest from 'supertest';

import { Batida, IBatida } from '../../models';
import { MensagensDeErro } from '../../utils/error';
import { segundosParaIsoDuration } from '../../utils/segundosParaIsoDuration';
import { geraPontosDoMesComHorasDevidas } from '../../utils/testes/mocks/geraPontosDoMesComHorasDevidas';
import { geraPontosDoMesComHorasExcedentes } from '../../utils/testes/mocks/geraPontosDoMesComHorasExcedentes';
import { geraPontosDoMesComHorasUteisCompletas } from '../../utils/testes/mocks/geraPontosDoMesComHorasUteisCompletas';
import { setupServer } from './setupServer';

function removerIdDeBatidas(batidas: IBatida[]): Partial<IBatida>[] {
  return batidas.map((batida: IBatida) => {
    const { id, ...rest } = batida;
    return rest;
  });
}

describe('INTEGRATION: GET /folhas-de-ponto/:anoMes', () => {
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

  it('cria um relatorio do mes com todas as horas uteis trabalhadas', async () => {
    const mockAnoMes = '2018-08';
    const mockIdDeUsuario = 1;
    const diasUteisEmAnoMes = 23;
    const horasUteis = 184;
    const mockBatidas = geraPontosDoMesComHorasUteisCompletas(
      mockAnoMes,
      mockIdDeUsuario
    );

    const mockBatidasSemId = removerIdDeBatidas(mockBatidas);

    await batidaModel.bulkCreate(mockBatidasSemId);

    const response = await Supertest(api)
      .get(`/v1/folhas-de-ponto/${mockAnoMes}`)
      .set('Accept', 'application/json');

    expect(response.headers['content-type']).toMatch('application/json');
    expect(response.status).toEqual(StatusCodes.OK);
    expect(response.body.anoMes).toEqual(mockAnoMes);
    expect(response.body.expedientes.length).toEqual(diasUteisEmAnoMes);
    expect(response.body.horasTrabalhadas).toEqual(
      segundosParaIsoDuration(hoursToSeconds(horasUteis))
    );
    expect(response.body.horasDevidas).toEqual(
      segundosParaIsoDuration(hoursToSeconds(0))
    );
    expect(response.body.horasExcedentes).toEqual(
      segundosParaIsoDuration(hoursToSeconds(0))
    );
  });

  it('cria um relatorio do mes com 10 horas excedentes', async () => {
    const mockAnoMes = '2018-08';
    const diasUteisEmAnoMes = 23;
    const horasUteis = 184;
    const mockIdDeUsuario = 1;
    const dezHorasEmSegundos = 36000;

    const mockBatidas = geraPontosDoMesComHorasExcedentes(
      mockAnoMes,
      dezHorasEmSegundos,
      mockIdDeUsuario
    );

    const mockBatidasSemId = removerIdDeBatidas(mockBatidas);

    await batidaModel.bulkCreate(mockBatidasSemId);

    const response = await Supertest(api)
      .get(`/v1/folhas-de-ponto/${mockAnoMes}`)
      .set('Accept', 'application/json');

    expect(response.headers['content-type']).toMatch('application/json');
    expect(response.status).toEqual(StatusCodes.OK);
    expect(response.body.anoMes).toEqual(mockAnoMes);
    expect(response.body.expedientes.length).toEqual(diasUteisEmAnoMes);
    expect(response.body.horasTrabalhadas).toEqual(
      segundosParaIsoDuration(hoursToSeconds(horasUteis) + dezHorasEmSegundos)
    );
    expect(response.body.horasExcedentes).toEqual(
      segundosParaIsoDuration(dezHorasEmSegundos)
    );
    expect(response.body.horasDevidas).toEqual(
      segundosParaIsoDuration(hoursToSeconds(0))
    );
  });

  it('cria um relatorio do mes com 14 horas devidas', async () => {
    const mockAnoMes = '2018-08';
    const diasUteisEmAnoMes = 23;
    const horasUteis = 184;
    const mockIdDeUsuario = 1;
    const quatorzeHorasEmSegundos = 50400;

    const mockBatidas = geraPontosDoMesComHorasDevidas(
      mockAnoMes,
      quatorzeHorasEmSegundos,
      mockIdDeUsuario
    );

    const mockBatidasSemId = removerIdDeBatidas(mockBatidas);

    await batidaModel.bulkCreate(mockBatidasSemId);

    const response = await Supertest(api)
      .get(`/v1/folhas-de-ponto/${mockAnoMes}`)
      .set('Accept', 'application/json');

    expect(response.headers['content-type']).toMatch('application/json');
    expect(response.status).toEqual(StatusCodes.OK);
    expect(response.body.anoMes).toEqual(mockAnoMes);
    expect(response.body.expedientes.length).toEqual(diasUteisEmAnoMes);
    expect(response.body.horasTrabalhadas).toEqual(
      segundosParaIsoDuration(
        hoursToSeconds(horasUteis) - quatorzeHorasEmSegundos
      )
    );
    expect(response.body.horasExcedentes).toEqual(segundosParaIsoDuration(0));
    expect(response.body.horasDevidas).toEqual(
      segundosParaIsoDuration(quatorzeHorasEmSegundos)
    );
  });

  it('cria um relatorio do mes com 3 dias trabalhados, um deles somente meio periodo', async () => {
    const mockAnoMes = '2018-08';
    const horasUteis = 184;
    const mockIdDeUsuario = 1;
    // dois dias inteiros (16) + meio periodo (4)
    const horasTrabalhadas = 20;
    const horasDevidas = horasUteis - horasTrabalhadas;
    // nao bateu o ponto de saida no segundo dia
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

    const mockBatidasSemId = removerIdDeBatidas(mesDeTresDias as IBatida[]);

    await batidaModel.bulkCreate(mockBatidasSemId);

    const response = await Supertest(api)
      .get(`/v1/folhas-de-ponto/${mockAnoMes}`)
      .set('Accept', 'application/json');

    expect(response.headers['content-type']).toMatch('application/json');
    expect(response.status).toEqual(StatusCodes.OK);
    expect(response.body.anoMes).toEqual(mockAnoMes);
    expect(response.body.expedientes.length).toEqual(3);
    expect(response.body.horasTrabalhadas).toEqual(
      segundosParaIsoDuration(hoursToSeconds(horasTrabalhadas))
    );
    expect(response.body.horasExcedentes).toEqual(segundosParaIsoDuration(0));
    expect(response.body.horasDevidas).toEqual(
      segundosParaIsoDuration(hoursToSeconds(horasDevidas))
    );
  });

  it('cria um relatorio do mes com 4 dias trabalhados, um deles a pessoa nao bateu o ultimo ponto (4)', async () => {
    // a ideia desse teste e verificar os periodos validos (abre e fecha ponto)
    // se a pessoa nao fechou o ponto, aquele periodo nao e valido, entao nao
    // conta no relatorio
    const mockAnoMes = '2018-08';
    const horasUteis = 184;
    const mockIdDeUsuario = 1;
    // tres dias inteiros (24) + meio periodo (4)
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

    const mockBatidasSemId = removerIdDeBatidas(mesDeTresDias as IBatida[]);

    await batidaModel.bulkCreate(mockBatidasSemId);

    const response = await Supertest(api)
      .get(`/v1/folhas-de-ponto/${mockAnoMes}`)
      .set('Accept', 'application/json');

    expect(response.headers['content-type']).toMatch('application/json');
    expect(response.status).toEqual(StatusCodes.OK);
    expect(response.body.anoMes).toEqual(mockAnoMes);
    expect(response.body.expedientes.length).toEqual(4);
    expect(response.body.horasTrabalhadas).toEqual(
      segundosParaIsoDuration(hoursToSeconds(horasTrabalhadas))
    );
    expect(response.body.horasExcedentes).toEqual(segundosParaIsoDuration(0));
    expect(response.body.horasDevidas).toEqual(
      segundosParaIsoDuration(hoursToSeconds(horasDevidas))
    );
  });

  it('falha ao tentar criar um relatorio sem registros', async () => {
    const mockAnoMes = '2018-08';

    const response = await Supertest(api)
      .get(`/v1/folhas-de-ponto/${mockAnoMes}`)
      .set('Accept', 'application/json');

    expect(response.headers['content-type']).toMatch('application/json');
    expect(response.status).toEqual(StatusCodes.NOT_FOUND);
    expect(response.body.mensagem).toEqual(
      MensagensDeErro.ERRO_CRIACAO_RELATORIO_NAO_ENCONTRADO
    );
  });
});
