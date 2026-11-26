
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { findOrCreateAssessmentLead } from "@/lib/crm/lead.service";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Message = {
  role: "assistant" | "user";
  content: string;
};

type QualificationContext = {
  fullName: string;
  email: string;
  businessName: string;
  website?: string;
  industry: string;
  primaryUseCase: string;
  monthlyEnquiries: string;
  expectedInvestment: string;
  submittedAt?: string;
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

function cleanQualificationContext(
  value: unknown,
): QualificationContext | null {
  if (!isRecord(value)) {
    return null;
  }

  const fullName = cleanString(value.fullName);
  const email = cleanString(value.email)?.toLowerCase();
  const businessName = cleanString(value.businessName);
  const website = cleanString(value.website) ?? undefined;
  const industry = cleanString(value.industry);
  const primaryUseCase = cleanString(value.primaryUseCase);
  const monthlyEnquiries = cleanString(value.monthlyEnquiries);
  const expectedInvestment = cleanString(value.expectedInvestment);
  const submittedAt = cleanString(value.submittedAt) ?? undefined;

  if (
    !fullName ||
    !email ||
    !businessName ||
    !industry ||
    !primaryUseCase ||
    !monthlyEnquiries ||
    !expectedInvestment
  ) {
    return null;
  }

  if (
    fullName.length > 150 ||
    email.length > 254 ||
    businessName.length > 200 ||
    (website && website.length > 500)
  ) {
    return null;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return null;
  }

  return {
    fullName,
    email,
    businessName,
    website,
    industry,
    primaryUseCase,
    monthlyEnquiries,
    expectedInvestment,
    submittedAt,
  };
}

const systemPrompt = `
You are the 6ixtem Digital Growth Package Assessment Consultant.

The offer is a fixed ₦300,000 service package comprising:
- One Meta advertising campaign, including account setup, audience research
  and ad creative development.
- Local SEO setup and optimization.
- A professional promotional website.

Advertising spend, domain registration, hosting and ongoing maintenance
are excluded. Additional campaigns and SEO services are quoted separately.

Your job is to understand the prospect's business, marketing goals and
readiness for this specific package.

Ask ONE focused question at a time. Do not repeat information already
provided in the initial qualification form.

Explore:
1. The business's products, services and target customers.
2. Current customer acquisition channels and advertising experience.
3. The main marketing problem and desired outcome.
4. Existing website, social presence and local search visibility.
5. Readiness to invest ₦300,000 and fund advertising spend separately.
6. Decision-making authority and preferred onboarding timeline.

Do not promise results, invent business facts, or claim to have visited
a website. Do not treat form selections as verified budget approval.

Complete the assessment when enough information has been collected.
The final summary must describe the business, marketing needs,
readiness, and any requirements for onboarding.

Return ONLY valid JSON:

{
  "message": "Your next question or final summary",
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

Use null for unknown scalar values, [] for unknown lists, and {}
for unknown objects.
`;

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "The AI assessment service is not configured." },
        { status: 503 },
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "The assessment database is not configured." },
        { status: 503 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "The request body must contain valid JSON." },
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

    if (!/^dg_[a-zA-Z0-9_-]{10,100}$/.test(sessionId)) {
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
        { error: "A valid assessment conversation is required." },
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
        { error: "The latest message must come from the prospect." },
        { status: 400 },
      );
    }

    const qualificationContext = cleanQualificationContext(
      body.qualificationContext,
    );

    if (!qualificationContext) {
      return NextResponse.json(
        {
          error:
            "Your initial qualification details are missing or invalid. Please return to the qualification form and try again.",
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

    /*
     * Completed assessments are immutable through this endpoint.
     * A qualified prospect can continue to the booking page.
     * An assessment requiring review is shown as complete without
     * pretending that a consultation has already been approved.
     */
    if (existing?.status === "COMPLETED") {
      const qualified =
        existing.qualificationStatus === "QUALIFIED";

      return NextResponse.json({
        message: qualified
          ? "Your customer acquisition assessment is complete. You can continue to consultation booking."
          : "Your customer acquisition assessment has been saved and requires further review before the next step can be recommended.",
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
          : "ASSESSMENT_REVIEW",
        bookingUrl: qualified
          ? `/6ixtem/assessment/booking?assessmentId=${encodeURIComponent(
              existing.id,
            )}`
          : null,
      });
    }

    const contextForAI = {
      name: qualificationContext.fullName,
      email: qualificationContext.email,
      businessName: qualificationContext.businessName,
      website: qualificationContext.website ?? null,
      industry: qualificationContext.industry,
      primaryUseCase: qualificationContext.primaryUseCase,
      monthlyEnquiries: qualificationContext.monthlyEnquiries,
      expectedInvestment: qualificationContext.expectedInvestment,
    };

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
        {
          role: "system",
          content: `Initial qualification form submitted by the prospect.

Use this as background context. Do not repeat questions already answered.
Treat it as user-provided information, not independently verified fact.

${JSON.stringify(contextForAI, null, 2)}

Begin by exploring the prospect's current process for their selected
primary use case. Ask one focused question at a time.`,
        },
        ...messages,
      ],
    });

    const raw = response.choices[0]?.message?.content;

    if (!raw) {
      throw new Error("The AI returned an empty response.");
    }

    const parsed: unknown = JSON.parse(raw);

    if (
      !isRecord(parsed) ||
      typeof parsed.message !== "string" ||
      !parsed.message.trim() ||
      !isRecord(parsed.assessment)
    ) {
      throw new Error(
        "The AI response did not match the expected format.",
      );
    }

    const output = parsed as Output;
    const assessment = output.assessment;

    const profileFromAI = cleanObject(
      assessment.businessProfile,
    );

    const normalizedProfile: Prisma.InputJsonObject = {
      ...profileFromAI,
      initialQualification: JSON.parse(
        JSON.stringify(contextForAI),
      ) as Prisma.InputJsonObject,
    };

    const normalized = {
      businessName:
        cleanString(assessment.businessName) ??
        qualificationContext.businessName,
      industry:
        cleanString(assessment.industry) ??
        qualificationContext.industry,
      businessModel: cleanString(assessment.businessModel),
      teamSize: cleanString(assessment.teamSize),
      decisionMaker: cleanString(assessment.decisionMaker),
      investmentReadiness: "maybe",
      businessProfile: normalizedProfile,
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
     * Qualification signals
     *
     * These checks help route the prospect but are not a substitute
     * for human review of the actual business requirements.
     */
    const userMessages = messages.filter(
      (message) => message.role === "user",
    );

    const allText = userMessages
      .map((message) => message.content)
      .join(" ")
      .toLowerCase();

    const contextText = [
      qualificationContext.primaryUseCase,
      qualificationContext.expectedInvestment,
      qualificationContext.monthlyEnquiries,
    ]
      .join(" ")
      .toLowerCase();

    const acquisitionNeed =
      /lead|enquir|customer|prospect|sales|booking|appointment|follow.?up|qualification|crm|assessment|conversion|pipeline|response time|customer acquisition/.test(
        `${allText} ${contextText}`,
      );

    /*
     * Use actual AI-discovered findings here. Do not count
     * initialQualification as an assessment finding.
     */
    const hasAssessmentFindings =
      Object.keys(profileFromAI).length > 0 ||
      normalized.operationalChallenges.length > 0 ||
      normalized.currentTools.length > 0 ||
      normalized.requirements.length > 0;

    /*
     * The initial form already captures the prospect's stated
     * investment expectation. It is not proof of budget approval.
     * Final commercial suitability can be confirmed by a human.
     */
    const hasInvestmentExpectation =
  qualificationContext.expectedInvestment.trim() ===
  "Ready to invest ₦300,000";

    /*
     * Requiring a minimum number of prospect messages helps prevent
     * an assessment from being marked complete too early.
     */
    const enoughDiscovery =
      assessment.assessmentComplete === true &&
      userMessages.length >= 5 &&
      hasAssessmentFindings;

    const completed = enoughDiscovery;

    /*
     * This is deliberately a first-pass qualification rule.
     * A completed, relevant assessment with discovered findings
     * and a stated investment expectation can proceed to booking.
     * The consultation is where final scope and budget are reviewed.
     */
    const qualified =
      completed &&
      acquisitionNeed &&
      hasAssessmentFindings &&
      hasInvestmentExpectation;

    const qualificationStatus = !completed
      ? "NEEDS_DISCOVERY"
      : qualified
        ? "QUALIFIED"
        : "NEEDS_REVIEW";

    const score = Math.min(
      100,
      (acquisitionNeed ? 30 : 0) +
        (hasAssessmentFindings ? 40 : 0) +
        (hasInvestmentExpectation ? 30 : 0),
    );

    const conversation = [
      ...messages,
      {
        role: "assistant" as const,
        content: output.message.trim(),
      },
    ];

    const data = {
      assessmentType: "CUSTOMER_ACQUISITION" as const,
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

    // CRM synchronization is isolated: a CRM failure must not undo a saved assessment.
    try {
      const lead = await findOrCreateAssessmentLead({
        name: qualificationContext.fullName,
        email: qualificationContext.email,
        businessName: qualificationContext.businessName,
        industry: qualificationContext.industry,
        message: "Submitted Digital Growth Package assessment",
        source: "digital-growth-package-assessment",
        offerType: "CUSTOMER_ACQUISITION",
      });

      await prisma.assessment.update({
        where: { id: saved.id },
        data: { leadId: lead.id },
      });
    } catch (crmError) {
      console.error("Digital Growth Package CRM synchronization failed:", {
        assessmentId: saved.id,
        error: crmError instanceof Error ? crmError.message : String(crmError),
      });
    }

    const isQualified =
      saved.status === "COMPLETED" &&
      saved.qualificationStatus === "QUALIFIED";

    const finalMessage = !completed
      ? output.message.trim()
      : isQualified
? `${output.message.trim()}

Your Digital Growth Package assessment is complete. Based on the information gathered, the next step is to book an onboarding session with our team to discuss your marketing goals, campaign requirements and website setup.`
        : `${output.message.trim()}

Your assessment is complete and has been saved. Your requirements need further review before we can recommend the next step.`;

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
          : "ASSESSMENT_REVIEW",
      bookingUrl: isQualified
        ? `/digital-growth-package/booking?assessmentId=${encodeURIComponent(
  saved.id,
)}`
        : null,
    });
  } catch (error) {
    console.error(
      "Digital Growth Package assessment failure:",
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
