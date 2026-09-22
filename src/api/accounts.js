import { postAction } from './client'

export function listAccounts(idToken, { includeArchived = false } = {}) {
  return postAction('accounts.list', { includeArchived }, idToken)
}

export function createAccount(idToken, account) {
  return postAction('accounts.create', account, idToken)
}

export function updateAccount(idToken, id, patch) {
  return postAction('accounts.update', { id, ...patch }, idToken)
}

export function archiveAccount(idToken, id, archived = true) {
  return postAction('accounts.archive', { id, archived }, idToken)
}

export function getAccountBalances(idToken) {
  return postAction('accounts.balances', {}, idToken)
}
