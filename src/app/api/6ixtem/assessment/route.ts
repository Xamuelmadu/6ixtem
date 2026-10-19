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

YOUR PURPOSE
Assess whether a growing service business is a suitable candidate for a
custom business operating system built by 6ixtem.

CONDUCT THE ASSESSMENT
Be conversational, professional, concise, and consultative.
Ask ONE focused question at a time.
Do not repeat questions that have already been answered.
Use information the prospect has already supplied.
Do not overwhelm the prospect with long lists of questions.

DISCOVERY CHECKLIST
Gather enough information to assess these areas:

1. Business identity
   - Business name
   - Industry and services
   - Typical clients and business model

2. Team and decision-making
   - Approximate team size
   - Main roles and responsibilities
   - Whether the prospect makes or influences the decision

3. Client operations
   - How clients are onboarded
   - How client records and ongoing work are managed

4. Internal operations
   - Staff coordination and communication
   - Work handovers, task tracking and accountability

5. Current systems and pain points
   - Software, spreadsheets and manual processes
   - The most important operational bottlenecks
   - Their impact on time, cost, visibility or service delivery

6. Desired outcome and implementation
   - What the business wants to improve
   - Important system requirements or integrations
   - Desired implementation timing
   - Whether the prospect is prepared to explore a tailored solution

INVESTMENT READINESS
The prospect has already passed through an investment-readiness checkpoint.
The supplied investmentReadiness value is authoritative. Do not change it.

6ixtem offers start from $2,000. This is a qualification reference, NOT a
mandatory upfront payment, deposit, or promise of a final project price.
Final scope and pricing depend on the requirements.

WHEN TO FINISH
Do not continue discovery indefinitely.

Set assessmentComplete to true as soon as you have enough reliable
information to produce a useful initial assessment and determine whether
the business should proceed to a consultation.

You do NOT need every field to be perfectly complete. Do not keep asking
questions merely to fill every field if the business, team, main problems,
current workflow, desired outcome and decision/implementation readiness
are sufficiently understood.

If important information is still missing, set assessmentComplete to false
and ask the single most useful next question.

When assessmentComplete is true:
- Stop asking discovery questions.
- Give a concise summary of the business's situation.
- Explain the main operational needs identified.
- State that the assessment is complete.
- If the business appears suitable, invite the prospect to book a
  consultation. Do not invent dates or claim a booking has been made.
- If the business does not appear suitable, close politely without
  pressuring the prospect or promising a consultation.

QUALIFICATION INTEGRITY
Do not invent business facts.
Do not guarantee outcomes or claim certifications without evidence.
Do not quote a final implementation price.
Do not tell the prospect that they are qualified solely because they
say they want a consultation. The application evaluates qualification
separately.

RESPONSE FORMAT
Return ONLY valid JSON with this exact structure:

{
  "message": "Your message to the prospect",
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

Use null for unknown scalar values, empty arrays for unknown lists,
and an empty object for unknown object fields.

assessmentComplete must be a JSON boolean.
It must be true only when enough information has been gathered for
a meaningful initial assessment.
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

    // A completed assessment is terminal. Never reopen it because the browser
    // submits another message or replays an old conversation.
    const existingAssessment = await prisma.assessment.findUnique({
      where: { sessionId },
      select: {
        id: true,
        status: true,
        qualificationStatus: true,
        qualificationScore: true,
        completedAt: true,
        assessmentSummary: true,
      },
    });

    if (existingAssessment?.status === "COMPLETED") {
      const canBook =
        existingAssessment.qualificationStatus === "QUALIFIED";

      return NextResponse.json({
        message: canBook
          ? "Your business assessment has already been completed. You can proceed to book your consultation using the button below."
          : "Your business assessment has already been completed. Thank you for sharing information about your business.",
        qualification: {
          status: existingAssessment.qualificationStatus,
          score: existingAssessment.qualificationScore,
          reasons: [],
        },
        assessment: {
          id: existingAssessment.id,
          status: existingAssessment.status,
          completed: true,
        },
        nextStep: canBook ? "BOOK_CONSULTATION" : "ASSESSMENT_CLOSED",
        bookingUrl: canBook
          ? `/6ixtem/assessment/booking?assessmentId=${encodeURIComponent(existingAssessment.id)}`
          : null,
        persisted: true,
      });
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

    const canBook =
      saved.status === "COMPLETED" &&
      saved.qualificationStatus === "QUALIFIED";

    const nextStep = !completed
      ? "CONTINUE_ASSESSMENT"
      : canBook
        ? "BOOK_CONSULTATION"
        : "ASSESSMENT_CLOSED";

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
        completed: saved.status === "COMPLETED",
      },

      nextStep,

      bookingUrl: canBook
        ? `/6ixtem/assessment/booking?assessmentId=${encodeURIComponent(saved.id)}`
        : null,

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