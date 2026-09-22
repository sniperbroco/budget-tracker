var Categories = (function () {
  var SHEET_NAME = 'Categories'

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
      type: payload.type,
      color: payload.color || '#6366f1',
      archived: false,
      createdAt: new Date().toISOString(),
    }
    return SheetUtil.appendRow(SHEET_NAME, row)
  }

  function update(payload) {
    if (!payload.id) throw new Error('Missing id.')
    var patch = {}
    ;['name', 'type', 'color'].forEach(function (field) {
      if (Object.prototype.hasOwnProperty.call(payload, field)) {
        patch[field] = field === 'name' ? String(payload[field]).trim() : payload[field]
      }
    })
    if (patch.name !== undefined && !patch.name) throw new Error('Name is required.')
    if (patch.type !== undefined && patch.type !== 'income' && patch.type !== 'expense') {
      throw new Error('Invalid type.')
    }
    return SheetUtil.updateRowById(SHEET_NAME, payload.id, patch)
  }

  function archive(payload) {
    if (!payload.id) throw new Error('Missing id.')
    var archived = payload.archived !== false
    return SheetUtil.updateRowById(SHEET_NAME, payload.id, { archived: archived })
  }

  function validate(payload) {
    if (!payload.name || !payload.name.trim()) throw new Error('Name is required.')
    if (payload.type !== 'income' && payload.type !== 'expense') throw new Error('Invalid type.')
  }

  return { list: list, create: create, update: update, archive: archive }
})()
