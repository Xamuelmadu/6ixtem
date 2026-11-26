
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Globe2,
  Megaphone,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Digital Growth Package | 6ixtem",
  description:
    "Grow your business with a Meta advertising campaign, local SEO and a promotional website. One-time service fee of ₦300,000.",
};

const services = [
  {
    icon: Megaphone,
    title: "Meta advertising",
    description:
      "One campaign with ad account setup, audience research and creative development tailored to your business.",
  },
  {
    icon: Search,
    title: "Local SEO",
    description:
      "Local search optimization to improve your visibility to customers searching for your services in your area.",
  },
  {
    icon: Globe2,
    title: "Promotional website",
    description:
      "A professional promotional website with responsive design, contact functionality and cloud deployment.",
  },
];

const process = [
  "Complete the business qualification form.",
  "Discuss your goals and requirements with our team.",
  "Confirm the scope and begin onboarding.",
];

export default function DigitalGrowthPackagePage() {
  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            6ixtem
          </Link>

          <Link
            href="/digital-growth-package/qualify"
            className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500"
          >
            Get started
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-sm text-blue-200">
            <Sparkles size={16} />
            Digital Growth Package
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Build your online presence.
            <span className="block text-blue-400">
              Reach more customers.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            A complete digital marketing starter package for growing
            businesses. Get Meta advertising, local SEO and a promotional
            website in one coordinated service.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/digital-growth-package/qualify"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-4 font-semibold hover:bg-blue-500"
            >
              Start your assessment <ArrowRight size={18} />
            </Link>

            <a
              href="#package"
              className="rounded-xl border border-white/20 px-6 py-4 font-semibold hover:bg-white/5"
            >
              Explore the package
            </a>
          </div>
        </div>

        <div className="rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-600/20 to-slate-900 p-8">
          <BarChart3 className="mb-6 text-blue-400" size={40} />
          <p className="text-sm uppercase tracking-widest text-blue-300">
            One-time service fee
          </p>
          <p className="mt-3 text-5xl font-bold">₦300,000</p>
          <p className="mt-4 leading-7 text-slate-300">
            Advertising setup, local search optimization and a professional
            promotional website.
          </p>

          <div className="mt-8 space-y-4 border-t border-white/10 pt-6">
            {[
              "One Meta advertising campaign",
              "Local SEO setup and optimization",
              "Promotional website included",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-blue-400" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="package"
        className="border-y border-white/10 bg-slate-900/50"
      >
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            What's included
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Three essentials for digital growth
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {services.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-white/10 bg-slate-900 p-7"
              >
                <Icon className="text-blue-400" size={30} />
                <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                <p className="mt-3 leading-7 text-slate-300">
                  {description}
                </p>
              </article>
            ))}
          </div>

          <p className="mt-8 text-sm leading-6 text-slate-400">
            The service fee excludes advertising spend, domain registration,
            hosting and ongoing maintenance. Additional campaigns and SEO
            services are quoted separately. Marketing results are not
            guaranteed.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-3xl font-bold">How to get started</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {process.map((step, index) => (
            <div key={step} className="rounded-2xl border border-white/10 p-6">
              <span className="text-sm font-bold text-blue-400">
                STEP 0{index + 1}
              </span>
              <p className="mt-3 leading-7 text-slate-300">{step}</p>
            </div>
          ))}
        </div>

        <Link
          href="/digital-growth-package/qualify"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-4 font-semibold hover:bg-blue-500"
        >
          Apply for the package <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}
