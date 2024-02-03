import { DataTypes, Model } from 'sequelize';
import { z } from 'zod';

import { sequelize } from '../db';

const pontoSchema = z.object({
  id: z.number().min(1),
  idDeUsuario: z.number().min(1),
  momento: z.string(),
  momentoDate: z.date(),
});

const pontoDtoSchema = z.object({
  idDeUsuario: z.number().min(1).optional(),
  momento: z.string(),
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
    idDeUsuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    momento: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    momentoDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'batida',
    paranoid: true,
  }
);

type IBatida = z.infer<typeof pontoSchema>;
type IBatidaDto = z.infer<typeof pontoDtoSchema>;

export { IBatida, pontoSchema, IBatidaDto, pontoDtoSchema, Batida };
