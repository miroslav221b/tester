"use client";

import {
  Background,
  ConnectionLineType,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Connection,
  type DefaultEdgeOptions,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeTypes,
  type ReactFlowInstance,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { useSequenceEditor } from "@/features/store/hooks/sequenceEditor";
import { useAppSelector } from "@/features/store/hooks";
import { selectQuestionsForTest, selectTestById } from "@/features/store/selectors";

import { FlowEndNode } from "./flowEndNode";
import { FlowStartNode } from "./flowStartNode";
import { QuestionNode } from "./questionNode";
import { CONNECTION_LINE_COLOR, FLOW_START_HANDLE, FLOW_START_ID } from "../constants";
import {
  buildFlowEdges,
  buildFlowNodes,
  isValidFlowConnection,
  mergeNodePositions,
  nodeIdToTargetEntry,
} from "../lib/sequenceFlow";

const defaultEdgeOptions: DefaultEdgeOptions = {
  type: "smoothstep",
  style: { strokeWidth: 2.5 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 18,
    height: 18,
  },
};

import "@xyflow/react/dist/style.css";

const nodeTypes: NodeTypes = {
  question: QuestionNode,
  flowStart: FlowStartNode,
  flowEnd: FlowEndNode,
};

type SequenceFlowCanvasProps = {
  testId: string;
  onEditQuestion?: (questionId: string) => void;
  onDeleteQuestion?: (questionId: string) => void;
};

function edgesEqual(current: Edge[], next: Edge[]): boolean {
  if (current.length !== next.length) return false;
  const currentIds = new Set(current.map((edge) => edge.id));
  for (const edge of next) {
    if (!currentIds.has(edge.id)) return false;
  }
  return true;
}

function SequenceFlowCanvasInner({
  testId,
  onEditQuestion,
  onDeleteQuestion,
}: SequenceFlowCanvasProps) {
  const selectTest = useMemo(() => selectTestById(testId), [testId]);
  const selectQuestions = useMemo(
    () => selectQuestionsForTest(testId),
    [testId],
  );
  const test = useAppSelector(selectTest);
  const questions = useAppSelector(selectQuestions);
  const {
    createStartConnection,
    createWrongConnection,
    createRightConnection,
    removeStartConnection,
    removeWrongConnection,
    removeRightConnection,
  } = useSequenceEditor(testId);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const isSyncingRef = useRef(false);
  const hasFitViewRef = useRef(false);

  const questionTextById = useMemo(
    () =>
      Object.fromEntries(
        questions.map((question) => [question.id, question.text]),
      ),
    [questions],
  );

  const schemeSignature = useMemo(
    () => (test ? JSON.stringify(test.sequenceScheme) : ""),
    [test],
  );

  const questionIdsSignature = useMemo(
    () => test?.questionIds.join(",") ?? "",
    [test?.questionIds],
  );

  useEffect(() => {
    if (!test) return;

    isSyncingRef.current = true;

    const nextNodes = buildFlowNodes(
      test,
      questionTextById,
      onEditQuestion,
      onDeleteQuestion,
    );
    const nextEdges = buildFlowEdges(test);

    setNodes((previous) => mergeNodePositions(nextNodes, previous));
    setEdges((previous) =>
      edgesEqual(previous, nextEdges) ? previous : nextEdges,
    );

    const frame = requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });

    return () => cancelAnimationFrame(frame);
  }, [
    onDeleteQuestion,
    onEditQuestion,
    questionIdsSignature,
    questionTextById,
    schemeSignature,
    test,
  ]);

  const onInit = useCallback((instance: ReactFlowInstance<Node, Edge>) => {
    if (hasFitViewRef.current) return;
    hasFitViewRef.current = true;
    void instance.fitView({ padding: 0.2 });
  }, []);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target || !connection.sourceHandle) {
        return;
      }
      const target = nodeIdToTargetEntry(connection.target);
      if (connection.source === FLOW_START_ID) {
        createStartConnection(target);
        return;
      }
      if (connection.sourceHandle === "wrong") {
        createWrongConnection(connection.source, target);
        return;
      }
      if (connection.sourceHandle === "correct") {
        createRightConnection(connection.source, target);
      }
    },
    [
      createRightConnection,
      createStartConnection,
      createWrongConnection,
    ],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (!isSyncingRef.current) {
        const removedEdges = changes
          .filter((change) => change.type === "remove")
          .map((change) => edges.find((edge) => edge.id === change.id))
          .filter((edge): edge is Edge => edge !== undefined);

        for (const edge of removedEdges) {
          if (
            edge.source === FLOW_START_ID &&
            edge.sourceHandle === FLOW_START_HANDLE
          ) {
            removeStartConnection();
          } else if (edge.sourceHandle === "wrong") {
            removeWrongConnection(edge.source);
          } else if (edge.sourceHandle === "correct") {
            removeRightConnection(edge.source);
          }
        }
      }

      onEdgesChange(changes);
    },
    [
      edges,
      onEdgesChange,
      removeRightConnection,
      removeStartConnection,
      removeWrongConnection,
    ],
  );

  if (!test) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Test not found.
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={handleEdgesChange}
      onConnect={onConnect}
      onInit={onInit}
      isValidConnection={(connection) =>
        isValidFlowConnection(connection as Connection)
      }
      nodeTypes={nodeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      connectionLineType={ConnectionLineType.SmoothStep}
      connectionLineStyle={{
        stroke: CONNECTION_LINE_COLOR,
        strokeWidth: 2.5,
      }}
      elevateEdgesOnSelect
      nodesConnectable
      edgesReconnectable
      deleteKeyCode={["Backspace", "Delete"]}
      className="bg-muted/20"
    >
      <Background gap={16} size={1} />
      <Controls />
      <MiniMap pannable zoomable />
    </ReactFlow>
  );
}

export function SequenceFlowCanvas(props: SequenceFlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <SequenceFlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
