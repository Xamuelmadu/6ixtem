"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle, Send } from "lucide-react";

type Message = {
  role: "assistant" | "user";
  content: string;
};

type ApiResult = {
  message: string;
  assessment?: {
    id?: string;
    completed?: boolean;
    summary?: string;
  };
  qualification?: {
    status: string;
    score: number;
  };
  nextStep?: string;
  bookingUrl?: string | null;
};

function makeSessionId() {
  return `ca_${crypto.randomUUID().replace(/-/g, "")}`;
}

export default function CustomerAcquisitionAssessment() {
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSessionId(makeSessionId());

    setMessages([
      {
        role: "assistant",
        content:
          "Let's start with your business. What do you sell or what service do you provide, and who are your typical customers?",
      },
    ]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, busy]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = input.trim();

    if (!content || busy || !sessionId) {
      return;
    }

    const nextMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content,
      },
    ];

    setMessages(nextMessages);
    setInput("");
    setBusy(true);

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
          }),
        },
      );

      const data = (await response.json()) as ApiResult & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          data.error || "We couldn't process that answer. Please try again.",
        );
      }

      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: data.message,
        },
      ]);

      setResult(data);
    } catch (error) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  const completed = result?.assessment?.completed === true;

  const canBook =
    completed &&
    result?.qualification?.status === "QUALIFIED" &&
    !!result?.assessment?.id;

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
        <div>
          <p className="font-bold">Customer acquisition assessment</p>
          <p className="mt-1 text-xs text-slate-500">
            Your answers prepare an initial assessment.
          </p>
        </div>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
          AI guided
        </span>
      </div>

      <div className="max-h-[520px] min-h-[320px] space-y-4 overflow-y-auto bg-slate-50 p-4 sm:p-6">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-7 ${
                message.role === "user"
                  ? "rounded-br-md bg-blue-600 text-white"
                  : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <LoaderCircle size={16} className="animate-spin" />
            Reviewing your answer…
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {completed ? (
        <div className="border-t border-slate-200 p-5 sm:p-6">
          <h2 className="text-lg font-bold">Assessment complete</h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {canBook
              ? "Your responses indicate that a consultation may be a useful next step. Continue to choose a time and provide your contact details."
              : "Thank you for sharing information about your process. We may need to review your requirements before recommending a consultation."}
          </p>

          {canBook && (
            <Link
              href={`/6ixtem/assessment/booking?assessmentId=${encodeURIComponent(
                result!.assessment!.id!,
              )}`}
              className="button-primary mt-5"
            >
              Continue to consultation booking <ArrowRight size={16} />
            </Link>
          )}

          <Link
            href="/ai-customer-acquisition"
            className="mt-5 block text-sm font-semibold text-slate-500 hover:text-blue-600"
          >
            Return to product page
          </Link>
        </div>
      ) : (
        <form
          onSubmit={submit}
          className="flex gap-3 border-t border-slate-200 p-4 sm:p-5"
        >
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={busy || !sessionId}
            rows={2}
            maxLength={4000}
            placeholder="Type your answer…"
            className="min-w-0 flex-1 resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
          />

          <button
            type="submit"
            disabled={busy || !input.trim() || !sessionId}
            aria-label="Send answer"
            className="flex h-12 w-12 shrink-0 items-center justify-center self-end rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <LoaderCircle size={19} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
      )}
    </div>
  );
}