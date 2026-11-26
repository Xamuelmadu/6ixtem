import type { Metadata } from "next";
import Link from "next/link";
import DigitalGrowthAssessment from "./ui";

export const metadata: Metadata = {
  title: "Digital Growth Package Assessment | 6ixtem",
  description:
    "Assess your business's digital marketing needs and suitability for the 6ixtem Digital Growth Package.",
};

export default function DigitalGrowthAssessmentPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <nav className="container-main flex h-[72px] items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-[-0.07em]">
            6ixtem<span className="text-blue-600">.</span>
          </Link>

          <Link
            href="/digital-growth-package"
            className="text-sm font-semibold text-slate-600 hover:text-blue-600"
          >
            Package overview
          </Link>
        </nav>
      </header>

      <section className="container-main py-10 md:py-16">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">Digital Growth Package</p>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Assess your business growth needs.
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Answer a few questions about your business, your current online
            presence, and your marketing goals. This assessment will help us
            understand how the ₦300,000 Digital Growth Package can support your
            business through a Meta advertising campaign, local SEO, and a
            promotional website.
          </p>

          <DigitalGrowthAssessment />
        </div>
      </section>
    </main>
  );
}