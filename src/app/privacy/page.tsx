import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, NEWSLETTER_NAME, SITE_NAME, SITE_URL, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: `How ${SITE_NAME} handles your information: newsletter emails, cookie-free analytics, settings saved in your browser and third-party services.`,
  path: "/privacy",
});

const LAST_UPDATED = "October 1, 2026";

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted">{children}</div>
    </section>
  );
}

function External({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:text-accent-hover">
      {children}
    </a>
  );
}

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted">Last updated: {LAST_UPDATED}</p>
        <p className="mt-4 leading-relaxed text-muted">
          {SITE_NAME} ({SITE_URL.replace("https://", "")}) is a free website for economic and market
          data. We collect as little information as possible, we don&apos;t sell it, and we don&apos;t
          use advertising or tracking cookies. This page explains exactly what is collected and why.
        </p>
      </div>

      <section className="rounded-lg border border-border border-l-4 border-l-accent bg-surface p-5 text-sm leading-relaxed text-muted">
        <h2 className="font-medium text-primary">The short version</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>You can use the whole site without giving us any personal information.</li>
          <li>If you subscribe to the newsletter, we keep your email address to send it to you.</li>
          <li>Our visitor statistics don&apos;t use cookies and don&apos;t identify you.</li>
          <li>Your settings are saved only in your own browser.</li>
          <li>We never sell your information.</li>
        </ul>
      </section>

      <Section title="Information you give us: the newsletter">
        <p>
          When you subscribe to {NEWSLETTER_NAME}, we collect your <strong className="text-primary">email
          address</strong>, along with which signup form you used (for example, the Calendar page) and
          that you came from our website. We use this only to send you the newsletter and to understand
          which signup forms work best.
        </p>
        <p>
          Our newsletter is delivered by{" "}
          <External href="https://www.beehiiv.com/privacy">beehiiv</External>, which stores subscriber
          email addresses and sends emails on our behalf. beehiiv&apos;s privacy policy applies to the
          emails you receive, including how opens and clicks may be measured.
        </p>
        <p>
          You can unsubscribe at any time using the link at the bottom of every email. To have your
          email address deleted entirely, contact us (see below).
        </p>
      </Section>

      <Section title="Visitor statistics">
        <p>
          We use{" "}
          <External href="https://vercel.com/docs/analytics/privacy-policy">Vercel Web Analytics</External>{" "}
          to count page views and see, in aggregate, which pages are popular, which websites send us
          visitors, and general information such as country, device type and browser. It{" "}
          <strong className="text-primary">does not use cookies</strong>, does not follow you to other
          websites, and doesn&apos;t give us information that identifies you personally.
        </p>
      </Section>

      <Section title="Settings saved in your browser">
        <p>
          If you change settings such as the color theme, light or dark mode, default chart range or
          time zone, or add your own charts on the Economic Indicators page, those choices are saved
          in your browser&apos;s local storage so the site remembers them next time. This information
          stays on your device; it is never sent to us. You can clear it at any time by clearing your
          browser&apos;s site data.
        </p>
      </Section>

      <Section title="Hosting and security">
        <p>
          Our website is hosted by{" "}
          <External href="https://vercel.com/legal/privacy-policy">Vercel</External>. Like any web host,
          Vercel processes technical information needed to deliver the site and keep it secure, such
          as your IP address, browser type and the pages requested. We don&apos;t use this information
          to identify or profile visitors.
        </p>
      </Section>

      <Section title="Third-party services">
        <p>Some features rely on other companies. We share only what each feature needs:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-primary">TradingView</strong>: the live price widgets on the Markets
            page are loaded directly from TradingView, which may collect information or set cookies
            under its own{" "}
            <External href="https://www.tradingview.com/privacy-policy/">privacy policy</External>. They
            appear only on the Markets page.
          </li>
          <li>
            <strong className="text-primary">FRED (Federal Reserve Bank of St. Louis)</strong>: our
            servers request economic data from FRED. When you search FRED data on our site, your search
            words are sent to FRED from our server, not from your browser, and nothing that identifies
            you is included.
          </li>
          <li>
            <strong className="text-primary">Calendar apps</strong>: if you choose &ldquo;Add to
            calendar&rdquo; with Google Calendar, you&apos;re taken to Google, whose privacy policy
            applies. Downloaded calendar files (.ics) are created in your browser.
          </li>
        </ul>
      </Section>

      <Section title="What we don't do">
        <ul className="list-disc space-y-1 pl-5">
          <li>We don&apos;t sell, rent or trade your personal information.</li>
          <li>We don&apos;t use advertising or cross-site tracking cookies.</li>
          <li>We don&apos;t require an account to use the site.</li>
        </ul>
      </Section>

      <Section title="How long we keep information">
        <p>
          We keep your email address for as long as you&apos;re subscribed, and delete it on request.
          Visitor statistics are kept in aggregate form only.
        </p>
      </Section>

      <Section title="Your choices and rights">
        <p>
          You can unsubscribe from the newsletter at any time. Depending on where you live (for
          example, under the GDPR in the EU and UK, or under California law), you may have the right
          to ask what personal information we hold about you, to correct it, or to have it deleted.
          Contact us and we&apos;ll respond within a reasonable time.
        </p>
      </Section>

      <Section title="Children">
        <p>
          {SITE_NAME} is not directed at children under 13, and we don&apos;t knowingly collect
          personal information from them.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          If we change how we handle information, we&apos;ll update this page and the &ldquo;Last
          updated&rdquo; date above.
        </p>
      </Section>

      <Section id="contact" title="Contact">
        <p>
          Questions or requests about your information? Email us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-accent hover:text-accent-hover">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
        <p>
          See also our <Link href="/about" className="font-medium text-accent hover:text-accent-hover">About page</Link>{" "}
          for our data sources and investment disclaimer.
        </p>
      </Section>
    </div>
  );
}
