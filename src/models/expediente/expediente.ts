import { z } from 'zod';

const expedientePontoSchema = z
  .string()
  .regex(/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/);

const diaStringSchema = z
  .string()
  .regex(/^(0[1-9]|[1-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/);

const expedienteSchema = z.object({
  dia: diaStringSchema,
  pontos: z.array(expedientePontoSchema).max(4),
});

type IExpediente = z.infer<typeof expedienteSchema>;
type IExpedientePonto = z.infer<typeof expedientePontoSchema>;

export { IExpediente, expedienteSchema, IExpedientePonto };
