import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Globe2,
  MapPin,
  Megaphone,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Digital Growth Package | 6ixtem",
  description:
    "Build a professional online presence, reach customers through Meta advertising, and improve local search visibility with the 6ixtem Digital Growth Package.",
};

const benefits = [
  {
    icon: Globe2,
    number: "01",
    title: "Give your business a credible online home.",
    description:
      "A promotional website gives potential customers somewhere to learn about your business, explore your offers, and contact you. Stop relying entirely on social media pages to represent your brand.",
  },
  {
    icon: Megaphone,
    number: "02",
    title: "Reach people beyond your existing followers.",
    description:
      "We set up one Meta advertising campaign, research the audience, and develop ad creatives to help put your products or services in front of relevant potential customers.",
  },
  {
    icon: MapPin,
    number: "03",
    title: "Improve your visibility in local searches.",
    description:
      "Local SEO setup and optimization help establish your business's presence in relevant searches, so people looking for your services have a better opportunity to discover you.",
  },
];

const process = [
  {
    title: "Tell us about your business",
    description:
      "Complete the short qualification form and assessment so we can understand your business, current online presence, and marketing objectives.",
  },
  {
    title: "We review your growth requirements",
    description:
      "Our team evaluates your business needs and determines whether the package is a suitable fit.",
  },
  {
    title: "Plan your onboarding",
    description:
      "Qualified businesses can proceed to a consultation to discuss the campaign, website, SEO requirements, and next steps.",
  },
];

export default function DigitalGrowthPackagePage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <nav className="container-main flex h-[72px] items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-black tracking-[-0.07em]"
          >
            6ixtem<span className="text-blue-600">.</span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            <a href="#why-growth" className="text-sm font-medium text-slate-600 hover:text-blue-600">
              Why growth
            </a>
            <a href="#package" className="text-sm font-medium text-slate-600 hover:text-blue-600">
              What's included
            </a>
            <a href="#process" className="text-sm font-medium text-slate-600 hover:text-blue-600">
              How it works
            </a>
          </div>

          <Link
            href="/digital-growth-package/qualify"
            className="button-primary inline-flex items-center gap-2"
          >
            Get started <ArrowRight size={17} />
          </Link>
        </nav>
      </header>

      <section className="border-b border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-100">
        <div className="container-main py-20 md:py-28">
          <p className="eyebrow">6ixtem · Digital Growth Package</p>

          <h1 className="mt-6 max-w-5xl text-5xl font-black leading-[1.03] tracking-[-0.055em] sm:text-6xl md:text-7xl">
            Your business deserves to be seen, found, and contacted.
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-600">
            A professional digital presence is more than having a social
            media page. It is about giving potential customers a clear way to
            discover your business, understand what you offer, and take the
            next step.
          </p>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            The 6ixtem Digital Growth Package brings together a promotional
            website, local SEO, and a Meta advertising campaign to help you
            build that foundation.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Link
              href="/digital-growth-package/qualify"
              className="button-primary inline-flex items-center gap-3"
            >
              Assess your business <ArrowRight size={19} />
            </Link>

            <a
              href="#package"
              className="text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
              Explore the package
            </a>
          </div>

          <p className="mt-5 text-sm text-slate-500">
            ₦300,000 one-time service fee · Advertising spend excluded
          </p>
        </div>
      </section>

      <section id="why-growth" className="container-main py-16 md:py-24">
        <p className="eyebrow">Why your business needs this</p>

        <h2 className="mt-4 max-w-4xl text-4xl font-black tracking-tight md:text-5xl">
          Growth becomes harder when customers cannot find you.
        </h2>

        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
          Your business may offer excellent products or services, but
          visibility, credibility, and customer access are separate
          challenges. This package addresses all three with a coordinated
          digital foundation.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {benefits.map(({ icon: Icon, number, title, description }) => (
            <article
              key={number}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Icon size={24} />
                </span>

                <span className="text-sm font-bold text-slate-400">
                  {number}
                </span>
              </div>

              <h3 className="mt-6 text-xl font-bold leading-7">
                {title}
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="package" className="border-y border-slate-200 bg-slate-50">
        <div className="container-main py-16 md:py-24">
          <p className="eyebrow">What's included</p>

          <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
            One package. Three growth foundations.
          </h2>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-5">
              {benefits.map(({ number, title, description }) => (
                <div
                  key={number}
                  className="rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="mt-2 leading-7 text-slate-600">
                    {description}
                  </p>
                </div>
              ))}
            </div>

            <aside className="h-fit rounded-2xl border border-blue-200 bg-white p-7 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
                Digital Growth Package
              </p>

              <p className="mt-4 text-4xl font-black tracking-tight">
                ₦300,000
              </p>

              <p className="mt-2 text-sm text-slate-500">
                One-time service fee
              </p>

              <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-700">
                {[
                  "One Meta advertising campaign",
                  "Ad account setup and audience research",
                  "Ad creative development",
                  "Local SEO setup and optimization",
                  "Promotional website",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckCircle2
                      size={19}
                      className="mt-0.5 shrink-0 text-blue-600"
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/digital-growth-package/qualify"
                className="button-primary mt-7 flex w-full items-center justify-center gap-2"
              >
                Get started <ArrowRight size={18} />
              </Link>

              <p className="mt-4 text-xs leading-5 text-slate-500">
                Advertising spend, domain registration, hosting, and
                ongoing maintenance are not included. Additional campaigns
                and SEO work are quoted separately.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section id="process" className="container-main py-16 md:py-24">
        <p className="eyebrow">How it works</p>

        <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
          From assessment to onboarding.
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {process.map((step, index) => (
            <article
              key={step.title}
              className="rounded-2xl border border-slate-200 p-6"
            >
              <span className="text-sm font-bold text-blue-700">
                STEP 0{index + 1}
              </span>
              <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">
                {step.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <ShieldCheck
            size={22}
            className="mt-0.5 shrink-0 text-blue-700"
          />
          <p className="text-sm leading-6 text-slate-600">
            The assessment helps us determine whether this package is
            appropriate for your business. Advertising performance and
            search rankings are not guaranteed.
          </p>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50">
        <div className="container-main py-14 md:py-20">
          <h2 className="max-w-3xl text-3xl font-black tracking-tight md:text-5xl">
            Build the digital foundation your business needs.
          </h2>

          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Start with a short business assessment and find out whether the
            Digital Growth Package is the right next step for your business.
          </p>

          <Link
            href="/digital-growth-package/qualify"
            className="button-primary mt-7 inline-flex items-center gap-2"
          >
            Assess your business <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}