import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { Header } from './Header'
import { useRecurringSync } from '../features/recurring/useRecurringSync'

export function AppShell() {
  useRecurringSync()

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell-main">
        <Header />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
