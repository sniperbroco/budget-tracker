import { useMemo, useState } from 'react'
import { useDebts } from '../features/debts/useDebts'
import { useAccounts } from '../features/accounts/useAccounts'
import { useCategories } from '../features/categories/useCategories'
import { useTransactions } from '../features/transactions/useTransactions'
import { DebtList } from '../features/debts/DebtList'
import { DebtForm } from '../features/debts/DebtForm'
import { TransactionForm } from '../features/transactions/TransactionForm'
import { Modal } from '../components/Modal'
import { Button } from '../components/Button'
import { Spinner } from '../components/Spinner'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import { ErrorBanner } from '../components/ErrorBanner'

export function DebtsPage() {
  const [showArchived, setShowArchived] = useState(false)
  const { debts, loading, error, addDebt, editDebt, setArchived, recordPayment } = useDebts({
    includeArchived: showArchived,
  })
  const { accounts } = useAccounts()
  const { categories } = useCategories()
  const { addTransaction } = useTransactions()
  const [modalState, setModalState] = useState(null) // null | 'create' | debt
  const [paymentTarget, setPaymentTarget] = useState(null)

  const sorted = useMemo(() => [...debts].sort((a, b) => a.name.localeCompare(b.name)), [debts])

  async function handleSubmit(values) {
    if (modalState && modalState !== 'create') {
      await editDebt(modalState.id, values)
    } else {
      await addDebt(values)
    }
    setModalState(null)
  }

  // Paying a debt is recorded as a real expense transaction (so it shows
  // up in spending history and reduces the account it came from), and
  // that same amount reduces the debt's balance.
  async function handlePaymentTransaction(values) {
    await addTransaction(values)
    await recordPayment(paymentTarget.id, -values.amount)
    setPaymentTarget(null)
  }

  return (
    <div className="page">
      <div className="page-toolbar">
        <label className="toggle">
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
          Show archived
        </label>
        <Button icon={<Icon name="plus" size={16} />} onClick={() => setModalState('create')}>
          Add debt
        </Button>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <Spinner />
      ) : sorted.length === 0 ? (
        <EmptyState
          title="No debts tracked yet"
          description="Add a loan or credit card to track what you owe and your payoff progress."
        />
      ) : (
        <DebtList
          debts={sorted}
          onEdit={setModalState}
          onArchive={(debt) => setArchived(debt.id, !debt.archived)}
          onLogPayment={setPaymentTarget}
        />
      )}

      {modalState && (
        <Modal title={modalState === 'create' ? 'Add debt' : 'Edit debt'} onClose={() => setModalState(null)}>
          <DebtForm
            debt={modalState === 'create' ? null : modalState}
            accounts={accounts}
            onSubmit={handleSubmit}
            onCancel={() => setModalState(null)}
          />
        </Modal>
      )}

      {paymentTarget && (
        <Modal title={`Log a payment — ${paymentTarget.name}`} onClose={() => setPaymentTarget(null)}>
          <TransactionForm
            categories={categories}
            accounts={accounts}
            fixedType="expense"
            onSubmit={handlePaymentTransaction}
            onCancel={() => setPaymentTarget(null)}
          />
        </Modal>
      )}
    </div>
  )
}
