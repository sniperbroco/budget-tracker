var Transactions = (function () {
  var SHEET_NAME = 'Transactions'

  function list(filters) {
    filters = filters || {}
    var rows = SheetUtil.readAllRows(SHEET_NAME)
    var search = filters.search ? String(filters.search).toLowerCase() : ''

    return rows
      .filter(function (row) {
        if (filters.dateFrom && row.date < filters.dateFrom) return false
        if (filters.dateTo && row.date > filters.dateTo) return false
        if (filters.type && row.type !== filters.type) return false
        if (filters.categoryId && row.categoryId !== filters.categoryId) return false
        if (filters.accountId && row.accountId !== filters.accountId && row.toAccountId !== filters.accountId) return false
        if (search) {
          var haystack = (String(row.notes || '') + ' ' + String(row.tags || '')).toLowerCase()
          if (haystack.indexOf(search) === -1) return false
        }
        return true
      })
      .sort(function (a, b) {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1
        return a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0
      })
  }

  function create(payload) {
    validate(payload, false)
    var isTransfer = payload.type === 'transfer'
    if (isTransfer) SheetUtil.ensureColumn(SHEET_NAME, 'toAccountId')
    var now = new Date().toISOString()
    var row = {
      id: Utilities.getUuid(),
      date: payload.date,
      type: payload.type,
      categoryId: isTransfer ? '' : payload.categoryId,
      accountId: payload.accountId || '',
      toAccountId: isTransfer ? payload.toAccountId : '',
      amount: Number(payload.amount),
      notes: payload.notes || '',
      tags: normalizeTags(payload.tags),
      createdAt: now,
      updatedAt: now,
    }
    var created = SheetUtil.appendRow(SHEET_NAME, row)
    applyEffect(payload.type, created.accountId, payload.toAccountId, created.amount, 1)
    return created
  }

  function update(payload) {
    if (!payload.id) throw new Error('Missing id.')

    var existing = SheetUtil.readAllRows(SHEET_NAME).find(function (row) {
      return row.id === payload.id
    })
    if (!existing) throw new Error('Row not found: ' + payload.id)

    var patch = {}
    ;['date', 'type', 'categoryId', 'accountId', 'toAccountId', 'amount', 'notes', 'tags'].forEach(function (field) {
      if (Object.prototype.hasOwnProperty.call(payload, field)) {
        if (field === 'amount') patch[field] = Number(payload[field])
        else if (field === 'tags') patch[field] = normalizeTags(payload[field])
        else patch[field] = payload[field]
      }
    })
    var merged = Object.assign({}, existing, patch)
    validate(merged, false)
    if (merged.type === 'transfer') {
      SheetUtil.ensureColumn(SHEET_NAME, 'toAccountId')
      patch.categoryId = ''
    } else if (existing.toAccountId) {
      patch.toAccountId = ''
    }
    patch.updatedAt = new Date().toISOString()
    var updated = SheetUtil.updateRowById(SHEET_NAME, payload.id, patch)

    // Undo the old transaction's effect on any linked credit card debt,
    // then apply the new one — handles amount/type/account all changing
    // at once, and nets out to zero when nothing relevant changed.
    applyEffect(existing.type, existing.accountId, existing.toAccountId, existing.amount, -1)
    applyEffect(merged.type, merged.accountId, merged.type === 'transfer' ? merged.toAccountId : '', merged.amount, 1)

    return updated
  }

  function remove(payload) {
    if (!payload.id) throw new Error('Missing id.')

    var existing = SheetUtil.readAllRows(SHEET_NAME).find(function (row) {
      return row.id === payload.id
    })
    if (!existing) throw new Error('Row not found: ' + payload.id)

    SheetUtil.deleteRowById(SHEET_NAME, payload.id)
    applyEffect(existing.type, existing.accountId, existing.toAccountId, existing.amount, -1)
    return { id: payload.id }
  }

  // Applies (direction 1) or undoes (-1) a transaction's effect on any linked
  // credit card debt. A transfer moves money out of one account and into
  // another, so it touches both ends.
  function applyEffect(type, accountId, toAccountId, amount, direction) {
    if (type === 'transfer') {
      Debts.adjustBalanceForAccount(accountId, direction * Number(amount))
      Debts.adjustBalanceForAccount(toAccountId, -direction * Number(amount))
    } else {
      Debts.adjustBalanceForAccount(accountId, direction * signedAmount(type, amount))
    }
  }

  // Positive grows a linked credit card's balance owed (a charge/expense),
  // negative shrinks it (a refund/income).
  function signedAmount(type, amount) {
    var numericAmount = Number(amount) || 0
    return type === 'expense' ? numericAmount : -numericAmount
  }

  function normalizeTags(tags) {
    if (!tags) return ''
    return String(tags)
      .split(',')
      .map(function (tag) {
        return tag.trim()
      })
      .filter(Boolean)
      .join(',')
  }

  function validate(payload, isPatch) {
    if (!isPatch || payload.date !== undefined) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) throw new Error('Invalid date.')
    }
    if (!isPatch || payload.type !== undefined) {
      if (payload.type !== 'income' && payload.type !== 'expense' && payload.type !== 'transfer') {
        throw new Error('Invalid type.')
      }
    }
    if (payload.type === 'transfer') {
      if (!payload.accountId || !payload.toAccountId) throw new Error('Choose both accounts for a transfer.')
      if (payload.accountId === payload.toAccountId) throw new Error('Transfer accounts must be different.')
    } else if (!isPatch || payload.categoryId !== undefined) {
      if (!payload.categoryId) throw new Error('Missing categoryId.')
    }
    if (!isPatch || payload.amount !== undefined) {
      if (!(Number(payload.amount) > 0)) throw new Error('Amount must be greater than 0.')
    }
  }

  return { list: list, create: create, update: update, remove: remove }
})()
