import { postAction } from './client'

export function listGoals(idToken, { includeArchived = false } = {}) {
  return postAction('goals.list', { includeArchived }, idToken)
}

export function createGoal(idToken, goal) {
  return postAction('goals.create', goal, idToken)
}

export function updateGoal(idToken, id, patch) {
  return postAction('goals.update', { id, ...patch }, idToken)
}

export function archiveGoal(idToken, id, archived = true) {
  return postAction('goals.archive', { id, archived }, idToken)
}

export function contributeToGoal(idToken, id, amount) {
  return postAction('goals.contribute', { id, amount }, idToken)
}
