/**
 * Returns the current local date as YYYY-MM-DD string.
 * Using this instead of toISOString().split('T')[0] which gives UTC date
 * and can be off by a day depending on timezone.
 */
export function getLocalDateString(date?: Date): string {
  const d = date || new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Returns the first day of the current month as YYYY-MM-DD string.
 */
export function getFirstOfMonthString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}
