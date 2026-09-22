var Recurring = (function () {
  var SHEET_NAME = 'RecurringTransactions'

  function list(payload) {
    payload = payload || {}
    var rows = SheetUtil.readAllRows(SHEET_NAME)
    if (payload.includeInactive) return rows
    return rows.filter(function (row) {
      return row.active
    })
  }

  function create(payload) {
    validate(payload)
    var now = new Date().toISOString()
    var row = {
      id: Utilities.getUuid(),
      type: payload.type,
      categoryId: payload.categoryId,
      accountId: payload.accountId || '',
      amount: Number(payload.amount),
      notes: payload.notes || '',
      tags: normalizeTags(payload.tags),
      frequency: payload.frequency,
      startDate: payload.startDate,
      nextRunDate: payload.startDate,
      active: true,
      createdAt: now,
      updatedAt: now,
    }
    return SheetUtil.appendRow(SHEET_NAME, row)
  }

  function update(payload) {
    if (!payload.id) throw new Error('Missing id.')
    var patch = {}
    ;['type', 'categoryId', 'accountId', 'amount', 'notes', 'tags', 'frequency', 'active'].forEach(
      function (field) {
        if (Object.prototype.hasOwnProperty.call(payload, field)) {
          if (field === 'amount') patch[field] = Number(payload[field])
          else if (field === 'tags') patch[field] = normalizeTags(payload[field])
          else patch[field] = payload[field]
        }
      },
    )
    patch.updatedAt = new Date().toISOString()
    return SheetUtil.updateRowById(SHEET_NAME, payload.id, patch)
  }

  function remove(payload) {
    if (!payload.id) throw new Error('Missing id.')
    SheetUtil.deleteRowById(SHEET_NAME, payload.id)
    return { id: payload.id }
  }

  // Lazily catches up: generates a real Transaction row for every occurrence
  // due up to today, advancing nextRunDate each time. Runs whenever the app
  // loads rather than needing an installed time-driven trigger.
  function sync() {
    var rules = SheetUtil.readAllRows(SHEET_NAME).filter(function (row) {
      return row.active
    })
    var today = todayKey()
    var created = 0

    rules.forEach(function (rule) {
      var nextRunDate = rule.nextRunDate || rule.startDate
      var anchorDay = Number(String(rule.startDate).split('-')[2])

      while (nextRunDate && nextRunDate <= today) {
        Transactions.create({
          date: nextRunDate,
          type: rule.type,
          categoryId: rule.categoryId,
          accountId: rule.accountId,
          amount: rule.amount,
          notes: rule.notes,
          tags: rule.tags,
        })
        created += 1
        nextRunDate = advance(nextRunDate, rule.frequency, anchorDay)
      }

      if (nextRunDate !== rule.nextRunDate) {
        SheetUtil.updateRowById(SHEET_NAME, rule.id, {
          nextRunDate: nextRunDate,
          updatedAt: new Date().toISOString(),
        })
      }
    })

    return { generated: created }
  }

  // Always targets the rule's original day-of-month (clamped to the target
  // month's length) rather than chaining off the previous occurrence, so a
  // "day 31" rule doesn't drift earlier after landing on a short month.
  function advance(dateKey, frequency, anchorDay) {
    var parts = dateKey.split('-').map(Number)
    var year = parts[0]
    var month = parts[1] - 1
    var day = parts[2]

    if (frequency === 'weekly') {
      return formatDate(new Date(year, month, day + 7))
    }

    var targetMonthTotal = month + 1
    var targetYear = year + Math.floor(targetMonthTotal / 12)
    var targetMonth = ((targetMonthTotal % 12) + 12) % 12
    var lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate()
    var targetDay = Math.min(anchorDay || day, lastDayOfTargetMonth)
    return formatDate(new Date(targetYear, targetMonth, targetDay))
  }

  function formatDate(date) {
    var y = date.getFullYear()
    var m = String(date.getMonth() + 1).padStart(2, '0')
    var d = String(date.getDate()).padStart(2, '0')
    return y + '-' + m + '-' + d
  }

  function todayKey() {
    return formatDate(new Date())
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

  function validate(payload) {
    if (payload.type !== 'income' && payload.type !== 'expense') throw new Error('Invalid type.')
    if (!payload.categoryId) throw new Error('Missing categoryId.')
    if (!(Number(payload.amount) > 0)) throw new Error('Amount must be greater than 0.')
    if (payload.frequency !== 'monthly' && payload.frequency !== 'weekly') {
      throw new Error('Invalid frequency.')
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.startDate)) throw new Error('Invalid start date.')
  }

  return { list: list, create: create, update: update, remove: remove, sync: sync }
})()
