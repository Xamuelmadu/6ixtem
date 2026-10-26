
export type QualificationInput = {
  businessName?: string | null;
  industry?: string | null;
  businessModel?: string | null;
  teamSize?: string | null;
  decisionMaker?: string | null;
  investmentReadiness?: string | null;
  operationalChallenges?: unknown;
  requirements?: unknown;
  assessmentComplete?: boolean;
};

export type QualificationStatus =
  | "NEEDS_DISCOVERY"
  | "QUALIFIED"
  | "NEEDS_REVIEW"
  | "NOT_READY"
  | "NOT_A_FIT";

export type QualificationResult = {
  status: QualificationStatus;
  score: number;
  reasons: string[];
};

function hasText(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function hasContent(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (value && typeof value === "object") {
    return Object.keys(value).length > 0;
  }

  return false;
}

export function qualifyAssessment(
  input: QualificationInput,
): QualificationResult {
  let score = 0;
  const reasons: string[] = [];

  const profileComplete =
    hasText(input.businessName) &&
    hasText(input.industry) &&
    hasText(input.businessModel) &&
    hasText(input.teamSize);

  const challengesIdentified = hasContent(
    input.operationalChallenges,
  );

  const requirementsIdentified = hasContent(
    input.requirements,
  );

  const decisionMakerKnown = hasText(input.decisionMaker);

  const readiness = input.investmentReadiness
    ?.toLowerCase()
    .trim();

  if (profileComplete) {
    score += 20;
    reasons.push("Core business profile identified.");
  } else {
    reasons.push(
      "More business profile information is required.",
    );
  }

  if (challengesIdentified) {
    score += 25;
    reasons.push(
      "Operational challenges have been identified.",
    );
  } else {
    reasons.push(
      "Operational challenges require further discovery.",
    );
  }

  if (requirementsIdentified) {
    score += 20;
    reasons.push(
      "Initial requirements have been identified.",
    );
  } else {
    reasons.push(
      "Required capabilities need clarification.",
    );
  }

  if (decisionMakerKnown) {
    score += 15;
    reasons.push(
      "Decision-making involvement has been discussed.",
    );
  } else {
    reasons.push(
      "Decision-making authority needs clarification.",
    );
  }

  if (readiness === "yes") {
    score += 20;
    reasons.push(
      "Prospect indicates investment readiness.",
    );
  } else if (readiness === "maybe") {
    score += 10;
    reasons.push(
      "Investment readiness depends on the proposed scope.",
    );
  }

  if (readiness === "no") {
    return {
      status: "NOT_READY",
      score,
      reasons: [
        ...reasons,
        "Prospect is not currently ready to invest.",
      ],
    };
  }

  if (!input.assessmentComplete || !profileComplete) {
    return {
      status: "NEEDS_DISCOVERY",
      score,
      reasons,
    };
  }

  if (
    !challengesIdentified ||
    !requirementsIdentified ||
    !decisionMakerKnown ||
    !readiness
  ) {
    return {
      status: "NEEDS_REVIEW",
      score,
      reasons,
    };
  }

  // A "maybe" prospect can qualify based on the same score
  // threshold when the required assessment information is present.
  if (score >= 80) {
    return {
      status: "QUALIFIED",
      score,
      reasons,
    };
  }

  return {
    status: "NEEDS_REVIEW",
    score,
    reasons: [
      ...reasons,
      "The assessment requires further review before consultation.",
    ],
  };
}
