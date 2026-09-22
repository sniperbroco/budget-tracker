// All dates are handled as plain YYYY-MM-DD / YYYY-MM strings, never as
// Date objects that could shift across timezones. `new Date()` is only
// used to read the browser's local calendar date/time, never to format
// a stored value.

export function getCurrentDateKey() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function getCurrentMonthKey() {
  return getCurrentDateKey().slice(0, 7)
}

export function dateKeyToMonthKey(dateKey) {
  return dateKey ? dateKey.slice(0, 7) : ''
}

export function getMonthDateRange(monthKey) {
  const [year, month] = monthKey.split('-').map(Number)
  const lastDay = new Date(year, month, 0).getDate()
  return {
    dateFrom: `${monthKey}-01`,
    dateTo: `${monthKey}-${String(lastDay).padStart(2, '0')}`,
  }
}

export function shiftMonthKey(monthKey, delta) {
  const [year, month] = monthKey.split('-').map(Number)
  const zeroBasedTotal = (month - 1) + delta
  const newYear = year + Math.floor(zeroBasedTotal / 12)
  const newMonth = ((zeroBasedTotal % 12) + 12) % 12
  return `${newYear}-${String(newMonth + 1).padStart(2, '0')}`
}

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function formatMonthLabel(monthKey) {
  if (!monthKey) return ''
  const [year, month] = monthKey.split('-').map(Number)
  return `${MONTH_LABELS[month - 1]} ${year}`
}

export function formatDateLabel(dateKey) {
  if (!dateKey) return ''
  const [year, month, day] = dateKey.split('-').map(Number)
  return `${MONTH_LABELS[month - 1].slice(0, 3)} ${day}, ${year}`
}

export function formatMonthShortLabel(monthKey) {
  if (!monthKey) return ''
  const [, month] = monthKey.split('-').map(Number)
  return MONTH_LABELS[month - 1].slice(0, 3)
}

export function getTrailingMonthKeys(count) {
  const current = getCurrentMonthKey()
  const keys = []
  for (let i = count - 1; i >= 0; i -= 1) {
    keys.push(shiftMonthKey(current, -i))
  }
  return keys
}

export function getTrailingRange(count) {
  const keys = getTrailingMonthKeys(count)
  return {
    dateFrom: `${keys[0]}-01`,
    dateTo: getMonthDateRange(keys[keys.length - 1]).dateTo,
  }
}
