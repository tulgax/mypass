export const metadata = {
  title: "Cookie Preferences - MyPass",
  description: "Manage your cookie preferences for MyPass. Learn about how we use cookies and similar technologies.",
}

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-20 md:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-medium tracking-[-0.05em] sm:text-5xl">
            Cookie Preferences
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Last updated: January 15, 2026
          </p>

          <div className="mt-12 space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                What Are Cookies?
              </h2>
              <p>
                Cookies are small text files that are placed on your device when
                you visit a website. They are widely used to make websites work
                more efficiently and provide information to website owners.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                How We Use Cookies
              </h2>
              <p className="mb-2">We use cookies for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Essential Cookies:</strong> Required for the website to
                  function properly. These cannot be disabled.
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> Help us understand how
                  visitors interact with our website by collecting anonymous
                  information.
                </li>
                <li>
                  <strong>Functional Cookies:</strong> Remember your preferences
                  and settings to provide a better experience.
                </li>
                <li>
                  <strong>Marketing Cookies:</strong> Used to deliver relevant
                  advertisements and track campaign effectiveness.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Managing Your Cookie Preferences
              </h2>
              <p className="mb-4">
                You can control and manage cookies in several ways:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Use the cookie preference settings on this page to manage
                  non-essential cookies
                </li>
                <li>
                  Adjust your browser settings to refuse or delete cookies
                </li>
                <li>
                  Use browser extensions or privacy tools to block cookies
                </li>
              </ul>
              <p className="mt-4">
                Please note that disabling certain cookies may impact your
                experience on our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Third-Party Cookies
              </h2>
              <p>
                Some cookies are placed by third-party services that appear on
                our pages. We do not control these cookies, and you should check
                the third-party websites for more information about their use of
                cookies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Cookie Settings
              </h2>
              <div className="mt-4 space-y-4 p-6 border border-border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Essential Cookies
                    </h3>
                    <p className="text-sm">Required for the site to function</p>
                  </div>
                  <span className="text-sm text-muted-foreground">Always Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Analytics Cookies
                    </h3>
                    <p className="text-sm">Help us improve our website</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Marketing Cookies
                    </h3>
                    <p className="text-sm">Used for advertising purposes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Contact Us
              </h2>
              <p>
                If you have questions about our use of cookies, please contact
                us at{" "}
                <a
                  href="mailto:privacy@mypass.com"
                  className="text-foreground hover:underline"
                >
                  privacy@mypass.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
