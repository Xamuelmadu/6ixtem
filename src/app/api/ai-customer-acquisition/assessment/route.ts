import OpenAI from "openai";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Message = {
  role: "assistant" | "user";
  content: string;
};

type Output = {
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

  return result ? result.slice(0, 2000) : null;
}

function cleanArray(value: unknown): Prisma.InputJsonArray {
  return Array.isArray(value)
    ? (JSON.parse(
        JSON.stringify(value.slice(0, 100)),
      ) as Prisma.InputJsonArray)
    : [];
}

function cleanObject(value: unknown): Prisma.InputJsonObject {
  return isRecord(value)
    ? (JSON.parse(JSON.stringify(value)) as Prisma.InputJsonObject)
    : {};
}

const systemPrompt = `
You are the 6ixtem AI Customer Acquisition Assessment Consultant.

You are NOT conducting the general Business OS assessment.

Your job is to understand how a business acquires customers and determine
whether a custom AI customer acquisition workflow could be useful.

Ask ONE focused question at a time. Do not repeatedly ask for information
the prospect has already provided.

Explore these areas progressively:

1. Business name, industry, services, products and target customers.
2. Where leads and enquiries originate.
3. Approximate enquiry volume.
4. How enquiries are answered and followed up.
5. How leads are qualified before a sales call.
6. Booking and appointment scheduling processes.
7. Repetitive questions customers frequently ask.
8. Current CRM, website, forms, messaging and calendar tools.
9. Lost leads, response delays, repetitive manual work and business impact.
10. Desired AI behavior, integrations and human handoff requirements.
11. Implementation timeline and decision-making authority.
12. Readiness to invest in a custom implementation.

Investment qualification reference:
6ixtem offers start from 1.5 million.

Do not infer a currency. Do not describe this as an upfront payment.
Do not promise a final price or claim that the starting point is the
complete implementation cost.

If investment readiness is unclear, ask respectfully whether an offer
starting from 1.5 million is within the prospect's potential budget.

Do not pressure the prospect. Do not invent information, business facts,
integrations, results or promises.

Complete the assessment only when enough useful information has been
collected to understand the prospect's customer acquisition process.

When appropriate, summarize the main problem, desired outcome and possible
AI workflow. Make it clear that the final scope depends on further review.

Return ONLY valid JSON using this structure:

{
  "message": "The next message to the prospect",
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

Use null for unknown scalar values, [] for unknown lists, and {} for
unknown objects.
`;

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: "The AI assessment service is not configured.",
        },
        { status: 503 },
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          error: "The assessment database is not configured.",
        },
        { status: 503 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "The request body must contain valid JSON.",
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

    const sessionId =
      typeof body.sessionId === "string" ? body.sessionId : "";

    if (!/^ca_[a-zA-Z0-9_-]{10,100}$/.test(sessionId)) {
      return NextResponse.json(
        { error: "Invalid assessment session." },
        { status: 400 },
      );
    }

    if (
      !Array.isArray(body.messages) ||
      body.messages.length < 2 ||
      body.messages.length > 80
    ) {
      return NextResponse.json(
        {
          error: "A valid assessment conversation is required.",
        },
        { status: 400 },
      );
    }

    const messages: Message[] = [];

    for (const item of body.messages) {
      if (
        !isRecord(item) ||
        !["assistant", "user"].includes(String(item.role)) ||
        typeof item.content !== "string" ||
        !item.content.trim() ||
        item.content.length > 4000
      ) {
        return NextResponse.json(
          { error: "One or more messages are invalid." },
          { status: 400 },
        );
      }

      messages.push({
        role: item.role as Message["role"],
        content: item.content.trim(),
      });
    }

    if (messages[messages.length - 1].role !== "user") {
      return NextResponse.json(
        {
          error: "The latest message must come from the prospect.",
        },
        { status: 400 },
      );
    }

    const existing = await prisma.assessment.findUnique({
      where: { sessionId },
      select: {
        id: true,
        assessmentType: true,
        status: true,
        qualificationStatus: true,
        qualificationScore: true,
        businessName: true,
        industry: true,
        businessModel: true,
        teamSize: true,
        decisionMaker: true,
        businessProfile: true,
        operationalChallenges: true,
        currentTools: true,
        requirements: true,
        assessmentSummary: true,
      },
    });

    if (
      existing &&
      existing.assessmentType !== "CUSTOMER_ACQUISITION"
    ) {
      return NextResponse.json(
        {
          error:
            "This session belongs to a different assessment. Start a new session.",
        },
        { status: 409 },
      );
    }

    if (existing?.status === "COMPLETED") {
      const qualified =
        existing.qualificationStatus === "QUALIFIED";

      return NextResponse.json({
        message: "Your customer acquisition assessment is already complete.",
        qualification: {
          status: existing.qualificationStatus,
          score: existing.qualificationScore,
        },
        assessment: {
          id: existing.id,
          completed: true,
          summary: existing.assessmentSummary,
        },
        nextStep: qualified
          ? "CONSULTATION_AVAILABLE"
          : "ASSESSMENT_CLOSED",
        bookingUrl: qualified
          ? `/6ixtem/assessment/booking?assessmentId=${encodeURIComponent(
              existing.id,
            )}`
          : null,
      });
    }

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0.3,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messages,
      ],
    });

    const raw = response.choices[0]?.message?.content;

    if (!raw) {
      throw new Error("The AI returned an empty response.");
    }

    const output = JSON.parse(raw) as Output;

    if (
      !isRecord(output) ||
      typeof output.message !== "string" ||
      !output.message.trim() ||
      !isRecord(output.assessment)
    ) {
      throw new Error(
        "The AI response did not match the expected format.",
      );
    }

    const assessment = output.assessment;

    const normalized = {
      businessName: cleanString(assessment.businessName),
      industry: cleanString(assessment.industry),
      businessModel: cleanString(assessment.businessModel),
      teamSize: cleanString(assessment.teamSize),
      decisionMaker: cleanString(assessment.decisionMaker),
      investmentReadiness: "maybe",
      businessProfile: cleanObject(assessment.businessProfile),
      operationalChallenges: cleanArray(
        assessment.operationalChallenges,
      ),
      currentTools: cleanArray(assessment.currentTools),
      requirements: cleanArray(assessment.requirements),
      assessmentSummary: cleanString(
        assessment.assessmentSummary,
      ),
    };

    /*
     * Initial qualification heuristic.
     *
     * This should be replaced or strengthened with your actual qualification
     * rules before using the assessment as the sole gate to a sales call.
     */
    const allText = messages
      .filter((message) => message.role === "user")
      .map((message) => message.content)
      .join(" ")
      .toLowerCase();

    const hasAcquisitionNeed =
      /lead|enquir|customer|prospect|sales|booking|appointment|follow.?up|qualification|crm/.test(
        allText,
      );

    const indicatesDecisionAuthority =
      /owner|founder|director|manager|decision.?maker|i decide|i can approve|partner/.test(
        allText,
      );

    const indicatesReadiness =
      /1\.5\s?million|1500000|1,500,000|budget|investment|ready to invest|can invest|within budget/.test(
        allText,
      );

    const enoughDiscovery =
      assessment.assessmentComplete === true &&
      messages.filter((message) => message.role === "user").length >= 5;

    const completed = enoughDiscovery;

    const qualified =
      completed &&
      hasAcquisitionNeed &&
      indicatesDecisionAuthority &&
      indicatesReadiness;

    const qualificationStatus = !completed
      ? "NEEDS_DISCOVERY"
      : qualified
        ? "QUALIFIED"
        : "NEEDS_REVIEW";

    const score = Math.min(
      100,
      (hasAcquisitionNeed ? 30 : 0) +
        (indicatesDecisionAuthority ? 25 : 0) +
        (indicatesReadiness ? 30 : 0) +
        (normalized.requirements.length ? 15 : 0),
    );

    const conversation = [
      ...messages,
      {
        role: "assistant",
        content: output.message.trim(),
      },
    ];

    const data = {
      assessmentType: "CUSTOMER_ACQUISITION",
      status: completed
        ? ("COMPLETED" as const)
        : ("IN_PROGRESS" as const),
      qualificationStatus: qualificationStatus as
        | "NEEDS_DISCOVERY"
        | "QUALIFIED"
        | "NEEDS_REVIEW",
      qualificationScore: score,
      ...normalized,
      conversation: JSON.parse(
        JSON.stringify(conversation),
      ) as Prisma.InputJsonArray,
      completedAt: completed ? new Date() : null,
      funnelState: completed
        ? qualified
          ? ("AWAITING_CONSENT" as const)
          : ("CLOSED" as const)
        : ("DISCOVERY" as const),
    };

    const saved = await prisma.assessment.upsert({
      where: { sessionId },
      create: {
        sessionId,
        ...data,
      },
      update: data,
      select: {
        id: true,
        status: true,
        qualificationStatus: true,
        qualificationScore: true,
        assessmentSummary: true,
      },
    });

    const isQualified =
      saved.status === "COMPLETED" &&
      saved.qualificationStatus === "QUALIFIED";

    const finalMessage = completed
      ? `${output.message.trim()}\n\nYour assessment is complete.${
          isQualified
            ? " Your responses indicate that a consultation may be a useful next step."
            : " We may need to review your requirements before recommending a consultation."
        }`
      : output.message.trim();

    return NextResponse.json({
      message: finalMessage,
      qualification: {
        status: saved.qualificationStatus,
        score: saved.qualificationScore,
      },
      assessment: {
        id: saved.id,
        completed: saved.status === "COMPLETED",
        summary: saved.assessmentSummary,
      },
      nextStep: !completed
        ? "CONTINUE_ASSESSMENT"
        : isQualified
          ? "CONSULTATION_AVAILABLE"
          : "ASSESSMENT_CLOSED",
      bookingUrl: isQualified
        ? `/6ixtem/assessment/booking?assessmentId=${encodeURIComponent(
            saved.id,
          )}`
        : null,
    });
  } catch (error) {
    console.error(
      "AI customer acquisition assessment failure:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "We could not process that response. Please try again.",
      },
      { status: 500 },
    );
  }
}