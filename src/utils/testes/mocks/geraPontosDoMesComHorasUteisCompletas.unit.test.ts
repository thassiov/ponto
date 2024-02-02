import { differenceInBusinessDays, endOfMonth, startOfMonth } from 'date-fns';

import { IAnoMes } from '../../../models';
import { geraPontosDoMesComHorasUteisCompletas } from './geraPontosDoMesComHorasUteisCompletas';

describe('geraPontosDoMesComHorasUteisCompletasdifferenceInBusinessDays', () => {
  it.each([
    [
      '2018-03',
      differenceInBusinessDays(
        endOfMonth(new Date(2018, 2)),
        startOfMonth(new Date(2018, 2))
      ),
    ],
    [
      '2019-03',
      differenceInBusinessDays(
        endOfMonth(new Date(2019, 2)),
        startOfMonth(new Date(2019, 2))
      ),
    ],
    [
      '2024-01',
      differenceInBusinessDays(
        endOfMonth(new Date(2024, 0)),
        startOfMonth(new Date(2024, 0))
      ),
    ],
    [
      '2023-06',
      differenceInBusinessDays(
        endOfMonth(new Date(2023, 5)),
        startOfMonth(new Date(2023, 5))
      ),
    ],
    [
      '1984-08',
      differenceInBusinessDays(
        endOfMonth(new Date(1984, 7)),
        startOfMonth(new Date(1984, 7))
      ),
    ],
  ])(
    'gera pontos no mes de %p com %p dias uteis',
    async (anoMes: IAnoMes, diasUteis: number) => {
      const result = geraPontosDoMesComHorasUteisCompletas(anoMes);

      expect(result.length / 4).toEqual(diasUteis);
    }
  );
});
