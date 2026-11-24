
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/crm/admin-auth";

const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "CLOSED",
  "LOST",
] as const;

const ASSESSMENT_TYPES = [
  "BUSINESS_OS",
  "CUSTOMER_ACQUISITION",
] as const;

export async function GET(request: NextRequest) {
  try {
    if (!(await verifyAdminSession())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const params = request.nextUrl.searchParams;

    const rawPage = Number(params.get("page") || 1);
    const rawLimit = Number(params.get("limit") || 20);

    const page =
      Number.isFinite(rawPage) && rawPage > 0
        ? Math.floor(rawPage)
        : 1;

    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0
        ? Math.min(100, Math.floor(rawLimit))
        : 20;

    const search = params.get("search")?.trim();
    const status = params.get("status");
    const industry = params.get("industry")?.trim();
    const rawPriority = params.get("priority");
    const source = params.get("source");

    const where: Record<string, any> = {
      archivedAt: null,
    };

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          companyName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          phone: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (
      status &&
      LEAD_STATUSES.includes(
        status as (typeof LEAD_STATUSES)[number],
      )
    ) {
      where.status = status;
    }

    if (industry) {
      where.industry = industry;
    }

    if (rawPriority !== null && rawPriority !== "") {
      const priority = Number(rawPriority);

      if (
        Number.isInteger(priority) &&
        priority >= 0 &&
        priority <= 3
      ) {
        where.priority = priority;
      }
    }

    if (
      source &&
      ASSESSMENT_TYPES.includes(
        source as (typeof ASSESSMENT_TYPES)[number],
      )
    ) {
      where.assessments = {
        some: {
          assessmentType: source,
        },
      };
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          assessments: {
            select: {
              id: true,
              assessmentType: true,
              status: true,
              qualificationStatus: true,
              qualificationScore: true,
              createdAt: true,
              completedAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      }),

      prisma.lead.count({
        where,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error("[CRM_LEADS_GET]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve leads.",
      },
      { status: 500 },
    );
  }
}
