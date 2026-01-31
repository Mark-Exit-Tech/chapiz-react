const pad2 = (n: number) => String(n).padStart(2, '0');

function dateToDatetimeLocal(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/**
 * Rounds a datetime-local value (YYYY-MM-DDTHH:mm) to the nearest 15 minutes.
 * Prevents users from setting arbitrary minutes; only :00, :15, :30, :45 are allowed.
 */
export function roundDatetimeLocalTo15Min(value: string): string {
  if (!value || value.length < 16) return value;
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  const m = d.getMinutes();
  const r = Math.round(m / 15) * 15;
  if (r === 60) {
    d.setHours(d.getHours() + 1);
    d.setMinutes(0, 0, 0);
  } else {
    d.setMinutes(r, 0, 0);
  }
  return dateToDatetimeLocal(d);
}

/**
 * Default Valid From: today at current time rounded to 15 minutes.
 */
export function getDefaultValidFrom(): string {
  return roundDatetimeLocalTo15Min(dateToDatetimeLocal(new Date()));
}

/**
 * Default Valid To: 2 weeks from now, same time of day, rounded to 15 minutes.
 */
export function getDefaultValidTo(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return roundDatetimeLocalTo15Min(dateToDatetimeLocal(d));
}

/**
 * Date-only (YYYY-MM-DD) for today. Use with type="date" inputs.
 */
export function getDefaultValidFromDateOnly(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/**
 * Date-only (YYYY-MM-DD) for 2 weeks from today. Use with type="date" inputs.
 */
export function getDefaultValidToDateOnly(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/**
 * Parse date-only string (YYYY-MM-DD) as local midnight. Avoids UTC interpretation.
 */
export function parseDateOnlyLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Parse date-only string (YYYY-MM-DD) as local end of day (23:59:59.999).
 */
export function parseDateOnlyEndOfDay(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999);
}
