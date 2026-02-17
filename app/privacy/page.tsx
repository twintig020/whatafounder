// TODO: LEGAL — replace with real Privacy Policy copy from your legal team
import type { Metadata } from 'next'
import { APP_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Privacy Policy',
}

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Privacy Policy</h1>
      <p className="text-slate-400 text-sm mb-10">Last updated: {new Date().getFullYear()}</p>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-600 dark:text-slate-400">
        <section>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
            1. Who we are
          </h2>
          <p>
            {APP_NAME} is operated by [Company Name]. We are committed to protecting your personal
            data and respecting your privacy.
          </p>
          <p className="mt-2 text-amber-600 dark:text-amber-400 text-sm font-medium">
            TODO: LEGAL — add company details, registration number, and contact information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
            2. What data we collect
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Email address (for authentication)</li>
            <li>Your answers to the 12 assessment questions</li>
            <li>Push notification subscription (if granted)</li>
            <li>Device and browser information for analytics</li>
          </ul>
          <p className="mt-2 text-amber-600 dark:text-amber-400 text-sm font-medium">
            TODO: LEGAL — complete full data inventory with retention periods.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
            3. How we use your data
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To generate your personalised Founder Profile</li>
            <li>To send optional push notifications (Day 2 &amp; Day 3 reminders)</li>
            <li>To process payments (via Revolut)</li>
            <li>To improve the product</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
            4. AI processing
          </h2>
          <p>
            With your consent, your answers may be used to improve our scoring algorithms. This
            consent is optional and can be withdrawn at any time from Settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
            5. Your rights
          </h2>
          <p>
            Under GDPR you have the right to access, correct, and delete your data. You can delete
            your account and all associated data at any time from Settings.
          </p>
          <p className="mt-2 text-amber-600 dark:text-amber-400 text-sm font-medium">
            TODO: LEGAL — add full GDPR rights section, DPA details, and supervisory authority
            information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
            6. Contact
          </h2>
          <p>
            For privacy enquiries:{' '}
            <a href="mailto:privacy@whatafounder.com" className="text-indigo-600 hover:underline">
              privacy@whatafounder.com
            </a>
          </p>
          <p className="mt-2 text-amber-600 dark:text-amber-400 text-sm font-medium">
            TODO: LEGAL — confirm contact email.
          </p>
        </section>
      </div>
    </main>
  )
}
