
"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  Globe,
  Mail,
  UserRound,
} from "lucide-react";

type QualificationForm = {
  fullName: string;
  email: string;
  businessName: string;
  website: string;
  industry: string;
  primaryUseCase: string;
  monthlyEnquiries: string;
  expectedInvestment: string;
};

const initialForm: QualificationForm = {
  fullName: "",
  email: "",
  businessName: "",
  website: "",
  industry: "",
  primaryUseCase: "",
  monthlyEnquiries: "",
  expectedInvestment: "",
};

const industries = [
  "Professional services and consulting",
  "Healthcare and care services",
  "Hospitality and reservations",
  "Cleaning and facilities management",
  "Real estate and property services",
  "Education and training",
  "E-commerce and retail",
  "Financial and business services",
  "Technology",
  "Other",
];

const useCases = [
  "Qualify leads before discovery calls",
  "Assess customers before offering a service",
  "Book appointments or reservations",
  "Answer repetitive customer questions",
  "Collect customer information automatically",
  "Manage multi-stage customer assessments",
  "Connect lead acquisition to our CRM or internal systems",
  "A combination of these",
];

const enquiryBands = [
  "Fewer than 50",
  "50–200",
  "201–1,000",
  "1,001–5,000",
  "More than 5,000",
  "Not sure",
];

const investmentBands = [
  "$1,500–$2,500",
  "$2,501–$5,000",
  "$5,001–$10,000",
  "More than $10,000",
  "I need to understand the scope before deciding",
];

function FieldLabel({
  children,
  htmlFor,
  required = false,
}: {
  children: React.ReactNode;
  htmlFor: string;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-sm font-semibold text-slate-800"
    >
      {children}
      {required && <span className="ml-1 text-blue-600">*</span>}
    </label>
  );
}

export default function CustomerAcquisitionQualificationPage() {
  const router = useRouter();

  const [form, setForm] = useState<QualificationForm>(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof QualificationForm>(
    key: K,
    value: QualificationForm[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.businessName.trim() ||
      !form.industry ||
      !form.primaryUseCase ||
      !form.monthlyEnquiries ||
      !form.expectedInvestment
    ) {
      setError("Please complete all required fields before continuing.");
      return;
    }

    const normalizedEmail = form.email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Enter a valid business email address.");
      return;
    }

    // Normalize the website into a local variable instead of mutating React state.
    let normalizedWebsite = form.website.trim();

    if (normalizedWebsite) {
      try {
        if (!/^https?:\/\//i.test(normalizedWebsite)) {
          normalizedWebsite = `https://${normalizedWebsite}`;
        }

        const parsedWebsite = new URL(normalizedWebsite);

        if (
          !["http:", "https:"].includes(parsedWebsite.protocol) ||
          !parsedWebsite.hostname.includes(".")
        ) {
          throw new Error("Invalid website");
        }

        normalizedWebsite = parsedWebsite.toString();
      } catch {
        setError("Enter a valid website address, or leave the field blank.");
        return;
      }
    }

    setSubmitting(true);

    try {
      sessionStorage.setItem(
        "6ixtem_customer_acquisition_qualification",
        JSON.stringify({
          ...form,
          fullName: form.fullName.trim(),
          email: normalizedEmail,
          businessName: form.businessName.trim(),
          website: normalizedWebsite,
          industry: form.industry,
          primaryUseCase: form.primaryUseCase,
          monthlyEnquiries: form.monthlyEnquiries,
          expectedInvestment: form.expectedInvestment,
          submittedAt: new Date().toISOString(),
        }),
      );

      router.push("/ai-customer-acquisition/assessment");
    } catch {
      setError(
        "Your browser could not save the form. Please enable session storage and try again.",
      );
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <nav className="container-main flex h-[72px] items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-[-0.07em]">
            6ixtem<span className="text-blue-600">.</span>
          </Link>

          <Link
            href="/ai-customer-acquisition"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            Product overview
          </Link>
        </nav>
      </header>

      <section className="container-main py-10 md:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <p className="eyebrow">
              Step 1 of 2 · Business qualification
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              Let&apos;s understand your business first.
            </h1>

            <p className="mt-5 max-w-2xl leading-7 text-slate-600">
              Before our AI assesses your customer acquisition process, tell
              us a little about your business. This helps us focus the
              assessment on the challenges that matter to you.
            </p>
          </div>

          <div className="mb-8 grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: UserRound,
                title: "Your business",
                description: "Tell us who you are",
              },
              {
                icon: ClipboardList,
                title: "Your requirements",
                description: "Identify the use case",
              },
              {
                icon: CheckCircle2,
                title: "AI assessment",
                description: "Explore your process",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <Icon size={20} className="text-blue-600" />
                  <p className="mt-3 font-bold">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
          >
            <div className="mb-7 flex items-start gap-3 border-b border-slate-200 pb-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Building2 size={22} />
              </span>

              <div>
                <h2 className="text-xl font-bold">
                  Business and contact details
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Fields marked with an asterisk are required.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="fullName" required>
                  Full name
                </FieldLabel>
                <input
                  id="fullName"
                  name="fullName"
                  autoComplete="name"
                  className={inputClass}
                  placeholder="Your full name"
                  value={form.fullName}
                  onChange={(event) =>
                    update("fullName", event.target.value)
                  }
                  required
                  maxLength={150}
                />
              </div>

              <div>
                <FieldLabel htmlFor="email" required>
                  Business email
                </FieldLabel>
                <div className="relative">
                  <Mail
                    size={17}
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className={`${inputClass} pl-10`}
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={(event) =>
                      update("email", event.target.value)
                    }
                    required
                    maxLength={254}
                  />
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="businessName" required>
                  Business name
                </FieldLabel>
                <input
                  id="businessName"
                  name="businessName"
                  autoComplete="organization"
                  className={inputClass}
                  placeholder="Your company"
                  value={form.businessName}
                  onChange={(event) =>
                    update("businessName", event.target.value)
                  }
                  required
                  maxLength={200}
                />
              </div>

              <div>
                <FieldLabel htmlFor="website">Business website</FieldLabel>
                <div className="relative">
                  <Globe
                    size={17}
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="website"
                    name="website"
                    type="text"
                    autoComplete="url"
                    className={`${inputClass} pl-10`}
                    placeholder="www.company.com"
                    value={form.website}
                    onChange={(event) =>
                      update("website", event.target.value)
                    }
                    maxLength={500}
                  />
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Optional. Leave blank if you do not have a website.
                </p>
              </div>

              <div className="sm:col-span-2">
                <FieldLabel htmlFor="industry" required>
                  Which industry does your business operate in?
                </FieldLabel>
                <select
                  id="industry"
                  name="industry"
                  className={inputClass}
                  value={form.industry}
                  onChange={(event) =>
                    update("industry", event.target.value)
                  }
                  required
                >
                  <option value="">Select your industry</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="my-8 border-t border-slate-200" />

            <div className="mb-6">
              <p className="text-lg font-bold">Your customer acquisition</p>
              <p className="mt-2 leading-7 text-slate-600">
                These answers help us tailor the next stage to your business.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <FieldLabel htmlFor="primaryUseCase" required>
                  What do you primarily want AI to help your business do?
                </FieldLabel>
                <select
                  id="primaryUseCase"
                  name="primaryUseCase"
                  className={inputClass}
                  value={form.primaryUseCase}
                  onChange={(event) =>
                    update("primaryUseCase", event.target.value)
                  }
                  required
                >
                  <option value="">Select your primary use case</option>
                  {useCases.map((useCase) => (
                    <option key={useCase} value={useCase}>
                      {useCase}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel htmlFor="monthlyEnquiries" required>
                  Approximately how many customer inquiries do you receive
                  each month?
                </FieldLabel>
                <select
                  id="monthlyEnquiries"
                  name="monthlyEnquiries"
                  className={inputClass}
                  value={form.monthlyEnquiries}
                  onChange={(event) =>
                    update("monthlyEnquiries", event.target.value)
                  }
                  required
                >
                  <option value="">Select monthly inquiry volume</option>
                  {enquiryBands.map((band) => (
                    <option key={band} value={band}>
                      {band}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  These ranges help us understand your operating context. They
                  are not automatic eligibility rules.
                </p>
              </div>

              <div>
                <FieldLabel htmlFor="expectedInvestment" required>
                  What is your expected implementation investment?
                </FieldLabel>
                <select
                  id="expectedInvestment"
                  name="expectedInvestment"
                  className={inputClass}
                  value={form.expectedInvestment}
                  onChange={(event) =>
                    update("expectedInvestment", event.target.value)
                  }
                  required
                >
                  <option value="">Select an investment range</option>
                  {investmentBands.map((band) => (
                    <option key={band} value={band}>
                      {band}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Custom implementations start from $1,500. Final pricing
                  depends on workflow scope and integration requirements.
                </p>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
              >
                {error}
              </p>
            )}

            <div className="mt-8 border-t border-slate-200 pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="button-primary inline-flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {submitting
                  ? "Preparing assessment..."
                  : "Continue to AI assessment"}
                <ArrowRight size={17} />
              </button>

              <p className="mt-4 text-xs leading-5 text-slate-500">
                Your answers personalize the assessment. The AI will explore
                your process in more detail; this form alone does not guarantee
                consultation eligibility.
              </p>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            6ixtem — Business systems, intelligently designed.
          </p>
        </div>
      </section>
    </main>
  );
}
