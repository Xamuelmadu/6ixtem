
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Command,
  ShieldCheck,
} from "lucide-react";

type Readiness = "yes" | "maybe" | "no";

export default function AssessmentEntryPage() {
  const [readiness, setReadiness] = useState<Readiness | "">("");

  function continueAssessment() {
    if (!readiness || readiness === "no") return;

    sessionStorage.setItem("6ixtem_investment_readiness", readiness);
    window.location.href = "/6ixtem/assessment/chat";
  }

  return (
    <main className="blue-glow flex min-h-screen flex-col bg-white">
      <header className="border-b border-slate-200 bg-white/90">
        <nav className="container-main flex h-[72px] items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-black tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Command size={19} />
            </span>
            6ixtem<span className="text-blue-600">.</span>
          </Link>
          <Link href="/6ixtem" className="text-sm font-semibold text-slate-600 hover:text-blue-600">
            <span className="flex items-center gap-2">
              <ArrowLeft size={16} /> Back to 6ixtem
            </span>
          </Link>
        </nav>
      </header>

      <section className="container-main flex flex-1 items-center justify-center py-14">
        <div className="w-full max-w-2xl">
          <div className="text-center">
            <span className="eyebrow">Before we begin</span>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Let&apos;s understand your business.
            </h1>
            <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-600">
              6ixtem implementations are scoped around each business&apos;s
              operational needs. We begin by understanding your readiness,
              challenges and objectives before discussing an implementation.
            </p>
          </div>

          <div className="surface-card mt-10 p-6 sm:p-9">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <CheckCircle2 size={23} />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Is your business prepared to consider an implementation starting from $2000?
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  The final investment depends on the agreed requirements,
                  integrations, complexity and implementation scope. This is an
                  initial readiness check, not a quotation.
                </p>
              </div>
            </div>

            <div className="mt-7 space-y-3">
              {[
                {
                  value: "yes" as const,
                  title: "Yes, we are prepared to invest",
                  description: "We are looking for a serious operational solution.",
                },
                {
                  value: "maybe" as const,
                  title: "Possibly, depending on the scope",
                  description: "We need to understand the solution and requirements first.",
                },
                {
                  value: "no" as const,
                  title: "No, not at this stage",
                  description: "We are currently exploring lower-cost alternatives.",
                },
              ].map((option) => {
                const selected = readiness === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setReadiness(option.value)}
                    className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition ${
                      selected
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                        : "border-slate-200 hover:border-blue-200 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        selected
                          ? "border-blue-600 bg-blue-600"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                    </span>
                    <span>
                      <span className="block font-bold text-slate-900">
                        {option.title}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-slate-500">
                        {option.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {readiness === "no" && (
              <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Thank you for being upfront. You can explore our approach and
                return when your business is ready to consider a structured
                implementation.
              </p>
            )}

            <button
              type="button"
              disabled={!readiness || readiness === "no"}
              onClick={continueAssessment}
              className="button-primary mt-7 w-full disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue to business assessment <ArrowRight size={17} />
            </button>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck size={15} />
              Your responses are used to assess business fit.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
