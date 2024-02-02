import { addSeconds, formatISODuration, intervalToDuration } from 'date-fns';

function segundosParaIsoDuration(segundos: number): string {
  const unixEpoch = new Date(0);
  const iso = intervalToDuration({
    start: unixEpoch,
    end: addSeconds(unixEpoch, segundos),
  });

  return formatISODuration(iso);
}

export { segundosParaIsoDuration };
