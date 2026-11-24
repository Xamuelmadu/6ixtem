
import { z } from "zod";
import { LeadStatus, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/crm/admin-auth";

const updateLeadSchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),
  phone: z.string().trim().max(50).nullable().optional(),
  message: z.string().trim().max(5000).optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  budget: z.string().trim().max(200).nullable().optional(),
  project: z.string().trim().max(500).nullable().optional(),
  timeline: z.string().trim().max(200).nullable().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
  score: z.number().int().min(0).max(100).optional(),
  priority: z.number().int().min(0).max(3).optional(),
  companyName: z.string().trim().max(200).nullable().optional(),
  industry: z.string().trim().max(150).nullable().optional(),
  assignedTo: z.string().trim().max(150).nullable().optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getLeadId(rawId: string): Promise<number | null> {
  const id = Number(rawId);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext,
) {
  try {
    if (!(await verifyAdminSession())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const { id: rawId } = await params;
    const id = await getLeadId(rawId);

    if (id === null) {
      return NextResponse.json(
        { success: false, message: "Invalid lead ID." },
        { status: 400 },
      );
    }

    const lead = await prisma.lead.findFirst({
      where: {
        id,
        archivedAt: null,
      },
      include: {
        assessments: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            assessmentType: true,
            status: true,
            qualificationStatus: true,
            qualificationScore: true,
            createdAt: true,
            completedAt: true,
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, message: "Lead not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      lead,
    });
  } catch (error) {
    console.error("[CRM_LEAD_GET]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve lead.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    if (!(await verifyAdminSession())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const { id: rawId } = await params;
    const id = await getLeadId(rawId);

    if (id === null) {
      return NextResponse.json(
        { success: false, message: "Invalid lead ID." },
        { status: 400 },
      );
    }

    const body = await request.json().catch(() => null);
    const validation = updateLeadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid lead update.",
          errors: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = validation.data;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No update fields supplied.",
        },
        { status: 400 },
      );
    }

    const existingLead = await prisma.lead.findFirst({
      where: {
        id,
        archivedAt: null,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!existingLead) {
      return NextResponse.json(
        { success: false, message: "Lead not found." },
        { status: 404 },
      );
    }

    const updateData: Prisma.LeadUpdateInput = {
      ...data,
    };

    // Only record a new contact date when the lead first
    // transitions into CONTACTED.
    if (
      data.status === "CONTACTED" &&
      existingLead.status !== "CONTACTED"
    ) {
      updateData.lastContactedAt = new Date();
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: updateData,
      include: {
        assessments: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            assessmentType: true,
            status: true,
            qualificationStatus: true,
            qualificationScore: true,
            createdAt: true,
            completedAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      lead,
    });
  } catch (error) {
    console.error("[CRM_LEAD_UPDATE]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update lead.",
      },
      { status: 500 },
    );
  }
}
