export function getIsoDateString(data = new Date()): string {
  data.setMilliseconds(0);
  return data.toISOString();
}
