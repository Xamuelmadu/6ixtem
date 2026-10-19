import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import {
  addLocalDays,
  createSlotsForDate,
  getBusyIntervals,
  isValidLocalDate,
  localDateRange,
} from "@/lib/6ixtem-google-calendar";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const assessmentId =
      url.searchParams.get("assessmentId") ?? "";

    const from =
      url.searchParams.get("from") ?? "";

    const days = Number(
      url.searchParams.get("days") ?? "14",
    );

    if (
      !assessmentId ||
      !isValidLocalDate(from) ||
      !Number.isInteger(days) ||
      days < 1 ||
      days > 21
    ) {
      return NextResponse.json(
        {
          error:
            "Provide a valid assessmentId, a from date in YYYY-MM-DD format, and days between 1 and 21.",
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
          status: true,
          qualificationStatus: true,
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
            "Only completed, qualified assessments can book a consultation.",
        },
        { status: 403 },
      );
    }

    const rangeStart =
      localDateRange(from).start;

    const rangeEnd =
      localDateRange(
        addLocalDays(from, days),
      ).start;

    const busy = await getBusyIntervals(
      rangeStart,
      rangeEnd,
    );

    const dates: Array<{
      date: string;
      slots: ReturnType<
        typeof createSlotsForDate
      >;
    }> = [];

    for (let i = 0; i < days; i++) {
      const date = addLocalDays(from, i);

      dates.push({
        date,
        slots: createSlotsForDate(
          date,
          busy,
        ),
      });
    }

    return NextResponse.json({
      timeZone: "Africa/Lagos",
      durationMinutes: 30,
      dates,
    });
  } catch (error) {
    console.error(
      "6ixtem availability error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Could not retrieve calendar availability.",
      },
      { status: 503 },
    );
  }
}