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
        if (filters.accountId && row.accountId !== filters.accountId) return false
        if (search) {
          var haystack = (String(row.notes || '') + ' ' + String(row.tags || '')).toLowerCase()
          if (haystack.indexOf(search) === -1) return false
        }
        return true
      })
      .sort(function (a, b) {
        return a.date < b.date ? 1 : a.date > b.date ? -1 : 0
      })
  }

  function create(payload) {
    validate(payload, false)
    var now = new Date().toISOString()
    var row = {
      id: Utilities.getUuid(),
      date: payload.date,
      type: payload.type,
      categoryId: payload.categoryId,
      accountId: payload.accountId || '',
      amount: Number(payload.amount),
      notes: payload.notes || '',
      tags: normalizeTags(payload.tags),
      createdAt: now,
      updatedAt: now,
    }
    var created = SheetUtil.appendRow(SHEET_NAME, row)
    Debts.adjustBalanceForAccount(created.accountId, signedAmount(created.type, created.amount))
    return created
  }

  function update(payload) {
    if (!payload.id) throw new Error('Missing id.')

    var existing = SheetUtil.readAllRows(SHEET_NAME).find(function (row) {
      return row.id === payload.id
    })
    if (!existing) throw new Error('Row not found: ' + payload.id)

    var patch = {}
    ;['date', 'type', 'categoryId', 'accountId', 'amount', 'notes', 'tags'].forEach(function (field) {
      if (Object.prototype.hasOwnProperty.call(payload, field)) {
        if (field === 'amount') patch[field] = Number(payload[field])
        else if (field === 'tags') patch[field] = normalizeTags(payload[field])
        else patch[field] = payload[field]
      }
    })
    validate(patch, true)
    patch.updatedAt = new Date().toISOString()
    var updated = SheetUtil.updateRowById(SHEET_NAME, payload.id, patch)

    // Undo the old transaction's effect on any linked credit card debt,
    // then apply the new one — handles amount/type/account all changing
    // at once, and nets out to zero when nothing relevant changed.
    Debts.adjustBalanceForAccount(existing.accountId, -signedAmount(existing.type, existing.amount))
    Debts.adjustBalanceForAccount(updated.accountId, signedAmount(updated.type, updated.amount))

    return updated
  }

  function remove(payload) {
    if (!payload.id) throw new Error('Missing id.')

    var existing = SheetUtil.readAllRows(SHEET_NAME).find(function (row) {
      return row.id === payload.id
    })
    if (!existing) throw new Error('Row not found: ' + payload.id)

    SheetUtil.deleteRowById(SHEET_NAME, payload.id)
    Debts.adjustBalanceForAccount(existing.accountId, -signedAmount(existing.type, existing.amount))
    return { id: payload.id }
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
      if (payload.type !== 'income' && payload.type !== 'expense') throw new Error('Invalid type.')
    }
    if (!isPatch || payload.categoryId !== undefined) {
      if (!payload.categoryId) throw new Error('Missing categoryId.')
    }
    if (!isPatch || payload.amount !== undefined) {
      if (!(Number(payload.amount) > 0)) throw new Error('Amount must be greater than 0.')
    }
  }

  return { list: list, create: create, update: update, remove: remove }
})()
