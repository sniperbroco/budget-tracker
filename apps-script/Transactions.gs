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
    return SheetUtil.appendRow(SHEET_NAME, row)
  }

  function update(payload) {
    if (!payload.id) throw new Error('Missing id.')
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
    return SheetUtil.updateRowById(SHEET_NAME, payload.id, patch)
  }

  function remove(payload) {
    if (!payload.id) throw new Error('Missing id.')
    SheetUtil.deleteRowById(SHEET_NAME, payload.id)
    return { id: payload.id }
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
