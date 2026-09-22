import { useState } from 'react'
import { Field } from '../../components/Field'
import { Button } from '../../components/Button'
import { ColorSwatchPicker } from '../../components/ColorSwatchPicker'
import { CATEGORY_COLORS } from '../../components/categoryColors'

export function GoalForm({ goal, onSubmit, onCancel }) {
  const [name, setName] = useState(goal?.name ?? '')
  const [targetAmount, setTargetAmount] = useState(goal?.targetAmount ?? '')
  const [targetDate, setTargetDate] = useState(goal?.targetDate ?? '')
  const [color, setColor] = useState(goal?.color ?? CATEGORY_COLORS[6])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!name.trim()) nextErrors.name = 'Enter a goal name.'
    if (!(Number(targetAmount) > 0)) nextErrors.targetAmount = 'Enter a target greater than 0.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({ name: name.trim(), targetAmount: Number(targetAmount), targetDate, color })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <Field
        id="goal-name"
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="e.g. Emergency fund"
      />
      <Field
        id="goal-target"
        type="number"
        min="0"
        step="0.01"
        label="Target amount"
        value={targetAmount}
        onChange={(e) => setTargetAmount(e.target.value)}
        error={errors.targetAmount}
        placeholder="0.00"
      />
      <Field
        id="goal-date"
        type="date"
        label="Target date (optional)"
        value={targetDate}
        onChange={(e) => setTargetDate(e.target.value)}
      />
      <div className="field">
        <span className="field-label">Color</span>
        <ColorSwatchPicker value={color} onChange={setColor} />
      </div>
      {formError && <p className="form-error">{formError}</p>}
      <div className="form-actions">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : goal ? 'Save changes' : 'Add goal'}
        </Button>
      </div>
    </form>
  )
}
