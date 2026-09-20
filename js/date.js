/**
 * Date formatting utilities (Hebrew).
 *
 * Pure functions, no DOM / no imports, so they can be unit-tested in plain Node.
 */

/** Hebrew weekday names, index 0 = Sunday (matches Date.getDay()). */
const HEBREW_WEEKDAYS = [
  'יום ראשון',
  'יום שני',
  'יום שלישי',
  'יום רביעי',
  'יום חמישי',
  'יום שישי',
  'שבת'
];

/**
 * Zero-pads a number to two digits.
 * @param {number} n
 * @returns {string}
 */
function pad2(n) {
  return String(n).padStart(2, '0');
}

/**
 * Formats an ISO booking date into an elegant Hebrew string.
 * Example: "יום שני, 28.09.26 בשעה 17:00".
 *
 * The ISO string is treated as a wall-clock local time (no timezone shifting),
 * which matches how itinerary times are authored in places.json.
 *
 * @param {?string} [isoString] - e.g. "2026-09-28T17:00:00" or null/undefined.
 * @returns {string} Formatted Hebrew date, or '' when there is no valid date.
 */
export function formatBookingDateHebrew(isoString) {
  if (!isoString || typeof isoString !== 'string') return '';

  // Parse components directly from the ISO string to avoid timezone drift.
  const match = isoString.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/
  );
  if (!match) return '';

  const year = Number(match[1]);
  const month = Number(match[2]); // 1-12
  const day = Number(match[3]);
  const hasTime = match[4] !== undefined;
  const hours = hasTime ? Number(match[4]) : 0;
  const minutes = hasTime ? Number(match[5]) : 0;

  // Basic validity checks.
  if (month < 1 || month > 12 || day < 1 || day > 31) return '';

  // Use a local Date only to derive the weekday.
  const d = new Date(year, month - 1, day, hours, minutes);
  if (Number.isNaN(d.getTime())) return '';

  const weekday = HEBREW_WEEKDAYS[d.getDay()];
  const shortYear = pad2(year % 100);
  const datePart = `${pad2(day)}.${pad2(month)}.${shortYear}`;

  if (!hasTime) {
    return `${weekday}, ${datePart}`;
  }

  const timePart = `${pad2(hours)}:${pad2(minutes)}`;
  return `${weekday}, ${datePart} בשעה ${timePart}`;
}
