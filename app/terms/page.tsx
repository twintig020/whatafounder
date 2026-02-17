// TODO: LEGAL — replace with real Terms of Service copy from your legal team
import type { Metadata } from 'next'
import { APP_NAME, PRICES } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Terms of Service',
}

export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Terms of Service</h1>
      <p className="text-slate-400 text-sm mb-10">Last updated: {new Date().getFullYear()}</p>

      <div className="space-y-6 text-slate-600 dark:text-slate-400">
        <section>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
            1. Acceptance
          </h2>
          <p>
            By using {APP_NAME} you agree to these Terms. If you don&apos;t agree, please don&apos;t use the
            service.
          </p>
          <p className="mt-2 text-amber-600 dark:text-amber-400 text-sm font-medium">
            TODO: LEGAL — add full acceptance clause.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
            2. The service
          </h2>
          <p>
            {APP_NAME} provides a 3-day founder assessment. The basic profile is free. An Extended
            Report is available for {PRICES.currencySymbol}
            {PRICES.full} (discounted offers may apply).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
            3. Payments
          </h2>
          <p>
            Payments are processed by Revolut. All purchases are final. The Extended Report is
            non-refundable once accessed.
          </p>
          <p className="mt-2 text-amber-600 dark:text-amber-400 text-sm font-medium">
            TODO: LEGAL — add full payment and refund terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
            4. Intellectual property
          </h2>
          <p>
            Your profile content belongs to you. The {APP_NAME} service, scoring methodology, and
            archetype framework are proprietary.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
            5. Disclaimer
          </h2>
          <p>
            {APP_NAME} is a self-reflection tool, not a psychological assessment. Results are
            indicative, not diagnostic.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
            6. Contact
          </h2>
          <p>
            Questions:{' '}
            <a href="mailto:hello@whatafounder.com" className="text-indigo-600 hover:underline">
              hello@whatafounder.com
            </a>
          </p>
          <p className="mt-2 text-amber-600 dark:text-amber-400 text-sm font-medium">
            TODO: LEGAL — confirm contact email and add full governing law clause.
          </p>
        </section>
      </div>
    </main>
  )
}
