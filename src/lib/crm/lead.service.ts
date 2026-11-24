
import { prisma } from "@/lib/prisma";
import type { Lead } from "@prisma/client";

export type AssessmentLeadInput = {
  name?: string | null;
  email: string;
  businessName?: string | null;
  industry?: string | null;
  message?: string | null;
  source?: string | null;
  offerType: "BUSINESS_OS" | "CUSTOMER_ACQUISITION";
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function cleanValue(value?: string | null): string | null {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

/**
 * Find or create a permanent CRM Lead from an assessment.
 *
 * Existing CRM-managed fields such as status, notes, assignment,
 * budget, project, and priority are deliberately preserved.
 */
export async function findOrCreateAssessmentLead(
  input: AssessmentLeadInput,
): Promise<Lead> {
  const email = normalizeEmail(input.email);

  if (!email) {
    throw new Error("A valid email address is required to create a CRM lead.");
  }

  const name =
    cleanValue(input.name) ??
    cleanValue(input.businessName) ??
    email.split("@")[0];

  const businessName = cleanValue(input.businessName);
  const industry = cleanValue(input.industry);
  const message =
    cleanValue(input.message) ??
    `Submitted ${input.offerType} assessment`;

  // Match existing emails case-insensitively, including legacy records.
  const existingLead = await prisma.lead.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (existingLead) {
    // Only fill missing profile fields.
    // Never overwrite existing CRM-managed information.
    const updates: {
      name?: string;
      companyName?: string;
      industry?: string;
    } = {};

    if (!cleanValue(existingLead.name)) {
      updates.name = name;
    }

    if (!cleanValue(existingLead.companyName) && businessName) {
      updates.companyName = businessName;
    }

    if (!cleanValue(existingLead.industry) && industry) {
      updates.industry = industry;
    }

    if (Object.keys(updates).length > 0) {
      return prisma.lead.update({
        where: {
          id: existingLead.id,
        },
        data: updates,
      });
    }

    return existingLead;
  }

  // Create a new permanent CRM contact.
  return prisma.lead.create({
    data: {
      name,
      email,
      message,
      companyName: businessName,
      industry,
      source: cleanValue(input.source),
    },
  });
}
