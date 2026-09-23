var PaycheckEnvelopes = (function () {
  var SHEET_NAME = 'PaycheckEnvelopes'

  function list(payload) {
    payload = payload || {}
    var rows = SheetUtil.readAllRows(SHEET_NAME)
    if (!payload.paycheckId) return rows
    return rows.filter(function (row) {
      return row.paycheckId === payload.paycheckId
    })
  }

  function create(payload) {
    validate(payload)
    var now = new Date().toISOString()
    return SheetUtil.appendRow(SHEET_NAME, {
      id: Utilities.getUuid(),
      paycheckId: payload.paycheckId,
      name: payload.name.trim(),
      amount: Number(payload.amount),
      notes: (payload.notes || '').trim(),
      createdAt: now,
      updatedAt: now,
    })
  }

  function update(payload) {
    if (!payload.id) throw new Error('Missing id.')
    var patch = {}
    ;['name', 'amount', 'notes'].forEach(function (field) {
      if (Object.prototype.hasOwnProperty.call(payload, field)) {
        if (field === 'amount') patch[field] = Number(payload[field])
        else patch[field] = String(payload[field]).trim()
      }
    })
    if (patch.name !== undefined && !patch.name) throw new Error('Name is required.')
    if (patch.amount !== undefined && !(patch.amount > 0)) throw new Error('Amount must be greater than 0.')
    patch.updatedAt = new Date().toISOString()
    return SheetUtil.updateRowById(SHEET_NAME, payload.id, patch)
  }

  function remove(payload) {
    if (!payload.id) throw new Error('Missing id.')
    SheetUtil.deleteRowById(SHEET_NAME, payload.id)
    return { id: payload.id }
  }

  function validate(payload) {
    if (!payload.paycheckId) throw new Error('Missing paycheckId.')
    if (!payload.name || !payload.name.trim()) throw new Error('Name is required.')
    if (!(Number(payload.amount) > 0)) throw new Error('Amount must be greater than 0.')
  }

  return { list: list, create: create, update: update, remove: remove }
})()
