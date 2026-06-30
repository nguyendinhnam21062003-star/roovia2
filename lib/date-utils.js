const DEFAULT_TIME_ZONE = 'Asia/Ho_Chi_Minh';

function padDatePart(value) {
  return String(value).padStart(2, '0');
}

export function formatISODate(date, timeZone = DEFAULT_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);

  const year = parts.find(part => part.type === 'year')?.value;
  const month = parts.find(part => part.type === 'month')?.value;
  const day = parts.find(part => part.type === 'day')?.value;

  return `${year}-${month}-${day}`;
}

export function todayISO(timeZone = DEFAULT_TIME_ZONE) {
  return formatISODate(new Date(), timeZone);
}

export function addDaysISO(value, days) {
  const [year, month, day] = String(value).split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return `${date.getUTCFullYear()}-${padDatePart(date.getUTCMonth() + 1)}-${padDatePart(date.getUTCDate())}`;
}
