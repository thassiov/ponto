import {
  addMilliseconds,
  endOfMonth,
  isWeekend,
  secondsToMilliseconds,
  startOfMonth,
  subMilliseconds,
} from 'date-fns';

import { IAnoMes, IBatida } from '../../../models';
import { segundosUteisEmMes } from '../../segundosUteisEmMes';
import { getIsoDateString } from './getIsoDateString';

function geraPontosDoMesComHorasExcedentes(
  anoMes: IAnoMes,
  horasExcedentesEmSegundos: number,
  idDeUsuario = 1
): IBatida[] {
  const [ano, mes]: string[] = anoMes.split('-');
  const dataBase = new Date(
    parseInt(ano as string),
    parseInt(mes as string) - 1
  );

  const diasUteis = segundosUteisEmMes(anoMes) / 86400;
  const miliExcedentes = secondsToMilliseconds(horasExcedentesEmSegundos);
  const miliPorTurno = parseFloat(
    (miliExcedentes / diasUteis / 2).toPrecision(2)
  );
  let miliRestantes = miliExcedentes;

  const inicioDoMes = startOfMonth(dataBase);
  const fimDoMes = endOfMonth(dataBase);
  const inicioDoMesDia = inicioDoMes.getDate();
  const fimDoMesDia = fimDoMes.getDate();
  const batidas: IBatida[] = [];

  for (let index = inicioDoMesDia; index <= fimDoMesDia; index++) {
    const diaDoMes = new Date(dataBase);
    diaDoMes.setDate(index);

    if (isWeekend(diaDoMes)) {
      continue;
    }

    const inicioDeExpedienteSemAcrescimo = new Date(diaDoMes);
    inicioDeExpedienteSemAcrescimo.setHours(8, 0, 0);

    let miliARemover = 0;
    if (miliPorTurno <= miliRestantes) {
      miliARemover = miliPorTurno;
    } else {
      if (miliRestantes) {
        miliARemover = miliRestantes;
      }
    }

    miliRestantes -= miliARemover;

    const inicioDeExpediente = subMilliseconds(
      inicioDeExpedienteSemAcrescimo,
      miliARemover
    );

    const saidaParaAlmoco = new Date(diaDoMes);
    saidaParaAlmoco.setHours(12, 0, 0);

    const voltaDoAlmoco = new Date(diaDoMes);
    voltaDoAlmoco.setHours(14, 0, 0);

    const fimDoExpedienteSemAcrescimo = new Date(diaDoMes);
    fimDoExpedienteSemAcrescimo.setHours(18, 0, 0);

    let segundosAAdicionar = 0;
    if (miliPorTurno <= miliRestantes) {
      segundosAAdicionar = miliPorTurno;
    } else {
      if (miliRestantes) {
        segundosAAdicionar = miliRestantes;
      }
    }

    miliRestantes -= segundosAAdicionar;

    const fimDoExpediente = addMilliseconds(
      fimDoExpedienteSemAcrescimo,
      segundosAAdicionar
    );

    [
      inicioDeExpediente,
      saidaParaAlmoco,
      voltaDoAlmoco,
      fimDoExpediente,
    ].forEach((momentoDate: Date) => {
      batidas.push({
        id: Math.floor(Math.random() * 1000),
        idDeUsuario,
        momentoDate,
        momento: getIsoDateString(momentoDate),
      });
    });
  }

  return batidas;
}

export { geraPontosDoMesComHorasExcedentes };
