type ErrorOpts = {
  details?: Record<string, unknown>;
  cause?: Error;
};

export class CustomError extends Error {
  details?: Record<string, unknown>;
  cause?: Error;

  constructor(message: string, opts?: ErrorOpts) {
    super(message);
    this.name = 'CustomError';

    if (opts) {
      if (opts.details) {
        this.details = opts.details;
      }

      if (opts.cause) {
        this.cause = opts.cause;
        // concatena as mensagens de erro pra melhor visibilidade
        if (opts.cause.message) {
          this.message += `: ${opts.cause.message}`;
        }
      }
    }
  }
}

export class ServiceError extends CustomError {
  name = 'ServiceError';
}

export class RepositoryError extends CustomError {
  name = 'RepositoryError';
}

export class DatabaseInstanceError extends CustomError {
  name = 'DatabaseInstanceError';
}

export class EndpointHandlerError extends CustomError {
  name = 'EndpointHandlerError';
}

export class ValidationError extends CustomError {
  name = 'ValidationError';
}

export enum MensagensDeErro {
  ERRO_CRIACAO_BATIDA_FIM_DE_SEMANA = 'Sábado e domingo não são permitidos como dia de trabalho',
  ERRO_CRIACAO_BATIDA_JA_REGISTRADA = 'Horário já registrado',
}
