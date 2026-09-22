import { useState } from 'react'
import { Field } from '../../components/Field'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import { ColorSwatchPicker } from '../../components/ColorSwatchPicker'
import { CATEGORY_COLORS } from '../../components/categoryColors'
import { validateCategory, hasErrors } from '../../utils/validation'

export function CategoryForm({ category, onSubmit, onCancel }) {
  const [name, setName] = useState(category?.name ?? '')
  const [type, setType] = useState(category?.type ?? 'expense')
  const [color, setColor] = useState(category?.color ?? CATEGORY_COLORS[0])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateCategory({ name, type })
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return

    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({ name: name.trim(), type, color })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <Field
        id="category-name"
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="e.g. Groceries"
      />
      <Select
        id="category-type"
        label="Type"
        value={type}
        onChange={(e) => setType(e.target.value)}
        error={errors.type}
      >
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </Select>
      <div className="field">
        <span className="field-label">Color</span>
        <ColorSwatchPicker value={color} onChange={setColor} />
      </div>
      {formError && <p className="form-error">{formError}</p>}
      <div className="form-actions">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : category ? 'Save changes' : 'Add category'}
        </Button>
      </div>
    </form>
  )
}
