import { z } from 'zod';

import { expedienteSchema } from '../expediente';

// os campos de hora vao ser processados a partir dos
// segundos entre cada batida. A partir dessa diferenca em
// segundos que a string de duracao ISO 8601 vai ser gerada
// e atribuida a esses campos

// @NOTE no yaml o campo "anoMes" tem a propriedade "format" como
// duracao ISO, mas o nome e o exemplo dao a entender que e somente
// ano-mes, entao vou presumir que e um typo
const relatorioSchema = z.object({
  anoMes: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  horasTrabalhadas: z.string(),
  horasExcedentes: z.string(),
  horasDevidas: z.string(),
  expedientes: z.array(expedienteSchema),
});

type IRelatorio = z.infer<typeof relatorioSchema>;

export { IRelatorio, relatorioSchema };
