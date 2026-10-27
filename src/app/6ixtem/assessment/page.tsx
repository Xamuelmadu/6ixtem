
"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Command,
  ShieldCheck,
} from "lucide-react";

type Readiness = "yes" | "maybe" | "no";

type BusinessOSQualification = {
  fullName: string;
  email: string;
  businessName: string;
  industry: string;
  teamSize: string;
  investmentReadiness: Readiness;
  submittedAt: string;
};

const SESSION_KEY = "6ixtem_assessment_session";
const READINESS_KEY = "6ixtem_investment_readiness";
const QUALIFICATION_KEY = "6ixtem_business_os_qualification";

export default function AssessmentEntryPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [readiness, setReadiness] = useState<Readiness | "">("");
  const [error, setError] = useState("");

  function continueAssessment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!readiness) {
      setError("Please select your investment readiness.");
      return;
    }

    if (readiness === "no") {
      setError(
        "Please return when your business is ready to consider an implementation starting from $2,000."
      );
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    const qualification: BusinessOSQualification = {
      fullName: fullName.trim(),
      email: normalizedEmail,
      businessName: businessName.trim(),
      industry: industry.trim(),
      teamSize,
      investmentReadiness: readiness,
      submittedAt: new Date().toISOString(),
    };

    // Reuse the session ID if this prospect has already started this assessment.
    let sessionId = sessionStorage.getItem(SESSION_KEY);

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }

    sessionStorage.setItem(
      QUALIFICATION_KEY,
      JSON.stringify(qualification)
    );

    // Retain the existing readiness key for compatibility with the chat.
    sessionStorage.setItem(READINESS_KEY, readiness);

    window.location.href = "/6ixtem/assessment/chat";
  }

  return (
    <main className="blue-glow flex min-h-screen flex-col bg-white">
      <header className="border-b border-slate-200 bg-white/90">
        <nav className="container-main flex h-[72px] items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-black tracking-tight"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Command size={19} />
            </span>
            6ixtem<span className="text-blue-600">.</span>
          </Link>

          <Link
            href="/6ixtem"
            className="text-sm font-semibold text-slate-600 hover:text-blue-600"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to 6ixtem
            </span>
          </Link>
        </nav>
      </header>

      <section className="container-main flex flex-1 items-center justify-center py-14">
        <div className="w-full max-w-3xl">
          <div className="text-center">
            <span className="eyebrow">Business assessment</span>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Let&apos;s understand your business.
            </h1>

            <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-600">
              Tell us a little about your business and what you are looking
              to improve. We will use this information to make your
              assessment more relevant and avoid asking you to repeat
              information you have already provided.
            </p>
          </div>

          <form
            onSubmit={continueAssessment}
            className="surface-card mt-10 space-y-8 p-6 sm:p-9"
          >
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                Your contact details
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Provide the details we should use if you qualify and choose
                to receive your assessment and consultation information.
              </p>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Full name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    minLength={2}
                    maxLength={150}
                    required
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Work email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900">
                About your business
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="businessName"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Business name
                  </label>
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    autoComplete="organization"
                    minLength={2}
                    maxLength={200}
                    required
                    value={businessName}
                    onChange={(event) => setBusinessName(event.target.value)}
                    placeholder="Your business name"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="industry"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Industry
                  </label>
                  <input
                    id="industry"
                    name="industry"
                    type="text"
                    minLength={2}
                    maxLength={150}
                    required
                    value={industry}
                    onChange={(event) => setIndustry(event.target.value)}
                    placeholder="e.g. Healthcare, cleaning, agency"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="teamSize"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Approximate team size
                  </label>
                  <select
                    id="teamSize"
                    name="teamSize"
                    required
                    value={teamSize}
                    onChange={(event) => setTeamSize(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  >
                    <option value="" disabled>
                      Select your team size
                    </option>
                    <option value="1-4">1–4 people</option>
                    <option value="5-9">5–9 people</option>
                    <option value="10-24">10–24 people</option>
                    <option value="25-49">25–49 people</option>
                    <option value="50+">50+ people</option>
                  </select>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <CheckCircle2 size={23} />
                </span>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Is your business prepared to consider an implementation
                    starting from $2,000?
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    The final investment depends on the agreed requirements,
                    integrations, complexity and implementation scope. This
                    is an initial readiness check, not a quotation.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  {
                    value: "yes" as const,
                    title: "Yes, we are prepared to invest",
                    description:
                      "We are looking for a serious operational solution.",
                  },
                  {
                    value: "maybe" as const,
                    title: "Possibly, depending on the scope",
                    description:
                      "We need to understand the solution and requirements first.",
                  },
                  {
                    value: "no" as const,
                    title: "No, not at this stage",
                    description:
                      "We are currently exploring lower-cost alternatives.",
                  },
                ].map((option) => {
                  const selected = readiness === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setReadiness(option.value);
                        setError("");
                      }}
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
                        {selected && (
                          <span className="h-2 w-2 rounded-full bg-white" />
                        )}
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
            </section>

            {readiness === "no" && (
              <p className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Thank you for being upfront. You can explore our approach
                and return when your business is ready to consider a
                structured implementation.
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!readiness || readiness === "no"}
              className="button-primary flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue to business assessment
              <ArrowRight size={17} />
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck size={15} />
              Your details are used for assessment and, with your consent,
              relevant follow-up.
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
