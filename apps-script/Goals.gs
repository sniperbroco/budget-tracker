var Goals = (function () {
  var SHEET_NAME = 'SavingsGoals'

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
      targetAmount: Number(payload.targetAmount),
      targetDate: payload.targetDate || '',
      currentAmount: 0,
      color: payload.color || '#1baf7a',
      archived: false,
      createdAt: now,
      updatedAt: now,
    }
    return SheetUtil.appendRow(SHEET_NAME, row)
  }

  function update(payload) {
    if (!payload.id) throw new Error('Missing id.')
    var patch = {}
    ;['name', 'targetAmount', 'targetDate', 'color'].forEach(function (field) {
      if (Object.prototype.hasOwnProperty.call(payload, field)) {
        if (field === 'name') patch[field] = String(payload[field]).trim()
        else if (field === 'targetAmount') patch[field] = Number(payload[field])
        else patch[field] = payload[field]
      }
    })
    if (patch.name !== undefined && !patch.name) throw new Error('Name is required.')
    if (patch.targetAmount !== undefined && !(patch.targetAmount > 0)) {
      throw new Error('Target amount must be greater than 0.')
    }
    patch.updatedAt = new Date().toISOString()
    return SheetUtil.updateRowById(SHEET_NAME, payload.id, patch)
  }

  function archive(payload) {
    if (!payload.id) throw new Error('Missing id.')
    var archived = payload.archived !== false
    return SheetUtil.updateRowById(SHEET_NAME, payload.id, { archived: archived })
  }

  // amount may be negative to record a withdrawal; currentAmount never drops below 0.
  function contribute(payload) {
    if (!payload.id) throw new Error('Missing id.')
    var delta = Number(payload.amount)
    if (!delta) throw new Error('Amount must be non-zero.')

    var goals = SheetUtil.readAllRows(SHEET_NAME)
    var goal = goals.find(function (row) {
      return row.id === payload.id
    })
    if (!goal) throw new Error('Goal not found: ' + payload.id)

    var nextAmount = Math.max(0, Number(goal.currentAmount || 0) + delta)
    return SheetUtil.updateRowById(SHEET_NAME, payload.id, {
      currentAmount: nextAmount,
      updatedAt: new Date().toISOString(),
    })
  }

  function validate(payload) {
    if (!payload.name || !payload.name.trim()) throw new Error('Name is required.')
    if (!(Number(payload.targetAmount) > 0)) throw new Error('Target amount must be greater than 0.')
  }

  return { list: list, create: create, update: update, archive: archive, contribute: contribute }
})()
