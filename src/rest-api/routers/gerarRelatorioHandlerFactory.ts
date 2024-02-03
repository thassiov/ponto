import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { anoMesSchema } from '../../models';
import { RelatorioService } from '../../services/relatorio';
import { EndpointHandlerError, MensagensDeErro } from '../../utils/error';
import { EndpointHandler } from '../../utils/types';

const idSchema = z.number().min(1);

function gerarRelatorioHandlerFactory(
  relatorioService: RelatorioService
): EndpointHandler {
  return async function gerarRelatorioHandler(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const anoMes = req.params?.anoMes as string;
      const idDeUsuario = parseInt(req.query?.idDeUsuario as string) || 1;

      if (!idSchema.safeParse(idDeUsuario).success) {
        res.status(StatusCodes.BAD_REQUEST).json({
          mensagem:
            MensagensDeErro.ERRO_ENDPOINT_GERAR_RELATORIO_ID_DE_USUARIO_INVALIDO,
        });
        return;
      }

      if (!anoMesSchema.safeParse(anoMes).success) {
        res.status(StatusCodes.BAD_REQUEST).json({
          mensagem:
            MensagensDeErro.ERRO_ENDPOINT_GERAR_RELATORIO_ANOMES_FORMATO_INVALIDO,
        });
        return;
      }

      const relatorio = await relatorioService.gerarRelatorio(
        anoMes,
        idDeUsuario
      );

      res.status(StatusCodes.OK).json(relatorio);
      return;
    } catch (error) {
      const errorMsg = (error as Error).message;

      if (
        errorMsg.includes(MensagensDeErro.ERRO_CRIACAO_RELATORIO_NAO_ENCONTRADO)
      ) {
        res.status(StatusCodes.NOT_FOUND).json({
          mensagem: MensagensDeErro.ERRO_CRIACAO_RELATORIO_NAO_ENCONTRADO,
        });
        return;
      }
      throw new EndpointHandlerError('Error processing request', {
        cause: error as Error,
        details: {
          handler: 'gerarRelatorioHandler',
          request: {
            method: req.method,
            headers: req.headers,
            body: req.body,
            url: req.url,
          },
        },
      });
    }
  };
}

export { gerarRelatorioHandlerFactory };
