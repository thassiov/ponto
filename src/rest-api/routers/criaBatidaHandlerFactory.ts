import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

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
        res.status(StatusCodes.BAD_REQUEST).type('application/json').json({
          mensagem:
            MensagensDeErro.ERRO_ENDPOINT_CRIACAO_BATIDA_CAMPO_OBRIGATORIO,
        });
        return;
      }

      if (!z.coerce.date().safeParse(req.body.momento).success) {
        res.status(StatusCodes.BAD_REQUEST).type('application/json').json({
          mensagem:
            MensagensDeErro.ERRO_ENDPOINT_GERAR_RELATORIO_ANOMES_FORMATO_INVALIDO,
        });
        return;
      }

      const result = await batidaService.criar({
        momento: req.body.momento,
        idDeUsuario: req.body.idDeUsuario || 1,
      });

      if (!result) {
        throw new Error('Nao foi possivel criar o ponto');
      }

      const expediente = await relatorioService.gerarRelatorioDoDia(
        new Date(req.body.momento),
        parseInt(req.body.idDeUsuario) || 1
      );

      res.status(StatusCodes.CREATED).type('application/json').json(expediente);
      return;
    } catch (error) {
      const errorMsg = (error as Error).message;

      if (
        errorMsg.includes(
          MensagensDeErro.ERRO_CRIACAO_BATIDA_TEMPO_MINIMO_DE_ALMOCO
        )
      ) {
        res.status(StatusCodes.BAD_REQUEST).type('application/json').json({
          mensagem: MensagensDeErro.ERRO_CRIACAO_BATIDA_TEMPO_MINIMO_DE_ALMOCO,
        });
        return;
      }

      if (
        errorMsg.includes(
          MensagensDeErro.ERRO_CRIACAO_BATIDA_ANTERIOR_A_BATIDA_PREVIA
        )
      ) {
        res.status(StatusCodes.BAD_REQUEST).type('application/json').json({
          mensagem:
            MensagensDeErro.ERRO_CRIACAO_BATIDA_ANTERIOR_A_BATIDA_PREVIA,
        });
        return;
      }

      if (
        errorMsg.includes(
          MensagensDeErro.ERRO_CRIACAO_BATIDA_NUMERO_MAXIMO_REGISTRADO
        )
      ) {
        res.status(StatusCodes.BAD_REQUEST).type('application/json').json({
          mensagem:
            MensagensDeErro.ERRO_CRIACAO_BATIDA_NUMERO_MAXIMO_REGISTRADO,
        });
        return;
      }

      if (
        errorMsg.includes(MensagensDeErro.ERRO_CRIACAO_BATIDA_FIM_DE_SEMANA)
      ) {
        res.status(StatusCodes.BAD_REQUEST).type('application/json').json({
          mensagem: MensagensDeErro.ERRO_CRIACAO_BATIDA_FIM_DE_SEMANA,
        });
        return;
      }

      if (
        errorMsg.includes(MensagensDeErro.ERRO_CRIACAO_BATIDA_JA_REGISTRADA)
      ) {
        res.status(StatusCodes.CONFLICT).type('application/json').json({
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
