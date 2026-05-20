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

/** Vertical gap after each row: added on top of the row’s tallest node (primary flow). */
const LAYOUT_LAYER_GAP = 180;
/** Horizontal gap between adjacent nodes within the same row. */
const LAYOUT_IN_ROW_GAP = 52;
const DEFAULT_QUESTION_W = 256;
const DEFAULT_QUESTION_H = 170;
const DEFAULT_TERMINAL_W = 140;
const DEFAULT_TERMINAL_H = 52;

function estimateNodeSize(node: Node): { w: number; h: number } {
  const w =
    node.measured?.width ??
    node.width ??
    (node.type === "question" ? DEFAULT_QUESTION_W : DEFAULT_TERMINAL_W);
  const h =
    node.measured?.height ??
    node.height ??
    (node.type === "question" ? DEFAULT_QUESTION_H : DEFAULT_TERMINAL_H);
  return { w: Number(w), h: Number(h) };
}

/**
 * Longest-path layering from the start node (DAG-style sequence graph).
 * Unreachable nodes are placed in a trailing row.
 */
function computeLongestPathLayers(
  nodes: Node[],
  edges: Edge[],
): Map<string, number> {
  const layer = new Map<string, number>();
  for (const n of nodes) {
    layer.set(n.id, n.id === FLOW_START_ID ? 0 : -1);
  }

  const maxIterations = Math.max(nodes.length + edges.length + 2, 8);
  for (let i = 0; i < maxIterations; i++) {
    let changed = false;
    for (const e of edges) {
      const ls = layer.get(e.source);
      if (ls === undefined || ls < 0) continue;
      const nextLayer = ls + 1;
      const lt = layer.get(e.target);
      if (lt === undefined || lt < nextLayer) {
        layer.set(e.target, nextLayer);
        changed = true;
      }
    }
    if (!changed) break;
  }

  let maxL = 0;
  for (const v of layer.values()) {
    if (v > maxL) maxL = v;
  }

  for (const n of nodes) {
    const v = layer.get(n.id);
    if (v === undefined || v < 0) {
      layer.set(n.id, maxL + 1);
    }
  }

  return layer;
}

function compareNodesInLayer(a: Node, b: Node, edges: Edge[]): number {
  const primaryIncoming = (
    id: string,
  ): { order: number; source: string; handle: string } | null => {
    const incoming = edges.filter((e) => e.target === id);
    if (incoming.length === 0) return null;
    const sorted = [...incoming].sort((x, y) =>
      x.source === y.source
        ? (x.sourceHandle ?? "").localeCompare(y.sourceHandle ?? "")
        : x.source.localeCompare(y.source),
    );
    const e = sorted[0];
    const order =
      e.sourceHandle === "wrong"
        ? 0
        : e.sourceHandle === "correct"
          ? 1
          : e.source === FLOW_START_ID
            ? -1
            : 2;
    return { order, source: e.source, handle: e.sourceHandle ?? "" };
  };

  const ia = primaryIncoming(a.id);
  const ib = primaryIncoming(b.id);
  if (ia && ib) {
    if (ia.order !== ib.order) return ia.order - ib.order;
    const sc = ia.source.localeCompare(ib.source);
    if (sc !== 0) return sc;
    const hc = ia.handle.localeCompare(ib.handle);
    if (hc !== 0) return hc;
  } else if (ia || ib) {
    return ia ? -1 : 1;
  }

  if (a.type !== b.type) {
    const rank = (t: string | undefined) =>
      t === "flowStart" ? 0 : t === "question" ? 1 : t === "flowEnd" ? 3 : 2;
    return rank(a.type) - rank(b.type);
  }

  return a.id.localeCompare(b.id);
}

/**
 * Top-to-bottom layered layout: earlier layers sit higher on the canvas; edges
 * flow downward. Nodes in the same layer sit in one row with consistent spacing.
 */
export function applyLayeredLayout(nodes: Node[], edges: Edge[]): Node[] {
  if (nodes.length === 0) return nodes;

  const layerById = computeLongestPathLayers(nodes, edges);
  const maxLayer = Math.max(0, ...layerById.values());

  const layerToNodes = new Map<number, Node[]>();
  for (const node of nodes) {
    const layer = layerById.get(node.id) ?? maxLayer + 1;
    const list = layerToNodes.get(layer) ?? [];
    list.push(node);
    layerToNodes.set(layer, list);
  }

  const sortedLayers = [...layerToNodes.keys()].sort((a, b) => a - b);
  const positionById = new Map<string, { x: number; y: number }>();

  let rowTop = 0;
  for (const layer of sortedLayers) {
    const row = [...(layerToNodes.get(layer) ?? [])].sort((a, b) =>
      compareNodesInLayer(a, b, edges),
    );
    let xCursor = 0;
    let maxRowH = 0;
    for (const node of row) {
      const { w, h } = estimateNodeSize(node);
      positionById.set(node.id, { x: xCursor, y: rowTop });
      xCursor += w + LAYOUT_IN_ROW_GAP;
      if (h > maxRowH) maxRowH = h;
    }
    rowTop += maxRowH + LAYOUT_LAYER_GAP;
  }

  const xs = [...positionById.values()].map((p) => p.x);
  const ys = [...positionById.values()].map((p) => p.y);
  const minX = xs.length ? Math.min(...xs) : 0;
  const minY = ys.length ? Math.min(...ys) : 0;

  return nodes.map((node) => {
    const p = positionById.get(node.id);
    if (!p) return node;
    return {
      ...node,
      position: { x: p.x - minX, y: p.y - minY },
    };
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
