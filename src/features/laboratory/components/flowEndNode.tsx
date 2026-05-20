"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

import type { FlowTerminalNodeData } from "../lib/sequenceFlow";

export function FlowEndNode({ data }: NodeProps<Node<FlowTerminalNodeData>>) {
  return (
    <div className="min-w-28 rounded-full border-2 border-muted-foreground/40 bg-muted px-5 py-2.5 text-center shadow-sm">
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="!size-3 !border-2 !border-muted-foreground !bg-background"
      />
      <p className="text-sm font-semibold text-muted-foreground">{data.label}</p>
    </div>
  );
}
