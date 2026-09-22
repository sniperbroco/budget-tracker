var Budgets = (function () {
  var SHEET_NAME = 'Budgets'

  function list(payload) {
    payload = payload || {}
    var rows = SheetUtil.readAllRows(SHEET_NAME)
    if (!payload.month) return rows
    return rows.filter(function (row) {
      return row.month === payload.month
    })
  }

  // One row per (categoryId, month): saving a budget for a category+month
  // that already has one updates it in place instead of duplicating.
  function upsert(payload) {
    validate(payload)
    var existing = payload.id
      ? null
      : SheetUtil.findRowByColumns(SHEET_NAME, { categoryId: payload.categoryId, month: payload.month })
    var id = payload.id || (existing && existing.id)
    var now = new Date().toISOString()

    if (id) {
      return SheetUtil.updateRowById(SHEET_NAME, id, {
        categoryId: payload.categoryId,
        month: payload.month,
        limitAmount: Number(payload.limitAmount),
        updatedAt: now,
      })
    }

    return SheetUtil.appendRow(SHEET_NAME, {
      id: Utilities.getUuid(),
      categoryId: payload.categoryId,
      month: payload.month,
      limitAmount: Number(payload.limitAmount),
      createdAt: now,
      updatedAt: now,
    })
  }

  function remove(payload) {
    if (!payload.id) throw new Error('Missing id.')
    SheetUtil.deleteRowById(SHEET_NAME, payload.id)
    return { id: payload.id }
  }

  function validate(payload) {
    if (!payload.categoryId) throw new Error('Missing categoryId.')
    if (!/^\d{4}-\d{2}$/.test(payload.month)) throw new Error('Invalid month.')
    if (!(Number(payload.limitAmount) > 0)) throw new Error('Limit must be greater than 0.')
  }

  return { list: list, upsert: upsert, remove: remove }
})()
