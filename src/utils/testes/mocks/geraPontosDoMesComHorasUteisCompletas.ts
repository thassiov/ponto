import { endOfMonth, isWeekend, startOfMonth } from 'date-fns';

import { IAnoMes, IBatida } from '../../../models';
import { getIsoDateString } from './getIsoDateString';

function geraPontosDoMesComHorasUteisCompletas(
  anoMes: IAnoMes,
  idDeUsuario = 1
): IBatida[] {
  const [ano, mes]: string[] = anoMes.split('-');
  const dataBase = new Date(
    parseInt(ano as string),
    parseInt(mes as string) - 1
  );
  const inicioDoMesDia = startOfMonth(dataBase).getDate();
  const fimDoMesDia = endOfMonth(dataBase).getDate();
  const batidas: IBatida[] = [];

  for (let index = inicioDoMesDia; index < fimDoMesDia; index++) {
    const diaDoMes = new Date(dataBase);
    diaDoMes.setDate(index);

    if (isWeekend(diaDoMes)) {
      continue;
    }

    const oitoHoras = new Date(diaDoMes);
    oitoHoras.setHours(8, 0, 0);
    const meioDia = new Date(diaDoMes);
    meioDia.setHours(12, 0, 0);
    const quatorzeHoras = new Date(diaDoMes);
    quatorzeHoras.setHours(14, 0, 0);
    const dezoitoHoras = new Date(diaDoMes);
    dezoitoHoras.setHours(18, 0, 0);

    [oitoHoras, meioDia, quatorzeHoras, dezoitoHoras].forEach(
      (momentoDate: Date) => {
        batidas.push({
          id: Math.floor(Math.random() * 1000),
          idDeUsuario,
          momentoDate,
          momento: getIsoDateString(momentoDate),
        });
      }
    );
  }

  return batidas;
}

export { geraPontosDoMesComHorasUteisCompletas };
