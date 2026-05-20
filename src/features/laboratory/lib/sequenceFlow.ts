import { MarkerType, type Connection, type Edge, type Node } from "@xyflow/react";

import type { SequenceSchemeEntry } from "@/features/tests/types/sequenceScheme";
import type { Test } from "@/features/tests/types/test";
import { getOutgoing } from "@/features/tests/lib/sequenceSchemeGraph";

import {
  FLOW_FINISH_ID,
  FLOW_START_HANDLE,
  FLOW_START_ID,
  RIGHT_EDGE_COLOR,
  START_EDGE_COLOR,
  WRONG_EDGE_COLOR,
} from "../constants";
import { normalizeFlowStartEntry } from "@/features/tests/lib/sequenceSchemeGraph";

export type QuestionNodeData = {
  text: string;
  onEdit?: () => void;
  onDelete?: () => void;
};

export type FlowTerminalNodeData = {
  label: string;
};

export function targetEntryToNodeId(
  target: SequenceSchemeEntry | null,
): string | null {
  if (target === null || target === "__flow_finish__") {
    return FLOW_FINISH_ID;
  }
  return target;
}

export function nodeIdToTargetEntry(nodeId: string): SequenceSchemeEntry {
  if (nodeId === FLOW_FINISH_ID) {
    return "__flow_finish__";
  }
  return nodeId;
}

export function buildFlowNodes(
  test: Test,
  questionTextById: Record<string, string>,
  onEditQuestion?: (questionId: string) => void,
  onDeleteQuestion?: (questionId: string) => void,
): Node[] {
  const nodes: Node[] = [
    {
      id: FLOW_START_ID,
      type: "flowStart",
      position: { x: 320, y: 0 },
      data: { label: "Start" },
      draggable: true,
    },
    {
      id: FLOW_FINISH_ID,
      type: "flowEnd",
      position: { x: 320, y: 520 },
      data: { label: "End" },
      draggable: true,
    },
  ];

  const columns = 3;
  const xGap = 300;
  const yGap = 180;

  test.questionIds.forEach((questionId, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    nodes.push({
      id: questionId,
      type: "question",
      position: {
        x: column * xGap + 40,
        y: row * yGap + 120,
      },
      data: {
        text: questionTextById[questionId] ?? `Question ${questionId}`,
        onEdit: onEditQuestion
          ? () => onEditQuestion(questionId)
          : undefined,
        onDelete: onDeleteQuestion
          ? () => onDeleteQuestion(questionId)
          : undefined,
      },
      draggable: true,
    });
  });

  return nodes;
}

function makeStartEdge(target: string): Edge {
  return {
    id: `${FLOW_START_ID}:${FLOW_START_HANDLE}->${target}`,
    source: FLOW_START_ID,
    sourceHandle: FLOW_START_HANDLE,
    target,
    targetHandle: "target",
    type: "smoothstep",
    animated: false,
    className: "edge-start",
    style: {
      stroke: START_EDGE_COLOR,
      strokeWidth: 2.5,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
      color: START_EDGE_COLOR,
    },
    zIndex: 1,
  };
}

function makeEdge(
  source: string,
  sourceHandle: "wrong" | "correct",
  target: string,
): Edge {
  const isWrong = sourceHandle === "wrong";
  const color = isWrong ? WRONG_EDGE_COLOR : RIGHT_EDGE_COLOR;

  return {
    id: `${source}:${sourceHandle}->${target}`,
    source,
    sourceHandle,
    target,
    targetHandle: "target",
    type: "smoothstep",
    animated: false,
    label: isWrong ? "W" : "R",
    className: isWrong ? "edge-wrong" : "edge-right",
    style: {
      stroke: color,
      strokeWidth: 2.5,
    },
    labelStyle: {
      fontSize: 11,
      fontWeight: 600,
      fill: color,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
      color,
    },
    zIndex: 1,
  };
}

export function buildFlowEdges(test: Test): Edge[] {
  const edges: Edge[] = [];

  const startTarget = normalizeFlowStartEntry(test.sequenceScheme.__flow_start__);
  if (startTarget !== null) {
    const startTargetId = targetEntryToNodeId(startTarget);
    if (startTargetId) {
      edges.push(makeStartEdge(startTargetId));
    }
  }

  for (const sourceId of test.questionIds) {
    const { wrong, correct } = getOutgoing(test.sequenceScheme[sourceId]);

    if (wrong !== null) {
      const targetId = targetEntryToNodeId(wrong);
      if (targetId) {
        edges.push(makeEdge(sourceId, "wrong", targetId));
      }
    }

    if (correct !== null) {
      const targetId = targetEntryToNodeId(correct);
      if (targetId) {
        edges.push(makeEdge(sourceId, "correct", targetId));
      }
    }
  }

  return edges;
}

export function mergeNodePositions(
  nextNodes: Node[],
  previousNodes: Node[],
): Node[] {
  const positionById = new Map(
    previousNodes.map((node) => [node.id, node.position]),
  );

  return nextNodes.map((node) => {
    const position = positionById.get(node.id);
    return position ? { ...node, position } : node;
  });
}

export function isValidFlowConnection(connection: Connection): boolean {
  if (!connection.source || !connection.target || !connection.sourceHandle) {
    return false;
  }
  if (connection.target === FLOW_START_ID) {
    return false;
  }
  if (connection.source === FLOW_FINISH_ID) {
    return false;
  }
  if (connection.source === FLOW_START_ID) {
    return connection.sourceHandle === FLOW_START_HANDLE;
  }
  if (
    connection.sourceHandle !== "wrong" &&
    connection.sourceHandle !== "correct"
  ) {
    return false;
  }
  return true;
}
