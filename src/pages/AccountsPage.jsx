import { useMemo, useState } from 'react'
import { useAccounts } from '../features/accounts/useAccounts'
import { AccountList } from '../features/accounts/AccountList'
import { AccountForm } from '../features/accounts/AccountForm'
import { Modal } from '../components/Modal'
import { Button } from '../components/Button'
import { Spinner } from '../components/Spinner'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import { ErrorBanner } from '../components/ErrorBanner'

export function AccountsPage() {
  const [showArchived, setShowArchived] = useState(false)
  const { accounts, balances, loading, error, addAccount, editAccount, setArchived } = useAccounts({
    includeArchived: showArchived,
  })
  const [modalState, setModalState] = useState(null) // null | 'create' | account

  const sorted = useMemo(() => [...accounts].sort((a, b) => a.name.localeCompare(b.name)), [accounts])

  async function handleSubmit(values) {
    if (modalState && modalState !== 'create') {
      await editAccount(modalState.id, values)
    } else {
      await addAccount(values)
    }
    setModalState(null)
  }

  return (
    <div className="page">
      <div className="page-toolbar">
        <label className="toggle">
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
          Show archived
        </label>
        <Button icon={<Icon name="plus" size={16} />} onClick={() => setModalState('create')}>
          Add account
        </Button>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <Spinner />
      ) : sorted.length === 0 ? (
        <EmptyState
          title="No accounts yet"
          description="Add a cash, bank, or card account to start tracking balances."
        />
      ) : (
        <AccountList
          accounts={sorted}
          balances={balances}
          onEdit={setModalState}
          onArchive={(account) => setArchived(account.id, !account.archived)}
        />
      )}

      {modalState && (
        <Modal title={modalState === 'create' ? 'Add account' : 'Edit account'} onClose={() => setModalState(null)}>
          <AccountForm
            account={modalState === 'create' ? null : modalState}
            onSubmit={handleSubmit}
            onCancel={() => setModalState(null)}
          />
        </Modal>
      )}
    </div>
  )
}
