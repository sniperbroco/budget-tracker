import { useMemo, useState } from 'react'
import { useCategories } from '../features/categories/useCategories'
import { useBudgets } from '../features/budgets/useBudgets'
import { useTransactions } from '../features/transactions/useTransactions'
import { BudgetRow } from '../features/budgets/BudgetRow'
import { BudgetForm } from '../features/budgets/BudgetForm'
import { Modal } from '../components/Modal'
import { Spinner } from '../components/Spinner'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import { ErrorBanner } from '../components/ErrorBanner'
import { getCurrentMonthKey, shiftMonthKey, formatMonthLabel, getMonthDateRange } from '../utils/date'

export function BudgetsPage() {
  const [month, setMonth] = useState(getCurrentMonthKey())
  const [modalState, setModalState] = useState(null) // null | { category, budget }

  const { categories, loading: loadingCategories, error: categoriesError } = useCategories()
  const { budgets, loading: loadingBudgets, error: budgetsError, saveBudget, removeBudget } = useBudgets(month)

  const filters = useMemo(() => getMonthDateRange(month), [month])
  const { transactions, loading: loadingTransactions, error: transactionsError } = useTransactions(filters)

  const loadError = categoriesError || budgetsError || transactionsError

  const expenseCategories = useMemo(
    () =>
      categories
        .filter((category) => category.type === 'expense' && !category.archived)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  )

  const budgetsByCategory = useMemo(() => new Map(budgets.map((b) => [b.categoryId, b])), [budgets])

  const spentByCategory = useMemo(() => {
    const map = new Map()
    transactions
      .filter((transaction) => transaction.type === 'expense')
      .forEach((transaction) => {
        map.set(transaction.categoryId, (map.get(transaction.categoryId) ?? 0) + transaction.amount)
      })
    return map
  }, [transactions])

  async function handleSubmit(values) {
    await saveBudget(values)
    setModalState(null)
  }

  const loading = loadingCategories || loadingBudgets || loadingTransactions

  return (
    <div className="page">
      <div className="period-switcher">
        <button
          type="button"
          className="icon-btn"
          onClick={() => setMonth((m) => shiftMonthKey(m, -1))}
          aria-label="Previous month"
        >
          <Icon name="chevronLeft" />
        </button>
        <span className="period-label">{formatMonthLabel(month)}</span>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setMonth((m) => shiftMonthKey(m, 1))}
          aria-label="Next month"
        >
          <Icon name="chevronRight" />
        </button>
      </div>

      {loadError && <ErrorBanner message={loadError} />}

      {loading ? (
        <Spinner />
      ) : expenseCategories.length === 0 ? (
        <EmptyState
          title="No expense categories yet"
          description="Add an expense category first, then set a budget for it."
        />
      ) : (
        <ul className="budget-list">
          {expenseCategories.map((category) => (
            <BudgetRow
              key={category.id}
              category={category}
              budget={budgetsByCategory.get(category.id)}
              spent={spentByCategory.get(category.id) ?? 0}
              onEdit={() => setModalState({ category, budget: budgetsByCategory.get(category.id) })}
              onRemove={() => removeBudget(budgetsByCategory.get(category.id).id)}
            />
          ))}
        </ul>
      )}

      {modalState && (
        <Modal title={`Set budget — ${modalState.category.name}`} onClose={() => setModalState(null)}>
          <BudgetForm
            month={month}
            category={modalState.category}
            budget={modalState.budget}
            onSubmit={handleSubmit}
            onCancel={() => setModalState(null)}
          />
        </Modal>
      )}
    </div>
  )
}
