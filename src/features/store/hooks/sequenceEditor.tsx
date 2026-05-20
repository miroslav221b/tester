"use client";

import { useCallback } from "react";

import {
  FLOW_START_KEY,
  getOutgoing as getOutgoingFromEntry,
  isFlowStartNode,
  normalizeFlowStartEntry,
  pruneSequenceScheme,
  type BranchSide,
  type OutgoingConnections,
} from "@/features/tests/lib/sequenceSchemeGraph";
import type {
  SequenceScheme,
  SequenceSchemeEntry,
} from "@/features/tests/types/sequenceScheme";
import { useAppDispatch, useAppSelector } from "@/features/store/hooks";
import { selectTestById } from "@/features/store/selectors";
import {
  setFlowStartConnection,
  setSequenceConnection,
} from "@/features/store/slices/testsSlice";

export type SequenceEditor = {
  sequenceScheme: SequenceScheme | undefined;
  getOutgoing: (nodeId: string) => OutgoingConnections;
  getStartOutgoing: () => SequenceSchemeEntry | null;
  removeStartConnection: () => void;
  createStartConnection: (toNode: SequenceSchemeEntry) => void;
  removeWrongConnection: (nodeId: string) => void;
  removeRightConnection: (nodeId: string) => void;
  createWrongConnection: (
    fromNode: string,
    toNode: SequenceSchemeEntry,
  ) => void;
  createRightConnection: (
    fromNode: string,
    toNode: SequenceSchemeEntry,
  ) => void;
};

export function useSequenceEditor(testId: string): SequenceEditor {
  const dispatch = useAppDispatch();
  const test = useAppSelector(selectTestById(testId));

  const applyConnection = useCallback(
    (fromNode: string, side: BranchSide, target: SequenceSchemeEntry | null) => {
      if (!test) return;
      dispatch(
        setSequenceConnection({
          testId,
          fromNode,
          side,
          target,
        }),
      );
    },
    [dispatch, test, testId],
  );

  const applyStartConnection = useCallback(
    (target: SequenceSchemeEntry | null) => {
      if (!test) return;
      dispatch(
        setFlowStartConnection({
          testId,
          target,
        }),
      );
    },
    [dispatch, test, testId],
  );

  const getScheme = useCallback(() => {
    if (!test) return undefined;
    return pruneSequenceScheme(test.sequenceScheme, test.questionIds);
  }, [test]);

  const getOutgoing = useCallback(
    (nodeId: string): OutgoingConnections => {
      const scheme = getScheme();
      if (!scheme) {
        return { wrong: null, correct: null };
      }
      if (isFlowStartNode(nodeId)) {
        const target = normalizeFlowStartEntry(scheme[FLOW_START_KEY]);
        return { wrong: target, correct: null };
      }
      return getOutgoingFromEntry(scheme[nodeId]);
    },
    [getScheme],
  );

  const getStartOutgoing = useCallback((): SequenceSchemeEntry | null => {
    const scheme = getScheme();
    if (!scheme) return null;
    return normalizeFlowStartEntry(scheme[FLOW_START_KEY]);
  }, [getScheme]);

  return {
    sequenceScheme: test?.sequenceScheme,
    getOutgoing,
    getStartOutgoing,
    removeStartConnection: useCallback(
      () => applyStartConnection(null),
      [applyStartConnection],
    ),
    createStartConnection: useCallback(
      (toNode) => applyStartConnection(toNode),
      [applyStartConnection],
    ),
    removeWrongConnection: useCallback(
      (nodeId) => {
        if (isFlowStartNode(nodeId)) {
          applyStartConnection(null);
          return;
        }
        applyConnection(nodeId, "W", null);
      },
      [applyConnection, applyStartConnection],
    ),
    removeRightConnection: useCallback(
      (nodeId) => {
        if (isFlowStartNode(nodeId)) return;
        applyConnection(nodeId, "R", null);
      },
      [applyConnection],
    ),
    createWrongConnection: useCallback(
      (fromNode, toNode) => {
        if (isFlowStartNode(fromNode)) {
          applyStartConnection(toNode);
          return;
        }
        applyConnection(fromNode, "W", toNode);
      },
      [applyConnection, applyStartConnection],
    ),
    createRightConnection: useCallback(
      (fromNode, toNode) => {
        if (isFlowStartNode(fromNode)) return;
        applyConnection(fromNode, "R", toNode);
      },
      [applyConnection],
    ),
  };
}
