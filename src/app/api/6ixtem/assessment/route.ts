import OpenAI from "openai";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { qualifyAssessment } from "@/lib/6ixtem-qualification";
import {
  send6ixtemEmail,
  getAdminNotificationEmail,
  emailLayout,
  escapeHtml,
  emailText,
} from "@/lib/6ixtem-email";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `
You are the 6ixtem Business Assessment Consultant.

YOUR PURPOSE
Assess whether a growing service business is suitable for a custom
business operating system built by 6ixtem.

DISCOVERY
Be conversational, professional, concise, and consultative.
Ask ONE focused question at a time.
Do not repeat questions already answered.
Do not overwhelm the prospect with long lists of questions.

Gather enough information about:
- Business identity, industry, services and business model.
- Team size, responsibilities and decision-making authority.
- Client onboarding and client record management.
- Staff coordination, communication, handovers and accountability.
- Existing software, spreadsheets and manual processes.
- Operational bottlenecks and their impact.
- Desired improvements, requirements, integrations and timeline.

INVESTMENT READINESS
The investment-readiness checkpoint supplied by the application is
authoritative. Do not change it.

6ixtem offers start from $2,000. This is a qualification reference,
not a mandatory upfront payment or a promise of final project pricing.
Final scope and pricing depend on requirements.

COMPLETION
Set assessmentComplete to true when enough reliable information has
been gathered to produce a useful initial assessment and determine
suitability for a consultation.

Do not continue discovery indefinitely. If important information is
still missing, ask the single most useful next question.

When complete, summarize the business situation and the main
operational needs identified. State that the assessment is complete.
Do not invent facts, guarantee outcomes, claim unsupported
certifications, or quote a final implementation price.

If the business appears suitable, say that a consultation may be the
next step. Do not claim a consultation has been booked.
The application—not you—determines qualification and controls the
booking-consent process.

If the business is not suitable, close politely without pressure.

Return ONLY valid JSON with this structure:
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
`;

type IncomingMessage = {
  role: "assistant" | "user";
  content: string;
};

type BusinessOSQualification = {
  fullName: string;
  email: string;
  businessName: string;
  industry: string;
  teamSize: string;
  investmentReadiness: "yes" | "maybe" | "no";
  submittedAt?: string;
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
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const result = value.trim();
  return result.length ? result.slice(0, 2000) : null;
}

function cleanArray(value: unknown): Prisma.InputJsonArray {
  if (!Array.isArray(value)) return [];
  const parsed: unknown = JSON.parse(JSON.stringify(value.slice(0, 100)));
  return Array.isArray(parsed) ? (parsed as Prisma.InputJsonArray) : [];
}

function cleanObject(value: unknown): Prisma.InputJsonObject {
  if (!isRecord(value)) return {};
  const parsed: unknown = JSON.parse(JSON.stringify(value));
  return isRecord(parsed) ? (parsed as Prisma.InputJsonObject) : {};
}

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function parseQualificationContext(
  value: unknown
): BusinessOSQualification | null {
  if (!isRecord(value)) return null;

  const fullName = cleanString(value.fullName);
  const email = cleanString(value.email)?.toLowerCase() ?? null;
  const businessName = cleanString(value.businessName);
  const industry = cleanString(value.industry);
  const teamSize = cleanString(value.teamSize);
  const readiness = value.investmentReadiness;

  if (
    !fullName ||
    fullName.length > 150 ||
    !email ||
    !validEmail(email) ||
    !businessName ||
    businessName.length > 200 ||
    !industry ||
    industry.length > 200 ||
    !teamSize ||
    teamSize.length > 100 ||
    !["yes", "maybe", "no"].includes(String(readiness))
  ) {
    return null;
  }

  return {
    fullName,
    email,
    businessName,
    industry,
    teamSize,
    investmentReadiness:
      readiness as BusinessOSQualification["investmentReadiness"],
    ...(typeof value.submittedAt === "string"
      ? { submittedAt: value.submittedAt.slice(0, 100) }
      : {}),
  };
}

function getLatestUserMessage(messages: IncomingMessage[]): string {
  return messages[messages.length - 1].content.trim();
}

function isPositiveConsent(message: string): boolean {
  const value = message
    .toLowerCase()
    .trim()
    .replace(/[.!?,;]+$/g, "")
    .replace(/\s+/g, " ");

  return /^(yes|yes please|yeah|yep|sure|okay|ok|i agree|i would|i'd like to|let's book|lets book|book a consultation|i want to book|i'm interested|im interested|proceed|continue|yes,? (please )?(proceed|continue|book|let's book|lets book)|i would like to (proceed|continue|book|book a consultation)|let's proceed|lets proceed|go ahead|continue to consultation|proceed to consultation)$/i.test(
    value,
  );
}

function isNegativeConsent(message: string): boolean {
  const value = message.toLowerCase().trim();

  return /^(no|no thanks|not now|not yet|maybe later|i decline|don't book|do not book|not interested|stop|cancel)$/i.test(
    value
  );
}

function htmlParagraphs(value: string): string {
  return value
    .split(/\n+/)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

async function notifyAdmin(
  subject: string,
  text: string,
  html: string
): Promise<void> {
  const to = getAdminNotificationEmail();

  if (!to) {
    console.warn(
      "6ixtem admin notification skipped: no notification email configured."
    );
    return;
  }

  try {
    await send6ixtemEmail({ to, subject, text, html });
  } catch (error) {
    // Notification failure must not undo a saved assessment or lead.
    console.error("6ixtem admin notification failed:", error);
  }
}

async function sendLeadEmails(input: {
  name: string;
  email: string;
  businessName: string | null;
  assessmentSummary: string | null;
  bookingUrl: string;
}): Promise<boolean> {
  const name = escapeHtml(input.name);
  const businessName = escapeHtml(input.businessName || "Your business");
  const summary = input.assessmentSummary
    ? htmlParagraphs(input.assessmentSummary)
    : "<p>Your assessment has been completed. You can use the link below to choose a consultation time.</p>";

  const bookingLink = `${
    process.env.NEXT_PUBLIC_SITE_URL || "https://6ixtem.com"
  }${input.bookingUrl}`;

  try {
    await send6ixtemEmail({
      to: input.email,
      subject: "Your 6ixtem business assessment",
      text: emailText(
        `Hi ${input.name},\n\nYour 6ixtem business assessment is complete for ${
          input.businessName || "your business"
        }.\n\n${
          input.assessmentSummary ||
          "You can now choose a consultation time if you would like to discuss your requirements."
        }\n\nBook a consultation: ${bookingLink}\n\nThe 6ixtem Team`
      ),
      html: emailLayout(
        "Your assessment is complete",
        `
          <h1>Your assessment is complete</h1>
          <p>Hi ${name},</p>
          <p>Thank you for completing your 6ixtem business assessment for <strong>${businessName}</strong>.</p>
          ${summary}
          <p>If you would like to discuss your business requirements with our team, you can choose a suitable consultation time below.</p>
          <p><a href="${escapeHtml(bookingLink)}">Choose a consultation time</a></p>
          <p>There is no obligation to book.</p>
          <p>The 6ixtem Team</p>
        `
      ),
    });

    return true;
  } catch (error) {
    console.error("6ixtem lead email failed:", error);
    return false;
  }
}

export async function POST(request: Request) {
  let stage = "request validation";

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
    const qualificationContext = parseQualificationContext(
      body.qualificationContext
    );

    if (
      body.qualificationContext !== undefined &&
      body.qualificationContext !== null &&
      !qualificationContext
    ) {
      return NextResponse.json(
        { error: "The supplied business qualification details are invalid." },
        { status: 400 }
      );
    }

    if (
      qualificationContext &&
      qualificationContext.investmentReadiness !== investmentReadiness
    ) {
      return NextResponse.json(
        {
          error:
            "Investment readiness does not match the submitted qualification details.",
        },
        { status: 400 }
      );
    }

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

    if (!Array.isArray(incomingMessages) || incomingMessages.length === 0) {
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
        !item.content.trim() ||
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

    const latestMessage = getLatestUserMessage(messages);

    stage = "database lookup";

    const existing = await prisma.assessment.findUnique({
      where: { sessionId },
      select: {
        id: true,
        status: true,
        qualificationStatus: true,
        qualificationScore: true,
        completedAt: true,
        assessmentSummary: true,
        businessName: true,
        industry: true,
        businessModel: true,
        teamSize: true,
        decisionMaker: true,
        investmentReadiness: true,
        businessProfile: true,
        operationalChallenges: true,
        currentTools: true,
        requirements: true,
        contactName: true,
        contactEmail: true,
        funnelState: true,
        assessmentEmailSentAt: true,
        bookingLinkSentAt: true,
      },
    });

    /*
     * Post-assessment funnel:
     * qualification and state are read from the database, never trusted
     * from browser-supplied fields.
     */
    if (existing?.status === "COMPLETED") {
      const canBook = existing.qualificationStatus === "QUALIFIED";

      if (!canBook) {
        return NextResponse.json({
          message:
            "Your assessment is complete. Thank you for sharing information about your business. Based on the information provided, a consultation is not the recommended next step at this time.",
          qualification: {
            status: existing.qualificationStatus,
            score: existing.qualificationScore,
            reasons: [],
          },
          assessment: {
            id: existing.id,
            status: existing.status,
            completed: true,
          },
          nextStep: "ASSESSMENT_CLOSED",
          bookingUrl: null,
          persisted: true,
        });
      }

      if (
        existing.funnelState === "DECLINED" ||
        existing.funnelState === "CLOSED"
      ) {
        return NextResponse.json({
          message:
            "Thank you for your time. You can return whenever you are ready to explore your business requirements further.",
          qualification: {
            status: existing.qualificationStatus,
            score: existing.qualificationScore,
            reasons: [],
          },
          assessment: {
            id: existing.id,
            status: existing.status,
            completed: true,
          },
          nextStep: "ASSESSMENT_CLOSED",
          bookingUrl: null,
          persisted: true,
        });
      }

      if (existing.funnelState === "BOOKING_LINK_SENT") {
        const bookingUrl =
          `/6ixtem/assessment/booking?assessmentId=${encodeURIComponent(existing.id)}`;

        return NextResponse.json({
          message:
            "Your assessment is complete, and the consultation link has been sent to your email. Please check your inbox, including your spam or junk folder.",
          qualification: {
            status: existing.qualificationStatus,
            score: existing.qualificationScore,
            reasons: [],
          },
          assessment: {
            id: existing.id,
            status: existing.status,
            completed: true,
          },
          nextStep: "BOOKING_LINK_SENT",
          bookingUrl,
          persisted: true,
        });
      }

      if (existing.funnelState === "COLLECTING_NAME") {
        const name = latestMessage.trim().slice(0, 150);

        if (
          name.length < 2 ||
          name.length > 150 ||
          /@|https?:\/\/|\d{6,}/i.test(name)
        ) {
          return NextResponse.json({
            message:
              "Please enter your name so I can prepare the consultation details.",
            qualification: {
              status: existing.qualificationStatus,
              score: existing.qualificationScore,
              reasons: [],
            },
            assessment: {
              id: existing.id,
              status: existing.status,
              completed: true,
            },
            nextStep: "COLLECTING_NAME",
            bookingUrl: null,
            persisted: true,
          });
        }

        await prisma.assessment.update({
          where: { id: existing.id },
          data: {
            contactName: name,
            funnelState: "COLLECTING_EMAIL",
          },
        });

        return NextResponse.json({
          message: `Thank you, ${name}. What email address should we send your assessment summary and consultation booking link to?`,
          qualification: {
            status: existing.qualificationStatus,
            score: existing.qualificationScore,
            reasons: [],
          },
          assessment: {
            id: existing.id,
            status: existing.status,
            completed: true,
          },
          nextStep: "COLLECTING_EMAIL",
          bookingUrl: null,
          persisted: true,
        });
      }

      if (existing.funnelState === "COLLECTING_EMAIL") {
        const email = latestMessage.trim().toLowerCase();

        if (!validEmail(email)) {
          return NextResponse.json({
            message:
              "That doesn't look like a valid email address. Please check it and enter the email address where you'd like to receive your assessment and booking link.",
            qualification: {
              status: existing.qualificationStatus,
              score: existing.qualificationScore,
              reasons: [],
            },
            assessment: {
              id: existing.id,
              status: existing.status,
              completed: true,
            },
            nextStep: "COLLECTING_EMAIL",
            bookingUrl: null,
            persisted: true,
          });
        }

        if (!existing.contactName) {
          await prisma.assessment.update({
            where: { id: existing.id },
            data: { funnelState: "COLLECTING_NAME" },
          });

          return NextResponse.json({
            message: "Before I send that, could you tell me your name?",
            qualification: {
              status: existing.qualificationStatus,
              score: existing.qualificationScore,
              reasons: [],
            },
            assessment: {
              id: existing.id,
              status: existing.status,
              completed: true,
            },
            nextStep: "COLLECTING_NAME",
            bookingUrl: null,
            persisted: true,
          });
        }

        stage = "saving prospect contact";

        await prisma.assessment.update({
          where: { id: existing.id },
          data: {
            contactEmail: email,
            funnelState: "COLLECTING_EMAIL",
          },
        });

        const bookingUrl =
          `/6ixtem/assessment/booking?assessmentId=${encodeURIComponent(existing.id)}`;

        const emailSent = await sendLeadEmails({
          name: existing.contactName,
          email,
          businessName: existing.businessName,
          assessmentSummary: existing.assessmentSummary,
          bookingUrl,
        });

        if (!emailSent) {
          // Keep the email and name saved so a retry can resend.
          return NextResponse.json({
            message:
              "Your details have been saved, but we couldn't send the email just yet. Please try sending your email address again in a moment.",
            qualification: {
              status: existing.qualificationStatus,
              score: existing.qualificationScore,
              reasons: [],
            },
            assessment: {
              id: existing.id,
              status: existing.status,
              completed: true,
            },
            nextStep: "COLLECTING_EMAIL",
            bookingUrl: null,
            persisted: true,
          });
        }

        await prisma.assessment.update({
          where: { id: existing.id },
          data: {
            funnelState: "BOOKING_LINK_SENT",
            bookingLinkSentAt: new Date(),
          },
        });

        await notifyAdmin(
          "New qualified 6ixtem lead",
          [
            "A qualified prospect has completed the 6ixtem assessment and requested a consultation.",
            `Name: ${existing.contactName}`,
            `Email: ${email}`,
            `Business: ${existing.businessName || "Not provided"}`,
            `Industry: ${existing.industry || "Not provided"}`,
            `Qualification score: ${existing.qualificationScore}`,
            `Assessment ID: ${existing.id}`,
            `Summary: ${existing.assessmentSummary || "Not provided"}`,
          ].join("\n"),
          emailLayout(
            "New qualified 6ixtem lead",
            `
              <h1>New qualified 6ixtem lead</h1>
              <p>A qualified prospect has completed the assessment and requested a consultation.</p>
              <p><strong>Name:</strong> ${escapeHtml(existing.contactName)}</p>
              <p><strong>Email:</strong> ${escapeHtml(email)}</p>
              <p><strong>Business:</strong> ${escapeHtml(existing.businessName || "Not provided")}</p>
              <p><strong>Industry:</strong> ${escapeHtml(existing.industry || "Not provided")}</p>
              <p><strong>Qualification score:</strong> ${existing.qualificationScore}</p>
              <p><strong>Assessment ID:</strong> ${escapeHtml(existing.id)}</p>
              <h2>Assessment summary</h2>
              ${htmlParagraphs(existing.assessmentSummary || "Not provided")}
            `
          )
        );

        return NextResponse.json({
          message:
            "Your assessment confirmation and consultation booking link have been sent to your email. You can use the link in that email to choose a suitable time.",
          qualification: {
            status: existing.qualificationStatus,
            score: existing.qualificationScore,
            reasons: [],
          },
          assessment: {
            id: existing.id,
            status: existing.status,
            completed: true,
          },
          nextStep: "BOOKING_LINK_SENT",
          bookingUrl,
          persisted: true,
        });
      }

      // Consent is required before sending the assessment email and booking link.
      if (
        existing.funnelState === "QUALIFIED" ||
        existing.funnelState === "AWAITING_CONSENT" ||
        existing.funnelState === "DISCOVERY"
      ) {
        if (isNegativeConsent(latestMessage)) {
          await prisma.assessment.update({
            where: { id: existing.id },
            data: { funnelState: "DECLINED" },
          });

          return NextResponse.json({
            message:
              "No problem. Thank you for completing the 6ixtem business assessment. You're welcome to return whenever you are ready to explore your operational requirements further.",
            qualification: {
              status: existing.qualificationStatus,
              score: existing.qualificationScore,
              reasons: [],
            },
            assessment: {
              id: existing.id,
              status: existing.status,
              completed: true,
            },
            nextStep: "ASSESSMENT_CLOSED",
            bookingUrl: null,
            persisted: true,
          });
        }

        if (isPositiveConsent(latestMessage)) {
          if (
            existing.contactName &&
            existing.contactEmail &&
            validEmail(existing.contactEmail)
          ) {
            const bookingUrl =
              `/6ixtem/assessment/booking?assessmentId=${encodeURIComponent(existing.id)}`;

            const emailSent = await sendLeadEmails({
              name: existing.contactName,
              email: existing.contactEmail,
              businessName: existing.businessName,
              assessmentSummary: existing.assessmentSummary,
              bookingUrl,
            });

            if (!emailSent) {
              return NextResponse.json({
                message:
                  "Thanks for confirming. Your details are saved, but we couldn't send the email just yet. Please reply yes to retry.",
                qualification: {
                  status: existing.qualificationStatus,
                  score: existing.qualificationScore,
                  reasons: [],
                },
                assessment: {
                  id: existing.id,
                  status: existing.status,
                  completed: true,
                },
                nextStep: "AWAITING_CONSENT",
                bookingUrl: null,
                persisted: true,
              });
            }

            await prisma.assessment.update({
              where: { id: existing.id },
              data: {
                funnelState: "BOOKING_LINK_SENT",
                bookingLinkSentAt: new Date(),
              },
            });

            await notifyAdmin(
              "New qualified 6ixtem lead",
              [
                "A qualified prospect has completed the 6ixtem assessment and requested a consultation.",
                `Name: ${existing.contactName}`,
                `Email: ${existing.contactEmail}`,
                `Business: ${existing.businessName || "Not provided"}`,
                `Industry: ${existing.industry || "Not provided"}`,
                `Qualification score: ${existing.qualificationScore}`,
                `Assessment ID: ${existing.id}`,
                `Summary: ${existing.assessmentSummary || "Not provided"}`,
              ].join("\n"),
              emailLayout(
                "New qualified 6ixtem lead",
                `
                  <h1>New qualified 6ixtem lead</h1>
                  <p>A qualified prospect has completed the assessment and requested a consultation.</p>
                  <p><strong>Name:</strong> ${escapeHtml(existing.contactName)}</p>
                  <p><strong>Email:</strong> ${escapeHtml(existing.contactEmail)}</p>
                  <p><strong>Business:</strong> ${escapeHtml(existing.businessName || "Not provided")}</p>
                  <p><strong>Industry:</strong> ${escapeHtml(existing.industry || "Not provided")}</p>
                  <p><strong>Qualification score:</strong> ${existing.qualificationScore}</p>
                  <p><strong>Assessment ID:</strong> ${escapeHtml(existing.id)}</p>
                  <h2>Assessment summary</h2>
                  ${htmlParagraphs(existing.assessmentSummary || "Not provided")}
                `
              )
            );

            return NextResponse.json({
              message:
                "Your assessment confirmation and consultation booking link have been sent to your email. You can use the link in that email to choose a suitable time.",
              qualification: {
                status: existing.qualificationStatus,
                score: existing.qualificationScore,
                reasons: [],
              },
              assessment: {
                id: existing.id,
                status: existing.status,
                completed: true,
              },
              nextStep: "BOOKING_LINK_SENT",
              bookingUrl,
              persisted: true,
            });
          }

          await prisma.assessment.update({
            where: { id: existing.id },
            data: { funnelState: "COLLECTING_NAME" },
          });

          return NextResponse.json({
            message:
              "Great. What is your name? I'll use it to prepare your assessment and consultation details.",
            qualification: {
              status: existing.qualificationStatus,
              score: existing.qualificationScore,
              reasons: [],
            },
            assessment: {
              id: existing.id,
              status: existing.status,
              completed: true,
            },
            nextStep: "COLLECTING_NAME",
            bookingUrl: null,
            persisted: true,
          });
        }

        await prisma.assessment.update({
          where: { id: existing.id },
          data: { funnelState: "AWAITING_CONSENT" },
        });

        return NextResponse.json({
          message:
            "Your assessment is complete, and your business appears suitable for a consultation with 6ixtem. Would you like to continue and receive an assessment confirmation and a link to book a consultation? You can say yes or no.",
          qualification: {
            status: existing.qualificationStatus,
            score: existing.qualificationScore,
            reasons: [],
          },
          assessment: {
            id: existing.id,
            status: existing.status,
            completed: true,
          },
          nextStep: "AWAITING_CONSENT",
          bookingUrl: null,
          persisted: true,
        });
      }

      return NextResponse.json({
        message:
          "Your assessment is complete. Would you like to receive the assessment confirmation and consultation booking link by email?",
        qualification: {
          status: existing.qualificationStatus,
          score: existing.qualificationScore,
          reasons: [],
        },
        assessment: {
          id: existing.id,
          status: existing.status,
          completed: true,
        },
        nextStep: "AWAITING_CONSENT",
        bookingUrl: null,
        persisted: true,
      });
    }

    /*
     * Discovery phase.
     */
    stage = "OpenAI request";

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "system",
          content: `Investment readiness checkpoint: ${investmentReadiness}`,
        },
        ...(qualificationContext
          ? [
              {
                role: "system" as const,
                content: [
                  "The prospect has already submitted these validated entry-form details.",
                  `Full name: ${qualificationContext.fullName}`,
                  `Email: ${qualificationContext.email}`,
                  `Business name: ${qualificationContext.businessName}`,
                  `Industry: ${qualificationContext.industry}`,
                  `Team size: ${qualificationContext.teamSize}`,
                  "Treat these details as known. Do not ask the prospect to repeat their name, email, business name, industry, or team size.",
                  "Continue with one focused operational discovery question at a time.",
                ].join("\n"),
              },
            ]
          : []),
        ...messages,
      ],
    });

    const raw = response.choices[0]?.message?.content;

    if (!raw) throw new Error("The AI returned an empty response.");

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
      throw new Error("The AI response did not match the expected format.");
    }

    const assessment = output.assessment;

    const normalized = {
      businessName:
        qualificationContext?.businessName ??
        cleanString(assessment.businessName),
      industry:
        qualificationContext?.industry ?? cleanString(assessment.industry),
      businessModel: cleanString(assessment.businessModel),
      teamSize:
        qualificationContext?.teamSize ?? cleanString(assessment.teamSize),
      decisionMaker: cleanString(assessment.decisionMaker),
      investmentReadiness,
      businessProfile: cleanObject(assessment.businessProfile),
      operationalChallenges: cleanArray(assessment.operationalChallenges),
      currentTools: cleanArray(assessment.currentTools),
      requirements: cleanArray(assessment.requirements),
      assessmentSummary: cleanString(assessment.assessmentSummary),
    };

  const userMessageCount = messages.filter(
  (message) => message.role === "user",
).length;

const hasAssessmentFindings =
  Object.keys(normalized.businessProfile).length > 0 ||
  normalized.operationalChallenges.length > 0 ||
  normalized.currentTools.length > 0 ||
  normalized.requirements.length > 0;

const enoughDiscovery =
  assessment.assessmentComplete === true &&
  userMessageCount >= 5 &&
  hasAssessmentFindings;

const rawQualification = qualifyAssessment({
  ...normalized,
  assessmentComplete: enoughDiscovery,
});

// Completion and qualification are separate decisions.
// A completed assessment may still require human review.
const completed = enoughDiscovery;

const qualification = completed &&
  rawQualification.status === "NEEDS_DISCOVERY"
  ? {
      ...rawQualification,
      status: "NEEDS_REVIEW" as const,
      reasons: [
        ...rawQualification.reasons,
        "The assessment is complete, but some qualification details require review.",
      ],
    }
  : rawQualification;

    const conversation = [
      ...messages,
      { role: "assistant" as const, content: output.message.trim() },
    ];

    stage = "saving assessment";

    const saved = await prisma.assessment.upsert({
      where: { sessionId },
      create: {
        sessionId,
        assessmentType: "BUSINESS_OS",
        contactName: qualificationContext?.fullName ?? null,
        contactEmail: qualificationContext?.email ?? null,
        status: completed ? "COMPLETED" : "IN_PROGRESS",
        qualificationStatus: qualification.status,
        qualificationScore: qualification.score,
        businessName: normalized.businessName,
        industry: normalized.industry,
        businessModel: normalized.businessModel,
        teamSize: normalized.teamSize,
        decisionMaker: normalized.decisionMaker,
        investmentReadiness: normalized.investmentReadiness,
        businessProfile: normalized.businessProfile,
        operationalChallenges: normalized.operationalChallenges,
        currentTools: normalized.currentTools,
        requirements: normalized.requirements,
        conversation,
        assessmentSummary: normalized.assessmentSummary,
        completedAt: completed ? new Date() : null,
        funnelState: completed
          ? qualification.status === "QUALIFIED"
            ? "AWAITING_CONSENT"
            : "CLOSED"
          : "DISCOVERY",
      },
      update: {
        assessmentType: "BUSINESS_OS",
        ...(qualificationContext && !existing?.contactName
          ? { contactName: qualificationContext.fullName }
          : {}),
        ...(qualificationContext && !existing?.contactEmail
          ? { contactEmail: qualificationContext.email }
          : {}),
        status: completed ? "COMPLETED" : "IN_PROGRESS",
        qualificationStatus: qualification.status,
        qualificationScore: qualification.score,
        businessName: normalized.businessName,
        industry: normalized.industry,
        businessModel: normalized.businessModel,
        teamSize: normalized.teamSize,
        decisionMaker: normalized.decisionMaker,
        investmentReadiness: normalized.investmentReadiness,
        businessProfile: normalized.businessProfile,
        operationalChallenges: normalized.operationalChallenges,
        currentTools: normalized.currentTools,
        requirements: normalized.requirements,
        conversation,
        assessmentSummary: normalized.assessmentSummary,
        ...(completed
          ? {
              completedAt: new Date(),
              funnelState:
                qualification.status === "QUALIFIED"
                  ? "AWAITING_CONSENT"
                  : "CLOSED",
            }
          : {}),
      },
      select: {
        id: true,
        status: true,
        qualificationStatus: true,
        qualificationScore: true,
        funnelState: true,
      },
    });

    const canBook =
      saved.status === "COMPLETED" &&
      saved.qualificationStatus === "QUALIFIED";

    /*
     * Notify the admin when an assessment first completes.
     * Use the persisted timestamp to avoid routine duplicate notifications.
     */
    if (completed && !existing?.completedAt) {
      const admin = getAdminNotificationEmail();

      if (admin) {
        const sentAt = new Date();

        await notifyAdmin(
          `6ixtem assessment completed: ${
            normalized.businessName || "New prospect"
          }`,
          [
            "A 6ixtem business assessment has been completed.",
            `Business: ${normalized.businessName || "Not provided"}`,
            `Industry: ${normalized.industry || "Not provided"}`,
            `Qualification: ${saved.qualificationStatus}`,
            `Score: ${saved.qualificationScore}`,
            `Assessment ID: ${saved.id}`,
            `Summary: ${normalized.assessmentSummary || "Not provided"}`,
          ].join("\n"),
          emailLayout(
            "6ixtem assessment completed",
            `
              <h1>Assessment completed</h1>
              <p><strong>Business:</strong> ${escapeHtml(normalized.businessName || "Not provided")}</p>
              <p><strong>Industry:</strong> ${escapeHtml(normalized.industry || "Not provided")}</p>
              <p><strong>Qualification:</strong> ${escapeHtml(saved.qualificationStatus)}</p>
              <p><strong>Score:</strong> ${saved.qualificationScore}</p>
              <p><strong>Assessment ID:</strong> ${escapeHtml(saved.id)}</p>
              <h2>Summary</h2>
              ${htmlParagraphs(normalized.assessmentSummary || "Not provided")}
            `
          )
        );

        // Record that the completion notification attempt occurred.
        // A failed email is logged; it does not invalidate the saved assessment.
        await prisma.assessment.update({
          where: { id: saved.id },
          data: { assessmentEmailSentAt: sentAt },
        });
      }
    }

    const nextStep = !completed
      ? "CONTINUE_ASSESSMENT"
      : canBook
        ? "AWAITING_CONSENT"
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
      bookingUrl: null,
      persisted: true,
    });
  } catch (error) {
    console.error("6ixtem assessment failure:", {
      stage,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });

    return NextResponse.json(
      { error: "We could not process that response. Please try again." },
      { status: 500 }
    );
  }
}