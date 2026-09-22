import { useState } from 'react'
import { Field } from '../../components/Field'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import { formatCurrency } from '../../utils/currency'

export function DebtPaymentForm({ debt, onSubmit, onCancel }) {
  const [direction, setDirection] = useState('payment')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const numericAmount = Number(amount)
    if (!(numericAmount > 0)) {
      setError('Enter an amount greater than 0.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(direction === 'payment' ? -numericAmount : numericAmount)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <p className="goal-contribute-summary">
        Current balance: {formatCurrency(debt.balance)} of {formatCurrency(debt.originalAmount)}
        {debt.kind === 'loan' ? ' principal' : ' limit'}.
      </p>
      {debt.kind === 'credit_card' && (
        <Select id="debt-direction" label="Action" value={direction} onChange={(e) => setDirection(e.target.value)}>
          <option value="payment">Log a payment</option>
          <option value="charge">Log a charge</option>
        </Select>
      )}
      <Field
        id="debt-payment-amount"
        type="number"
        min="0"
        step="0.01"
        label="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={error}
        placeholder="0.00"
      />
      <div className="form-actions">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  )
}
