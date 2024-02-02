import { endOfMonth, isWeekend, startOfMonth } from 'date-fns';

import { IAnoMes, IBatida } from '../../../models';
import { getIsoDateString } from './getIsoDateString';

function geraPontosDoMesComHorasUteisCompletas(
  anoMes: IAnoMes,
  idDeUsuario = 1
): IBatida[] {
  const inicioDoMesDia = startOfMonth(anoMes).getDate();
  const fimDoMesDia = endOfMonth(anoMes).getDate();
  const batidas: IBatida[] = [];

  for (let index = inicioDoMesDia; index < fimDoMesDia; index++) {
    // @NOTE bug or something: por algum motivo, quando a iteracao chega no
    // numero 10, esse Date, que deveria criar o dia 10 do dado mes, na verdade
    // cria outra vez o dia 9. Dai o index e o dia ficam dessincronizados e nao sei
    // como resolver. Ja tentei um monte de coisas. Talvez o problema seja eu, mas
    // sei la. Vou fazer commit disso pra olhar depois.
    let diaDoMes = new Date(`${anoMes}-${index > 10 ? '0' + index : index}`);

    console.log(diaDoMes.getDate(), index);

    if (isWeekend(diaDoMes)) {
      console.log('fds', diaDoMes.getDate(), index);
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
