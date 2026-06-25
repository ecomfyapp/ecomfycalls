import Link from "next/link";

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-[#647084] dark:text-white/55">
          Last updated: June 25, 2026
        </p>

        <div className="mt-10 space-y-8 text-base leading-7 text-[#4b5567] dark:text-white/70">
          <section>
            <h2 className="text-xl font-semibold text-[#0b1020] dark:text-white">
              Overview
            </h2>
            <p className="mt-3">
              EcomfyCalls helps insurance agents and teams access high-intent
              customer calls. This Privacy Policy explains how we collect, use,
              and protect information when you use our website, authentication
              flows, and related services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0b1020] dark:text-white">
              Information We Collect
            </h2>
            <p className="mt-3">
              We may collect account information such as your name, email
              address, login provider, and profile details provided through
              authentication services such as Google or Facebook. We may also
              collect business information you submit, including agency details,
              insurance verticals, campaign preferences, and support requests.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0b1020] dark:text-white">
              How We Use Information
            </h2>
            <p className="mt-3">
              We use information to create and manage accounts, authenticate
              users, provide access to EcomfyCalls services, communicate with
              users, improve platform quality, prevent fraud, and comply with
              legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0b1020] dark:text-white">
              Third-Party Login Providers
            </h2>
            <p className="mt-3">
              If you sign in using Google or Facebook, we receive limited
              profile information authorized by you and the provider, such as
              your email address and basic profile details. We do not sell this
              information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0b1020] dark:text-white">
              Data Sharing
            </h2>
            <p className="mt-3">
              We may share information with service providers that help us
              operate the platform, such as hosting, authentication, analytics,
              customer support, and security services. We may also disclose
              information if required by law or to protect users, the platform,
              or our rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0b1020] dark:text-white">
              Data Security
            </h2>
            <p className="mt-3">
              We use reasonable administrative, technical, and organizational
              safeguards to protect user information. No online service can
              guarantee complete security, but we work to protect data from
              unauthorized access, misuse, or disclosure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0b1020] dark:text-white">
              Data Retention and Deletion
            </h2>
            <p className="mt-3">
              We retain account and service information for as long as needed to
              provide the platform, comply with legal obligations, resolve
              disputes, and enforce agreements. You may request deletion of your
              account data by following the instructions on our User Data
              Deletion page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0b1020] dark:text-white">
              Contact
            </h2>
            <p className="mt-3">
              For privacy questions or requests, contact us at{" "}
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
