import { useState } from 'react'
import { Field } from '../../components/Field'
import { Button } from '../../components/Button'
import { getCurrentDateKey } from '../../utils/date'

export function PaycheckForm({ paycheck, onSubmit, onCancel }) {
  const [date, setDate] = useState(paycheck?.date ?? getCurrentDateKey())
  const [amount, setAmount] = useState(paycheck?.amount ?? '')
  const [label, setLabel] = useState(paycheck?.label ?? '')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!date) nextErrors.date = 'Pick a date.'
    if (!(Number(amount) > 0)) nextErrors.amount = 'Enter an amount greater than 0.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({ date, amount: Number(amount), label: label.trim() })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <Field
        id="paycheck-date"
        type="date"
        label="Date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        error={errors.date}
      />
      <Field
        id="paycheck-amount"
        type="number"
        min="0"
        step="0.01"
        label="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={errors.amount}
        placeholder="0.00"
      />
      <Field
        id="paycheck-label"
        label="Label (optional)"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="e.g. October 5th paycheck"
      />
      {formError && <p className="form-error">{formError}</p>}
      <div className="form-actions">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : paycheck ? 'Save changes' : 'Add paycheck'}
        </Button>
      </div>
    </form>
  )
}
