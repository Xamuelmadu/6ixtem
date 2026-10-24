
import { BookingStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCalendarClient } from "@/lib/6ixtem-google-calendar";

function isAuthorized(request: Request): boolean {
  const expected = process.env.BOOKING_MANAGEMENT_SECRET;
  const supplied = request.headers.get("x-booking-management-secret");

  return Boolean(expected && supplied && supplied === expected);
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
    typeof body !== "object" ||
    body === null ||
    !("bookingId" in body) ||
    typeof body.bookingId !== "string" ||
    !body.bookingId.trim()
  ) {
    return NextResponse.json(
      { error: "A valid bookingId is required." },
      { status: 400 },
    );
  }

  const bookingId = body.bookingId.trim();

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        status: true,
        googleEventId: true,
        cancelledAt: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 },
      );
    }

    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.cancelledAt
    ) {
      return NextResponse.json({
        success: true,
        message: "The booking is already cancelled.",
      });
    }

    if (booking.status !== BookingStatus.BOOKED) {
      return NextResponse.json(
        {
          error: `Cannot cancel a booking with status ${booking.status}.`,
        },
        { status: 409 },
      );
    }

    // Remove the calendar event first. If Google fails unexpectedly,
    // leave the database booking unchanged and retry the operation.
    if (booking.googleEventId) {
      const { calendar, calendarId } = await getCalendarClient();

      try {
        await calendar.events.delete({
          calendarId,
          eventId: booking.googleEventId,
          sendUpdates: "all",
        });
      } catch (error) {
        const status = (
          error as { code?: number; response?: { status?: number } }
        )?.response?.status ??
          (error as { code?: number })?.code;

        // A missing Google event is already effectively deleted.
        if (status !== 404 && status !== 410) {
          throw error;
        }
      }
    }

    const updated = await prisma.booking.updateMany({
      where: {
        id: booking.id,
        status: BookingStatus.BOOKED,
        cancelledAt: null,
      },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    if (updated.count !== 1) {
      return NextResponse.json(
        {
          error:
            "The booking changed while cancellation was in progress. Refresh and check its current status.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      status: BookingStatus.CANCELLED,
      message: "The booking has been cancelled.",
    });
  } catch (error) {
    console.error("6ixtem booking cancellation failed:", error);

    return NextResponse.json(
      {
        error:
          "Cancellation could not be completed. Check the booking and calendar before retrying.",
      },
      { status: 500 },
    );
  }
}
