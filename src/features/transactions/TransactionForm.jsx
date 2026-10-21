import { useState } from 'react'
import { Field } from '../../components/Field'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import { validateTransaction, hasErrors } from '../../utils/validation'
import { getCurrentDateKey } from '../../utils/date'

export function TransactionForm({ transaction, categories, accounts, fixedType, onSubmit, onCancel }) {
  const [date, setDate] = useState(transaction?.date ?? getCurrentDateKey())
  const [type, setType] = useState(fixedType ?? transaction?.type ?? 'expense')
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? '')
  const [accountId, setAccountId] = useState(transaction?.accountId ?? '')
  const [toAccountId, setToAccountId] = useState(transaction?.toAccountId ?? '')
  const [amount, setAmount] = useState(transaction?.amount ?? '')
  const [notes, setNotes] = useState(transaction?.notes ?? '')
  const [tags, setTags] = useState(transaction?.tags ?? '')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  // Keep the currently-selected category visible even if it has since been
  // archived (relevant when editing an older transaction).
  const availableCategories = categories.filter(
    (category) => category.type === type && (!category.archived || category.id === categoryId),
  )

  const isTransfer = type === 'transfer'
  const selectedAccount = accounts.find((account) => account.id === accountId)
  const isCreditAccount =
    selectedAccount?.type === 'credit' || accounts.find((account) => account.id === toAccountId)?.type === 'credit'

  function handleTypeChange(nextType) {
    setType(nextType)
    setCategoryId('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateTransaction({ date, type, categoryId, accountId, toAccountId, amount })
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return

    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({
        date,
        type,
        categoryId: isTransfer ? '' : categoryId,
        accountId,
        toAccountId: isTransfer ? toAccountId : '',
        amount: Number(amount),
        notes: notes.trim(),
        tags,
      })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <Select
        id="txn-type"
        label="Type"
        value={type}
        onChange={(e) => handleTypeChange(e.target.value)}
        error={errors.type}
        disabled={Boolean(fixedType)}
      >
        <option value="expense">Expense</option>
        <option value="income">Income</option>
        <option value="transfer">Transfer</option>
      </Select>
      <Field
        id="txn-date"
        type="date"
        label="Date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        error={errors.date}
      />
      {!isTransfer && (
        <Select
          id="txn-category"
          label="Category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          error={errors.categoryId}
        >
          <option value="" disabled>Choose a category…</option>
          {availableCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}{category.archived ? ' (archived)' : ''}
            </option>
          ))}
        </Select>
      )}
      {isTransfer && (
        <>
          <Select
            id="txn-account"
            label="From account"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            error={errors.accountId}
          >
            <option value="" disabled>Choose an account…</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </Select>
          <Select
            id="txn-to-account"
            label="To account"
            value={toAccountId}
            onChange={(e) => setToAccountId(e.target.value)}
            error={errors.toAccountId}
          >
            <option value="" disabled>Choose an account…</option>
            {accounts
              .filter((account) => account.id !== accountId)
              .map((account) => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
          </Select>
        </>
      )}
      {!isTransfer && accounts.length > 0 && (
        <Select
          id="txn-account"
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
      {isCreditAccount && (
        <p className="field-hint">
          This is a credit card account — the linked debt&apos;s balance owed and available limit will update
          automatically when you save.
        </p>
      )}
      <Field
        id="txn-amount"
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
        id="txn-notes"
        label="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Optional note"
      />
      <Field
        id="txn-tags"
        label="Tags (optional, comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="e.g. work, reimbursable"
      />
      {formError && <p className="form-error">{formError}</p>}
      <div className="form-actions">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : transaction ? 'Save changes' : 'Add transaction'}
        </Button>
      </div>
    </form>
  )
}
