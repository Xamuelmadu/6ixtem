"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUp,
  Bot,
  CheckCircle2,
  Command,
  LoaderCircle,
  ShieldCheck,
  UserRound,
} from "lucide-react";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

type AssessmentResponse = {
  message: string;
  nextStep?: string;
  bookingUrl?: string;
  assessment?: {
    id?: string;
    status?: string;
    completed?: boolean;
  };
  qualification?: {
    status?: string;
    score?: number;
    reasons?: string[];
  };
  error?: string;
};

const SESSION_KEY = "6ixtem_assessment_session";
const READINESS_KEY = "6ixtem_investment_readiness";

export default function AssessmentChatPage() {
  const [sessionId, setSessionId] = useState("");
  const [readiness, setReadiness] = useState("maybe");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Welcome to your 6ixtem business assessment. I'll ask about your business, how your team operates, the challenges you face and what you want to improve. To begin, what is your business called, what service does it provide, and who are its typical clients?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qualification, setQualification] = useState("");

  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [bookingUrl, setBookingUrl] = useState("");
  const [completionType, setCompletionType] = useState<
    "qualified" | "closed" | ""
  >("");

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let id = sessionStorage.getItem(SESSION_KEY);

    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }

    setSessionId(id);

    const storedReadiness = sessionStorage.getItem(READINESS_KEY);

    if (storedReadiness) {
      setReadiness(storedReadiness);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading, assessmentComplete]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = input.trim();

    if (
      !content ||
      loading ||
      !sessionId ||
      assessmentComplete
    ) {
      return;
    }

    const nextMessages: ChatMessage[] = [
      ...messages,
      {
        role: "user",
        content,
      },
    ];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/6ixtem/assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          messages: nextMessages,
          investmentReadiness: readiness,
        }),
      });

      const data: AssessmentResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "The assessment could not be continued.",
        );
      }

      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            data.message ||
            "Thank you. Let's continue with your assessment.",
        },
      ]);

      if (data.qualification?.status) {
        setQualification(data.qualification.status);
      }

      /*
       * TERMINAL ASSESSMENT HANDLING
       *
       * The API must return one of these nextStep values:
       *
       * CONTINUE_ASSESSMENT
       * BOOK_CONSULTATION
       * ASSESSMENT_CLOSED
       *
       * Only BOOK_CONSULTATION with a valid bookingUrl
       * displays the booking button.
       */

      const isTerminalStep =
        data.nextStep === "BOOK_CONSULTATION" ||
        data.nextStep === "ASSESSMENT_CLOSED";

      const isCompleted = data.assessment?.completed === true;

      if (isTerminalStep || isCompleted) {
        setAssessmentComplete(true);

        const canBook =
          data.nextStep === "BOOK_CONSULTATION" &&
          typeof data.bookingUrl === "string" &&
          data.bookingUrl.trim().length > 0;

        if (canBook) {
          setBookingUrl(data.bookingUrl!.trim());
          setCompletionType("qualified");
        } else {
          setBookingUrl("");
          setCompletionType("closed");
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#f5f8ff]">
      <header className="border-b border-slate-200 bg-white">
        <nav className="container-main flex h-[72px] items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-black tracking-tight"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Command size={19} />
            </span>

            6ixtem
            <span className="text-blue-600">.</span>
          </Link>

          <Link
            href="/6ixtem/assessment"
            className="text-sm font-semibold text-slate-600 hover:text-blue-600"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft size={15} />
              Exit assessment
            </span>
          </Link>
        </nav>
      </header>

      <div className="container-main grid flex-1 gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_290px]">
        <section className="flex min-h-[70vh] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Chat header */}

          <div className="flex items-center gap-3 border-b border-slate-100 p-5 sm:px-7">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Bot size={23} />
            </span>

            <div>
              <h1 className="font-bold text-slate-900">
                Business assessment
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                AI-assisted operational discovery
              </p>
            </div>

            <span
              className={`ml-auto rounded-full px-3 py-1.5 text-xs font-bold ${
                assessmentComplete
                  ? "bg-slate-100 text-slate-700"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {assessmentComplete ? "Completed" : "Interactive"}
            </span>
          </div>

          {/* Conversation */}

          <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-7">
            {messages.map((message, index) => (
              <div
                key={`${index}-${message.role}`}
                className={`flex gap-3 ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Bot size={17} />
                  </span>
                )}

                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-7 sm:max-w-[78%] ${
                    message.role === "user"
                      ? "rounded-br-md bg-blue-600 text-white"
                      : "rounded-bl-md border border-slate-100 bg-slate-50 text-slate-700"
                  }`}
                >
                  {message.content}
                </div>

                {message.role === "user" && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-700">
                    <UserRound size={17} />
                  </span>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <LoaderCircle
                  size={17}
                  className="animate-spin text-blue-600"
                />

                Reviewing your response...
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* API errors */}

          {error && (
            <div className="mx-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:mx-7">
              {error}
            </div>
          )}

          {/* Terminal assessment screen */}

          {assessmentComplete ? (
            <div className="border-t border-slate-100 bg-slate-50 p-5 sm:p-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                    <CheckCircle2 size={22} />
                  </span>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      {completionType === "qualified"
                        ? "Your assessment is complete"
                        : "Your assessment has concluded"}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {completionType === "qualified"
                        ? "Thank you. Based on your responses, the next step is to book a consultation with the 6ixtem team. Choose an available time on the booking page."
                        : "Thank you for sharing information about your business. Based on the assessment outcome, a consultation booking is not available at this stage."}
                    </p>
                  </div>
                </div>

                {completionType === "qualified" && bookingUrl && (
                  <Link
                    href={bookingUrl}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 sm:w-auto"
                  >
                    Continue to booking
                    <ArrowUp
                      size={16}
                      className="rotate-45"
                    />
                  </Link>
                )}

                {completionType === "qualified" && !bookingUrl && (
                  <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    Your assessment is complete, but the booking link was
                    not returned. Please contact the 6ixtem team for
                    assistance.
                  </p>
                )}

                {completionType === "closed" && (
                  <Link
                    href="/6ixtem"
                    className="mt-5 inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Return to 6ixtem
                  </Link>
                )}
              </div>
            </div>
          ) : (
            /* Active assessment input */

            <form
              onSubmit={sendMessage}
              className="border-t border-slate-100 p-4 sm:p-6"
            >
              <div className="flex items-end gap-3 rounded-xl border border-slate-200 bg-white p-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  rows={2}
                  maxLength={5000}
                  placeholder="Tell us about your business..."
                  className="max-h-36 min-h-[48px] flex-1 resize-y bg-transparent px-3 py-2 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400"
                  disabled={loading || !sessionId || assessmentComplete}
                />

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !input.trim() ||
                    !sessionId ||
                    assessmentComplete
                  }
                  aria-label="Send response"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? (
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <ArrowUp size={19} />
                  )}
                </button>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Press Enter to send. Use Shift + Enter for a new line.
              </p>
            </form>
          )}
        </section>

        {/* Assessment sidebar */}

        <aside className="space-y-4">
          <div className="surface-card p-5">
            <h2 className="font-bold text-slate-900">
              What we are assessing
            </h2>

            <div className="mt-4 space-y-4">
              {[
                "Business profile and service model",
                "Team structure and responsibilities",
                "Operational challenges",
                "Current tools and workflows",
                "Required improvements",
                "Investment and decision readiness",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2.5 text-sm leading-6 text-slate-600"
                >
                  <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <ShieldCheck
                size={18}
                className="text-blue-600"
              />

              Your assessment
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Your responses help us understand whether the 6ixtem
              approach matches your business. Qualification is not a
              guarantee of acceptance or a final implementation quote.
            </p>

            {qualification && (
              <p className="mt-4 rounded-lg bg-blue-50 p-3 text-xs font-bold text-blue-800">
                Current assessment status:{" "}
                {qualification.replaceAll("_", " ")}
              </p>
            )}

            {assessmentComplete && (
              <p className="mt-3 rounded-lg bg-slate-100 p-3 text-xs font-semibold text-slate-700">
                This assessment session is closed.
              </p>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}