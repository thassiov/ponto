import { getMockReq, getMockRes } from '@jest-mock/express';
import { StatusCodes } from 'http-status-codes';

import { RelatorioService } from '../../services/relatorio';
import { MensagensDeErro } from '../../utils/error';
import { gerarRelatorioHandlerFactory } from './gerarRelatorioHandlerFactory';

describe('REST: relatorio gerarRelatorioHandlerFactory', () => {
  const mockRelatorioService = {
    gerarRelatorioDoDia: jest.fn(),
    gerarRelatorio: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('cria um relatorio', async () => {
    const mockAnoMes = '2018-08';
    const mockIdDeUsuario = 1;
    const mockRelatorio = { relatorio: true };

    (mockRelatorioService.gerarRelatorio as jest.Mock).mockResolvedValueOnce(
      mockRelatorio
    );

    const mockReq = getMockReq({
      params: {
        anoMes: mockAnoMes,
        idDeUsuario: mockIdDeUsuario.toString(),
      },
    });
    const mockRes = getMockRes().res;
    const createBaldeHandler = gerarRelatorioHandlerFactory(
      mockRelatorioService as any as RelatorioService
    );

    await createBaldeHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(mockRes.json).toHaveBeenCalledWith(mockRelatorio);
  });

  it('falha ao nao encontrar dados para gerar o relatorio do mes', async () => {
    const mockAnoMes = '2018-08';
    const mockIdDeUsuario = 1;

    (mockRelatorioService.gerarRelatorio as jest.Mock).mockRejectedValueOnce(
      new Error(MensagensDeErro.ERRO_CRIACAO_RELATORIO_NAO_ENCONTRADO)
    );

    const mockReq = getMockReq({
      params: {
        anoMes: mockAnoMes,
        idDeUsuario: mockIdDeUsuario.toString(),
      },
    });
    const mockRes = getMockRes().res;
    const createBaldeHandler = gerarRelatorioHandlerFactory(
      mockRelatorioService as any as RelatorioService
    );

    await createBaldeHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(mockRes.json).toHaveBeenCalledWith({
      mensagem: MensagensDeErro.ERRO_CRIACAO_RELATORIO_NAO_ENCONTRADO,
    });
  });
});
