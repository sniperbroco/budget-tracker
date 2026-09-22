import { useMemo, useState } from 'react'
import { useRecurring } from '../features/recurring/useRecurring'
import { useCategories } from '../features/categories/useCategories'
import { useAccounts } from '../features/accounts/useAccounts'
import { RecurringList } from '../features/recurring/RecurringList'
import { RecurringForm } from '../features/recurring/RecurringForm'
import { Modal } from '../components/Modal'
import { Button } from '../components/Button'
import { Spinner } from '../components/Spinner'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import { ErrorBanner } from '../components/ErrorBanner'

export function RecurringPage() {
  const { rules, loading, error, addRule, editRule, removeRule, toggleActive } = useRecurring()
  const { categories } = useCategories()
  const { accounts } = useAccounts()
  const [modalState, setModalState] = useState(null) // null | 'create' | rule
  const [pendingDelete, setPendingDelete] = useState(null)

  const categoriesById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  async function handleSubmit(values) {
    if (modalState && modalState !== 'create') {
      await editRule(modalState.id, values)
    } else {
      await addRule(values)
    }
    setModalState(null)
  }

  async function handleConfirmDelete() {
    await removeRule(pendingDelete.id)
    setPendingDelete(null)
  }

  return (
    <div className="page">
      <div className="page-toolbar">
        <p className="page-hint">
          Recurring rules add a transaction automatically each time they&apos;re due, whenever you open the app.
        </p>
        <Button icon={<Icon name="plus" size={16} />} onClick={() => setModalState('create')}>
          Add recurring
        </Button>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <Spinner />
      ) : rules.length === 0 ? (
        <EmptyState
          title="No recurring transactions yet"
          description="Set up rent, subscriptions, or your salary to auto-generate each period."
        />
      ) : (
        <RecurringList
          rules={rules}
          categoriesById={categoriesById}
          onEdit={setModalState}
          onDelete={setPendingDelete}
          onToggle={(rule, active) => toggleActive(rule.id, active)}
        />
      )}

      {modalState && (
        <Modal
          title={modalState === 'create' ? 'Add recurring rule' : 'Edit recurring rule'}
          onClose={() => setModalState(null)}
        >
          <RecurringForm
            rule={modalState === 'create' ? null : modalState}
            categories={categories}
            accounts={accounts}
            onSubmit={handleSubmit}
            onCancel={() => setModalState(null)}
          />
        </Modal>
      )}

      {pendingDelete && (
        <Modal title="Delete recurring rule" onClose={() => setPendingDelete(null)}>
          <p>Delete this recurring rule? Past generated transactions stay, but future ones will stop.</p>
          <div className="form-actions">
            <Button variant="ghost" onClick={() => setPendingDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
