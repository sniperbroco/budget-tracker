import { useMemo, useState } from 'react'
import { useTransactions } from '../features/transactions/useTransactions'
import { useCategories } from '../features/categories/useCategories'
import { useBudgets } from '../features/budgets/useBudgets'
import { useAccounts } from '../features/accounts/useAccounts'
import { SummaryCards } from '../features/dashboard/SummaryCards'
import { CategoryBreakdownChart } from '../features/dashboard/CategoryBreakdownChart'
import { BudgetProgressOverview } from '../features/dashboard/BudgetProgressOverview'
import { TrendChart } from '../features/dashboard/TrendChart'
import { AccountBalancesOverview } from '../features/dashboard/AccountBalancesOverview'
import { Spinner } from '../components/Spinner'
import { Icon } from '../components/Icon'
import { ErrorBanner } from '../components/ErrorBanner'
import {
  getCurrentMonthKey,
  shiftMonthKey,
  formatMonthLabel,
  formatMonthShortLabel,
  getMonthDateRange,
  getTrailingMonthKeys,
  getTrailingRange,
  dateKeyToMonthKey,
} from '../utils/date'

const TREND_MONTHS = 6

export function DashboardPage() {
  const [month, setMonth] = useState(getCurrentMonthKey())

  const filters = useMemo(() => getMonthDateRange(month), [month])
  const { transactions, loading: loadingTransactions, error: transactionsError } = useTransactions(filters)
  const { categories, loading: loadingCategories, error: categoriesError } = useCategories()
  const { budgets, loading: loadingBudgets, error: budgetsError } = useBudgets(month)
  const { accounts, balances, loading: loadingAccounts, error: accountsError } = useAccounts()

  const trendRange = useMemo(() => getTrailingRange(TREND_MONTHS), [])
  const trendMonthKeys = useMemo(() => getTrailingMonthKeys(TREND_MONTHS), [])
  const { transactions: trendTransactions, loading: loadingTrend, error: trendError } = useTransactions(trendRange)

  const loadError = transactionsError || categoriesError || budgetsError || accountsError || trendError

  const categoriesById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const totals = useMemo(
    () =>
      transactions.reduce(
        (acc, transaction) => {
          if (transaction.type === 'income') acc.income += transaction.amount
          else acc.expense += transaction.amount
          return acc
        },
        { income: 0, expense: 0 },
      ),
    [transactions],
  )

  const categoryBreakdown = useMemo(() => {
    const totalsByCategory = new Map()
    transactions
      .filter((transaction) => transaction.type === 'expense')
      .forEach((transaction) => {
        totalsByCategory.set(
          transaction.categoryId,
          (totalsByCategory.get(transaction.categoryId) ?? 0) + transaction.amount,
        )
      })
    return Array.from(totalsByCategory.entries())
      .map(([categoryId, amount]) => {
        const category = categoriesById.get(categoryId)
        return {
          categoryId,
          amount,
          name: category?.name ?? 'Uncategorized',
          color: category?.color ?? '#9ca3af',
        }
      })
      .sort((a, b) => b.amount - a.amount)
  }, [transactions, categoriesById])

  const budgetOverview = useMemo(() => {
    return budgets
      .map((budget) => {
        const category = categoriesById.get(budget.categoryId)
        const spent = transactions
          .filter((t) => t.type === 'expense' && t.categoryId === budget.categoryId)
          .reduce((sum, t) => sum + t.amount, 0)
        return {
          categoryId: budget.categoryId,
          name: category?.name ?? 'Uncategorized',
          color: category?.color ?? '#9ca3af',
          limitAmount: budget.limitAmount,
          spent,
        }
      })
      .sort((a, b) => b.spent / b.limitAmount - a.spent / a.limitAmount)
  }, [budgets, categoriesById, transactions])

  const trendData = useMemo(() => {
    const totalsByMonth = new Map(trendMonthKeys.map((key) => [key, { income: 0, expense: 0 }]))
    trendTransactions.forEach((transaction) => {
      const key = dateKeyToMonthKey(transaction.date)
      const bucket = totalsByMonth.get(key)
      if (!bucket) return
      if (transaction.type === 'income') bucket.income += transaction.amount
      else bucket.expense += transaction.amount
    })
    return trendMonthKeys.map((key) => {
      const bucket = totalsByMonth.get(key)
      return {
        monthKey: key,
        monthLabel: formatMonthShortLabel(key),
        income: bucket.income,
        expense: bucket.expense,
        net: bucket.income - bucket.expense,
      }
    })
  }, [trendTransactions, trendMonthKeys])

  const loading = loadingTransactions || loadingCategories || loadingBudgets

  return (
    <div className="page dashboard-page">
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
      ) : (
        <>
          <SummaryCards income={totals.income} expense={totals.expense} net={totals.income - totals.expense} />

          <section className="card">
            <h2>Last {TREND_MONTHS} months</h2>
            {loadingTrend ? <Spinner /> : <TrendChart data={trendData} />}
          </section>

          <div className="dashboard-grid">
            <section className="card">
              <h2>Spending by category</h2>
              <CategoryBreakdownChart data={categoryBreakdown} />
            </section>
            <section className="card">
              <h2>Budget progress</h2>
              <BudgetProgressOverview items={budgetOverview} />
            </section>
            <section className="card">
              <h2>Account balances</h2>
              {loadingAccounts ? <Spinner /> : <AccountBalancesOverview accounts={accounts} balances={balances} />}
            </section>
          </div>
        </>
      )}
    </div>
  )
}
