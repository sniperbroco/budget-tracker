import { useState } from 'react'
import { Field } from '../../components/Field'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import { ColorSwatchPicker } from '../../components/ColorSwatchPicker'
import { CATEGORY_COLORS } from '../../components/categoryColors'

const ACCOUNT_TYPES = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank' },
  { value: 'credit', label: 'Credit card' },
  { value: 'ewallet', label: 'E-wallet' },
]

export function AccountForm({ account, onSubmit, onCancel }) {
  const [name, setName] = useState(account?.name ?? '')
  const [type, setType] = useState(account?.type ?? 'cash')
  const [startingBalance, setStartingBalance] = useState(account?.startingBalance ?? '')
  const [color, setColor] = useState(account?.color ?? CATEGORY_COLORS[8])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!name.trim()) nextErrors.name = 'Enter an account name.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({
        name: name.trim(),
        type,
        color,
        startingBalance: startingBalance === '' ? 0 : Number(startingBalance),
      })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <Field
        id="account-name"
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="e.g. BDO Savings"
      />
      <Select id="account-type" label="Type" value={type} onChange={(e) => setType(e.target.value)}>
        {ACCOUNT_TYPES.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </Select>
      <Field
        id="account-balance"
        type="number"
        step="0.01"
        label={account ? 'Starting balance' : 'Starting balance (optional)'}
        value={startingBalance}
        onChange={(e) => setStartingBalance(e.target.value)}
        placeholder="0.00"
      />
      <div className="field">
        <span className="field-label">Color</span>
        <ColorSwatchPicker value={color} onChange={setColor} />
      </div>
      {formError && <p className="form-error">{formError}</p>}
      <div className="form-actions">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : account ? 'Save changes' : 'Add account'}
        </Button>
      </div>
    </form>
  )
}
