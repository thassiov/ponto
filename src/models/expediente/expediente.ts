import { z } from 'zod';

const expedientePontoSchema = z
  .string()
  .regex(/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/);

const expedienteSchema = z.object({
  dia: z.date(),
  pontos: z.array(expedientePontoSchema).max(4),
});

type IExpediente = z.infer<typeof expedienteSchema>;

export { IExpediente, expedienteSchema };
