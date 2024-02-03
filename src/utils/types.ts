import { Request, Response } from 'express';

import { BatidaService } from '../services/batida';
import { RelatorioService } from '../services/relatorio';

export type EndpointHandler = (req: Request, res: Response) => Promise<void>;

export type Services = {
  batida: BatidaService;
  relatorio: RelatorioService;
};
