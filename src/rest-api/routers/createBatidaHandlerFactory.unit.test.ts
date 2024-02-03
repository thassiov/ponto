import { getMockReq, getMockRes } from '@jest-mock/express';
import { StatusCodes } from 'http-status-codes';

import { IBatidaDto } from '../../models';
import { BatidaService } from '../../services/batida';
import { RelatorioService } from '../../services/relatorio';
import { MensagensDeErro, ValidationError } from '../../utils/error';
import { getIsoDateString } from '../../utils/testes/mocks/getIsoDateString';
import { criaBatidaHandlerFactory } from './criaBatidaHandlerFactory';

describe('REST: batida createBatidaHandler', () => {
  const mockBatidaService = {
    criar: jest.fn(),
  };

  const mockRelatorioService = {
    gerarRelatorioDoDia: jest.fn(),
    gerarRelatorio: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('cria uma batida', async () => {
    const mockBatida = {
      idDeUsuario: 1,
      momento: getIsoDateString(),
    } as IBatidaDto;

    const mockExpediente = { expediente: true };

    (mockBatidaService.criar as jest.Mock).mockResolvedValueOnce(1);
    (
      mockRelatorioService.gerarRelatorioDoDia as jest.Mock
    ).mockResolvedValueOnce(mockExpediente);

    const mockReq = getMockReq({
      body: mockBatida,
    });
    const mockRes = getMockRes().res;
    const createBaldeHandler = criaBatidaHandlerFactory(
      mockBatidaService as any as BatidaService,
      mockRelatorioService as any as RelatorioService
    );

    await createBaldeHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.CREATED);
    expect(mockRes.json).toHaveBeenCalledWith(mockExpediente);
  });

  it('falha ao tentar criar uma batida com sem o campo de momento (obrigatorio)', async () => {
    const mockBatida = {
      idDeUsuario: 1,
    } as IBatidaDto;

    const mockReq = getMockReq({
      body: mockBatida,
    });
    const mockRes = getMockRes().res;
    const createBaldeHandler = criaBatidaHandlerFactory(
      mockBatidaService as any as BatidaService,
      mockRelatorioService as any as RelatorioService
    );

    await createBaldeHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(mockRes.json).toHaveBeenCalledWith({
      mensagem: MensagensDeErro.ERRO_ENDPOINT_CRIACAO_BATIDA_CAMPO_OBRIGATORIO,
    });
  });

  it('falha ao tentar criar uma batida no fim de semana', async () => {
    const mockBatida = {
      idDeUsuario: 1,
      momento: new Date().toDateString(),
    } as IBatidaDto;

    const mockReq = getMockReq({
      body: mockBatida,
    });

    (mockBatidaService.criar as jest.Mock).mockRejectedValueOnce(
      new ValidationError(MensagensDeErro.ERRO_CRIACAO_BATIDA_FIM_DE_SEMANA)
    );

    const mockRes = getMockRes().res;
    const createBaldeHandler = criaBatidaHandlerFactory(
      mockBatidaService as any as BatidaService,
      mockRelatorioService as any as RelatorioService
    );

    await createBaldeHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(mockRes.json).toHaveBeenCalledWith({
      mensagem: MensagensDeErro.ERRO_CRIACAO_BATIDA_FIM_DE_SEMANA,
    });
  });

  it('falha ao tentar criar uma batida com tempo anterior a outra batida ja registrada (viagem no tempo)', async () => {
    const mockBatida = {
      idDeUsuario: 1,
      momento: new Date().toDateString(),
    } as IBatidaDto;

    const mockReq = getMockReq({
      body: mockBatida,
    });

    (mockBatidaService.criar as jest.Mock).mockRejectedValueOnce(
      new ValidationError(
        MensagensDeErro.ERRO_CRIACAO_BATIDA_ANTERIOR_A_BATIDA_PREVIA
      )
    );

    const mockRes = getMockRes().res;
    const createBaldeHandler = criaBatidaHandlerFactory(
      mockBatidaService as any as BatidaService,
      mockRelatorioService as any as RelatorioService
    );

    await createBaldeHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(mockRes.json).toHaveBeenCalledWith({
      mensagem: MensagensDeErro.ERRO_CRIACAO_BATIDA_ANTERIOR_A_BATIDA_PREVIA,
    });
  });

  it('falha ao tentar criar uma batida depois de bater ponto 4 vezes no dia', async () => {
    const mockBatida = {
      idDeUsuario: 1,
      momento: new Date().toDateString(),
    } as IBatidaDto;

    const mockReq = getMockReq({
      body: mockBatida,
    });

    (mockBatidaService.criar as jest.Mock).mockRejectedValueOnce(
      new ValidationError(
        MensagensDeErro.ERRO_CRIACAO_BATIDA_NUMERO_MAXIMO_REGISTRADO
      )
    );

    const mockRes = getMockRes().res;
    const createBaldeHandler = criaBatidaHandlerFactory(
      mockBatidaService as any as BatidaService,
      mockRelatorioService as any as RelatorioService
    );

    await createBaldeHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(mockRes.json).toHaveBeenCalledWith({
      mensagem: MensagensDeErro.ERRO_CRIACAO_BATIDA_NUMERO_MAXIMO_REGISTRADO,
    });
  });

  it('falha ao tentar criar uma batida antes do tempo minimo de almoco', async () => {
    const mockBatida = {
      idDeUsuario: 1,
      momento: new Date().toDateString(),
    } as IBatidaDto;

    const mockReq = getMockReq({
      body: mockBatida,
    });

    (mockBatidaService.criar as jest.Mock).mockRejectedValueOnce(
      new ValidationError(
        MensagensDeErro.ERRO_CRIACAO_BATIDA_TEMPO_MINIMO_DE_ALMOCO
      )
    );

    const mockRes = getMockRes().res;
    const createBaldeHandler = criaBatidaHandlerFactory(
      mockBatidaService as any as BatidaService,
      mockRelatorioService as any as RelatorioService
    );

    await createBaldeHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(mockRes.json).toHaveBeenCalledWith({
      mensagem: MensagensDeErro.ERRO_CRIACAO_BATIDA_TEMPO_MINIMO_DE_ALMOCO,
    });
  });

  it('falha ao tentar criar uma mesma batida mais de uma vez (duplicacao)', async () => {
    const mockBatida = {
      idDeUsuario: 1,
      momento: new Date().toDateString(),
    } as IBatidaDto;

    const mockReq = getMockReq({
      body: mockBatida,
    });

    (mockBatidaService.criar as jest.Mock).mockRejectedValueOnce(
      new ValidationError(
        MensagensDeErro.ERRO_CRIACAO_BATIDA_JA_REGISTRADA
      )
    );

    const mockRes = getMockRes().res;
    const createBaldeHandler = criaBatidaHandlerFactory(
      mockBatidaService as any as BatidaService,
      mockRelatorioService as any as RelatorioService
    );

    await createBaldeHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(mockRes.json).toHaveBeenCalledWith({
      mensagem: MensagensDeErro.ERRO_CRIACAO_BATIDA_JA_REGISTRADA,
    });
  });
});
