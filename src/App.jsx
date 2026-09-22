import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { RequireAuth } from './auth/RequireAuth'
import { AppShell } from './layout/AppShell'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { BudgetsPage } from './pages/BudgetsPage'
import { AccountsPage } from './pages/AccountsPage'
import { GoalsPage } from './pages/GoalsPage'
import { DebtsPage } from './pages/DebtsPage'
import { RecurringPage } from './pages/RecurringPage'
import { MorePage } from './pages/MorePage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="budgets" element={<BudgetsPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="debts" element={<DebtsPage />} />
          <Route path="recurring" element={<RecurringPage />} />
          <Route path="more" element={<MorePage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
