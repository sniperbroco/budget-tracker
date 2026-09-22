var Accounts = (function () {
  var SHEET_NAME = 'Accounts'

  function list(payload) {
    payload = payload || {}
    var rows = SheetUtil.readAllRows(SHEET_NAME)
    if (payload.includeArchived) return rows
    return rows.filter(function (row) {
      return !row.archived
    })
  }

  function create(payload) {
    validate(payload)
    var row = {
      id: Utilities.getUuid(),
      name: payload.name.trim(),
      type: payload.type || 'cash',
      color: payload.color || '#2a78d6',
      startingBalance: Number(payload.startingBalance || 0),
      archived: false,
      createdAt: new Date().toISOString(),
    }
    return SheetUtil.appendRow(SHEET_NAME, row)
  }

  function update(payload) {
    if (!payload.id) throw new Error('Missing id.')
    var patch = {}
    ;['name', 'type', 'color', 'startingBalance'].forEach(function (field) {
      if (Object.prototype.hasOwnProperty.call(payload, field)) {
        if (field === 'name') patch[field] = String(payload[field]).trim()
        else if (field === 'startingBalance') patch[field] = Number(payload[field])
        else patch[field] = payload[field]
      }
    })
    if (patch.name !== undefined && !patch.name) throw new Error('Name is required.')
    return SheetUtil.updateRowById(SHEET_NAME, payload.id, patch)
  }

  function archive(payload) {
    if (!payload.id) throw new Error('Missing id.')
    var archived = payload.archived !== false
    return SheetUtil.updateRowById(SHEET_NAME, payload.id, { archived: archived })
  }

  // For a normal account: startingBalance + sum(income) - sum(expense),
  // across ALL transactions ever recorded for that account (not scoped to
  // a period). For an account linked to a revolving credit card debt, the
  // balance instead directly mirrors that debt's `availableLimit` field —
  // a number you enter by hand from your bank each statement cycle, not
  // computed from anything, since it doesn't reconcile with limit/balance
  // by simple subtraction.
  function balances() {
    var accounts = SheetUtil.readAllRows(SHEET_NAME)
    var transactions = SheetUtil.readAllRows('Transactions')
    var debts = SheetUtil.readAllRows('Debts')
    var totals = {}

    var linkedCreditCards = {}
    debts.forEach(function (debt) {
      if (debt.kind === 'credit_card' && debt.accountId && !debt.archived) {
        linkedCreditCards[debt.accountId] = debt
      }
    })

    accounts.forEach(function (account) {
      var linkedDebt = linkedCreditCards[account.id]
      totals[account.id] = linkedDebt
        ? Number(linkedDebt.availableLimit) || 0
        : Number(account.startingBalance) || 0
    })

    transactions.forEach(function (transaction) {
      if (!transaction.accountId || !(transaction.accountId in totals)) return
      if (linkedCreditCards[transaction.accountId]) return
      var amount = Number(transaction.amount) || 0
      totals[transaction.accountId] += transaction.type === 'income' ? amount : -amount
    })

    return totals
  }

  function validate(payload) {
    if (!payload.name || !payload.name.trim()) throw new Error('Name is required.')
  }

  return { list: list, create: create, update: update, archive: archive, balances: balances }
})()
