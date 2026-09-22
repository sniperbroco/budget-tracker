export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: 'home', end: true },
  { to: '/transactions', label: 'Transactions', icon: 'list' },
  { to: '/accounts', label: 'Accounts', icon: 'layers' },
  { to: '/budgets', label: 'Budgets', icon: 'wallet' },
  { to: '/categories', label: 'Categories', icon: 'tag' },
  { to: '/goals', label: 'Savings goals', icon: 'target' },
  { to: '/debts', label: 'Debts', icon: 'trendingDown' },
  { to: '/recurring', label: 'Recurring', icon: 'repeat' },
]

// Bottom tab bar (mobile) caps at 5 slots — the 4 most frequent screens plus
// a "More" tab for the lower-frequency management pages.
export const MOBILE_NAV_ITEMS = [
  NAV_ITEMS[0],
  NAV_ITEMS[1],
  NAV_ITEMS[2],
  NAV_ITEMS[3],
  { to: '/more', label: 'More', icon: 'moreHorizontal' },
]

export const MORE_ROUTES = ['/more', '/categories', '/goals', '/debts', '/recurring']
