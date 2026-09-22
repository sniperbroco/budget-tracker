import { CURRENCY, LOCALE } from '../config'

const formatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 2,
})

export function formatCurrency(amount) {
  const value = Number(amount)
  return formatter.format(Number.isFinite(value) ? value : 0)
}
