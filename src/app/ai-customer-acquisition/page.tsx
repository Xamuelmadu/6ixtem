import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CalendarCheck,
  CheckCircle2,
  MessageSquareText,
  Workflow,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AI Customer Acquisition | 6ixtem",
  description:
    "Qualify leads, answer first questions, gather customer requirements and move suitable prospects towards booking with a dedicated AI customer acquisition system.",
};

const capabilities = [
  {
    icon: MessageSquareText,
    title: "Respond to enquiries",
    description:
      "Give prospects a structured first point of contact and collect the information your team needs to respond well.",
  },
  {
    icon: Bot,
    title: "Qualify before the call",
    description:
      "Use a business-specific AI assessment to understand intent, requirements, urgency and suitability before a human consultation.",
  },
  {
    icon: Workflow,
    title: "Move leads through a process",
    description:
      "Replace disconnected enquiry handling with a defined journey from first contact to qualification and follow-up.",
  },
  {
    icon: CalendarCheck,
    title: "Guide suitable prospects to booking",
    description:
      "Where appropriate, direct qualified prospects into your existing consultation and calendar workflow.",
  },
];

export default function AICustomerAcquisitionPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <nav className="container-main flex h-[72px] items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-black tracking-[-0.07em]"
          >
            6ixtem<span className="text-blue-600">.</span>
          </Link>

          <Link
            href="/ai-customer-acquisition/assessment"
            className="button-primary"
          >
            Assess your business <ArrowRight size={16} />
          </Link>
        </nav>
      </header>

      <section className="blue-glow border-b border-slate-200">
        <div className="container-main grid items-center gap-12 py-16 md:grid-cols-[1.05fr_.95fr] md:py-24">
          <div>
            <p className="eyebrow">AI customer acquisition systems</p>

            <h1 className="mt-6 max-w-3xl text-[clamp(42px,6vw,72px)] font-black leading-[1.02] tracking-[-0.065em]">
              Stop making every lead wait for a human.
              <span className="mt-2 block text-blue-600">
                Build a smarter first step.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              6ixtem helps businesses introduce a dedicated AI assessment into
              their customer acquisition process—so enquiries can be understood,
              qualified and directed to the right next step before your team
              spends time on a call.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/ai-customer-acquisition/assessment"
                className="button-primary"
              >
                Start the AI assessment <ArrowRight size={17} />
              </Link>

              <Link href="/6ixtem" className="button-secondary">
                Explore 6ixtem
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-600">
              {[
                "Designed around your sales process",
                "Qualification before consultation",
                "Human handoff when appropriate",
              ].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-blue-600" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="surface-card relative p-5 sm:p-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
                  Customer journey
                </p>
                <h2 className="mt-2 text-xl font-bold">
                  From enquiry to next step
                </h2>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                AI-assisted
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {[
                [
                  "01",
                  "Capture the enquiry",
                  "Understand what the prospect needs.",
                ],
                [
                  "02",
                  "Assess and qualify",
                  "Ask relevant questions in a guided conversation.",
                ],
                [
                  "03",
                  "Prepare the handoff",
                  "Organize requirements and identify the next step.",
                ],
                [
                  "04",
                  "Book or follow up",
                  "Direct suitable prospects to a consultation.",
                ],
              ].map(([number, title, description]) => (
                <div
                  key={number}
                  className="flex gap-4 rounded-xl bg-slate-50 p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-black text-white">
                    {number}
                  </span>

                  <div>
                    <h3 className="font-bold">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl bg-[#102d62] p-5 text-white">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-200">
                <Zap size={16} /> The objective
              </div>

              <p className="mt-2 text-lg font-bold leading-7">
                Give every serious enquiry a clearer path forward—without
                adding unnecessary manual work.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-main py-20">
        <p className="eyebrow">What the system can support</p>

        <h2 className="section-heading max-w-3xl">
          A better acquisition process, designed around your business.
        </h2>

        <p className="section-copy">
          The right implementation depends on your offer, lead sources, sales
          process and existing tools. Start by assessing what you need.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="surface-card p-6 transition hover:-translate-y-1 hover:border-blue-200"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon size={23} />
              </span>

              <h3 className="mt-5 text-lg font-bold">{title}</h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-main pb-20">
        <div className="rounded-3xl bg-[#102d62] px-7 py-12 text-white sm:px-12 md:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">
            Start with an assessment
          </p>

          <h2 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
            Let’s understand how your business acquires customers today.
          </h2>

          <p className="mt-5 max-w-2xl leading-7 text-blue-100">
            Answer a few focused questions about your leads, current process
            and desired outcome. The assessment will help establish whether a
            dedicated AI acquisition workflow is a sensible next step.
          </p>

          <Link
            href="/ai-customer-acquisition/assessment"
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-5 font-bold text-blue-900 transition hover:bg-blue-50"
          >
            Begin assessment <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200">
        <div className="container-main flex flex-col gap-3 py-7 text-sm text-slate-500 sm:flex-row sm:justify-between">
          <p>© 2026 6ixtem. Business systems, intelligently designed.</p>
          <Link href="/" className="hover:text-blue-600">
            Back to 6ixtem
          </Link>
        </div>
      </footer>
    </main>
  );
}