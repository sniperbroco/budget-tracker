import { postAction } from './client'

export function listBudgets(idToken, { month } = {}) {
  return postAction('budgets.list', { month }, idToken)
}

export function upsertBudget(idToken, budget) {
  return postAction('budgets.upsert', budget, idToken)
}

export function deleteBudget(idToken, id) {
  return postAction('budgets.delete', { id }, idToken)
}
