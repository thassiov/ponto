import {
  differenceInBusinessDays,
  differenceInSeconds,
  endOfMonth,
  startOfMonth,
} from 'date-fns';

import { IAnoMes, IBatida } from '../../../models';
import { segundosUteisEmMes } from '../../segundosUteisEmMes';
import { geraPontosDoMesComHorasExcedentes } from './geraPontosDoMesComHorasExcedentes';

describe('geraPontosDoMesComHorasExcedentes', () => {
  it.todo('gera pontos no mes de %p com %p dias uteis e %p horas excedentes');

  it.each([
    [
      '2018-03',
      differenceInBusinessDays(
        endOfMonth(new Date(2018, 2)),
        startOfMonth(new Date(2018, 2))
      ),
      // 10 horas
      36000,
    ],
    [
      '2019-03',
      differenceInBusinessDays(
        endOfMonth(new Date(2019, 2)),
        startOfMonth(new Date(2019, 2))
      ),
      // 27 horas
      97200,
    ],
    [
      '2024-01',
      differenceInBusinessDays(
        endOfMonth(new Date(2024, 0)),
        startOfMonth(new Date(2024, 0))
      ),
      // 14 horas e 14 segundos
      50414,
    ],
    [
      '2023-06',
      differenceInBusinessDays(
        endOfMonth(new Date(2023, 5)),
        startOfMonth(new Date(2023, 5))
      ),
      // 5 horas
      18000,
    ],
    [
      '1984-08',
      differenceInBusinessDays(
        endOfMonth(new Date(1984, 7)),
        startOfMonth(new Date(1984, 7))
      ),
      // 30 horas
      108000,
    ],
  ])(
    'gera pontos no mes de %p com %p dias uteis e %p segundos excedentes',
    async (
      anoMes: IAnoMes,
      diasUteis: number,
      horasExcedentesEmSegundos: number
    ) => {
      const result = geraPontosDoMesComHorasExcedentes(
        anoMes,
        horasExcedentesEmSegundos
      );

      let somatoria = 0;

      for (let index = 0; index < result.length; index += 2) {
        const abrePonto = result[index] as IBatida;
        const fechaPonto = result[index + 1] as IBatida;

        const diferenca = differenceInSeconds(
          fechaPonto.momentoDate,
          abrePonto.momentoDate
        );

        somatoria += diferenca;
      }
      const segundosUteis = segundosUteisEmMes(anoMes);
      expect(result.length / 4).toEqual(diasUteis);
      expect(somatoria - segundosUteis).toEqual(horasExcedentesEmSegundos);
    }
  );
});
