export function formatPersianDate(input: Date | string | number) {
  const date = input instanceof Date ? input : new Date(input);
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export function formatPersianTime(input: Date | string | number) {
  const date = input instanceof Date ? input : new Date(input);
  return new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}
