import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-white px-5 py-12 text-[#0b1020] dark:bg-[#05070d] dark:text-white">
      <article className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm font-medium text-[#047857] hover:underline"
        >
          Back to EcomfyCalls
        </Link>

        <h1 className="mt-8 text-4xl font-semibold tracking-normal">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-[#647084] dark:text-white/55">
          Last updated: June 25, 2026
        </p>

        <div className="mt-10 space-y-8 text-base leading-7 text-[#4b5567] dark:text-white/70">
          <section>
            <h2 className="text-xl font-semibold text-[#0b1020] dark:text-white">
              Agreement to Terms
            </h2>
            <p className="mt-3">
              These Terms of Service govern your access to and use of
              EcomfyCalls. By creating an account or using our services, you
              agree to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0b1020] dark:text-white">
              Services
            </h2>
            <p className="mt-3">
              EcomfyCalls provides tools and services that help insurance
              agents and teams access customer calls and related campaign
              information. Availability, quality, pricing, and delivery of
              calls may vary by campaign, vertical, geography, and operational
              requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0b1020] dark:text-white">
              User Responsibilities
            </h2>
            <p className="mt-3">
              You are responsible for maintaining accurate account information,
              protecting your login credentials, complying with applicable
              insurance, telemarketing, consumer protection, privacy, and data
              security laws, and using the platform only for lawful business
              purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0b1020] dark:text-white">
              Payments and Campaigns
            </h2>
            <p className="mt-3">
              If paid services are offered, pricing, billing terms, refund
              rules, and campaign requirements may be provided separately. You
              agree to pay all applicable fees for services you purchase or
              authorize.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0b1020] dark:text-white">
              Prohibited Use
            </h2>
            <p className="mt-3">
              You may not misuse the platform, attempt unauthorized access,
              interfere with service operations, resell data or calls without
              permission, or use EcomfyCalls in a way that violates applicable
              laws or third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0b1020] dark:text-white">
              No Guarantee
            </h2>
            <p className="mt-3">
              EcomfyCalls may help connect agents with potential customers, but
              we do not guarantee sales, conversions, revenue, profitability, or
              specific campaign outcomes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0b1020] dark:text-white">
              Changes to Terms
            </h2>
            <p className="mt-3">
              We may update these terms from time to time. Continued use of the
              platform after changes become effective means you accept the
              updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0b1020] dark:text-white">
              Contact
            </h2>
            <p className="mt-3">
              For questions about these terms, contact us at{" "}
              <a
                href="mailto:support@ecomfycalls.com"
                className="font-medium text-[#047857] hover:underline"
              >
                support@ecomfycalls.com
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
