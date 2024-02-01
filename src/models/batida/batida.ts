import { DataTypes, Model } from 'sequelize';
import { z } from 'zod';

import { sequelize } from '../db';

const pontoSchema = z.object({
  id: z.number().min(1),
  momento: z.coerce.date(),
  momentoDate: z.date(),
});

const pontoDtoSchema = z.object({
  momento: z.coerce.date(),
  momentoDate: z.date().optional(),
});

class Batida extends Model {}
Batida.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    momento: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    momentoDate: {
      type: DataTypes.DATE,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: 'ponto',
    paranoid: true,
  }
);

type IBatida = z.infer<typeof pontoSchema>;
type IBatidaDto = z.infer<typeof pontoDtoSchema>;

export { IBatida, pontoSchema, IBatidaDto, pontoDtoSchema, Batida };
