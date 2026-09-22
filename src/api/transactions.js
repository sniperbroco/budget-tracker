import { postAction } from './client'

export function listTransactions(idToken, filters = {}) {
  return postAction('transactions.list', filters, idToken)
}

export function createTransaction(idToken, transaction) {
  return postAction('transactions.create', transaction, idToken)
}

export function updateTransaction(idToken, id, patch) {
  return postAction('transactions.update', { id, ...patch }, idToken)
}

export function deleteTransaction(idToken, id) {
  return postAction('transactions.delete', { id }, idToken)
}
