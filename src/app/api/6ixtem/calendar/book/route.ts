import crypto from "node:crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import {
  CONSULTATION_MINUTES,
  CONSULTATION_TIME_ZONE,
  getBusyIntervals,
  getCalendarClient,
  isValidConsultationSlot,
} from "@/lib/6ixtem-google-calendar";

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export async function POST(request: Request) {
  let createdEventId: string | null = null;

  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Request body must be valid JSON.",
        },
        { status: 400 },
      );
    }

    if (!isRecord(body)) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    const assessmentId =
      typeof body.assessmentId === "string"
        ? body.assessmentId.trim()
        : "";

    const attendeeName =
      typeof body.attendeeName === "string"
        ? body.attendeeName.trim()
        : "";

    const attendeeEmail =
      typeof body.attendeeEmail === "string"
        ? body.attendeeEmail.trim().toLowerCase()
        : "";

    const startAtRaw =
      typeof body.startAt === "string"
        ? body.startAt
        : "";

    const startAt = new Date(startAtRaw);

    if (
      !assessmentId ||
      attendeeName.length < 2 ||
      attendeeName.length > 120 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        attendeeEmail,
      ) ||
      attendeeEmail.length > 254 ||
      !Number.isFinite(startAt.getTime()) ||
      !isValidConsultationSlot(startAt)
    ) {
      return NextResponse.json(
        {
          error:
            "Provide valid booking details and choose a valid future consultation slot.",
        },
        { status: 400 },
      );
    }

    const assessment =
      await prisma.assessment.findUnique({
        where: {
          id: assessmentId,
        },

        select: {
          id: true,
          status: true,
          qualificationStatus: true,
          businessName: true,
          assessmentSummary: true,
        },
      });

    if (
      !assessment ||
      assessment.status !== "COMPLETED" ||
      assessment.qualificationStatus !== "QUALIFIED"
    ) {
      return NextResponse.json(
        {
          error:
            "This assessment is not eligible for booking.",
        },
        { status: 403 },
      );
    }

    const endAt = new Date(
      startAt.getTime() +
        CONSULTATION_MINUTES * 60_000,
    );

    // Check existing bookings in the database.
    const existing =
      await prisma.booking.findFirst({
        where: {
          status: "BOOKED",
          startAt: {
            lt: endAt,
          },
          endAt: {
            gt: startAt,
          },
        },

        select: {
          id: true,
        },
      });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "That slot has just been booked. Please choose another time.",
        },
        { status: 409 },
      );
    }

    // Recheck Google Calendar immediately before creation.
    const busy = await getBusyIntervals(
      startAt,
      endAt,
    );

    const overlaps = busy.some(
      (interval) =>
        startAt < interval.end &&
        endAt > interval.start,
    );

    if (overlaps) {
      return NextResponse.json(
        {
          error:
            "That time is no longer available. Please choose another slot.",
        },
        { status: 409 },
      );
    }

    const { calendar, calendarId } =
      await getCalendarClient();

    const eventResponse =
      await calendar.events.insert({
        calendarId,
        conferenceDataVersion: 1,
        sendUpdates: "all",

        requestBody: {
          summary:
            `6ixtem Consultation${
              assessment.businessName
                ? ` — ${assessment.businessName}`
                : ""
            }`,

          description: [
            "6ixtem business operations consultation.",
            `Assessment reference: ${assessment.id}`,
            assessment.assessmentSummary
              ? `Assessment summary: ${assessment.assessmentSummary.slice(0, 1500)}`
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
              email: attendeeEmail,
              displayName: attendeeName,
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

    createdEventId =
      eventResponse.data.id ?? null;

    if (!createdEventId) {
      throw new Error(
        "Google Calendar did not return an event ID.",
      );
    }

    // Conference creation can be asynchronous.
    const refreshed =
      await calendar.events.get({
        calendarId,
        eventId: createdEventId,
      });

    const meetUrl =
      refreshed.data.hangoutLink ??
      refreshed.data.conferenceData?.entryPoints?.find(
        (entry) =>
          entry.entryPointType === "video",
      )?.uri ??
      null;

    const booking =
      await prisma.booking.create({
        data: {
          assessmentId,
          attendeeName,
          attendeeEmail,
          startAt,
          endAt,
          timeZone: CONSULTATION_TIME_ZONE,
          status: "BOOKED",
          googleEventId: createdEventId,
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

    return NextResponse.json(
      {
        booking,
        calendarEventId: createdEventId,
        meetUrl,

        message: meetUrl
          ? "Your consultation is booked. A calendar invitation has been sent."
          : "Your calendar event and invitation were created. Google Meet details may take a short time to become available.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "6ixtem booking error:",
      error,
    );

    // Attempt to remove the Google event if
    // database persistence failed after creation.
    if (createdEventId) {
      try {
        const { calendar, calendarId } =
          await getCalendarClient();

        await calendar.events.delete({
          calendarId,
          eventId: createdEventId,
          sendUpdates: "all",
        });
      } catch (cleanupError) {
        console.error(
          "Could not clean up the Google Calendar event:",
          cleanupError,
        );
      }
    }

    return NextResponse.json(
      {
        error:
          "We could not complete the booking. Please refresh availability and try again.",
      },
      { status: 500 },
    );
  }
}