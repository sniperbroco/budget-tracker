import { useState } from 'react'
import { Field } from '../../components/Field'
import { Button } from '../../components/Button'

export function EnvelopeForm({ envelope, onSubmit, onCancel }) {
  const [name, setName] = useState(envelope?.name ?? '')
  const [amount, setAmount] = useState(envelope?.amount ?? '')
  const [notes, setNotes] = useState(envelope?.notes ?? '')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!name.trim()) nextErrors.name = 'Enter a name.'
    if (!(Number(amount) > 0)) nextErrors.amount = 'Enter an amount greater than 0.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({ name: name.trim(), amount: Number(amount), notes: notes.trim() })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <Field
        id="envelope-name"
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="e.g. Transpo, Sister's wedding"
      />
      <Field
        id="envelope-amount"
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
        id="envelope-notes"
        label="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Optional details"
      />
      {formError && <p className="form-error">{formError}</p>}
      <div className="form-actions">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : envelope ? 'Save changes' : 'Add envelope'}
        </Button>
      </div>
    </form>
  )
}
