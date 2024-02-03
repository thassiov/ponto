import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { pontoDtoSchema } from '../../models';
import { BatidaService } from '../../services/batida';
import { RelatorioService } from '../../services/relatorio';
import { EndpointHandlerError, MensagensDeErro } from '../../utils/error';
import { EndpointHandler } from '../../utils/types';

function criaBatidaHandlerFactory(
  batidaService: BatidaService,
  relatorioService: RelatorioService
): EndpointHandler {
  return async function criaBatidaHandler(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      if (!pontoDtoSchema.safeParse(req.body).success) {
        res.status(StatusCodes.BAD_REQUEST).json({
          mensagem:
            MensagensDeErro.ERRO_ENDPOINT_CRIACAO_BATIDA_CAMPO_OBRIGATORIO,
        });
        return;
      }

      const result = await batidaService.criar(req.body);

      if (!result) {
        throw new Error('Nao foi possivel criar o ponto');
      }

      const expediente = await relatorioService.gerarRelatorioDoDia(
        new Date(),
        result
      );

      res.status(StatusCodes.CREATED).json({ expediente });
      return;
    } catch (error) {
      const errorMsg = (error as Error).message;

      if (
        errorMsg.includes(
          MensagensDeErro.ERRO_CRIACAO_BATIDA_TEMPO_MINIMO_DE_ALMOCO
        )
      ) {
        res.status(StatusCodes.BAD_REQUEST).json({
          mensagem: MensagensDeErro.ERRO_CRIACAO_BATIDA_TEMPO_MINIMO_DE_ALMOCO,
        });
        return;
      }

      if (
        errorMsg.includes(
          MensagensDeErro.ERRO_CRIACAO_BATIDA_NUMERO_MAXIMO_REGISTRADO
        )
      ) {
        res.status(StatusCodes.BAD_REQUEST).json({
          mensagem:
            MensagensDeErro.ERRO_CRIACAO_BATIDA_NUMERO_MAXIMO_REGISTRADO,
        });
        return;
      }

      if (
        errorMsg.includes(MensagensDeErro.ERRO_CRIACAO_BATIDA_FIM_DE_SEMANA)
      ) {
        res.status(StatusCodes.BAD_REQUEST).json({
          mensagem: MensagensDeErro.ERRO_CRIACAO_BATIDA_FIM_DE_SEMANA,
        });
        return;
      }

      if (
        errorMsg.includes(MensagensDeErro.ERRO_CRIACAO_BATIDA_JA_REGISTRADA)
      ) {
        res.status(StatusCodes.CONFLICT).json({
          mensagem: MensagensDeErro.ERRO_CRIACAO_BATIDA_JA_REGISTRADA,
        });
        return;
      }

      throw new EndpointHandlerError('Error processing request', {
        cause: error as Error,
        details: {
          handler: 'criaBatidaHandler',
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

export { criaBatidaHandlerFactory };
