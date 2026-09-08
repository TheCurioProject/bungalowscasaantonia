/** Dates are calendar days at the property, never UTC instants. */
export function todayAtProperty() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-');
}

/** @param {string} day */
export function parseDay(day) { return new Date(`${day}T12:00:00`); }
/** @param {Date} date */
export function dayKey(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
/** @param {string} day @param {number} count */
export function addDays(day, count) { const date = parseDay(day); date.setDate(date.getDate() + count); return dayKey(date); }
/** @param {string} from @param {string} to */
export function nightsBetween(from, to) { return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000); }

/** @typedef {{start: string, end: string, status: 'occupied' | 'blocked'}} Period */
/** @param {string} day @param {Period[]} periods */
export function nightStatus(day, periods) { return periods.find(period => period.start <= day && day < period.end)?.status; }

/** End is exclusive: guests can depart on the day another stay starts.
 * @param {string} start @param {string} end @param {Period[]} periods @param {string} today
 */
export function stayError(start, end, periods, today) {
  if (!start || !end) return 'Selecciona tu llegada y tu salida.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || Number.isNaN(Date.parse(start)) || Number.isNaN(Date.parse(end)) || dayKey(parseDay(start)) !== start || dayKey(parseDay(end)) !== end) return 'Selecciona fechas válidas.';
  if (start < today) return 'La llegada no puede ser anterior a hoy.';
  if (end <= start) return 'La salida debe ser posterior a la llegada.';
  if (periods.some(period => start < period.end && end > period.start)) return 'La estancia cruza noches ocupadas o bloqueadas. Elige otro rango.';
  return '';
}
