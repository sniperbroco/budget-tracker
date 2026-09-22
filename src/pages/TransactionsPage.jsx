import { useMemo, useState } from 'react'
import { useTransactions } from '../features/transactions/useTransactions'
import { useCategories } from '../features/categories/useCategories'
import { useAccounts } from '../features/accounts/useAccounts'
import { TransactionFilters } from '../features/transactions/TransactionFilters'
import { TransactionList } from '../features/transactions/TransactionList'
import { TransactionForm } from '../features/transactions/TransactionForm'
import { Modal } from '../components/Modal'
import { Button } from '../components/Button'
import { Spinner } from '../components/Spinner'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import { ErrorBanner } from '../components/ErrorBanner'
import { formatCurrency } from '../utils/currency'
import { formatDateLabel } from '../utils/date'
import { downloadCsv, toCsv } from '../utils/csv'

const EMPTY_FILTERS = { dateFrom: '', dateTo: '', type: '', categoryId: '', accountId: '', search: '' }

export function TransactionsPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [modalState, setModalState] = useState(null) // null | 'create' | transaction
  const [pendingDelete, setPendingDelete] = useState(null)

  const appliedFilters = useMemo(() => {
    const result = {}
    if (filters.dateFrom) result.dateFrom = filters.dateFrom
    if (filters.dateTo) result.dateTo = filters.dateTo
    if (filters.type) result.type = filters.type
    if (filters.categoryId) result.categoryId = filters.categoryId
    if (filters.accountId) result.accountId = filters.accountId
    if (filters.search) result.search = filters.search
    return result
  }, [filters])

  const { transactions, loading, error, addTransaction, editTransaction, removeTransaction } =
    useTransactions(appliedFilters)
  const { categories } = useCategories()
  const { accounts } = useAccounts()

  const categoriesById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])
  const accountsById = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts])

  async function handleSubmit(values) {
    if (modalState && modalState !== 'create') {
      await editTransaction(modalState.id, values)
    } else {
      await addTransaction(values)
    }
    setModalState(null)
  }

  async function handleConfirmDelete() {
    await removeTransaction(pendingDelete.id)
    setPendingDelete(null)
  }

  function handleExportCsv() {
    const csv = toCsv(transactions, [
      { label: 'Date', value: (t) => formatDateLabel(t.date) },
      { label: 'Type', value: (t) => t.type },
      { label: 'Category', value: (t) => categoriesById.get(t.categoryId)?.name ?? '' },
      { label: 'Account', value: (t) => accountsById.get(t.accountId)?.name ?? '' },
      { label: 'Amount', value: (t) => t.amount },
      { label: 'Notes', value: (t) => t.notes ?? '' },
      { label: 'Tags', value: (t) => t.tags ?? '' },
    ])
    downloadCsv(`transactions-${new Date().toISOString().slice(0, 10)}.csv`, csv)
  }

  return (
    <div className="page">
      <div className="page-toolbar">
        <TransactionFilters filters={filters} categories={categories} accounts={accounts} onChange={setFilters} />
        <div className="page-toolbar-actions">
          <Button variant="ghost" icon={<Icon name="download" size={16} />} onClick={handleExportCsv} disabled={!transactions.length}>
            Export CSV
          </Button>
          <Button icon={<Icon name="plus" size={16} />} onClick={() => setModalState('create')}>
            Add transaction
          </Button>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <Spinner />
      ) : transactions.length === 0 ? (
        <EmptyState title="No transactions yet" description="Add your first income or expense to get started." />
      ) : (
        <TransactionList
          transactions={transactions}
          categoriesById={categoriesById}
          accountsById={accountsById}
          onEdit={setModalState}
          onDelete={setPendingDelete}
        />
      )}

      {modalState && (
        <Modal
          title={modalState === 'create' ? 'Add transaction' : 'Edit transaction'}
          onClose={() => setModalState(null)}
        >
          <TransactionForm
            transaction={modalState === 'create' ? null : modalState}
            categories={categories}
            accounts={accounts}
            onSubmit={handleSubmit}
            onCancel={() => setModalState(null)}
          />
        </Modal>
      )}

      {pendingDelete && (
        <Modal title="Delete transaction" onClose={() => setPendingDelete(null)}>
          <p>
            Delete this {pendingDelete.type} of {formatCurrency(pendingDelete.amount)}? This can&apos;t be undone.
          </p>
          <div className="form-actions">
            <Button variant="ghost" onClick={() => setPendingDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
