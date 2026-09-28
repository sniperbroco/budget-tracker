// Generic row <-> object helpers shared by Transactions/Categories/Budgets.
// Every sheet is read/written by header name (not column index), so
// reordering columns in the spreadsheet doesn't break anything.
var SheetUtil = (function () {
  function getSpreadsheet() {
    var sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID')
    if (!sheetId) throw new Error('Server is missing the SHEET_ID script property.')
    return SpreadsheetApp.openById(sheetId)
  }

  function getSheet(name) {
    var sheet = getSpreadsheet().getSheetByName(name)
    if (!sheet) throw new Error('Sheet tab not found: ' + name)
    return sheet
  }

  function getHeaders(sheet) {
    var lastColumn = sheet.getLastColumn()
    if (lastColumn === 0) return []
    return sheet.getRange(1, 1, 1, lastColumn).getValues()[0]
  }

  // Every date/month value we write is a plain string (e.g. "2026-09-28" or
  // "2026-09"). Sheets' "Automatic" cell format silently reinterprets those
  // as real Date cells the moment they're written, which then read back as
  // full ISO timestamps instead of the original string. These two helpers
  // guard against that on both ends: force the target cell to Plain Text
  // before writing a date-like string, and un-mangle any cell that already
  // got auto-converted to a Date before it leaves the server.
  function isDateLikeString(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}(-\d{2})?$/.test(value)
  }

  function normalizeCellValue(value) {
    if (!(value instanceof Date)) return value
    var tz = Session.getScriptTimeZone()
    var hasTime =
      value.getHours() !== 0 || value.getMinutes() !== 0 || value.getSeconds() !== 0 || value.getMilliseconds() !== 0
    return hasTime
      ? Utilities.formatDate(value, tz, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
      : Utilities.formatDate(value, tz, 'yyyy-MM-dd')
  }

  function protectDateColumns(range, headers, values) {
    headers.forEach(function (header, index) {
      if (isDateLikeString(values[index])) {
        range.getCell(1, index + 1).setNumberFormat('@')
      }
    })
  }

  function readAllRows(sheetName) {
    var sheet = getSheet(sheetName)
    var headers = getHeaders(sheet)
    var lastRow = sheet.getLastRow()
    if (lastRow < 2) return []

    var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues()
    return values.map(function (row) {
      var obj = {}
      headers.forEach(function (header, index) {
        obj[header] = normalizeCellValue(row[index])
      })
      return obj
    })
  }

  function appendRow(sheetName, rowObj) {
    var sheet = getSheet(sheetName)
    var headers = getHeaders(sheet)
    var row = headers.map(function (header) {
      return Object.prototype.hasOwnProperty.call(rowObj, header) ? rowObj[header] : ''
    })
    var targetRow = sheet.getLastRow() + 1
    var range = sheet.getRange(targetRow, 1, 1, row.length)
    protectDateColumns(range, headers, row)
    range.setValues([row])
    return rowObj
  }

  function findRowIndexById(sheet, headers, id) {
    var idColumn = headers.indexOf('id')
    if (idColumn === -1) throw new Error("Sheet is missing an 'id' column.")
    var lastRow = sheet.getLastRow()
    if (lastRow < 2) return -1

    var ids = sheet.getRange(2, idColumn + 1, lastRow - 1, 1).getValues()
    for (var i = 0; i < ids.length; i++) {
      if (ids[i][0] === id) return i + 2 // 1-based row index, +1 to skip the header row
    }
    return -1
  }

  function updateRowById(sheetName, id, patchObj) {
    var sheet = getSheet(sheetName)
    var headers = getHeaders(sheet)
    var rowIndex = findRowIndexById(sheet, headers, id)
    if (rowIndex === -1) throw new Error('Row not found: ' + id)

    var currentValues = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0]
    var nextValues = headers.map(function (header, index) {
      return Object.prototype.hasOwnProperty.call(patchObj, header) ? patchObj[header] : normalizeCellValue(currentValues[index])
    })
    var range = sheet.getRange(rowIndex, 1, 1, headers.length)
    protectDateColumns(range, headers, nextValues)
    range.setValues([nextValues])

    var result = {}
    headers.forEach(function (header, index) {
      result[header] = nextValues[index]
    })
    return result
  }

  function deleteRowById(sheetName, id) {
    var sheet = getSheet(sheetName)
    var headers = getHeaders(sheet)
    var rowIndex = findRowIndexById(sheet, headers, id)
    if (rowIndex === -1) throw new Error('Row not found: ' + id)
    sheet.deleteRow(rowIndex)
  }

  function findRowByColumns(sheetName, matchers) {
    var rows = readAllRows(sheetName)
    return rows.find(function (row) {
      return Object.keys(matchers).every(function (key) {
        return row[key] === matchers[key]
      })
    })
  }

  return {
    getSpreadsheet: getSpreadsheet,
    readAllRows: readAllRows,
    appendRow: appendRow,
    updateRowById: updateRowById,
    deleteRowById: deleteRowById,
    findRowByColumns: findRowByColumns,
  }
})()
