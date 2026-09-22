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
    var row = {
      id: Utilities.getUuid(),
      name: payload.name.trim(),
      kind: payload.kind,
      // A loan's balance starts at the full principal; a credit card starts
      // at whatever current balance is supplied (usually 0 for a fresh card).
      originalAmount: Number(payload.originalAmount),
      balance: payload.kind === 'loan' ? Number(payload.originalAmount) : Number(payload.balance || 0),
      interestRate: numberOrBlank(payload.interestRate),
      minimumPayment: numberOrBlank(payload.minimumPayment),
      dueDay: numberOrBlank(payload.dueDay),
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
    ;['name', 'interestRate', 'minimumPayment', 'dueDay', 'accountId', 'color'].forEach(function (field) {
      if (Object.prototype.hasOwnProperty.call(payload, field)) {
        if (field === 'name') patch[field] = String(payload[field]).trim()
        else if (field === 'interestRate' || field === 'minimumPayment' || field === 'dueDay') {
          patch[field] = numberOrBlank(payload[field])
        } else {
          patch[field] = payload[field]
        }
      }
    })
    if (patch.name !== undefined && !patch.name) throw new Error('Name is required.')
    patch.updatedAt = new Date().toISOString()
    return SheetUtil.updateRowById(SHEET_NAME, payload.id, patch)
  }

  function archive(payload) {
    if (!payload.id) throw new Error('Missing id.')
    var archived = payload.archived !== false
    return SheetUtil.updateRowById(SHEET_NAME, payload.id, { archived: archived })
  }

  // amount > 0 = a charge (balance grows; only meaningful for a credit
  // card), amount < 0 = a payment (balance shrinks). Balance never drops
  // below 0. This does not touch Transactions/Accounts — logging a debt
  // payment here is independent of recording the cash-out transaction.
  function record(payload) {
    if (!payload.id) throw new Error('Missing id.')
    var delta = Number(payload.amount)
    if (!delta) throw new Error('Amount must be non-zero.')

    var debts = SheetUtil.readAllRows(SHEET_NAME)
    var debt = debts.find(function (row) {
      return row.id === payload.id
    })
    if (!debt) throw new Error('Debt not found: ' + payload.id)

    var nextBalance = Math.max(0, Number(debt.balance || 0) + delta)
    return SheetUtil.updateRowById(SHEET_NAME, payload.id, {
      balance: nextBalance,
      updatedAt: new Date().toISOString(),
    })
  }

  function numberOrBlank(value) {
    return value === undefined || value === null || value === '' ? '' : Number(value)
  }

  function validate(payload) {
    if (!payload.name || !payload.name.trim()) throw new Error('Name is required.')
    if (payload.kind !== 'loan' && payload.kind !== 'credit_card') throw new Error('Invalid kind.')
    if (!(Number(payload.originalAmount) > 0)) throw new Error('Amount must be greater than 0.')
  }

  return { list: list, create: create, update: update, archive: archive, record: record }
})()
