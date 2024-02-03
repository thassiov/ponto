import {
  addDays,
  differenceInBusinessDays,
  endOfMonth,
  hoursToSeconds,
  startOfMonth,
} from 'date-fns';

import { IAnoMes } from '../models';

function segundosUteisEmMes(anoMes: IAnoMes): number {
  const [ano, mes]: string[] = anoMes.split('-');
  const dataBase = new Date(
    parseInt(ano as string),
    parseInt(mes as string) - 1
  );
  const inicioDoMes = startOfMonth(dataBase);
  const fimDoMes = addDays(endOfMonth(dataBase), 1);
  const diasUteis = differenceInBusinessDays(fimDoMes, inicioDoMes);

  const segundosUteis = hoursToSeconds(diasUteis * 8);

  return segundosUteis;
}

export { segundosUteisEmMes };
