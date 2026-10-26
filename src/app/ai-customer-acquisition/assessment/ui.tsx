"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

const STORAGE_KEY = "6ixtem_customer_acquisition_qualification";

export default function CustomerAcquisitionAssessment() {
  const [sessionId, setSessionId] = useState("");
  const [qualificationContext, setQualificationContext] =
    useState<QualificationContext | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ApiResponse | null>(null);

  useEffect(() => {
    try {
      const savedContext = sessionStorage.getItem(STORAGE_KEY);

      if (!savedContext) {
        setInitializing(false);
        return;
      }

      const parsedContext = JSON.parse(
        savedContext,
      ) as QualificationContext;

      setQualificationContext(parsedContext);

      const existingSession = sessionStorage.getItem(
        "6ixtem_customer_acquisition_session",
      );

      const nextSession =
        existingSession ||
        `ca_${crypto.randomUUID().replace(/-/g, "")}`;

      sessionStorage.setItem(
        "6ixtem_customer_acquisition_session",
        nextSession,
      );

      setSessionId(nextSession);

      setMessages([
        {
          role: "assistant",
          content: `Welcome${parsedContext.fullName ? `, ${parsedContext.fullName.split(" ")[0]}` : ""}. I've got the initial information about ${parsedContext.businessName}. I'll use it as context, so we can focus on how your customer acquisition process works rather than repeating the form.`,
        },
        {
          role: "assistant",
          content: `You indicated that your main priority is: ${parsedContext.primaryUseCase}. To start, can you walk me through what currently happens when a potential customer first contacts your business?`,
        },
      ]);
    } catch {
      setError(
        "We could not load your initial answers. Please return to the qualification form and try again.",
      );
    } finally {
      setInitializing(false);
    }
  }, []);

  const userMessageCount = useMemo(
    () => messages.filter((message) => message.role === "user").length,
    [messages],
  );

  async function sendMessage(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    const content = input.trim();

    if (!content || loading || !sessionId || result?.assessment?.completed) {
      return;
    }

    setError("");
    setInput("");
    setLoading(true);

    const nextMessages: Message[] = [
      ...messages,
      { role: "user", content },
    ];

    setMessages(nextMessages);

    try {
      const response = await fetch(
        "/api/ai-customer-acquisition/assessment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            messages: nextMessages,
            qualificationContext,
          }),
        },
      );

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(
          data.error || "We could not process your response. Please try again.",
        );
      }

      if (!data.message) {
        throw new Error("The assessment returned an empty response.");
      }

      setMessages([
        ...nextMessages,
        { role: "assistant", content: data.message },
      ]);

      setResult(data);
    } catch (requestError) {
      setMessages(nextMessages);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong. Please try again.",
      );
      setInput(content);
    } finally {
      setLoading(false);
    }
  }

  if (initializing) {
    return (
      <div className="mt-10 flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-10 text-slate-600">
        <LoaderCircle size={20} className="animate-spin" />
        Preparing your assessment...
      </div>
    );
  }

  if (!qualificationContext) {
    return (
      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold">
          Complete your business qualification first
        </h2>
        <p className="mt-3 leading-7 text-slate-600">
          We use your initial business details to personalize this assessment.
          Please complete the short form before continuing.
        </p>
        <Link
          href="/ai-customer-acquisition/qualify"
          className="button-primary mt-6 inline-flex items-center gap-2"
        >
          Go to qualification form
          <ArrowRight size={17} />
        </Link>
      </div>
    );
  }

  const assessmentCompleted = result?.assessment?.completed === true;
  const consultationAvailable =
    result?.nextStep === "CONSULTATION_AVAILABLE" &&
    Boolean(result.bookingUrl);

  return (
    <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 p-5 sm:p-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
          <Bot size={23} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold">AI Customer Acquisition Assessment</h2>
          <p className="mt-1 text-sm text-slate-500">
            Exploring your process at {qualificationContext.businessName}
          </p>
        </div>
        <span className="hidden rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 sm:inline-flex">
          Step 2 of 2
        </span>
      </div>

      <div className="border-b border-slate-200 p-4 sm:p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Your initial details
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            qualificationContext.industry,
            qualificationContext.primaryUseCase,
            `Enquiries: ${qualificationContext.monthlyEnquiries}`,
            `Investment: ${qualificationContext.expectedInvestment}`,
          ].map((item) => (
            <span
              key={item}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div
        className="max-h-[560px] space-y-5 overflow-y-auto p-4 sm:p-6"
        aria-live="polite"
      >
        {messages.map((message, index) => {
          const isUser = message.role === "user";

          return (
            <div
              key={`${message.role}-${index}`}
              className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  isUser
                    ? "bg-slate-900 text-white"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {isUser ? <UserRound size={18} /> : <Bot size={18} />}
              </span>
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                  isUser
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-7">
                  {message.content}
                </p>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Bot size={18} />
            </span>
            <span className="flex items-center gap-2">
              <LoaderCircle size={16} className="animate-spin" />
              Reviewing your response...
            </span>
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mx-4 mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700 sm:mx-6"
        >
          {error}
        </div>
      )}

      {!assessmentCompleted && (
        <form
          onSubmit={sendMessage}
          className="border-t border-slate-200 bg-slate-50 p-4 sm:p-5"
        >
          <label htmlFor="assessment-answer" className="sr-only">
            Your answer
          </label>
          <div className="flex items-end gap-2">
            <textarea
              id="assessment-answer"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Describe how your process works..."
              rows={2}
              maxLength={4000}
              disabled={loading}
              className="min-h-[54px] flex-1 resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || !sessionId}
              className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send answer"
            >
              {loading ? (
                <LoaderCircle size={20} className="animate-spin" />
              ) : (
                <Send size={19} />
              )}
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {userMessageCount} responses submitted. Please do not include
            passwords or other sensitive credentials.
          </p>
        </form>
      )}

      {assessmentCompleted && (
        <div className="border-t border-slate-200 bg-slate-50 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2
              size={23}
              className="mt-0.5 shrink-0 text-blue-600"
            />
            <div>
              <h3 className="text-lg font-bold">Assessment completed</h3>
              <p className="mt-2 leading-7 text-slate-600">
                {result?.assessment?.summary ||
                  "Your responses have been recorded for review."}
              </p>

              {consultationAvailable && result?.bookingUrl && (
                <Link
                  href={result.bookingUrl}
                  className="button-primary mt-5 inline-flex items-center gap-2"
                >
                  Continue to consultation booking
                  <ArrowRight size={17} />
                </Link>
              )}

              {!consultationAvailable && (
                <p className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                  Your requirements may need further review before a
                  consultation is recommended. The assessment result reflects
                  the information collected and does not guarantee eligibility.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}