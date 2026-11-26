
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "CLOSED"
  | "LOST";

type AssessmentType =
  | "BUSINESS_OS"
  | "CUSTOMER_ACQUISITION";

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
  phone?: string | null;
  companyName: string | null;
  industry: string | null;
  status: LeadStatus;
  priority: number;
  assignedTo: string | null;
  score?: number;
  createdAt: string;
  assessments: Assessment[];
};

type LeadsResponse = {
  success?: boolean;
  message?: string;
  data?: Lead[];
  pagination?: {
    total: number;
    totalPages: number;
    page?: number;
    limit?: number;
  };
  leads?: Lead[];
  total?: number;
  totalPages?: number;
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

const PRIORITY_LABELS: Record<number, string> = {
  0: "Low",
  1: "Medium",
  2: "High",
  3: "Urgent",
};

const SOURCE_OPTIONS: {
  value: AssessmentType | "";
  label: string;
}[] = [
  { value: "", label: "All sources" },
  {
    value: "BUSINESS_OS",
    label: "Business OS",
  },
  {
    value: "CUSTOMER_ACQUISITION",
    label: "AI Customer Acquisition",
  },
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

function getPriorityLabel(priority: number): string {
  return PRIORITY_LABELS[priority] ?? "Low";
}

function getStatusClass(status: LeadStatus): string {
  switch (status) {
    case "NEW":
      return "bg-blue-50 text-blue-700";

    case "CONTACTED":
      return "bg-amber-50 text-amber-700";

    case "QUALIFIED":
      return "bg-green-50 text-green-700";

    case "CLOSED":
      return "bg-slate-100 text-slate-700";

    case "LOST":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getPriorityClass(priority: number): string {
  switch (priority) {
    case 1:
      return "bg-blue-50 text-blue-700";

    case 2:
      return "bg-amber-50 text-amber-700";

    case 3:
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getLeadSources(lead: Lead): string[] {
  return Array.from(
    new Set(
      (lead.assessments ?? [])
        .map((assessment) => assessment.assessmentType)
        .filter(Boolean),
    ),
  );
}

export default function CRMLeadsPage() {
  const router = useRouter();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LeadStatus | "">("");
  const [source, setSource] = useState<AssessmentType | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (status) {
        params.set("status", status);
      }

      if (source) {
        params.set("source", source);
      }

      const response = await fetch(
        `/api/6ixtem/admin/leads?${params.toString()}`,
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

      const result: LeadsResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to load leads.",
        );
      }

      const leadData = result.data ?? result.leads ?? [];

      const paginationTotal =
        result.pagination?.total ?? result.total ?? 0;

      const paginationPages =
        result.pagination?.totalPages ??
        result.totalPages ??
        1;

      setLeads(leadData);
      setTotal(paginationTotal);
      setTotalPages(Math.max(1, paginationPages));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Request failed.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, status, source, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadLeads();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadLeads]);

  async function logout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch(
        "/api/6ixtem/admin/logout",
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error(
          "Unable to log out. Please try again.",
        );
      }

      router.replace("/6ixtem/admin/login");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Logout failed.",
      );

      setLoggingOut(false);
    }
  }

  function openLead(id: number) {
    router.push(`/6ixtem/admin/leads/${id}`);
  }

  return (
    <main className="min-h-screen bg-[#eef3fc] p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#1854d8]">
              6ixtem / Business OS
            </p>

            <h1 className="text-4xl font-extrabold tracking-tight text-[#080f25]">
              CRM Leads
            </h1>

            <p className="mt-1 text-[#52627c]">
              Manage assessment leads and customer relationships.
            </p>
          </div>

          <button
            onClick={logout}
            disabled={loggingOut}
            className="rounded-lg border border-[#1854d8] bg-[#1854d8] px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#14264c] bg-[#101a33] p-6">
            <p className="text-sm text-blue-200">
              Total leads
            </p>

            <p className="mt-2 text-4xl font-extrabold tracking-tight text-[#080f25]">
              {total}
            </p>
          </div>

          <div className="rounded-2xl border border-[#d7e2f3] bg-white p-5">
            <p className="text-sm text-[#52627c]">
              Current page
            </p>

            <p className="mt-2 text-4xl font-extrabold tracking-tight text-[#080f25]">
              {page} / {totalPages}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[#d7e2f3] bg-white p-5">
          <div className="flex flex-wrap gap-3">
            <input
              type="search"
              placeholder="Search name, email or company..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="min-w-[240px] flex-1 rounded-lg border border-[#d7e2f3] px-4 py-2 text-sm text-[#080f25] outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
            />

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as LeadStatus | "");
                setPage(1);
              }}
              className="rounded-lg border border-[#d7e2f3] bg-white px-4 py-2 text-sm text-[#080f25] outline-none focus:border-slate-500"
            >
              <option value="">All statuses</option>

              {LEAD_STATUSES.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={source}
              onChange={(e) => {
                setSource(
                  e.target.value as AssessmentType | "",
                );
                setPage(1);
              }}
              className="min-w-[210px] rounded-lg border border-[#d7e2f3] bg-white px-4 py-2 text-sm text-[#080f25] outline-none focus:border-slate-500"
            >
              {SOURCE_OPTIONS.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
              {error}

              <button
                onClick={() => void loadLeads()}
                className="ml-2 font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="border-b bg-slate-50 text-[#52627c]">
                <tr>
                  <th className="px-4 py-3 font-medium">
                    Lead
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Company
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Industry
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Source
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Priority
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Assessments
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Date added
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-[#52627c]"
                    >
                      Loading leads...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-[#52627c]"
                    >
                      No leads found.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => {
                    const sources = getLeadSources(lead);

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => openLead(lead.id)}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" ||
                            e.key === " "
                          ) {
                            e.preventDefault();
                            openLead(lead.id);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        className="cursor-pointer transition hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                      >
                        <td className="px-4 py-4">
                          <p className="font-medium text-[#080f25]">
                            {lead.name}
                          </p>

                          <p className="text-[#52627c]">
                            {lead.email}
                          </p>

                          {lead.assignedTo && (
                            <p className="mt-1 text-xs text-slate-400">
                              Assigned to: {lead.assignedTo}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-4 text-slate-700">
                          {lead.companyName || "—"}
                        </td>

                        <td className="px-4 py-4 text-slate-700">
                          {lead.industry || "—"}
                        </td>

                        <td className="px-4 py-4">
                          {sources.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {sources.map((item) => (
                                <span
                                  key={item}
                                  className="inline-flex rounded-full bg-[#e8f0ff] px-2.5 py-1 text-xs font-medium text-[#1854d8]"
                                >
                                  {getSourceLabel(item)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400">
                              No assessment source
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                              lead.status,
                            )}`}
                          >
                            {LEAD_STATUSES.find(
                              (item) =>
                                item.value === lead.status,
                            )?.label ?? lead.status}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getPriorityClass(
                              lead.priority,
                            )}`}
                          >
                            {getPriorityLabel(lead.priority)}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-slate-700">
                          {lead.assessments?.length ?? 0}
                        </td>

                        <td className="px-4 py-4 text-[#52627c]">
                          {new Date(
                            lead.createdAt,
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <footer className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-[#52627c]">
              Page {page} of {totalPages}
              <span className="ml-2">
                ({total} total leads)
              </span>
            </p>

            <div className="flex gap-2">
              <button
                disabled={page <= 1 || loading}
                onClick={() =>
                  setPage((current) => current - 1)
                }
                className="rounded-lg border border-[#d7e2f3] px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                disabled={page >= totalPages || loading}
                onClick={() =>
                  setPage((current) => current + 1)
                }
                className="rounded-lg border border-[#d7e2f3] px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
}
