import Link from "next/link";

export default function UserDataDeletionPage() {
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
          User Data Deletion
        </h1>
        <p className="mt-3 text-sm text-[#647084] dark:text-white/55">
          Last updated: June 25, 2026
        </p>

        <div className="mt-10 space-y-8 text-base leading-7 text-[#4b5567] dark:text-white/70">
          <section>
            <h2 className="text-xl font-semibold text-[#0b1020] dark:text-white">
              How to Request Deletion
            </h2>
            <p className="mt-3">
              If you created an EcomfyCalls account or signed in using Facebook,
              Google, or another authentication provider, you can request that
              we delete your account data.
            </p>
            <p className="mt-3">
              Send an email to{" "}
              <a
                href="mailto:support@ecomfycalls.com"
                className="font-medium text-[#047857] hover:underline"
              >
                support@ecomfycalls.com
              </a>{" "}
              with the subject line{" "}
              <span className="font-medium">
                User Data Deletion Request
              </span>{" "}
              and include the email address associated with your EcomfyCalls
              account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0b1020] dark:text-white">
              What We Delete
            </h2>
            <p className="mt-3">
              After verifying the request, we will delete or anonymize account
              information associated with your user profile, including login
              identifiers and profile information stored by EcomfyCalls, unless
              retention is required for legal, security, fraud prevention, or
              accounting purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0b1020] dark:text-white">
              Processing Time
            </h2>
            <p className="mt-3">
              We aim to process deletion requests within 30 days of verification.
              If additional time is needed, we will notify you using the email
              address provided in your request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0b1020] dark:text-white">
              Facebook App Data
            </h2>
            <p className="mt-3">
              If you used Facebook Login with EcomfyCalls, this page serves as
              the user data deletion instructions required by Meta. You may also
              remove the app connection from your Facebook account settings.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
