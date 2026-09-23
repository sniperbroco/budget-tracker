/**
 * Single entry point for all data operations. Every request is a POST with
 * a text/plain body containing {action, idToken, payload} as JSON — this
 * keeps the request a CORS "simple request" so the browser skips the
 * OPTIONS preflight, which Apps Script Web Apps cannot answer.
 */
function doPost(e) {
  var body
  try {
    body = JSON.parse(e.postData.contents)
  } catch (err) {
    return jsonResponse({ ok: false, error: 'Malformed request body.' })
  }

  try {
    verifyIdToken(body.idToken)
    var result = routeAction(body.action, body.payload || {})
    return jsonResponse({ ok: true, data: result })
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message })
  }
}

// Reads (and the ID token) always go through doPost — a GET puts query
// params, including a token, into Apps Script's execution logs and the
// browser's history. doGet only answers an unauthenticated health check.
function doGet() {
  return jsonResponse({ ok: true, message: 'Use POST for all data operations.' })
}

function routeAction(action, payload) {
  switch (action) {
    case 'transactions.list':
      return Transactions.list(payload)
    case 'transactions.create':
      return Transactions.create(payload)
    case 'transactions.update':
      return Transactions.update(payload)
    case 'transactions.delete':
      return Transactions.remove(payload)
    case 'categories.list':
      return Categories.list(payload)
    case 'categories.create':
      return Categories.create(payload)
    case 'categories.update':
      return Categories.update(payload)
    case 'categories.archive':
      return Categories.archive(payload)
    case 'budgets.list':
      return Budgets.list(payload)
    case 'budgets.upsert':
      return Budgets.upsert(payload)
    case 'budgets.delete':
      return Budgets.remove(payload)
    case 'accounts.list':
      return Accounts.list(payload)
    case 'accounts.create':
      return Accounts.create(payload)
    case 'accounts.update':
      return Accounts.update(payload)
    case 'accounts.archive':
      return Accounts.archive(payload)
    case 'accounts.balances':
      return Accounts.balances()
    case 'goals.list':
      return Goals.list(payload)
    case 'goals.create':
      return Goals.create(payload)
    case 'goals.update':
      return Goals.update(payload)
    case 'goals.archive':
      return Goals.archive(payload)
    case 'goals.contribute':
      return Goals.contribute(payload)
    case 'recurring.list':
      return Recurring.list(payload)
    case 'recurring.create':
      return Recurring.create(payload)
    case 'recurring.update':
      return Recurring.update(payload)
    case 'recurring.delete':
      return Recurring.remove(payload)
    case 'recurring.sync':
      return Recurring.sync()
    case 'debts.list':
      return Debts.list(payload)
    case 'debts.create':
      return Debts.create(payload)
    case 'debts.update':
      return Debts.update(payload)
    case 'debts.archive':
      return Debts.archive(payload)
    case 'debts.record':
      return Debts.record(payload)
    case 'paychecks.list':
      return Paychecks.list(payload)
    case 'paychecks.create':
      return Paychecks.create(payload)
    case 'paychecks.update':
      return Paychecks.update(payload)
    case 'paychecks.delete':
      return Paychecks.remove(payload)
    case 'envelopes.list':
      return PaycheckEnvelopes.list(payload)
    case 'envelopes.create':
      return PaycheckEnvelopes.create(payload)
    case 'envelopes.update':
      return PaycheckEnvelopes.update(payload)
    case 'envelopes.delete':
      return PaycheckEnvelopes.remove(payload)
    default:
      throw new Error('Unknown action: ' + action)
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}
