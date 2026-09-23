var Paychecks = (function () {
  var SHEET_NAME = 'Paychecks'

  function list() {
    return SheetUtil.readAllRows(SHEET_NAME)
  }

  function create(payload) {
    validate(payload)
    var now = new Date().toISOString()
    return SheetUtil.appendRow(SHEET_NAME, {
      id: Utilities.getUuid(),
      date: payload.date,
      amount: Number(payload.amount),
      label: (payload.label || '').trim(),
      createdAt: now,
      updatedAt: now,
    })
  }

  function update(payload) {
    if (!payload.id) throw new Error('Missing id.')
    var patch = {}
    ;['date', 'amount', 'label'].forEach(function (field) {
      if (Object.prototype.hasOwnProperty.call(payload, field)) {
        if (field === 'amount') patch[field] = Number(payload[field])
        else if (field === 'label') patch[field] = String(payload[field]).trim()
        else patch[field] = payload[field]
      }
    })
    if (patch.date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(patch.date)) throw new Error('Invalid date.')
    if (patch.amount !== undefined && !(patch.amount > 0)) throw new Error('Amount must be greater than 0.')
    patch.updatedAt = new Date().toISOString()
    return SheetUtil.updateRowById(SHEET_NAME, payload.id, patch)
  }

  // Deleting a paycheck also deletes its envelopes — an envelope with no
  // paycheck to belong to is meaningless, so we don't leave orphans behind.
  function remove(payload) {
    if (!payload.id) throw new Error('Missing id.')
    PaycheckEnvelopes.list({ paycheckId: payload.id }).forEach(function (envelope) {
      SheetUtil.deleteRowById('PaycheckEnvelopes', envelope.id)
    })
    SheetUtil.deleteRowById(SHEET_NAME, payload.id)
    return { id: payload.id }
  }

  function validate(payload) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) throw new Error('Invalid date.')
    if (!(Number(payload.amount) > 0)) throw new Error('Amount must be greater than 0.')
  }

  return { list: list, create: create, update: update, remove: remove }
})()
