import type {
  SequenceScheme,
  SequenceSchemeEntry,
} from "@/features/tests/types/sequenceScheme";

export const BRANCH_SEPARATOR = "-W|R-";
export const FLOW_START_KEY = "__flow_start__" as const;

export type BranchSide = "W" | "R";

export type SequenceSchemeValue = SequenceScheme[string];

export type OutgoingConnections = {
  wrong: SequenceSchemeEntry | null;
  correct: SequenceSchemeEntry | null;
};

export function isFlowStartNode(nodeId: string): boolean {
  return nodeId === FLOW_START_KEY;
}

export function isBranchString(entry: string): boolean {
  return entry.includes(BRANCH_SEPARATOR);
}

export function formatEntryPart(entry: SequenceSchemeEntry): string {
  if (entry === null) return "null";
  return entry;
}

export function parseEntryPart(part: string): SequenceSchemeEntry {
  if (part === "null") return null;
  return part;
}

export function parseBranch(entry: string): OutgoingConnections {
  const index = entry.indexOf(BRANCH_SEPARATOR);
  if (index === -1) {
    const value = parseEntryPart(entry);
    return { wrong: value, correct: value };
  }
  return {
    wrong: parseEntryPart(entry.slice(0, index)),
    correct: parseEntryPart(entry.slice(index + BRANCH_SEPARATOR.length)),
  };
}

export function formatBranch(
  wrong: SequenceSchemeEntry,
  correct: SequenceSchemeEntry,
): string {
  return `${formatEntryPart(wrong)}${BRANCH_SEPARATOR}${formatEntryPart(correct)}`;
}

export function formatSequenceEntry(
  wrong: string,
  correct: string,
): string {
  return formatBranch(wrong, correct);
}

export function normalizeFlowStartEntry(
  entry: SequenceSchemeEntry | SequenceSchemeValue | undefined,
): SequenceSchemeEntry {
  if (entry === undefined) {
    return null;
  }
  if (typeof entry === "string" && isBranchString(entry)) {
    return parseBranch(entry).wrong;
  }
  return entry;
}

/** No scheme entry for a question means both W and R are unset (null). */
export function getOutgoing(
  entry: SequenceSchemeValue | undefined,
): OutgoingConnections {
  if (entry === undefined) {
    return { wrong: null, correct: null };
  }
  if (entry === null || entry === "__flow_finish__") {
    return { wrong: entry, correct: entry };
  }
  if (isBranchString(entry)) {
    return parseBranch(entry);
  }
  return { wrong: entry, correct: entry };
}

export function normalizeBranchEntry(
  wrong: SequenceSchemeEntry | null,
  correct: SequenceSchemeEntry | null,
): SequenceSchemeValue | undefined {
  if (wrong === null && correct === null) {
    return undefined;
  }
  if (wrong !== null && correct !== null && wrong === correct) {
    return wrong;
  }
  return formatBranch(wrong ?? null, correct ?? null) as SequenceSchemeValue;
}

function sanitizeTarget(
  target: SequenceSchemeEntry,
  questionIds: string[],
): SequenceSchemeEntry {
  if (target === null || target === "__flow_finish__") {
    return target;
  }
  return questionIds.includes(target) ? target : null;
}

export function pruneSequenceScheme(
  scheme: SequenceScheme,
  questionIds: string[],
): SequenceScheme {
  const validNodes = new Set(questionIds);
  const next = {} as SequenceScheme;

  for (const [key, value] of Object.entries(scheme)) {
    if (key === FLOW_START_KEY) {
      next[FLOW_START_KEY] = sanitizeTarget(
        normalizeFlowStartEntry(value),
        questionIds,
      );
      continue;
    }

    if (!validNodes.has(key)) {
      continue;
    }

    if (value === undefined) continue;

    if (value === null || value === "__flow_finish__") {
      next[key] = value;
      continue;
    }

    if (typeof value === "string" && isBranchString(value)) {
      const { wrong, correct } = parseBranch(value);
      const entry = normalizeBranchEntry(
        sanitizeTarget(wrong, questionIds),
        sanitizeTarget(correct, questionIds),
      );
      if (entry !== undefined) {
        next[key] = entry;
      }
      continue;
    }

    if (typeof value === "string") {
      const entry = sanitizeTarget(value, questionIds);
      if (entry !== null) {
        next[key] = entry;
      }
    }
  }

  if (next[FLOW_START_KEY] === undefined) {
    next[FLOW_START_KEY] = questionIds[0] ?? null;
  }

  return next;
}

export function branchTargetsFromEntry(
  entry: SequenceSchemeValue | undefined,
  fallbackQuestionId: string,
): { wrong: string; correct: string } {
  const { wrong, correct } = getOutgoing(entry);
  return {
    wrong: wrong === null ? fallbackQuestionId : wrong,
    correct: correct === null ? fallbackQuestionId : correct,
  };
}

export function setFlowStartConnection(
  scheme: SequenceScheme,
  target: SequenceSchemeEntry | null,
): SequenceScheme {
  return {
    ...scheme,
    [FLOW_START_KEY]: target,
  };
}

export function setConnection(
  scheme: SequenceScheme,
  fromNode: string,
  side: BranchSide,
  target: SequenceSchemeEntry | null,
): SequenceScheme {
  if (isFlowStartNode(fromNode)) {
    return setFlowStartConnection(scheme, target);
  }

  const { wrong, correct } = getOutgoing(scheme[fromNode]);
  const nextWrong = side === "W" ? target : wrong;
  const nextCorrect = side === "R" ? target : correct;
  const next = { ...scheme };
  const entry = normalizeBranchEntry(nextWrong, nextCorrect);

  if (entry === undefined) {
    delete next[fromNode];
  } else {
    next[fromNode] = entry;
  }

  return next;
}
