import { PublicLayout } from './PublicLayout'

const CONTACT = 'crdelapena04@gmail.com'

export function PrivacyPage() {
  return (
    <PublicLayout>
      <article className="public-legal">
        <h1>Privacy Policy</h1>
        <p className="public-muted">Last updated: October 16, 2026</p>

        <p>
          Personal Budget Tracker (“the app”, “we”) is a personal budgeting web app available at
          personal-budgettracker.vercel.app. This policy explains what information the app
          handles, why, and how it is protected.
        </p>

        <h2>Information we access</h2>
        <h3>Google account information</h3>
        <p>
          When you sign in with Google, the app receives a Google ID token containing your name,
          email address, profile picture and Google account ID. This is used only to identify you
          and to confirm you are the authorized owner of the budget spreadsheet. The app requests
          no other Google user data and does not access your Gmail, Drive files, contacts or
          calendar.
        </p>
        <h3>Budget data you enter</h3>
        <p>
          Transactions, categories, accounts, budgets, paychecks, savings goals, debts and
          recurring items that you enter are stored in a Google Sheet owned by you. They are not
          stored in any separate database run by the app.
        </p>

        <h2>How we use information</h2>
        <ul>
          <li>To authenticate you and display your own budget data back to you.</li>
          <li>To read and write rows in your Google Sheet when you add, edit or delete entries.</li>
        </ul>
        <p>We do not use your information for advertising, profiling or analytics.</p>

        <h2>How information flows</h2>
        <p>
          Your browser sends your Google ID token and requests to a Google Apps Script Web App
          deployed by the app owner. The Apps Script verifies the token with Google and checks that
          the email matches the authorized owner before reading or writing the spreadsheet. Requests
          from any other account are rejected.
        </p>

        <h2>Storage on your device</h2>
        <p>
          The app stores your sign-in session (the Google ID token and basic profile) in your
          browser’s local storage so you stay signed in. Tokens expire after about an hour and
          are discarded when expired or when you sign out. Clearing your browser data removes it.
        </p>

        <h2>Sharing and disclosure</h2>
        <p>
          We do not sell, rent or share your personal information or budget data with third
          parties. Data is processed only by the services needed to run the app: Google (sign-in,
          Google Sheets, Apps Script) and Vercel (hosting of the website files).
        </p>

        <h2>Retention and deletion</h2>
        <p>
          Your data stays in your Google Sheet until you delete it. You can delete any entry in the
          app, or delete the spreadsheet itself, at any time. You can sign out from within the app
          and revoke the app’s access at any time from your Google Account at
          myaccount.google.com/permissions.
        </p>

        <h2>Security</h2>
        <p>
          Connections use HTTPS, and the server verifies your identity on every request. No
          system is perfectly secure, so we cannot guarantee absolute security.
        </p>

        <h2>Children</h2>
        <p>The app is not directed at children under 13 and does not knowingly collect their information.</p>

        <h2>Changes to this policy</h2>
        <p>If this policy changes, the updated version will be posted here with a new date.</p>

        <h2>Contact</h2>
        <p>
          Questions or requests about this policy: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        </p>
      </article>
    </PublicLayout>
  )
}
