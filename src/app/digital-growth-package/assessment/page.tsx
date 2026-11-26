import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Globe2,
  MapPin,
  Megaphone,
} from "lucide-react";
import DigitalGrowthAssessment from "./ui";

export const metadata: Metadata = {
  title: "Digital Growth Assessment | 6ixtem",
  description:
    "Discover how the 6ixtem Digital Growth Package can help your business build a professional online presence, improve local visibility, and reach potential customers.",
};

const growthAreas = [
  {
    icon: Globe2,
    title: "Online presence",
    description: "Your website and digital credibility",
  },
  {
    icon: MapPin,
    title: "Local visibility",
    description: "How customers discover your business",
  },
  {
    icon: Megaphone,
    title: "Customer reach",
    description: "Your advertising and marketing goals",
  },
];

export default function DigitalGrowthAssessmentPage() {
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

          <Link
            href="/digital-growth-package"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            Package overview
          </Link>
        </nav>
      </header>

      <section className="border-b border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-100">
        <div className="container-main py-16 md:py-24">
          <p className="eyebrow">
            Digital Growth Package · Business Assessment
          </p>

          <h1 className="mt-5 max-w-5xl text-4xl font-black leading-[1.05] tracking-[-0.055em] sm:text-6xl md:text-7xl">
            Let&apos;s understand your business growth needs.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Every business has different challenges. This assessment helps
            us understand your current online presence, your marketing
            goals, and the opportunities available to grow your business.
          </p>

          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            We&apos;ll explore how the ₦300,000 Digital Growth Package can
            support your business through a promotional website, local SEO,
            and a Meta advertising campaign.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {growthAreas.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-white/80 p-4"
              >
                <Icon
                  size={22}
                  className="text-blue-600"
                  aria-hidden="true"
                />
                <h2 className="mt-3 font-bold text-slate-950">
                  {title}
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-main py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">Your assessment</p>

          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Tell us where your business is today.
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            Answer the questions below about your business and marketing
            objectives. We&apos;ll use your responses to determine whether
            the package is a suitable fit and, where appropriate, guide you
            toward the next step.
          </p>

          <DigitalGrowthAssessment />

          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
            <Link
              href="/digital-growth-package/qualify"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
              <ArrowLeft size={16} />
              Back to qualification
            </Link>

            <Link
              href="/digital-growth-package"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600"
            >
              Package details
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}