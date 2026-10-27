
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

type BusinessOSQualification = {
  fullName: string;
  email: string;
  businessName: string;
  industry: string;
  teamSize: string;
  investmentReadiness: "yes" | "maybe" | "no";
  submittedAt: string;
};

type AssessmentResponse = {
  message: string;
  nextStep?: string;
  bookingUrl?: string | null;
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
const QUALIFICATION_KEY = "6ixtem_business_os_qualification";

type FunnelStep =
  | "DISCOVERY"
  | "AWAITING_CONSENT"
  | "COLLECTING_NAME"
  | "COLLECTING_EMAIL"
  | "BOOKING_LINK_SENT"
  | "ASSESSMENT_CLOSED";

const INITIAL_MESSAGE =
  "Welcome to your 6ixtem business assessment. I'll ask about your business, how your team operates, the challenges you face and what you want to improve. To begin, what is your business called, what service does it provide, and who are its typical clients?";

function isQualificationContext(
  value: unknown
): value is BusinessOSQualification {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.fullName === "string" &&
    item.fullName.trim().length >= 2 &&
    typeof item.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email) &&
    typeof item.businessName === "string" &&
    item.businessName.trim().length >= 2 &&
    typeof item.industry === "string" &&
    item.industry.trim().length >= 2 &&
    typeof item.teamSize === "string" &&
    ["yes", "maybe", "no"].includes(
      String(item.investmentReadiness)
    )
  );
}

export default function AssessmentChatPage() {
  const [sessionId, setSessionId] = useState("");
  const [readiness, setReadiness] = useState<"yes" | "maybe" | "no">(
    "maybe"
  );
  const [qualificationContext, setQualificationContext] =
    useState<BusinessOSQualification | null>(null);
  const [contextLoaded, setContextLoaded] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: INITIAL_MESSAGE,
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qualification, setQualification] = useState("");
  const [funnelStep, setFunnelStep] =
    useState<FunnelStep>("DISCOVERY");
  const [assessmentId, setAssessmentId] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  const isTerminal =
    funnelStep === "BOOKING_LINK_SENT" ||
    funnelStep === "ASSESSMENT_CLOSED";

  const isAssessmentCompleted = funnelStep !== "DISCOVERY";

  useEffect(() => {
    let id = sessionStorage.getItem(SESSION_KEY);

    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }

    setSessionId(id);

    const storedReadiness = sessionStorage.getItem(READINESS_KEY);

    if (
      storedReadiness === "yes" ||
      storedReadiness === "maybe" ||
      storedReadiness === "no"
    ) {
      setReadiness(storedReadiness);
    }

    const storedQualification = sessionStorage.getItem(QUALIFICATION_KEY);

    if (storedQualification) {
      try {
        const parsed: unknown = JSON.parse(storedQualification);

        if (isQualificationContext(parsed)) {
          setQualificationContext(parsed);

          // Keep the readiness checkpoint aligned with the submitted form.
          setReadiness(parsed.investmentReadiness);
          sessionStorage.setItem(
            READINESS_KEY,
            parsed.investmentReadiness
          );

          setMessages([
            {
              role: "assistant",
              content: `Welcome, ${parsed.fullName}. Let's assess how ${parsed.businessName} operates today and where a tailored business operating system could help. I'll use the details you've already provided and focus on your workflows, challenges, current tools and desired improvements. What is the biggest operational challenge your business needs to solve right now?`,
            },
          ]);
        } else {
          sessionStorage.removeItem(QUALIFICATION_KEY);
        }
      } catch {
        sessionStorage.removeItem(QUALIFICATION_KEY);
      }
    }

    setContextLoaded(true);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading, funnelStep]);

  function getPlaceholder(): string {
    switch (funnelStep) {
      case "AWAITING_CONSENT":
        return "Type yes or no...";
      case "COLLECTING_NAME":
        return "Enter your full name...";
      case "COLLECTING_EMAIL":
        return "Enter your email address...";
      default:
        return "Tell us about your business...";
    }
  }

  function getInputLabel(): string {
    switch (funnelStep) {
      case "AWAITING_CONSENT":
        return "Would you like to continue?";
      case "COLLECTING_NAME":
        return "Your name";
      case "COLLECTING_EMAIL":
        return "Your email address";
      default:
        return "Your response";
    }
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = input.trim();

    if (
      !content ||
      loading ||
      !sessionId ||
      !contextLoaded ||
      isTerminal
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
          qualificationContext,
        }),
      });

      const data: AssessmentResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "The assessment could not be continued."
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

      if (data.assessment?.id) {
        setAssessmentId(data.assessment.id);
      }

      switch (data.nextStep) {
        case "CONTINUE_ASSESSMENT":
          setFunnelStep("DISCOVERY");
          setBookingUrl("");
          break;

        case "AWAITING_CONSENT":
          setFunnelStep("AWAITING_CONSENT");
          setBookingUrl("");
          break;

        case "COLLECTING_NAME":
          setFunnelStep("COLLECTING_NAME");
          setBookingUrl("");
          break;

        case "COLLECTING_EMAIL":
          setFunnelStep("COLLECTING_EMAIL");
          setBookingUrl("");
          break;

        case "BOOKING_LINK_SENT":
          setFunnelStep("BOOKING_LINK_SENT");
          setBookingUrl(
            typeof data.bookingUrl === "string" ? data.bookingUrl : ""
          );
          break;

        case "ASSESSMENT_CLOSED":
          setFunnelStep("ASSESSMENT_CLOSED");
          setBookingUrl("");
          break;

        default:
          if (
            data.assessment?.completed &&
            data.qualification?.status &&
            data.qualification.status !== "QUALIFIED"
          ) {
            setFunnelStep("ASSESSMENT_CLOSED");
          }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );

      // Preserve the user's response if the request failed.
      setInput(content);
      setMessages(messages);
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
                isTerminal
                  ? "bg-slate-100 text-slate-700"
                  : isAssessmentCompleted
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-blue-50 text-blue-700"
              }`}
            >
              {funnelStep === "BOOKING_LINK_SENT"
                ? "Email sent"
                : funnelStep === "ASSESSMENT_CLOSED"
                  ? "Concluded"
                  : isAssessmentCompleted
                    ? "Assessment complete"
                    : "Interactive"}
            </span>
          </div>

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
                {funnelStep === "DISCOVERY"
                  ? "Reviewing your response..."
                  : "Processing your response..."}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {error && (
            <div
              role="alert"
              className="mx-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:mx-7"
            >
              {error}
            </div>
          )}

          {funnelStep === "BOOKING_LINK_SENT" && (
            <div className="border-t border-slate-100 bg-slate-50 p-5 sm:p-6">
              <div className="rounded-2xl border border-emerald-200 bg-white p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <CheckCircle2 size={22} />
                  </span>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Check your email
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Your assessment confirmation and consultation
                      booking link have been sent. Open the email and use
                      the link to choose a suitable consultation time. If
                      it is not in your inbox, check your spam or junk
                      folder.
                    </p>
                  </div>
                </div>

                {bookingUrl && (
                  <Link
                    href={bookingUrl}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 sm:w-auto"
                  >
                    Open booking page
                    <ArrowUp size={16} className="rotate-45" />
                  </Link>
                )}
              </div>
            </div>
          )}

          {funnelStep === "ASSESSMENT_CLOSED" && (
            <div className="border-t border-slate-100 bg-slate-50 p-5 sm:p-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                    <CheckCircle2 size={22} />
                  </span>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Thank you for your time
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      This assessment session has concluded. You are
                      welcome to return to 6ixtem whenever you are ready
                      to explore your business requirements further.
                    </p>
                  </div>
                </div>

                <Link
                  href="/6ixtem"
                  className="mt-5 inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Return to 6ixtem
                </Link>
              </div>
            </div>
          )}

          {!isTerminal && (
            <form
              onSubmit={sendMessage}
              className="border-t border-slate-100 p-4 sm:p-6"
            >
              {funnelStep === "AWAITING_CONSENT" && (
                <div className="mb-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
                  You can choose to receive your assessment and booking
                  link by email, or decline without receiving follow-up.
                </div>
              )}

              <label
                htmlFor="assessment-message"
                className="mb-2 block text-xs font-semibold text-slate-500"
              >
                {getInputLabel()}
              </label>

              <div className="flex items-end gap-3 rounded-xl border border-slate-200 bg-white p-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                <textarea
                  id="assessment-message"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  rows={2}
                  maxLength={5000}
                  placeholder={getPlaceholder()}
                  autoComplete={
                    funnelStep === "COLLECTING_EMAIL"
                      ? "email"
                      : funnelStep === "COLLECTING_NAME"
                        ? "name"
                        : "off"
                  }
                  className="max-h-36 min-h-[48px] flex-1 resize-y bg-transparent px-3 py-2 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400"
                  disabled={loading || !sessionId || !contextLoaded}
                />

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !input.trim() ||
                    !sessionId ||
                    !contextLoaded
                  }
                  aria-label="Send response"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? (
                    <LoaderCircle size={18} className="animate-spin" />
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
              <ShieldCheck size={18} className="text-blue-600" />
              Your assessment
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Your responses help us understand whether the 6ixtem
              approach matches your business. Qualification is not a
              guarantee of acceptance or a final implementation quote.
            </p>

            {qualification && (
              <p className="mt-4 rounded-lg bg-blue-50 p-3 text-xs font-bold text-blue-800">
                Assessment status: {qualification.replaceAll("_", " ")}
              </p>
            )}

            {isAssessmentCompleted && !isTerminal && (
              <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
                Assessment complete. Follow the conversation to finish
                the next steps.
              </p>
            )}

            {qualificationContext && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Initial details
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {qualificationContext.businessName}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {qualificationContext.industry} · Team{" "}
                  {qualificationContext.teamSize}
                </p>
              </div>
            )}

            {assessmentId && (
              <p className="mt-3 break-all text-xs text-slate-400">
                Assessment reference: {assessmentId}
              </p>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
