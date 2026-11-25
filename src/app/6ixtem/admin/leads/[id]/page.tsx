
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "CLOSED"
  | "LOST";

type Assessment = {
  id: string;
  assessmentType: string;
  status: string;
  qualificationStatus: string;
  qualificationScore: number;
  createdAt: string;
  completedAt: string | null;
};

type Lead = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  industry: string | null;
  status: LeadStatus;
  priority: number;
  assignedTo: string | null;
  score: number;
  budget: string | null;
  project: string | null;
  timeline: string | null;
  notes: string | null;
  message: string;
  lastContactedAt: string | null;
  createdAt: string;
  assessments: Assessment[];
};

const LEAD_STATUSES: {
  value: LeadStatus;
  label: string;
}[] = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "CLOSED", label: "Closed" },
  { value: "LOST", label: "Lost" },
];

const PRIORITY_OPTIONS = [
  { value: 0, label: "Low" },
  { value: 1, label: "Medium" },
  { value: 2, label: "High" },
  { value: 3, label: "Urgent" },
];

function getSourceLabel(type: string): string {
  switch (type) {
    case "BUSINESS_OS":
      return "Business OS";

    case "CUSTOMER_ACQUISITION":
      return "AI Customer Acquisition";

    default:
      return type.replace(/_/g, " ");
  }
}

function getAssessmentStatusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

function CRMLeadDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(
          `/api/6ixtem/admin/leads/${params.id}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        if (response.status === 401) {
          router.replace("/6ixtem/admin/login");
          return;
        }

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Unable to load lead.",
          );
        }

        if (!cancelled) {
          setLead(result.lead ?? result.data ?? null);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to load lead.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [params.id, router]);

  function updateField<K extends keyof Lead>(
    field: K,
    value: Lead[K],
  ) {
    setLead((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current,
    );
  }

  async function save() {
    if (!lead || saving) return;

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/6ixtem/admin/leads/${params.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: lead.name,
            phone: lead.phone,
            companyName: lead.companyName,
            industry: lead.industry,
            status: lead.status,
            priority: Number(lead.priority),
            assignedTo: lead.assignedTo,
            notes: lead.notes,
            score: Number(lead.score),
            budget: lead.budget,
            project: lead.project,
            timeline: lead.timeline,
          }),
        },
      );

      if (response.status === 401) {
        router.replace("/6ixtem/admin/login");
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to update lead.",
        );
      }

      const updatedLead: Lead | null =
        result.lead ?? result.data ?? null;

      if (updatedLead) {
        setLead(updatedLead);
      }

      setMessage("Lead updated successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Save failed.",
      );
    } finally {
      setSaving(false);
    }
  }

  const fieldClass =
    "mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100";

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-10 text-slate-600">
        Loading lead...
      </main>
    );
  }

  if (!lead) {
    return (
      <main className="min-h-screen bg-slate-50 p-10 text-slate-700">
        {message || "Lead not found."}

        <button
          onClick={() =>
            router.push("/6ixtem/admin/leads")
          }
          className="ml-4 underline"
        >
          Back to Leads
        </button>
      </main>
    );
  }

  const leadSources = Array.from(
    new Set(
      (lead.assessments ?? [])
        .map((assessment) => assessment.assessmentType)
        .filter(Boolean),
    ),
  );

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        {/* Navigation */}
        <button
          onClick={() =>
            router.push("/6ixtem/admin/leads")
          }
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Back to Leads
        </button>

        {/* Lead Header */}
        <header className="mt-5">
          <h1 className="text-3xl font-bold text-slate-900">
            {lead.name}
          </h1>

          <p className="mt-1 text-slate-500">
            {lead.email}
          </p>

          {lead.phone && (
            <p className="mt-1 text-sm text-slate-500">
              {lead.phone}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {leadSources.length > 0 ? (
              leadSources.map((source) => (
                <span
                  key={source}
                  className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                >
                  Source: {getSourceLabel(source)}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-400">
                No linked assessment source
              </span>
            )}
          </div>
        </header>

        {/* Lead Information */}
        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Lead information
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Name
              <input
                className={fieldClass}
                value={lead.name || ""}
                onChange={(e) =>
                  updateField("name", e.target.value)
                }
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Company
              <input
                className={fieldClass}
                value={lead.companyName || ""}
                onChange={(e) =>
                  updateField("companyName", e.target.value)
                }
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Industry
              <input
                className={fieldClass}
                value={lead.industry || ""}
                onChange={(e) =>
                  updateField("industry", e.target.value)
                }
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Assigned to
              <input
                className={fieldClass}
                value={lead.assignedTo || ""}
                onChange={(e) =>
                  updateField("assignedTo", e.target.value)
                }
                placeholder="Assign lead to..."
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Status
              <select
                className={fieldClass}
                value={lead.status || "NEW"}
                onChange={(e) =>
                  updateField(
                    "status",
                    e.target.value as LeadStatus,
                  )
                }
              >
                {LEAD_STATUSES.map((status) => (
                  <option
                    key={status.value}
                    value={status.value}
                  >
                    {status.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Priority
              <select
                className={fieldClass}
                value={Number(lead.priority ?? 0)}
                onChange={(e) =>
                  updateField(
                    "priority",
                    Number(e.target.value),
                  )
                }
              >
                {PRIORITY_OPTIONS.map((priority) => (
                  <option
                    key={priority.value}
                    value={priority.value}
                  >
                    {priority.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Lead score
              <input
                className={fieldClass}
                type="number"
                min={0}
                max={100}
                value={lead.score ?? 0}
                onChange={(e) =>
                  updateField(
                    "score",
                    Number(e.target.value),
                  )
                }
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Budget
              <input
                className={fieldClass}
                value={lead.budget || ""}
                onChange={(e) =>
                  updateField("budget", e.target.value)
                }
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Project
              <input
                className={fieldClass}
                value={lead.project || ""}
                onChange={(e) =>
                  updateField("project", e.target.value)
                }
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Timeline
              <input
                className={fieldClass}
                value={lead.timeline || ""}
                onChange={(e) =>
                  updateField("timeline", e.target.value)
                }
              />
            </label>
          </div>

          {/* CRM Notes */}
          <label className="mt-5 block text-sm font-medium text-slate-700">
            CRM Notes
            <textarea
              className={`${fieldClass} min-h-32`}
              value={lead.notes || ""}
              onChange={(e) =>
                updateField("notes", e.target.value)
              }
              placeholder="Add internal notes about this lead..."
            />
          </label>

          {lead.lastContactedAt && (
            <p className="mt-4 text-xs text-slate-500">
              Last contacted:{" "}
              {new Date(
                lead.lastContactedAt,
              ).toLocaleString()}
            </p>
          )}

          {message && (
            <p
              className={`mt-4 text-sm ${
                message.toLowerCase().includes("successfully")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}

          <button
            onClick={save}
            disabled={saving}
            className="mt-5 rounded-lg bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </section>

        {/* Assessment History */}
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Assessment history
            </h2>

            <span className="text-sm text-slate-500">
              {lead.assessments?.length ?? 0} assessment(s)
            </span>
          </div>

          {lead.assessments?.length ? (
            <div className="mt-4 divide-y divide-slate-100">
              {lead.assessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="py-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">
                      {getSourceLabel(
                        assessment.assessmentType,
                      )}
                    </p>

                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                      {assessment.assessmentType}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Assessment ID: {assessment.id}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Submitted:{" "}
                    {new Date(
                      assessment.createdAt,
                    ).toLocaleString()}
                  </p>

                  <p className="mt-2 text-sm text-slate-600">
                    Status:{" "}
                    {getAssessmentStatusLabel(
                      assessment.status,
                    )}
                  </p>

                  {assessment.qualificationStatus && (
                    <p className="mt-1 text-sm text-slate-600">
                      Qualification:{" "}
                      {getAssessmentStatusLabel(
                        assessment.qualificationStatus,
                      )}
                    </p>
                  )}

                  {assessment.qualificationScore !==
                    undefined && (
                    <p className="mt-1 text-sm text-slate-600">
                      Qualification score:{" "}
                      {assessment.qualificationScore}
                    </p>
                  )}

                  {assessment.completedAt && (
                    <p className="mt-1 text-xs text-slate-500">
                      Completed:{" "}
                      {new Date(
                        assessment.completedAt,
                      ).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No assessments linked to this lead.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}


export default function CRMLeadDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 p-10 text-slate-600">
          Loading lead...
        </main>
      }
    >
      <CRMLeadDetailContent />
    </Suspense>
  );
}
