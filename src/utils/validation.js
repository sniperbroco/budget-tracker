const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/
const MONTH_KEY_RE = /^\d{4}-\d{2}$/

export function validateTransaction({ date, type, categoryId, amount }) {
  const errors = {}
  if (!date || !DATE_KEY_RE.test(date)) errors.date = 'Enter a valid date.'
  if (type !== 'income' && type !== 'expense') errors.type = 'Choose income or expense.'
  if (!categoryId) errors.categoryId = 'Choose a category.'
  const numericAmount = Number(amount)
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    errors.amount = 'Enter an amount greater than 0.'
  }
  return errors
}

export function validateCategory({ name, type }) {
  const errors = {}
  if (!name || !name.trim()) errors.name = 'Enter a category name.'
  if (type !== 'income' && type !== 'expense') errors.type = 'Choose income or expense.'
  return errors
}

export function validateBudget({ categoryId, month, limitAmount }) {
  const errors = {}
  if (!categoryId) errors.categoryId = 'Choose a category.'
  if (!month || !MONTH_KEY_RE.test(month)) errors.month = 'Choose a valid month.'
  const numericLimit = Number(limitAmount)
  if (!Number.isFinite(numericLimit) || numericLimit <= 0) {
    errors.limitAmount = 'Enter a limit greater than 0.'
  }
  return errors
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0
}
