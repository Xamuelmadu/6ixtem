"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Video,
} from "lucide-react";

type Slot = { startAt: string; endAt: string; label: string };
type AvailabilityDate = { date: string; slots: Slot[] };
type AvailabilityResponse = {
  timeZone: string;
  durationMinutes: number;
  dates: AvailabilityDate[];
  error?: string;
};
type BookingResponse = {
  booking?: {
    id: string;
    startAt: string;
    endAt: string;
    attendeeName: string;
    attendeeEmail: string;
    timeZone: string;
    status: string;
    meetUrl: string | null;
  };
  meetUrl?: string | null;
  message?: string;
  error?: string;
};

const TIME_ZONE = "Africa/Lagos";
const DAYS_TO_FETCH = 14;

function localDateString(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatDate(
  dateString: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);

  return new Intl.DateTimeFormat("en-NG", {
    timeZone: TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    ...options,
  }).format(date);
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function BookingPageContent() {
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get("assessmentId") ?? "";

  const [fromDate, setFromDate] = useState(() =>
    localDateString(new Date()),
  );
  const [availability, setAvailability] = useState<AvailabilityDate[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] =
    useState<BookingResponse["booking"] | null>(null);
  const [meetUrl, setMeetUrl] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const selectedDay = useMemo(
    () => availability.find((day) => day.date === selectedDate),
    [availability, selectedDate],
  );

  useEffect(() => {
    if (!assessmentId) {
      setError(
        "Your assessment reference is missing. Return to your completed assessment and open its booking link.",
      );
      return;
    }

    let cancelled = false;

    async function loadAvailability() {
      setLoadingSlots(true);
      setError("");
      setSelectedSlot(null);

      try {
        const params = new URLSearchParams({
          assessmentId,
          from: fromDate,
          days: String(DAYS_TO_FETCH),
        });

        const response = await fetch(
          `/api/6ixtem/calendar/availability?${params.toString()}`,
          { cache: "no-store" },
        );

        const data =
          (await response.json()) as AvailabilityResponse;

        if (!response.ok) {
          throw new Error(
            data.error || "Could not load appointment availability.",
          );
        }

        if (cancelled) return;

        setAvailability(data.dates ?? []);
        setSelectedDate((current) => {
          if (
            current &&
            data.dates?.some(
              (day) => day.date === current && day.slots.length > 0,
            )
          ) {
            return current;
          }

          return (
            data.dates?.find((day) => day.slots.length > 0)?.date ?? ""
          );
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load appointment availability.",
          );
          setAvailability([]);
          setSelectedDate("");
        }
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    }

    void loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [assessmentId, fromDate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!assessmentId) {
      setError(
        "Your assessment reference is missing. Please return to your assessment.",
      );
      return;
    }

    if (!selectedSlot) {
      setError("Choose an available appointment time first.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/6ixtem/calendar/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId,
          attendeeName: name.trim(),
          attendeeEmail: email.trim(),
          startAt: selectedSlot.startAt,
        }),
      });

      const data = (await response.json()) as BookingResponse;

      if (!response.ok || !data.booking) {
        throw new Error(
          data.error || "Your booking could not be completed.",
        );
      }

      setBooking(data.booking);
      setMeetUrl(data.meetUrl ?? data.booking.meetUrl ?? null);
      setConfirmationMessage(
        data.message || "Your consultation has been booked.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Your booking could not be completed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function changeWindow(direction: -1 | 1) {
    const [year, month, day] = fromDate.split("-").map(Number);
    const current = new Date(Date.UTC(year, month - 1, day));
    current.setUTCDate(current.getUTCDate() + direction * 7);

    setFromDate(
      [
        current.getUTCFullYear(),
        String(current.getUTCMonth() + 1).padStart(2, "0"),
        String(current.getUTCDate()).padStart(2, "0"),
      ].join("-"),
    );
  }

  const earliestDate = localDateString(new Date());

  if (booking) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={30} />
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
              6ixtem consultation
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              You&apos;re booked.
            </h1>
            <p className="mt-3 leading-7 text-slate-600">
              {confirmationMessage} Check your inbox and calendar invitation at{" "}
              {booking.attendeeEmail}.
            </p>

            <div className="mt-8 space-y-4 rounded-2xl bg-slate-50 p-5">
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-1 text-blue-700" size={20} />
                <div>
                  <p className="font-semibold">
                    {formatDate(localDateString(new Date(booking.startAt)), {
                      weekday: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatTime(booking.startAt)} – {formatTime(booking.endAt)} WAT
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Video className="mt-1 text-blue-700" size={20} />
                <div>
                  <p className="font-semibold">Google Meet</p>
                  {meetUrl ? (
                    <a
                      className="mt-1 inline-block break-all font-medium text-blue-700 underline underline-offset-4"
                      href={meetUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Join your meeting
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-slate-600">
                      Google is preparing the meeting link. Check your calendar
                      invitation shortly.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <p className="mt-6 text-sm text-slate-500">
              Keep the calendar invitation for the confirmed meeting details.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <a
          href="/6ixtem"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-700"
        >
          <ArrowLeft size={16} />
          Back to 6ixtem
        </a>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:gap-12">
          <section>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
              Your next step
            </p>
            <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Let&apos;s talk about how your business operates.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              Choose a convenient time for a focused 30-minute consultation
              about your operations, bottlenecks, and the systems your business
              needs.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <CalendarDays className="text-blue-700" size={21} />
                <p className="mt-3 font-semibold">Weekdays</p>
                <p className="mt-1 text-sm text-slate-600">Monday–Friday</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <Clock3 className="text-blue-700" size={21} />
                <p className="mt-3 font-semibold">30 minutes</p>
                <p className="mt-1 text-sm text-slate-600">9 AM–5 PM WAT</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
              <p className="font-semibold text-slate-900">What we&apos;ll cover</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                <li>• Your current workflows and operational challenges</li>
                <li>• Where systems, automation, and AI may help</li>
                <li>• Scope, implementation priorities, and next steps</li>
              </ul>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Choose a time</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Times shown in West Africa Time (WAT).
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                UTC+1
              </span>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
              >
                {error}
              </div>
            )}

            {!assessmentId && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                Your assessment reference is missing. Open this page using the
                booking link shown after completing your assessment.
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => changeWindow(-1)}
                disabled={loadingSlots || fromDate <= earliestDate}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft size={16} />
                Previous
              </button>

              <p className="text-center text-sm font-semibold text-slate-800">
                {availability.length
                  ? `${formatDate(availability[0].date)} – ${formatDate(
                      availability[availability.length - 1].date,
                    )}`
                  : "Available dates"}
              </p>

              <button
                type="button"
                onClick={() => changeWindow(1)}
                disabled={loadingSlots}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ArrowRight size={16} />
              </button>
            </div>

            {loadingSlots ? (
              <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-slate-500">
                <LoaderCircle className="animate-spin" size={20} />
                Checking your calendar…
              </div>
            ) : availability.length === 0 ? (
              <div className="mt-5 rounded-xl bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                No available times were returned for this period. Try another
                date range.
              </div>
            ) : (
              <>
                <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
                  {availability.map((day) => {
                    const active = day.date === selectedDate;

                    return (
                      <button
                        key={day.date}
                        type="button"
                        onClick={() => {
                          setSelectedDate(day.date);
                          setSelectedSlot(null);
                        }}
                        disabled={day.slots.length === 0}
                        className={`min-w-[76px] rounded-2xl border px-3 py-3 text-center transition disabled:cursor-not-allowed disabled:opacity-35 ${
                          active
                            ? "border-blue-700 bg-blue-700 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                        }`}
                      >
                        <span className="block text-xs opacity-80">
                          {formatDate(day.date, { weekday: "short" })}
                        </span>
                        <span className="mt-1 block text-lg font-semibold">
                          {Number(day.date.slice(-2))}
                        </span>
                        <span className="mt-1 block text-[11px] opacity-80">
                          {day.slots.length
                            ? `${day.slots.length} slots`
                            : "Full"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-slate-800">
                    {selectedDay
                      ? formatDate(selectedDay.date, {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })
                      : "Available times"}
                  </h3>

                  {selectedDay?.slots.length ? (
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {selectedDay.slots.map((slot) => {
                        const active =
                          selectedSlot?.startAt === slot.startAt;

                        return (
                          <button
                            key={slot.startAt}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                              active
                                ? "border-blue-700 bg-blue-50 text-blue-800 ring-2 ring-blue-100"
                                : "border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/50"
                            }`}
                          >
                            {slot.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                      No open slots on this date. Choose another day.
                    </p>
                  )}
                </div>
              </>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-8 border-t border-slate-100 pt-6"
            >
              <h3 className="text-base font-semibold">Your details</h3>
              <p className="mt-1 text-sm text-slate-500">
                We&apos;ll send the calendar invitation to this email address.
              </p>

              <div className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="attendee-name"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Full name
                  </label>
                  <input
                    id="attendee-name"
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={120}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="attendee-email"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Email address
                  </label>
                  <input
                    id="attendee-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              {selectedSlot && (
                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                  <p className="font-semibold">Selected appointment</p>
                  <p className="mt-1">
                    {selectedDay
                      ? formatDate(selectedDay.date, {
                          weekday: "long",
                          year: "numeric",
                        })
                      : ""}
                    {" · "}
                    {formatTime(selectedSlot.startAt)} WAT
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  !assessmentId ||
                  !selectedSlot ||
                  submitting ||
                  loadingSlots
                }
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <LoaderCircle className="animate-spin" size={18} />
                    Confirming your booking…
                  </>
                ) : (
                  <>
                    Confirm consultation
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                Your appointment is confirmed only after the booking request
                succeeds. Google Calendar will send the invitation.
              </p>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}


export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-600">
          <span className="inline-flex items-center gap-3">
            <LoaderCircle className="animate-spin" size={20} />
            Loading booking page…
          </span>
        </main>
      }
    >
      <BookingPageContent />
    </Suspense>
  );
}
