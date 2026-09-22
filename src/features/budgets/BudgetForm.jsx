import { useState } from 'react'
import { Field } from '../../components/Field'
import { Button } from '../../components/Button'
import { validateBudget, hasErrors } from '../../utils/validation'

export function BudgetForm({ month, category, budget, onSubmit, onCancel }) {
  const [limitAmount, setLimitAmount] = useState(budget?.limitAmount ?? '')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateBudget({ categoryId: category.id, month, limitAmount })
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return

    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({ id: budget?.id, categoryId: category.id, month, limitAmount: Number(limitAmount) })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <span className="field-label">Category</span>
        <div className="budget-form-category">
          <span className="category-swatch" style={{ backgroundColor: category.color }} />
          {category.name}
        </div>
      </div>
      <Field
        id="budget-limit"
        type="number"
        min="0"
        step="0.01"
        label="Monthly limit"
        value={limitAmount}
        onChange={(e) => setLimitAmount(e.target.value)}
        error={errors.limitAmount}
        placeholder="0.00"
      />
      {formError && <p className="form-error">{formError}</p>}
      <div className="form-actions">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save budget'}</Button>
      </div>
    </form>
  )
}
