import OpenAI from "openai";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { qualifyAssessment } from "@/lib/6ixtem-qualification";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `
You are the 6ixtem Business Assessment Consultant.

6ixtem designs business operating systems for growing service businesses.
The goal is to understand how each business operates and determine whether
its operational needs are suitable for a structured implementation.

Conduct a professional, conversational discovery interview. Ask one focused
question at a time. Avoid asking questions already answered. Do not overwhelm
the prospect with a long list of questions.

Discover:
- Business name, industry, service model and typical clients
- Team size, roles and decision-making authority
- Client onboarding and ongoing client management
- Staff coordination, handovers and internal communication
- Current software, spreadsheets and manual workflows
- Operational bottlenecks and their business impact
- Desired improvements, requirements and integrations
- Investment readiness and implementation timing

The prospect has already passed through an initial investment-readiness
checkpoint. The provided investmentReadiness value is the authoritative
answer to that checkpoint. Do not silently change it.

Do not invent business facts, promise guaranteed outcomes, claim compliance
certifications, or quote a final implementation price. The public starting
investment is ₦1,500,000, with final scope and pricing determined after
requirements are understood.

Be consultative, concise and professional. The assessment is not complete
until the important discovery areas have been covered. If the information
is incomplete, ask the next most useful question.

Return ONLY valid JSON with this shape:
{
  "message": "The next response to the prospect",
  "assessment": {
    "assessmentComplete": false,
    "businessName": null,
    "industry": null,
    "businessModel": null,
    "teamSize": null,
    "decisionMaker": null,
    "businessProfile": {},
    "operationalChallenges": [],
    "currentTools": [],
    "requirements": [],
    "assessmentSummary": ""
  }
}

Use null for unknown scalar values, empty arrays for unknown lists, and an
empty object for unknown object fields. assessmentComplete must be true only
when enough information has been gathered for a meaningful initial review.
`;

type IncomingMessage = {
  role: "assistant" | "user";
  content: string;
};

type AssessmentOutput = {
  message: string;
  assessment: {
    assessmentComplete?: boolean;
    businessName?: string | null;
    industry?: string | null;
    businessModel?: string | null;
    teamSize?: string | null;
    decisionMaker?: string | null;
    businessProfile?: Record<string, unknown>;
    operationalChallenges?: unknown[];
    currentTools?: unknown[];
    requirements?: unknown[];
    assessmentSummary?: string;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function cleanString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const result = value.trim();

  return result.length ? result.slice(0, 2000) : null;
}

function cleanArray(value: unknown): Prisma.InputJsonArray {
  if (!Array.isArray(value)) {
    return [];
  }

  const serialized = JSON.stringify(value.slice(0, 100));
  const parsed: unknown = JSON.parse(serialized);

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed as Prisma.InputJsonArray;
}

function cleanObject(value: unknown): Prisma.InputJsonObject {
  if (!isRecord(value)) {
    return {};
  }

  const serialized = JSON.stringify(value);
  const parsed: unknown = JSON.parse(serialized);

  if (!isRecord(parsed)) {
    return {};
  }

  return parsed as Prisma.InputJsonObject;
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "The AI assessment service is not configured." },
        { status: 503 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "The assessment database is not configured." },
        { status: 503 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "The request body must contain valid JSON." },
        { status: 400 }
      );
    }

    if (!isRecord(body)) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const sessionId =
      typeof body.sessionId === "string" ? body.sessionId : "";

    const investmentReadiness =
      typeof body.investmentReadiness === "string"
        ? body.investmentReadiness
        : "maybe";

    const incomingMessages = body.messages;

    if (!/^[a-zA-Z0-9_-]{10,100}$/.test(sessionId)) {
      return NextResponse.json(
        { error: "Invalid assessment session." },
        { status: 400 }
      );
    }

    if (!["yes", "maybe", "no"].includes(investmentReadiness)) {
      return NextResponse.json(
        { error: "Invalid investment readiness value." },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(incomingMessages) ||
      incomingMessages.length === 0
    ) {
      return NextResponse.json(
        { error: "A conversation message is required." },
        { status: 400 }
      );
    }

    if (incomingMessages.length > 80) {
      return NextResponse.json(
        { error: "The assessment has reached its message limit." },
        { status: 400 }
      );
    }

    const messages: IncomingMessage[] = [];

    for (const item of incomingMessages) {
      if (
        !isRecord(item) ||
        !["assistant", "user"].includes(String(item.role)) ||
        typeof item.content !== "string" ||
        item.content.trim().length === 0 ||
        item.content.length > 5000
      ) {
        return NextResponse.json(
          { error: "One or more messages are invalid." },
          { status: 400 }
        );
      }

      messages.push({
        role: item.role as IncomingMessage["role"],
        content: item.content.trim(),
      });
    }

    if (messages[messages.length - 1].role !== "user") {
      return NextResponse.json(
        { error: "The latest message must come from the prospect." },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "system",
          content: `Investment readiness checkpoint: ${investmentReadiness}`,
        },
        ...messages,
      ],
    });

    const raw = response.choices[0]?.message?.content;

    if (!raw) {
      throw new Error("The AI returned an empty response.");
    }

    let output: AssessmentOutput;

    try {
      output = JSON.parse(raw) as AssessmentOutput;
    } catch {
      throw new Error("The AI returned invalid structured data.");
    }

    if (
      !isRecord(output) ||
      typeof output.message !== "string" ||
      !output.message.trim() ||
      !isRecord(output.assessment)
    ) {
      throw new Error(
        "The AI response did not match the expected format."
      );
    }

    const assessment = output.assessment;

    const normalized = {
      businessName: cleanString(assessment.businessName),
      industry: cleanString(assessment.industry),
      businessModel: cleanString(assessment.businessModel),
      teamSize: cleanString(assessment.teamSize),
      decisionMaker: cleanString(assessment.decisionMaker),
      investmentReadiness,

      businessProfile: cleanObject(
        assessment.businessProfile
      ),

      operationalChallenges: cleanArray(
        assessment.operationalChallenges
      ),

      currentTools: cleanArray(
        assessment.currentTools
      ),

      requirements: cleanArray(
        assessment.requirements
      ),

      assessmentSummary: cleanString(
        assessment.assessmentSummary
      ),
    };

    const qualification = qualifyAssessment({
      ...normalized,
      assessmentComplete:
        assessment.assessmentComplete === true,
    });

    const completed =
      assessment.assessmentComplete === true &&
      qualification.status !== "NEEDS_DISCOVERY";

    const conversation = [
      ...messages,
      {
        role: "assistant" as const,
        content: output.message.trim(),
      },
    ];

    const saved = await prisma.assessment.upsert({
      where: {
        sessionId,
      },

      create: {
        sessionId,

        status: completed
          ? "COMPLETED"
          : "IN_PROGRESS",

        qualificationStatus: qualification.status,
        qualificationScore: qualification.score,

        businessName: normalized.businessName,
        industry: normalized.industry,
        businessModel: normalized.businessModel,
        teamSize: normalized.teamSize,
        decisionMaker: normalized.decisionMaker,
        investmentReadiness:
          normalized.investmentReadiness,

        businessProfile: normalized.businessProfile,
        operationalChallenges:
          normalized.operationalChallenges,
        currentTools: normalized.currentTools,
        requirements: normalized.requirements,

        conversation,
        assessmentSummary: normalized.assessmentSummary,

        completedAt: completed ? new Date() : null,
      },

      update: {
        status: completed
          ? "COMPLETED"
          : "IN_PROGRESS",

        qualificationStatus: qualification.status,
        qualificationScore: qualification.score,

        businessName: normalized.businessName,
        industry: normalized.industry,
        businessModel: normalized.businessModel,
        teamSize: normalized.teamSize,
        decisionMaker: normalized.decisionMaker,
        investmentReadiness:
          normalized.investmentReadiness,

        businessProfile: normalized.businessProfile,
        operationalChallenges:
          normalized.operationalChallenges,
        currentTools: normalized.currentTools,
        requirements: normalized.requirements,

        conversation,
        assessmentSummary: normalized.assessmentSummary,

        ...(completed
          ? { completedAt: new Date() }
          : {}),
      },

      select: {
        id: true,
        status: true,
        qualificationStatus: true,
        qualificationScore: true,
      },
    });

    return NextResponse.json({
      message: output.message.trim(),

      qualification: {
        status: saved.qualificationStatus,
        score: saved.qualificationScore,
        reasons: qualification.reasons,
      },

      assessment: {
        id: saved.id,
        status: saved.status,
      },

      persisted: true,
    });
  } catch (error) {
    console.error("6ixtem assessment error:", error);

    return NextResponse.json(
      {
        error:
          "We could not process that response. Please try again.",
      },
      { status: 500 }
    );
  }
}