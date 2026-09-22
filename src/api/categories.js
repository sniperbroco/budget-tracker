import { postAction } from './client'

export function listCategories(idToken, { includeArchived = false } = {}) {
  return postAction('categories.list', { includeArchived }, idToken)
}

export function createCategory(idToken, category) {
  return postAction('categories.create', category, idToken)
}

export function updateCategory(idToken, id, patch) {
  return postAction('categories.update', { id, ...patch }, idToken)
}

export function archiveCategory(idToken, id, archived = true) {
  return postAction('categories.archive', { id, archived }, idToken)
}
