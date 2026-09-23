import { postAction } from './client'

export function listPaychecks(idToken) {
  return postAction('paychecks.list', {}, idToken)
}

export function createPaycheck(idToken, paycheck) {
  return postAction('paychecks.create', paycheck, idToken)
}

export function updatePaycheck(idToken, id, patch) {
  return postAction('paychecks.update', { id, ...patch }, idToken)
}

export function deletePaycheck(idToken, id) {
  return postAction('paychecks.delete', { id }, idToken)
}

export function listEnvelopes(idToken) {
  return postAction('envelopes.list', {}, idToken)
}

export function createEnvelope(idToken, envelope) {
  return postAction('envelopes.create', envelope, idToken)
}

export function updateEnvelope(idToken, id, patch) {
  return postAction('envelopes.update', { id, ...patch }, idToken)
}

export function deleteEnvelope(idToken, id) {
  return postAction('envelopes.delete', { id }, idToken)
}
