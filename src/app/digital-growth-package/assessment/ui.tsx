"use client";

import { trackEvent } from "@/lib/analytics";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  LoaderCircle,
  Send,
  UserRound,
} from "lucide-react";

type Message = {
  role: "assistant" | "user";
  content: string;
};

type QualificationContext = {
  fullName: string;
  email: string;
  businessName: string;
  website?: string;
  industry: string;
  primaryUseCase: string;
  monthlyEnquiries: string;
  expectedInvestment: string;
  source?: string;
  submittedAt?: string;
};

type ApiResponse = {
  message?: string;
  error?: string;
  qualification?: {
    status?: string;
    score?: number;
  };
  assessment?: {
    id?: string;
    completed?: boolean;
    summary?: string | null;
  };
  nextStep?: string;
  bookingUrl?: string | null;
};

const QUALIFICATION_KEY = "6ixtem_digital_growth_qualification";
const SESSION_KEY = "6ixtem_digital_growth_session";

function isValidContext(value: unknown): value is QualificationContext {
  if (!value || typeof value !== "object") return false;

  const context = value as Partial<QualificationContext>;

  return [
    context.fullName,
    context.email,
    context.businessName,
    context.industry,
    context.primaryUseCase,
    context.monthlyEnquiries,
    context.expectedInvestment,
  ].every((field) => typeof field === "string" && field.trim().length > 0);
}

function createSessionId() {
  return `dg_${crypto.randomUUID().replace(/-/g, "")}`;
}

export default function DigitalGrowthAssessment() {
  const [sessionId, setSessionId] = useState("");
  const [context, setContext] = useState<QualificationContext | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState("");
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  const sending = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(QUALIFICATION_KEY);

      if (!saved) return;

      const parsed: unknown = JSON.parse(saved);

      if (!isValidContext(parsed)) {
        setError("Your qualification details are incomplete. Please submit the form again.");
        return;
      }

      const existingSession = sessionStorage.getItem(SESSION_KEY);
      const nextSession =
        existingSession && /^dg_[a-zA-Z0-9_-]{10,100}$/.test(existingSession)
          ? existingSession
          : createSessionId();

      sessionStorage.setItem(SESSION_KEY, nextSession);

      setContext(parsed);
      setSessionId(nextSession);
      setMessages([
        {
          role: "assistant",
          content: `Welcome, ${parsed.fullName.trim().split(/\s+/)[0]}. We've received the initial information about ${parsed.businessName}. We'll use it to assess your digital growth needs without repeating the qualification form.`,
        },
        {
          role: "assistant",
          content:
            "What is the biggest challenge your business currently faces with its online visibility, advertising, or generating customer enquiries?",
        },
      ]);
    } catch {
      setError(
        "We could not load your qualification details. Please return to the form and try again."
      );
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = input.trim();

    if (
      !content ||
      !context ||
      !sessionId ||
      sending.current ||
      result?.assessment?.completed
    ) {
      return;
    }

    const nextMessages: Message[] = [
      ...messages,
      { role: "user", content },
    ];

    sending.current = true;
    setLoading(true);
    setError("");
    setInput("");
    setMessages(nextMessages);

    try {
      const response = await fetch("/api/digital-growth-package/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          messages: nextMessages,
          qualificationContext: context,
        }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "We could not process your response.");
      }

      if (!data.message?.trim()) {
        throw new Error("The assessment returned an empty response.");
      }

      setMessages([
        ...nextMessages,
        { role: "assistant", content: data.message },
      ]);
      setResult(data);

      // Analytics must not interrupt the assessment.
      try {
        if (nextMessages.filter((m) => m.role === "user").length === 1) {
          trackEvent("assessment_started", {
            assessment_type: "digital_growth_package",
          });
        }

        if (data.assessment?.completed && data.assessment.id) {
          const key = `6ixtem_dg_completed_${data.assessment.id}`;

          if (!sessionStorage.getItem(key)) {
            trackEvent("assessment_completed", {
              assessment_type: "digital_growth_package",
            });
            sessionStorage.setItem(key, "1");
          }
        }
      } catch {
        // Analytics are optional.
      }
    } catch (requestError) {
      setMessages(messages);
      setInput(content);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong. Please try again."
      );
    } finally {
      sending.current = false;
      setLoading(false);
    }
  }

  if (initializing) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
        <LoaderCircle className="animate-spin text-blue-600" size={22} />
        Loading your assessment…
      </div>
    );
  }

  if (!context) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-bold text-slate-950">
          Complete your business qualification first
        </h3>

        <p className="mt-3 leading-7 text-slate-600">
          We need your business details before starting the assessment.
          Complete the qualification form in this browser tab, then continue
          to the assessment.
        </p>

        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <Link
          href="/digital-growth-package/qualify"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Go to qualification form <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  const completed = result?.assessment?.completed === true;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-950">
              Digital Growth Assessment
            </h3>
            <p className="text-sm text-slate-500">
              {context.businessName}
            </p>
          </div>
        </div>
      </div>

      <div className="max-h-[480px] space-y-4 overflow-y-auto p-5">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              message.role === "user" ? "justify-end" : ""
            }`}
          >
            {message.role === "assistant" && (
              <Bot className="mt-1 shrink-0 text-blue-600" size={20} />
            )}

            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 leading-7 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              {message.content}
            </div>

            {message.role === "user" && (
              <UserRound className="mt-1 shrink-0 text-slate-500" size={20} />
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <LoaderCircle className="animate-spin text-blue-600" size={18} />
            Reviewing your response…
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-200 p-5">
        {error && (
          <p role="alert" className="mb-4 text-sm text-red-600">
            {error}
          </p>
        )}

        {completed ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-semibold text-slate-950">
              <CheckCircle2 className="text-blue-600" size={20} />
              Assessment complete
            </div>

            {result?.qualification?.status === "QUALIFIED" &&
            result.bookingUrl ? (
              <Link
                href={result.bookingUrl}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Book a consultation <ArrowRight size={18} />
              </Link>
            ) : (
              <p className="text-sm leading-6 text-slate-600">
                {result?.nextStep ||
                  "Your responses have been recorded. Our team can review your business requirements before the next step."}
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={sendMessage} className="space-y-3">
            <label
              htmlFor="growth-assessment-response"
              className="block text-sm font-semibold text-slate-700"
            >
              Your response
            </label>

            <textarea
              id="growth-assessment-response"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={3}
              maxLength={4000}
              required
              disabled={loading}
              placeholder="Describe your business growth needs…"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <LoaderCircle className="animate-spin" size={18} />
              ) : (
                <Send size={18} />
              )}
              Send response
            </button>
          </form>
        )}
      </div>
    </div>
  );
}