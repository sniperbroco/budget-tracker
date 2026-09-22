import { useState } from 'react'
import { Field } from '../../components/Field'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import { getCurrentDateKey } from '../../utils/date'

export function RecurringForm({ rule, categories, accounts, onSubmit, onCancel }) {
  const [type, setType] = useState(rule?.type ?? 'expense')
  const [categoryId, setCategoryId] = useState(rule?.categoryId ?? '')
  const [accountId, setAccountId] = useState(rule?.accountId ?? '')
  const [amount, setAmount] = useState(rule?.amount ?? '')
  const [notes, setNotes] = useState(rule?.notes ?? '')
  const [tags, setTags] = useState(rule?.tags ?? '')
  const [frequency, setFrequency] = useState(rule?.frequency ?? 'monthly')
  const [startDate, setStartDate] = useState(rule?.startDate ?? getCurrentDateKey())
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const availableCategories = categories.filter(
    (category) => category.type === type && (!category.archived || category.id === categoryId),
  )

  function handleTypeChange(nextType) {
    setType(nextType)
    setCategoryId('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!categoryId) nextErrors.categoryId = 'Choose a category.'
    if (!(Number(amount) > 0)) nextErrors.amount = 'Enter an amount greater than 0.'
    if (!startDate) nextErrors.startDate = 'Choose a start date.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({
        type,
        categoryId,
        accountId,
        amount: Number(amount),
        notes: notes.trim(),
        tags,
        frequency,
        startDate,
      })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <Select id="recurring-type" label="Type" value={type} onChange={(e) => handleTypeChange(e.target.value)}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </Select>
      <Select
        id="recurring-category"
        label="Category"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        error={errors.categoryId}
      >
        <option value="" disabled>Choose a category…</option>
        {availableCategories.map((category) => (
          <option key={category.id} value={category.id}>{category.name}</option>
        ))}
      </Select>
      {accounts.length > 0 && (
        <Select
          id="recurring-account"
          label="Account (optional)"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        >
          <option value="">No account</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>{account.name}</option>
          ))}
        </Select>
      )}
      <Field
        id="recurring-amount"
        type="number"
        min="0"
        step="0.01"
        label="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={errors.amount}
        placeholder="0.00"
      />
      <Select id="recurring-frequency" label="Repeats" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
        <option value="monthly">Monthly</option>
        <option value="weekly">Weekly</option>
      </Select>
      <Field
        id="recurring-start"
        type="date"
        label="Start date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        error={errors.startDate}
      />
      <Field
        id="recurring-notes"
        label="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Optional note"
      />
      <Field
        id="recurring-tags"
        label="Tags (optional, comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="e.g. subscription, work"
      />
      {formError && <p className="form-error">{formError}</p>}
      <div className="form-actions">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : rule ? 'Save changes' : 'Add recurring rule'}
        </Button>
      </div>
    </form>
  )
}
