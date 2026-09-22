import { postAction } from './client'

export function listDebts(idToken, { includeArchived = false } = {}) {
  return postAction('debts.list', { includeArchived }, idToken)
}

export function createDebt(idToken, debt) {
  return postAction('debts.create', debt, idToken)
}

export function updateDebt(idToken, id, patch) {
  return postAction('debts.update', { id, ...patch }, idToken)
}

export function archiveDebt(idToken, id, archived = true) {
  return postAction('debts.archive', { id, archived }, idToken)
}

export function recordDebtPayment(idToken, id, amount) {
  return postAction('debts.record', { id, amount }, idToken)
}
