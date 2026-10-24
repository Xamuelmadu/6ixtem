
import {
  BookingStatus,
  EmailDeliveryStatus,
  EmailDeliveryType,
} from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCalendarClient } from "@/lib/6ixtem-google-calendar";
import {
  emailLayout,
  escapeHtml,
  send6ixtemEmail,
} from "@/lib/6ixtem-email";



const ZONE = "Africa/Lagos";
const REMINDER_WINDOW_MS = 30 * 60 * 1000;
const STALE_PROCESSING_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization");

  return Boolean(secret && header === `Bearer ${secret}`);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IE", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: ZONE,
  }).format(date);
}

function deliveryKey(
  type: EmailDeliveryType,
  bookingId: string,
): string {
  return `6ixtem:${type}:${bookingId}`;
}

async function ensureScheduledDeliveries(now: Date) {
  // Find bookings in a window centred on the 24-hour reminder point.
  const reminderStart = new Date(
    now.getTime() + 24 * 60 * 60 * 1000 - REMINDER_WINDOW_MS,
  );

  const reminderEnd = new Date(
    now.getTime() + 24 * 60 * 60 * 1000 + REMINDER_WINDOW_MS,
  );

  const reminderBookings = await prisma.booking.findMany({
    where: {
      status: BookingStatus.BOOKED,
      cancelledAt: null,
      startAt: {
        gt: reminderStart,
        lte: reminderEnd,
      },
    },
    select: {
      id: true,
      attendeeEmail: true,
      attendeeName: true,
      startAt: true,
      meetUrl: true,
    },
  });

  for (const booking of reminderBookings) {
    const date = formatDate(booking.startAt);

    const meet = booking.meetUrl
      ? `<p><strong>Google Meet:</strong> <a href="${escapeHtml(booking.meetUrl)}">${escapeHtml(booking.meetUrl)}</a></p>`
      : "<p>Please use the meeting details in your calendar invitation.</p>";

    const key = deliveryKey(
      EmailDeliveryType.BOOKING_REMINDER,
      booking.id,
    );

    await prisma.emailDelivery.upsert({
      where: { key },
      create: {
        key,
        type: EmailDeliveryType.BOOKING_REMINDER,
        bookingId: booking.id,
        recipient: booking.attendeeEmail,
        subject: "Reminder: your 6ixtem consultation is tomorrow",
        text: [
          `Hi ${booking.attendeeName},`,
          "",
          `Your 6ixtem consultation is scheduled for ${date} (${ZONE}).`,
          booking.meetUrl ? `Google Meet: ${booking.meetUrl}` : "",
          "",
          "The 6ixtem Team",
        ].filter(Boolean).join("\n"),
        html: emailLayout(
          "Consultation reminder",
          `<h1>Your consultation is tomorrow</h1>
          <p>Hi ${escapeHtml(booking.attendeeName)},</p>
          <p>Your 6ixtem consultation is scheduled for <strong>${escapeHtml(date)}</strong> (${ZONE}).</p>
          ${meet}
          <p>The 6ixtem Team</p>`,
        ),
        scheduledFor: new Date(
          booking.startAt.getTime() - 24 * 60 * 60 * 1000,
        ),
      },
      update: {},
    });
  }

  // Queue follow-ups for meetings that ended at least one hour ago.
  const followupBookings = await prisma.booking.findMany({
    where: {
      status: {
        in: [
          BookingStatus.BOOKED,
          BookingStatus.COMPLETED,
        ],
      },
      cancelledAt: null,
      endAt: {
        lte: new Date(now.getTime() - 60 * 60 * 1000),
      },
    },
    select: {
      id: true,
      attendeeEmail: true,
      attendeeName: true,
      endAt: true,
    },
    take: 250,
    orderBy: {
      endAt: "asc",
    },
  });

  for (const booking of followupBookings) {
    const key = deliveryKey(
      EmailDeliveryType.POST_MEETING_FOLLOWUP,
      booking.id,
    );

    await prisma.emailDelivery.upsert({
      where: { key },
      create: {
        key,
        type: EmailDeliveryType.POST_MEETING_FOLLOWUP,
        bookingId: booking.id,
        recipient: booking.attendeeEmail,
        subject: "Thank you for meeting with 6ixtem",
        text: [
          `Hi ${booking.attendeeName},`,
          "",
          "Thank you for taking the time to meet with 6ixtem.",
          "If you have any further questions or information to share, please reply to this email.",
          "",
          "The 6ixtem Team",
        ].join("\n"),
        html: emailLayout(
          "Thank you",
          `<h1>Thank you for meeting with us</h1>
          <p>Hi ${escapeHtml(booking.attendeeName)},</p>
          <p>Thank you for taking the time to meet with 6ixtem. If you have any further questions or information to share, please reply to this email.</p>
          <p>The 6ixtem Team</p>`,
        ),
        scheduledFor: new Date(
          booking.endAt.getTime() + 60 * 60 * 1000,
        ),
      },
      update: {},
    });
  }
}

async function reconcileUpcomingCalendarEvents(now: Date) {
  const { calendar, calendarId } = await getCalendarClient();

  const until = new Date(
    now.getTime() + 30 * 24 * 60 * 60 * 1000,
  );

  const bookings = await prisma.booking.findMany({
    where: {
      status: BookingStatus.BOOKED,
      cancelledAt: null,
      startAt: {
        gte: new Date(now.getTime() - 60 * 60 * 1000),
        lte: until,
      },
      googleEventId: {
        not: null,
      },
    },
    select: {
      id: true,
      googleEventId: true,
      startAt: true,
      endAt: true,
      meetUrl: true,
    },
    take: 300,
    orderBy: {
      startAt: "asc",
    },
  });

  let checked = 0;
  let cancelled = 0;
  let moved = 0;

  for (const booking of bookings) {
    if (!booking.googleEventId) continue;

    checked++;

    try {
      const response = await calendar.events.get({
        calendarId,
        eventId: booking.googleEventId,
      });

      const event = response.data;

      if (event.status === "cancelled") {
        const result = await prisma.booking.updateMany({
          where: {
            id: booking.id,
            status: BookingStatus.BOOKED,
            cancelledAt: null,
          },
          data: {
            status: BookingStatus.CANCELLED,
            cancelledAt: now,
          },
        });

        if (result.count) cancelled++;
        continue;
      }

      const eventStart = event.start?.dateTime
        ? new Date(event.start.dateTime)
        : null;

      const eventEnd = event.end?.dateTime
        ? new Date(event.end.dateTime)
        : null;

      if (
        !eventStart ||
        !eventEnd ||
        !Number.isFinite(eventStart.getTime()) ||
        !Number.isFinite(eventEnd.getTime())
      ) {
        continue;
      }

      const changed =
        eventStart.getTime() !== booking.startAt.getTime() ||
        eventEnd.getTime() !== booking.endAt.getTime();

      if (!changed) continue;

      const conflict = await prisma.booking.findFirst({
        where: {
          id: { not: booking.id },
          status: BookingStatus.BOOKED,
          cancelledAt: null,
          startAt: { lt: eventEnd },
          endAt: { gt: eventStart },
        },
        select: { id: true },
      });

      if (conflict) {
        console.error(
          "Calendar reconciliation found a conflicting external move",
          {
            bookingId: booking.id,
            conflictId: conflict.id,
          },
        );
        continue;
      }

      const meetUrl =
        event.hangoutLink ??
        event.conferenceData?.entryPoints?.find(
          (entry) => entry.entryPointType === "video",
        )?.uri ??
        booking.meetUrl;

      await prisma.booking.updateMany({
        where: {
          id: booking.id,
          status: BookingStatus.BOOKED,
          cancelledAt: null,
        },
        data: {
          startAt: eventStart,
          endAt: eventEnd,
          meetUrl,
        },
      });

      moved++;
    } catch (error) {
      const code =
        (error as { code?: number; response?: { status?: number } })
          ?.response?.status ??
        (error as { code?: number })?.code;

      if (code === 404 || code === 410) {
        const result = await prisma.booking.updateMany({
          where: {
            id: booking.id,
            status: BookingStatus.BOOKED,
            cancelledAt: null,
          },
          data: {
            status: BookingStatus.CANCELLED,
            cancelledAt: now,
          },
        });

        if (result.count) cancelled++;
      } else {
        console.error(
          "Could not reconcile Google Calendar event",
          { bookingId: booking.id, error },
        );
      }
    }
  }

  return { checked, cancelled, moved };
}

async function processDueDeliveries(now: Date) {
  const staleBefore = new Date(
    now.getTime() - STALE_PROCESSING_MS,
  );

  const candidates = await prisma.emailDelivery.findMany({
    where: {
      scheduledFor: { lte: now },
      attempts: { lt: MAX_ATTEMPTS },
      OR: [
        { status: EmailDeliveryStatus.PENDING },
        { status: EmailDeliveryStatus.FAILED },
        {
          status: EmailDeliveryStatus.PROCESSING,
          updatedAt: { lt: staleBefore },
        },
      ],
    },
    orderBy: { scheduledFor: "asc" },
    take: 100,
  });

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const delivery of candidates) {
    // Compare-and-set claim prevents two workers claiming the same row
    // when they observe the same attempt count.
    const claim = await prisma.emailDelivery.updateMany({
      where: {
        id: delivery.id,
        attempts: delivery.attempts,
        OR: [
          { status: EmailDeliveryStatus.PENDING },
          { status: EmailDeliveryStatus.FAILED },
          {
            status: EmailDeliveryStatus.PROCESSING,
            updatedAt: { lt: staleBefore },
          },
        ],
      },
      data: {
        status: EmailDeliveryStatus.PROCESSING,
        attempts: { increment: 1 },
        lastError: null,
      },
    });

    if (!claim.count) continue;

    if (
      !delivery.recipient ||
      !delivery.subject ||
      !delivery.html ||
      !delivery.text
    ) {
      await prisma.emailDelivery.update({
        where: { id: delivery.id },
        data: {
          status: EmailDeliveryStatus.FAILED,
          lastError: "Delivery payload is incomplete.",
        },
      });

      failed++;
      continue;
    }

    if (delivery.bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: delivery.bookingId },
        select: {
          status: true,
          cancelledAt: true,
        },
      });

      if (
        !booking ||
        booking.status === BookingStatus.CANCELLED ||
        booking.status === BookingStatus.RESCHEDULED ||
        booking.cancelledAt
      ) {
        await prisma.emailDelivery.update({
          where: { id: delivery.id },
          data: {
            status: EmailDeliveryStatus.FAILED,
            lastError: "Skipped because the booking is no longer active.",
          },
        });

        skipped++;
        continue;
      }
    }

    const result = await send6ixtemEmail({
      to: delivery.recipient,
      subject: delivery.subject,
      html: delivery.html,
      text: delivery.text,
    });

    if (result.success) {
      await prisma.emailDelivery.update({
        where: { id: delivery.id },
        data: {
          status: EmailDeliveryStatus.SENT,
          sentAt: now,
          providerMessageId: result.id,
          lastError: null,
        },
      });

      sent++;
    } else {
      const delayMinutes = Math.min(
        60,
        2 ** Math.min(delivery.attempts, 6),
      );

      await prisma.emailDelivery.update({
        where: { id: delivery.id },
        data: {
          status: EmailDeliveryStatus.FAILED,
          lastError: result.error.slice(0, 2000),
          scheduledFor: new Date(
            now.getTime() + delayMinutes * 60 * 1000,
          ),
        },
      });

      failed++;
    }
  }

  return {
    considered: candidates.length,
    sent,
    failed,
    skipped,
  };
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 },
    );
  }

  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 503 },
    );
  }

  try {
    const now = new Date();

    const reconciliation =
      await reconcileUpcomingCalendarEvents(now);

    await ensureScheduledDeliveries(now);

    const email = await processDueDeliveries(now);

    return NextResponse.json({
      success: true,
      at: now.toISOString(),
      reconciliation,
      email,
    });
  } catch (error) {
    console.error("6ixtem email cron failed:", error);

    return NextResponse.json(
      { error: "The email cron could not complete." },
      { status: 500 },
    );
  }
}
