import type { EvaluationResult, Problem, Solution } from "../types/domain";
import { CATEGORY_MAX } from "../types/domain";
import { parseEvaluationResult } from "../utils/evaluationParser";
import type { FeedbackProvider } from "./FeedbackProvider";

/**
 * Deterministic evaluator for local development and tests.
 * It rewards actual design evidence: clear ownership, requirement coverage, and behavior,
 * not keyword-only mentions like "Strategy Pattern" or "Encapsulation".
 */
export class MockFeedbackProvider implements FeedbackProvider {
  constructor(private readonly fixture?: EvaluationResult | (() => never) | "invalid-json") {}

  async evaluate(problem: Problem, solution: Solution): Promise<EvaluationResult> {
    if (this.fixture === "invalid-json") {
      return parseEvaluationResult("this is not json");
    }
    if (typeof this.fixture === "function") {
      this.fixture();
    }
    if (this.fixture && typeof this.fixture === "object") {
      return this.fixture;
    }

    const text = [
      solution.classes,
      solution.interfaces,
      solution.relationships,
      solution.responsibilities,
      solution.explanation,
    ]
      .join(" ")
      .toLowerCase();

    const namedTypes = extractNamedTypes(solution);
    const requirementReports = problem.requirements.map((requirement) => ({
      requirement,
      covered: requirementCovered(requirement, text, namedTypes),
    }));
    const requirementCoverage = requirementReports.filter((report) => report.covered).length / Math.max(1, requirementReports.length);
    const requirementHits = requirementReports.filter((report) => report.covered).length;
    const missingRequirements = requirementReports.filter((report) => !report.covered).map((report) => report.requirement);

    const conceptHits = problem.expectedConcepts.filter((concept) => conceptSignal(concept, text)).length;
    const domainTerms = extractDomainTerms(problem);
    const domainCoverage = domainTerms.length === 0 ? 0 : domainTerms.filter((term) => text.includes(term)).length / domainTerms.length;
    const structuralSignal = containsStructuralSignals(text);
    const genericPatternHits = genericPatternTerms.filter((term) => text.includes(term)).length;
    const hasBehaviorEvidence = /assign|track|calculate|issue|return|prevent|reject|search|move|schedule|park|hold|release|select|validate|delegate|own|contains/.test(text);
    const hasMeaningfulAbstraction = /interface|strategy|abstract|base class|depends on .*strategy|delegates .* to .*strategy|factory|policy/i.test(text) && /calculate|select|assign|dispatch|fee|allocation|pricing/i.test(text);
    const ownershipEvidence = /owns|contains|belongs to|managed by|delegates|controls|tracks|coordinates/i.test(text);
    const extensionEvidence = /(strategy|policy|factory|state|dispatcher|algorithm|rule)/i.test(text) && /delegate|replace|inject|without changing|without modifying|allows .* new/i.test(text);
    const hasRealEvidence = requirementCoverage >= 0.35 || (structuralSignal && namedTypes.length >= 2) || (hasBehaviorEvidence && namedTypes.length >= 3);

    const coverage = clamp(
      Math.max(
        0,
        requirementCoverage * 0.6 +
          (conceptHits / Math.max(1, problem.expectedConcepts.length)) * 0.2 +
          (namedTypes.length >= 3 ? 0.14 : namedTypes.length >= 1 ? 0.05 : 0) +
          (structuralSignal ? 0.12 : 0) +
          domainCoverage * 0.14 -
          Math.max(0, genericPatternHits - 2) * 0.15,
      ),
      1,
    );

    const categories = {
      classDesign: cap(0.5 + coverage * 1.7 + (ownershipEvidence ? 0.2 : 0) - (missingRequirements.length > 0 ? 0.25 : 0), CATEGORY_MAX.classDesign),
      abstraction: cap(0.4 + (hasMeaningfulAbstraction ? 1.3 : 0.2) + requirementCoverage * 0.8 - Math.max(0, genericPatternHits - 1) * 0.2, CATEGORY_MAX.abstraction),
      encapsulation: cap(0.2 + (hasBehaviorEvidence ? 0.5 : 0) + (ownershipEvidence ? 0.2 : 0) - (namedTypes.length === 0 ? 0.2 : 0), CATEGORY_MAX.encapsulation),
      relationships: cap(0.3 + coverage * 1.6 + (structuralSignal ? 0.3 : 0) - (!structuralSignal && namedTypes.length >= 2 ? 0.2 : 0), CATEGORY_MAX.relationships),
      extensibility: cap(0.2 + (extensionEvidence ? 1.4 : 0.4) + requirementCoverage * 0.9 - (missingRequirements.length > 1 ? 0.3 : 0), CATEGORY_MAX.extensibility),
      designPatterns: cap(0.1 + (extensionEvidence ? 0.8 : 0.1) + (hasMeaningfulAbstraction ? 0.2 : 0) - Math.max(0, genericPatternHits - 1) * 0.18, CATEGORY_MAX.designPatterns),
    };

    const baseScore =
      categories.classDesign +
      categories.abstraction +
      categories.encapsulation +
      categories.relationships +
      categories.extensibility +
      categories.designPatterns;

    let score = hasRealEvidence ? cap(baseScore, 10) : cap(baseScore * 0.45, 10);
    if (missingRequirements.length >= 3) {
      score = cap(score * 0.6, 10);
    } else if (missingRequirements.length >= 2) {
      score = cap(score * 0.72, 10);
    } else if (missingRequirements.length > 0 && requirementCoverage < 0.5) {
      score = cap(score * 0.8, 10);
    }

    const strengths = buildStrengths(problem, requirementReports, namedTypes, conceptHits, domainCoverage, hasRealEvidence);
    const weaknesses = buildWeaknesses(problem, requirementReports, missingRequirements, hasRealEvidence, ownershipEvidence, extensionEvidence);
    const suggestions = buildSuggestions(problem, missingRequirements, requirementReports);
    const improvedDesign = buildImprovedDesign(problem, missingRequirements);

    return {
      score,
      categories,
      strengths,
      weaknesses,
      suggestions,
      improvedDesign,
    };
  }
}

function buildStrengths(
  problem: Problem,
  requirementReports: Array<{ requirement: string; covered: boolean }>,
  namedTypes: string[],
  conceptHits: number,
  domainCoverage: number,
  hasRealEvidence: boolean,
): string[] {
  const covered = requirementReports.filter((entry) => entry.covered).length;
  const strongest = [] as string[];

  if (covered >= Math.max(2, Math.ceil(problem.requirements.length / 2))) {
    strongest.push(`The design covers several core requirements for ${problem.title}, including clear responsibility boundaries and behavior ownership.`);
  } else if (namedTypes.length >= 3) {
    strongest.push(`The submission names a coherent set of domain types and anchors them to actual responsibilities for ${problem.title}.`);
  } else {
    strongest.push(`The submission includes an initial model for ${problem.title}, with enough structure to suggest an object-oriented design.`);
  }

  if (conceptHits > 0 || domainCoverage >= 0.15) {
    strongest.push(`The answer shows domain-relevant concepts and terminology from ${problem.title}, which makes the design feel grounded rather than abstract.`);
  } else if (hasRealEvidence) {
    strongest.push(`The design has a plausible behavior flow and several concrete responsibilities, even if some variation points could be sharpened.`);
  }

  strongest.push("The strongest parts of the solution are the areas where the candidate ties behavior to specific classes or interfaces instead of naming patterns alone.");
  return strongest.slice(0, 4);
}

function buildWeaknesses(
  problem: Problem,
  requirementReports: Array<{ requirement: string; covered: boolean }>,
  missingRequirements: string[],
  hasRealEvidence: boolean,
  ownershipEvidence: boolean,
  extensionEvidence: boolean,
): string[] {
  const weaknesses: string[] = [];

  if (!hasRealEvidence) {
    weaknesses.push("The submission reads more like a buzzword list than a concrete design. It does not yet show enough ownership, state transitions, or requirement-specific behavior to justify the structure.");
  }

  if (missingRequirements.length > 0) {
    const missing = missingRequirements.slice(0, 2);
    weaknesses.push(
      `The design still leaves a gap on key requirements: ${missing.map((item) => item.toLowerCase()).join("; ")}. These are not minor details—they affect whether the system can behave correctly under real usage.`,
    );
  }

  if (!ownershipEvidence) {
    weaknesses.push(`The submission does not clearly explain who owns the mutable state or decision-making for ${problem.title}. Without that, responsibilities are too blurred and the design is harder to evolve.`);
  }

  if (!extensionEvidence) {
    weaknesses.push("The variation points are not yet concrete enough. The candidate should show how rules such as pricing, allocation, scheduling, or state transitions can change without rewriting the core model.");
  }

  if (weaknesses.length === 0) {
    weaknesses.push("The design is close, but a few responsibilities should be split more explicitly so each type has a clearer job and a stricter boundary.");
  }

  return weaknesses.slice(0, 3);
}

function buildSuggestions(problem: Problem, missingRequirements: string[], requirementReports: Array<{ requirement: string; covered: boolean }>): string[] {
  const suggestions: string[] = [];

  if (missingRequirements.length > 0) {
    const missing = missingRequirements.slice(0, 2);
    for (const requirement of missing) {
      suggestions.push(`For ${problem.title}, map "${requirement}" to a specific class or interface and explain who owns that behavior.`);
    }
  }

  const coveredCount = requirementReports.filter((report) => report.covered).length;
  if (coveredCount > 0) {
    suggestions.push("Name the owning class for each responsibility: coordinator, state holder, strategy, and data record. That makes the design easier to judge and defend.");
  }

  suggestions.push("Introduce a clear extension point for behavior that varies by rule or policy, and explain how the coordinator delegates to it instead of branching internally.");
  return suggestions.slice(0, 3);
}

function buildImprovedDesign(problem: Problem, missingRequirements: string[]): string {
  const baseName = problem.title.replace(/\s+/g, "");
  const coordinator = baseName.endsWith("System") ? baseName : `${baseName}Manager`;
  const domainHints = [
    "Owner",
    "Record",
    "Policy",
    "State",
    "Coordinator",
  ].slice(0, Math.max(2, Math.min(4, 5 - Math.max(0, missingRequirements.length - 1))));

  const featureLine = missingRequirements.length > 0
    ? `The design should explicitly separate coordination from policy and data ownership so the missing requirement${missingRequirements.length > 1 ? "s" : ""} are handled by the correct type.`
    : "The design should keep orchestration in the coordinator while each supporting type owns state and behavior.";

  return `${problem.title}: ${coordinator} coordinates the workflow. A small set of concrete domain types manage state and lifecycle, while rule-specific behavior is delegated to replaceable interfaces such as ${domainHints.join(", ")}. This keeps the main orchestrator focused on decisions and sequencing, while data holders enforce invariants like availability, capacity, due dates, or occupancy. ${featureLine}`;
}

function requirementCovered(requirement: string, text: string, namedTypes: string[]): boolean {
  const tokens = tokenize(requirement);
  const domainWords = tokens.filter((token) => token.length > 3 && !STOP_WORDS.has(token));
  if (domainWords.length === 0) {
    return false;
  }

  const matchingWords = domainWords.filter((token) => text.includes(token));
  const namedTypeMatches = namedTypes.some((type) => text.includes(type.toLowerCase()));
  const actionMatch = ACTION_WORDS.some((word) => text.includes(word));

  return matchingWords.length >= Math.max(2, Math.ceil(domainWords.length / 2)) || (matchingWords.length >= 1 && (namedTypeMatches || actionMatch));
}

const ACTION_WORDS = [
  "assign",
  "track",
  "issue",
  "return",
  "refund",
  "prevent",
  "search",
  "calculate",
  "move",
  "schedule",
  "dispatch",
  "park",
  "hold",
  "release",
  "select",
  "validate",
  "delegate",
  "register",
  "catalog",
  "loan",
  "occupancy",
  "availability",
  "cancel",
  "compute",
  "maintain",
  "store",
  "check",
  "reserve",
  "confirm",
  "reject",
];

const STOP_WORDS = new Set([
  "the",
  "and",
  "or",
  "with",
  "when",
  "while",
  "should",
  "allow",
  "without",
  "into",
  "from",
  "for",
  "this",
  "that",
  "their",
  "there",
  "many",
  "using",
  "does",
  "not",
  "must",
  "can",
  "be",
  "are",
  "is",
  "an",
  "a",
  "of",
  "to",
  "on",
  "by",
  "if",
  "it",
  "as",
  "at",
  "do",
  "than",
  "such",
  "same",
  "new",
  "later",
]);

const genericPatternTerms = [
  "strategy",
  "state",
  "factory",
  "observer",
  "singleton",
  "pattern",
  "encapsulation",
  "abstraction",
  "composition",
  "association",
  "aggregation",
  "cohesion",
  "interface",
];

function extractNamedTypes(solution: Solution): string[] {
  return Array.from(
    new Set(
      [solution.classes, solution.interfaces]
        .join(" ")
        .split(/[\s,;]+/)
        .map((part) => part.trim())
        .filter((part) => part.length > 1 && !/^(and|or|with|the|of|for|to|a|an)$/i.test(part)),
    ),
  );
}

function extractDomainTerms(problem: Problem): string[] {
  const source = [problem.title, ...problem.requirements, ...problem.constraints].join(" ").toLowerCase();
  return Array.from(
    new Set(
      source
        .replace(/[^a-z0-9]+/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 3)
        .filter((word) => !["there", "should", "when", "using", "without", "their", "model", "design", "objects", "intended", "while", "other", "allow", "support", "value", "through", "many", "system"].includes(word))
        .filter((word) => !genericPatternTerms.includes(word)),
    ),
  );
}

function containsStructuralSignals(text: string): boolean {
  const structuralWords = [
    "owns",
    "contains",
    "references",
    "assigns",
    "tracks",
    "calculates",
    "delegates",
    "injects",
    "stores",
    "validates",
    "returns",
    "issues",
    "prevents",
    "moves",
    "assign",
    "track",
    "compute",
    "validate",
    "prevent",
    "search",
    "issue",
    "cancel",
    "refund",
    "hold",
    "release",
    "select",
    "park",
    "dispense",
    "calculate",
  ];
  return structuralWords.some((word) => text.includes(word));
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

function requirementSignal(requirement: string, text: string): boolean {
  const tokens = tokenize(requirement);
  if (tokens.length === 0) {
    return false;
  }

  const overlap = tokens.filter((token) => text.includes(token));
  const actionWords = [
    "assign",
    "track",
    "issue",
    "return",
    "prevent",
    "search",
    "calculate",
    "cancel",
    "refund",
    "hold",
    "release",
    "select",
    "store",
    "check",
    "validate",
    "move",
    "park",
    "dispense",
  ];

  return overlap.length >= 2 || (overlap.length >= 1 && actionWords.some((word) => text.includes(word)));
}

function conceptSignal(concept: string, text: string): boolean {
  const tokens = tokenize(concept);
  if (tokens.length === 0) {
    return false;
  }

  return tokens.some((token) => text.includes(token));
}

function cap(value: number, max: number): number {
  return Math.round(Math.min(max, Math.max(0, value)) * 10) / 10;
}

function clamp(value: number, max: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(max, Math.max(0, value));
}
