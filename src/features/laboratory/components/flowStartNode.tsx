"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

import { FLOW_START_HANDLE } from "../constants";
import type { FlowTerminalNodeData } from "../lib/sequenceFlow";

export function FlowStartNode({ data }: NodeProps<Node<FlowTerminalNodeData>>) {
  return (
    <div className="min-w-28 rounded-full border-2 border-primary bg-primary px-5 py-2.5 text-center shadow-sm">
      <p className="text-sm font-semibold text-primary-foreground">{data.label}</p>
      <Handle
        type="source"
        position={Position.Bottom}
        id={FLOW_START_HANDLE}
        className="!size-3 !border-2 !border-primary !bg-background"
      />
    </div>
  );
}
