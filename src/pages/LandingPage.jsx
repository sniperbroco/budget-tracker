import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { PublicLayout } from './PublicLayout'

const FEATURES = [
  ['Transactions', 'Log income and expenses with categories, tags, notes and CSV export.'],
  ['Budgets', 'Set monthly limits per category and watch progress as you spend.'],
  ['Paychecks', 'Split each paycheck into freeform envelopes so every peso has a job.'],
  ['Accounts & debts', 'Track balances across wallets and pay down debts over time.'],
  ['Savings goals', 'Contribute toward goals and see how close you are.'],
  ['Recurring items', 'Rent, subscriptions and salary are generated automatically each period.'],
]

export function LandingPage() {
  const { idToken } = useAuth()

  return (
    <PublicLayout>
      <section className="public-hero">
        <h1>Personal Budget Tracker</h1>
        <p className="public-lead">
          Personal Budget Tracker is a private web app for tracking your own income, expenses,
          budgets, savings goals and debts. Your data lives in a Google Sheet that you own, so
          you stay in full control of it.
        </p>
        <Link to={idToken ? '/dashboard' : '/login'} className="public-cta">
          {idToken ? 'Open dashboard' : 'Sign in with Google'}
        </Link>
      </section>

      <section className="public-section">
        <h2>What it does</h2>
        <div className="public-features">
          {FEATURES.map(([title, text]) => (
            <div key={title} className="public-feature">
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="public-section">
        <h2>How your data is handled</h2>
        <p>
          You sign in with Google so the app can confirm who you are. Only the Google account that
          owns the budget spreadsheet is allowed to read or write it. The app does not sell,
          share or advertise with your data. Read the full <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </section>
    </PublicLayout>
  )
}
