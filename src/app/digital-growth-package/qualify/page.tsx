
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
      setError("Unable to save your details. Please try again.");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white";

  return (
    <main className="min-h-screen bg-[#07111f] px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/digital-growth-package"
          className="text-sm text-blue-400"
        >
          ← Back to package
        </Link>

        <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-blue-400">
          Step 1 of 2
        </p>
        <h1 className="mt-3 text-3xl font-bold">
          Business qualification
        </h1>
        <p className="mt-3 text-slate-300">
          Tell us about your business and readiness for the ₦300,000
          Digital Growth Package.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {[
            ["fullName", "Full name", "text"],
            ["email", "Email address", "email"],
            ["businessName", "Business name", "text"],
            ["website", "Website (optional)", "text"],
            ["industry", "Business industry", "text"],
          ].map(([name, label, type]) => (
            <div key={name}>
              <label htmlFor={name} className="mb-2 block text-sm font-medium">
                {label}
              </label>
              <input
                id={name}
                name={name}
                type={type}
                required={name !== "website"}
                className={inputClass}
              />
            </div>
          ))}

          <div>
            <label htmlFor="monthlyEnquiries" className="mb-2 block text-sm">
              Monthly customer enquiries
            </label>
            <select
              id="monthlyEnquiries"
              name="monthlyEnquiries"
              required
              defaultValue=""
              className={inputClass}
            >
              <option value="" disabled>Select a range</option>
              {["Fewer than 50", "50–200", "201–1,000", "More than 1,000", "Not sure"].map(
                (value) => <option key={value}>{value}</option>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="expectedInvestment" className="mb-2 block text-sm">
              Investment readiness
            </label>
            <select
              id="expectedInvestment"
              name="expectedInvestment"
              required
              defaultValue=""
              className={inputClass}
            >
              <option value="" disabled>Select an option</option>
              <option>Ready to invest ₦300,000</option>
              <option>Need to discuss the ₦300,000 package</option>
              <option>Not ready to invest ₦300,000 yet</option>
            </select>
          </div>

          {error && <p role="alert" className="text-red-400">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 px-6 py-4 font-semibold hover:bg-blue-500"
          >
            Continue to assessment
          </button>
        </form>
      </div>
    </main>
  );
}
