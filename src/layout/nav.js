export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: 'home', end: true },
  { to: '/transactions', label: 'Transactions', icon: 'list' },
  { to: '/accounts', label: 'Accounts', icon: 'layers' },
  { to: '/budgets', label: 'Budgets', icon: 'wallet' },
  { to: '/paychecks', label: 'Paychecks', icon: 'download' },
  { to: '/categories', label: 'Categories', icon: 'tag' },
  { to: '/goals', label: 'Savings goals', icon: 'target' },
  { to: '/debts', label: 'Debts', icon: 'trendingDown' },
  { to: '/recurring', label: 'Recurring', icon: 'repeat' },
]

// Bottom tab bar (mobile) caps at 5 slots — Dashboard, Accounts, a raised
// center "add transaction" action, Debts, and a "More" tab for the rest.
export const MOBILE_NAV_ITEMS = [
  NAV_ITEMS[0], // Dashboard
  NAV_ITEMS[2], // Accounts
  { to: '/transactions', label: 'Transactions', icon: 'plus', raised: true },
  NAV_ITEMS[7], // Debts
  { to: '/more', label: 'More', icon: 'list' },
]

export const MORE_ROUTES = ['/more', '/budgets', '/paychecks', '/categories', '/goals', '/recurring']
