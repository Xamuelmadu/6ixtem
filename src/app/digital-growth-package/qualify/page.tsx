"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";

export default function GrowthQualificationPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const data = Object.fromEntries(
      new FormData(event.currentTarget).entries()
    );

    try {
      sessionStorage.setItem(
        "6ixtem_digital_growth_qualification",
        JSON.stringify({
          fullName: String(data.fullName).trim(),
          email: String(data.email).trim(),
          businessName: String(data.businessName).trim(),
          website: String(data.website || "").trim(),
          industry: String(data.industry).trim(),
          monthlyEnquiries: String(data.monthlyEnquiries),
          expectedInvestment: String(data.expectedInvestment),
          primaryUseCase: "Digital Growth Package",
          source: "digital-growth-package",
          submittedAt: new Date().toISOString(),
        })
      );

      router.push("/digital-growth-package/assessment");
    } catch {
      setError(
        "Unable to save your details. Please try again."
      );
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  const fields = [
    {
      name: "fullName",
      label: "Full name",
      type: "text",
      placeholder: "Enter your full name",
      autoComplete: "name",
    },
    {
      name: "email",
      label: "Email address",
      type: "email",
      placeholder: "Enter your email address",
      autoComplete: "email",
    },
    {
      name: "businessName",
      label: "Business name",
      type: "text",
      placeholder: "Enter your business name",
      autoComplete: "organization",
    },
    {
      name: "website",
      label: "Website (optional)",
      type: "text",
      placeholder: "Enter your website address",
      autoComplete: "url",
    },
    {
      name: "industry",
      label: "Business industry",
      type: "text",
      placeholder: "e.g. Fashion, healthcare, engineering",
      autoComplete: "off",
    },
  ];

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
            href="/digital-growth-package"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Package overview
          </Link>
        </nav>
      </header>

      <section className="border-b border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-100">
        <div className="container-main py-14 md:py-20">
          <div className="mx-auto max-w-3xl">
            <p className="eyebrow">
              Digital Growth Package · Step 1 of 2
            </p>

            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-[-0.055em] sm:text-6xl md:text-7xl">
              Let&apos;s understand your business first.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Before we assess your digital growth needs, tell us
              about your business, your current online presence,
              and your readiness for the ₦300,000 package.
            </p>

            <p className="mt-4 max-w-2xl leading-7 text-slate-600">
              Your answers help us understand whether the promotional
              website, local SEO, and Meta advertising campaign are
              the right fit for your business.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                <Building2
                  size={22}
                  className="text-blue-600"
                  aria-hidden="true"
                />
                <h2 className="mt-3 font-bold">Your business</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Tell us who you are
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                <ClipboardList
                  size={22}
                  className="text-blue-600"
                  aria-hidden="true"
                />
                <h2 className="mt-3 font-bold">Your readiness</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Confirm your growth needs
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                <ShieldCheck
                  size={22}
                  className="text-blue-600"
                  aria-hidden="true"
                />
                <h2 className="mt-3 font-bold">Next step</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Digital growth assessment
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-main py-10 md:py-16">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">Business qualification</p>

          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Business and contact details
          </h2>

          <p className="mt-3 leading-7 text-slate-600">
            Fields marked with an asterisk are required.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >
            {fields.map(
              ({
                name,
                label,
                type,
                placeholder,
                autoComplete,
              }) => (
                <div key={name}>
                  <label
                    htmlFor={name}
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    {label}
                    {name !== "website" && (
                      <span className="text-blue-600"> *</span>
                    )}
                  </label>

                  <input
                    id={name}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    required={name !== "website"}
                    className={inputClass}
                  />
                </div>
              )
            )}

            <div>
              <label
                htmlFor="monthlyEnquiries"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Monthly customer enquiries{" "}
                <span className="text-blue-600">*</span>
              </label>

              <select
                id="monthlyEnquiries"
                name="monthlyEnquiries"
                required
                defaultValue=""
                className={inputClass}
              >
                <option value="" disabled>
                  Select a range
                </option>

                {[
                  "Fewer than 50",
                  "50–200",
                  "201–1,000",
                  "More than 1,000",
                  "Not sure",
                ].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="expectedInvestment"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Investment readiness{" "}
                <span className="text-blue-600">*</span>
              </label>

              <select
                id="expectedInvestment"
                name="expectedInvestment"
                required
                defaultValue=""
                className={inputClass}
              >
                <option value="" disabled>
                  Select an option
                </option>
                <option value="Ready to invest ₦300,000">
                  Ready to invest ₦300,000
                </option>
                <option value="Need to discuss the ₦300,000 package">
                  Need to discuss the ₦300,000 package
                </option>
                <option value="Not ready to invest ₦300,000 yet">
                  Not ready to invest ₦300,000 yet
                </option>
              </select>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="button-primary flex w-full items-center justify-center gap-2"
            >
              Continue to assessment
              <ArrowRight size={18} aria-hidden="true" />
            </button>

            <p className="text-center text-sm leading-6 text-slate-500">
              Your details will be used to personalize your Digital
              Growth Package assessment.
            </p>
          </form>

          <div className="mt-6">
            <Link
              href="/digital-growth-package"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back to package overview
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}