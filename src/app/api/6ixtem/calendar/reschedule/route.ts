
import crypto from "node:crypto";
import {
  BookingStatus,
  Prisma,
} from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import {
  CONSULTATION_MINUTES,
  CONSULTATION_TIME_ZONE,
  getBusyIntervals,
  getCalendarClient,
  isValidConsultationSlot,
} from "@/lib/6ixtem-google-calendar";

function isAuthorized(request: Request): boolean {
  const expected = process.env.BOOKING_MANAGEMENT_SECRET;
  const supplied = request.headers.get("x-booking-management-secret");

  return Boolean(expected && supplied && supplied === expected);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 },
    );
  }

  if (
    !isRecord(body) ||
    typeof body.bookingId !== "string" ||
    typeof body.startAt !== "string"
  ) {
    return NextResponse.json(
      { error: "bookingId and startAt are required." },
      { status: 400 },
    );
  }

  const bookingId = body.bookingId.trim();
  const startAt = new Date(body.startAt);

  if (
    !bookingId ||
    !Number.isFinite(startAt.getTime()) ||
    !isValidConsultationSlot(startAt)
  ) {
    return NextResponse.json(
      { error: "Choose a valid future consultation slot." },
      { status: 400 },
    );
  }

  const endAt = new Date(
    startAt.getTime() + CONSULTATION_MINUTES * 60_000,
  );

  let newGoogleEventId: string | null = null;
  let databaseCommitted = false;

  try {
    const oldBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        assessment: {
          select: {
            id: true,
            businessName: true,
            assessmentSummary: true,
          },
        },
      },
    });

    if (!oldBooking) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 },
      );
    }

    if (oldBooking.status !== BookingStatus.BOOKED) {
      return NextResponse.json(
        {
          error: "Only an active booking can be rescheduled.",
        },
        { status: 409 },
      );
    }

    if (startAt.getTime() === oldBooking.startAt.getTime()) {
      return NextResponse.json(
        { error: "Choose a different time to reschedule." },
        { status: 400 },
      );
    }

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        status: BookingStatus.BOOKED,
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
      select: { id: true },
    });

    if (conflictingBooking) {
      return NextResponse.json(
        {
          error: "That slot is already booked. Choose another time.",
        },
        { status: 409 },
      );
    }

    const busy = await getBusyIntervals(startAt, endAt);

    if (
      busy.some(
        (interval) => startAt < interval.end && endAt > interval.start,
      )
    ) {
      return NextResponse.json(
        {
          error: "That time is no longer available in Google Calendar.",
        },
        { status: 409 },
      );
    }

    const { calendar, calendarId } = await getCalendarClient();

    const eventResponse = await calendar.events.insert({
      calendarId,
      conferenceDataVersion: 1,
      sendUpdates: "all",
      requestBody: {
        summary: `6ixtem Consultation${
          oldBooking.assessment.businessName
            ? ` — ${oldBooking.assessment.businessName}`
            : ""
        }`,
        description: [
          "Rescheduled 6ixtem business operations consultation.",
          `Assessment reference: ${oldBooking.assessmentId}`,
          `Previous booking reference: ${oldBooking.id}`,
          oldBooking.assessment.assessmentSummary
            ? `Assessment summary: ${oldBooking.assessment.assessmentSummary.slice(0, 1500)}`
            : "",
        ]
          .filter(Boolean)
          .join("\n\n"),
        start: {
          dateTime: startAt.toISOString(),
          timeZone: CONSULTATION_TIME_ZONE,
        },
        end: {
          dateTime: endAt.toISOString(),
          timeZone: CONSULTATION_TIME_ZONE,
        },
        attendees: [
          {
            email: oldBooking.attendeeEmail,
            displayName: oldBooking.attendeeName,
          },
        ],
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
          },
        },
      },
    });

    newGoogleEventId = eventResponse.data.id ?? null;

    if (!newGoogleEventId) {
      throw new Error("Google Calendar returned no event ID.");
    }

    const refreshed = await calendar.events.get({
      calendarId,
      eventId: newGoogleEventId,
    });

    const meetUrl =
      refreshed.data.hangoutLink ??
      refreshed.data.conferenceData?.entryPoints?.find(
        (entry) => entry.entryPointType === "video",
      )?.uri ??
      null;

    const replacement = await prisma.$transaction(
      async (tx) => {
        // Compare-and-set prevents two concurrent reschedules from
        // both replacing the same original booking.
        const changed = await tx.booking.updateMany({
          where: {
            id: oldBooking.id,
            status: BookingStatus.BOOKED,
            cancelledAt: null,
          },
          data: {
            status: BookingStatus.RESCHEDULED,
          },
        });

        if (changed.count !== 1) {
          throw new Error("BOOKING_STATE_CHANGED");
        }

        const overlapping = await tx.booking.findFirst({
          where: {
            id: { not: oldBooking.id },
            status: BookingStatus.BOOKED,
            startAt: { lt: endAt },
            endAt: { gt: startAt },
          },
          select: { id: true },
        });

        if (overlapping) {
          throw new Error("SLOT_BECAME_UNAVAILABLE");
        }

        return tx.booking.create({
          data: {
            assessmentId: oldBooking.assessmentId,
            attendeeName: oldBooking.attendeeName,
            attendeeEmail: oldBooking.attendeeEmail,
            startAt,
            endAt,
            timeZone: CONSULTATION_TIME_ZONE,
            status: BookingStatus.BOOKED,
            googleEventId: newGoogleEventId,
            meetUrl,
          },
          select: {
            id: true,
            attendeeName: true,
            attendeeEmail: true,
            startAt: true,
            endAt: true,
            timeZone: true,
            status: true,
            meetUrl: true,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    databaseCommitted = true;

    // Only remove the old event after the database transaction commits.
    // If deletion fails, reconciliation can flag the orphaned event.
    if (oldBooking.googleEventId) {
      try {
        await calendar.events.delete({
          calendarId,
          eventId: oldBooking.googleEventId,
          sendUpdates: "all",
        });
      } catch (cleanupError) {
        console.error(
          "Replacement booking saved, but old calendar event deletion failed:",
          {
            oldBookingId: oldBooking.id,
            newBookingId: replacement.id,
            error: cleanupError,
          },
        );
      }
    }

    return NextResponse.json({
      success: true,
      previousBookingId: oldBooking.id,
      previousStatus: BookingStatus.RESCHEDULED,
      booking: replacement,
      message:
        "The consultation has been rescheduled. The replacement booking is saved in the database.",
    });
  } catch (error) {
    if (newGoogleEventId && !databaseCommitted) {
      try {
        const { calendar, calendarId } = await getCalendarClient();

        await calendar.events.delete({
          calendarId,
          eventId: newGoogleEventId,
          sendUpdates: "all",
        });
      } catch (cleanupError) {
        console.error(
          "Could not remove the uncommitted replacement event:",
          cleanupError,
        );
      }
    }

    if (
      error instanceof Error &&
      error.message === "BOOKING_STATE_CHANGED"
    ) {
      return NextResponse.json(
        {
          error:
            "The original booking changed during rescheduling. Refresh and try again.",
        },
        { status: 409 },
      );
    }

    if (
      error instanceof Error &&
      error.message === "SLOT_BECAME_UNAVAILABLE"
    ) {
      return NextResponse.json(
        {
          error:
            "That slot was booked by someone else. Choose another time.",
        },
        { status: 409 },
      );
    }

    console.error("6ixtem rescheduling failed:", error);

    return NextResponse.json(
      {
        error:
          "The consultation could not be rescheduled. Check the booking and calendar before retrying.",
      },
      { status: 500 },
    );
  }
}
