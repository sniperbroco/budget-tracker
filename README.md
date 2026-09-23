# Budget Tracker

A personal budgeting and expense tracker. React + Vite frontend, data stored
in a Google Sheet via a Google Apps Script Web App, secured with Google
sign-in so only your own Google account can read or write it.

## Features

- Full CRUD on transactions (income/expense), categories, accounts, and savings goals
- Monthly per-category budget limits with progress indicators
- Paycheck envelopes: log each paycheck and split it into freeform buckets (not tied to categories)
- Multiple accounts/wallets with live balances
- Savings goals with contribute/withdraw and progress tracking
- Recurring transactions (rent, subscriptions, salary) that auto-generate each period
- Tags and search on transactions, plus CSV export
- Dashboard with income/expense/net totals, a 6-month trend chart, category breakdown, and account balances
- Responsive layout: sidebar on desktop, bottom tab bar (with a "More" tab) on mobile
- Amounts formatted in Philippine Pesos (₱) by default — change via `VITE_CURRENCY`/`VITE_LOCALE`

## Architecture

```
React SPA  --(Google ID token in a text/plain POST body)-->  Apps Script Web App  -->  Google Sheet
```

The Apps Script Web App verifies the ID token server-side against your own
email before touching the spreadsheet — see `apps-script/Auth.gs`.

## One-time setup

### 1. Create the Google Sheet

Create a new Google Sheet with tabs for each entity below, each with a header
row exactly matching the columns listed (order doesn't matter, names must
match).

**Transactions**: `id, date, type, categoryId, accountId, amount, notes, tags, createdAt, updatedAt`

**Categories**: `id, name, type, color, archived, createdAt`

**Budgets**: `id, categoryId, month, limitAmount, createdAt, updatedAt`

**Accounts**: `id, name, type, color, startingBalance, archived, createdAt`

**SavingsGoals**: `id, name, targetAmount, targetDate, currentAmount, color, archived, createdAt, updatedAt`

**RecurringTransactions**: `id, type, categoryId, accountId, amount, notes, tags, frequency, startDate, nextRunDate, active, createdAt, updatedAt`

**Debts**: `id, name, kind, originalAmount, balance, interestRate, minimumPayment, dueDay, availableLimit, accountId, color, archived, createdAt, updatedAt`

**Paychecks**: `id, date, amount, label, createdAt, updatedAt`

**PaycheckEnvelopes**: `id, paycheckId, name, amount, notes, createdAt, updatedAt`

`accountId` and `tags` are optional per row — existing transactions without
them are still valid. Copy the Sheet's ID from its URL
(`https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit`).

### 2. Create a Google OAuth Client ID

In [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

1. Create an OAuth 2.0 Client ID of type **Web application**.
2. Under **Authorized JavaScript origins**, add `http://localhost:5173` and
   your production domain once you have one.
3. Copy the Client ID.

### 3. Configure and deploy the Apps Script backend

Install [`clasp`](https://github.com/google/clasp) globally (it's a dev tool, not a project dependency):

```bash
npm install -g @google/clasp
clasp login
```

From the `apps-script/` folder, either clone an existing Apps Script
project or create a new one bound to this codebase:

```bash
cd apps-script
clasp create --type webapp --title "Budget Tracker Backend"
# or: clasp clone <scriptId>
clasp push
```

In the Apps Script editor (`clasp open`), set two Script Properties under
**Project Settings → Script Properties**:

- `SHEET_ID` — the Sheet ID from step 1
- `OAUTH_CLIENT_ID` — the OAuth Client ID from step 2

Then edit `apps-script/Auth.gs` locally and replace `OWNER_EMAIL` with the
Google account that owns the Sheet, and `clasp push` again.

Deploy: **Deploy → New deployment → Web app**, with **Execute as: Me** and
**Who has access: Anyone**. Copy the resulting `/exec` URL.

Every time you change the `apps-script/*.gs` files afterwards: `clasp push`,
then **Manage deployments → edit the existing deployment → new version** (this
keeps the `/exec` URL stable instead of minting a new one).

### 4. Configure the frontend

```bash
cp .env.example .env
```

Fill in `.env`:

```
VITE_GOOGLE_CLIENT_ID=<OAuth Client ID from step 2>
VITE_APPS_SCRIPT_URL=<the /exec URL from step 3>
```

## Local development

```bash
npm install
npm run dev
```

Sign in with the Google account you set as `OWNER_EMAIL`. Any other account
will be rejected by the backend.

## Build & deploy

```bash
npm run build
npm run preview   # sanity-check the production build locally
```

Deploy the `dist/` output to Vercel or Netlify, setting the same two
`VITE_*` environment variables in the project's dashboard. Then add the
production domain to the OAuth Client's **Authorized JavaScript origins**.

Note: dynamic preview-deploy URLs (Vercel/Netlify PR previews) aren't
pre-registered as OAuth origins, so sign-in only works on `localhost` and
the production domain.
