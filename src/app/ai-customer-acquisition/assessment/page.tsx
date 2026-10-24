import type { Metadata } from "next";
import Link from "next/link";
import CustomerAcquisitionAssessment from "./ui";

export const metadata: Metadata = {
  title: "AI Customer Acquisition Assessment | 6ixtem",
  description:
    "Assess your lead handling and customer acquisition process with 6ixtem.",
};

export default function AssessmentPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <nav className="container-main flex h-[72px] items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-black tracking-[-0.07em]"
          >
            6ixtem<span className="text-blue-600">.</span>
          </Link>

          <Link
            href="/ai-customer-acquisition"
            className="text-sm font-semibold text-slate-600 hover:text-blue-600"
          >
            Product overview
          </Link>
        </nav>
      </header>

      <section className="container-main py-10 md:py-16">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">AI customer acquisition</p>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Assess your customer acquisition process.
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Answer one question at a time. The assessment will explore how
            enquiries arrive, how your team qualifies leads, and where an
            AI-assisted process may help.
          </p>

          <CustomerAcquisitionAssessment />
        </div>
      </section>
    </main>
  );
}