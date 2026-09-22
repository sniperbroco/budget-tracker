import { postAction } from './client'

export function listRecurring(idToken, { includeInactive = false } = {}) {
  return postAction('recurring.list', { includeInactive }, idToken)
}

export function createRecurring(idToken, rule) {
  return postAction('recurring.create', rule, idToken)
}

export function updateRecurring(idToken, id, patch) {
  return postAction('recurring.update', { id, ...patch }, idToken)
}

export function deleteRecurring(idToken, id) {
  return postAction('recurring.delete', { id }, idToken)
}

export function syncRecurring(idToken) {
  return postAction('recurring.sync', {}, idToken)
}
