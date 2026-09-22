var Debts = (function () {
  var SHEET_NAME = 'Debts'

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
    var now = new Date().toISOString()
    var principal = Number(payload.originalAmount)
    var interestRate = numberOrBlank(payload.interestRate)
    // A fixed loan's total owed includes a one-time flat interest amount
    // added to the principal (e.g. 10,000 principal at 10% -> 11,000
    // owed) — this becomes both the balance and the 100% reference point
    // for payoff progress. A credit card's limit is untouched by interest
    // rate, since interest there accrues on carried balances over time,
    // not upfront on the limit itself.
    var loanTotalOwed = principal + principal * (Number(interestRate || 0) / 100)
    var row = {
      id: Utilities.getUuid(),
      name: payload.name.trim(),
      kind: payload.kind,
      originalAmount: payload.kind === 'loan' ? loanTotalOwed : principal,
      balance: payload.kind === 'loan' ? loanTotalOwed : Number(payload.balance || 0),
      interestRate: interestRate,
      minimumPayment: numberOrBlank(payload.minimumPayment),
      dueDay: numberOrBlank(payload.dueDay),
      // Reference only — whatever your bank shows you directly for
      // "available spending limit". Not derived from originalAmount/
      // balance, since a bank's real available limit doesn't always
      // reconcile with limit-minus-balance by simple subtraction.
      availableLimit: numberOrBlank(payload.availableLimit),
      accountId: payload.accountId || '',
      color: payload.color || '#e34948',
      archived: false,
      createdAt: now,
      updatedAt: now,
    }
    return SheetUtil.appendRow(SHEET_NAME, row)
  }

  function update(payload) {
    if (!payload.id) throw new Error('Missing id.')
    var patch = {}
    ;['name', 'interestRate', 'minimumPayment', 'dueDay', 'availableLimit', 'accountId', 'color'].forEach(
      function (field) {
        if (Object.prototype.hasOwnProperty.call(payload, field)) {
          if (field === 'name') patch[field] = String(payload[field]).trim()
          else if (field === 'interestRate' || field === 'minimumPayment' || field === 'dueDay' || field === 'availableLimit') {
            patch[field] = numberOrBlank(payload[field])
          } else {
            patch[field] = payload[field]
          }
        }
      },
    )
    if (patch.name !== undefined && !patch.name) throw new Error('Name is required.')
    patch.updatedAt = new Date().toISOString()
    return SheetUtil.updateRowById(SHEET_NAME, payload.id, patch)
  }

  function archive(payload) {
    if (!payload.id) throw new Error('Missing id.')
    var archived = payload.archived !== false
    return SheetUtil.updateRowById(SHEET_NAME, payload.id, { archived: archived })
  }

  // Shared math for every balance-affecting event (a payment logged on the
  // Debts page, or a transaction charged/refunded on a linked account).
  // delta > 0 = a charge (balance grows, available limit shrinks),
  // delta < 0 = a payment/refund (balance shrinks, available limit grows).
  // Balance never drops below 0; available limit is clamped between 0 and
  // the card's total spending limit (originalAmount) and only touched when
  // the debt actually tracks one (loans leave it blank).
  function applyDelta(debt, delta) {
    var patch = { updatedAt: new Date().toISOString() }
    patch.balance = Math.max(0, Number(debt.balance || 0) + delta)
    if (debt.availableLimit !== '' && debt.availableLimit !== undefined && debt.availableLimit !== null) {
      var limit = Number(debt.originalAmount) || Infinity
      patch.availableLimit = Math.min(limit, Math.max(0, Number(debt.availableLimit || 0) - delta))
    }
    return patch
  }

  // amount > 0 = a charge, amount < 0 = a payment. This does not touch
  // Transactions/Accounts — logging a debt payment here is independent of
  // recording the cash-out transaction.
  function record(payload) {
    if (!payload.id) throw new Error('Missing id.')
    var delta = Number(payload.amount)
    if (!delta) throw new Error('Amount must be non-zero.')

    var debts = SheetUtil.readAllRows(SHEET_NAME)
    var debt = debts.find(function (row) {
      return row.id === payload.id
    })
    if (!debt) throw new Error('Debt not found: ' + payload.id)

    return SheetUtil.updateRowById(SHEET_NAME, payload.id, applyDelta(debt, delta))
  }

  // Called from Transactions.gs whenever a transaction is created, edited,
  // or deleted. Only ever touches a revolving credit card debt explicitly
  // linked to that account — everything else (loans, unlinked accounts) is
  // untouched.
  function adjustBalanceForAccount(accountId, delta) {
    if (!accountId || !delta) return
    var debts = SheetUtil.readAllRows(SHEET_NAME)
    var debt = debts.find(function (row) {
      return row.kind === 'credit_card' && row.accountId === accountId && !row.archived
    })
    if (!debt) return
    SheetUtil.updateRowById(SHEET_NAME, debt.id, applyDelta(debt, delta))
  }

  function numberOrBlank(value) {
    return value === undefined || value === null || value === '' ? '' : Number(value)
  }

  function validate(payload) {
    if (!payload.name || !payload.name.trim()) throw new Error('Name is required.')
    if (payload.kind !== 'loan' && payload.kind !== 'credit_card') throw new Error('Invalid kind.')
    if (!(Number(payload.originalAmount) > 0)) throw new Error('Amount must be greater than 0.')
  }

  return {
    list: list,
    create: create,
    update: update,
    archive: archive,
    record: record,
    adjustBalanceForAccount: adjustBalanceForAccount,
  }
})()
