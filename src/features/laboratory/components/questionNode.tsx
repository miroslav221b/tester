"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { QuestionNodeData } from "../lib/sequenceFlow";

export function QuestionNode({ data }: NodeProps<Node<QuestionNodeData>>) {
  return (
    <div className="w-64 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="!size-3 !border-2 !border-primary !bg-background"
      />
      <div className="flex items-start gap-2">
        <p className="line-clamp-4 min-w-0 flex-1 text-sm leading-snug text-card-foreground">
          {data.text}
        </p>
        <div className="flex shrink-0 items-center gap-0.5">
          {data.onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="nodrag nopan"
              aria-label="Edit question"
              onClick={(e) => {
                e.stopPropagation();
                data.onEdit?.();
              }}
            >
              <Pencil className="size-3.5" />
            </Button>
          )}
          {data.onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="nodrag nopan text-destructive hover:text-destructive"
              aria-label="Delete question"
              onClick={(e) => {
                e.stopPropagation();
                data.onDelete?.();
              }}
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
      <div className="relative mt-3 border-t border-border pt-3">
        <Handle
          type="source"
          position={Position.Bottom}
          id="wrong"
          style={{ left: "30%" }}
          className="!size-3 !border-2 !border-[var(--wrong-edge)] !bg-background"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="correct"
          style={{ left: "70%" }}
          className="!size-3 !border-2 !border-[var(--right-edge)] !bg-background"
        />
        <div className="pointer-events-none flex justify-between px-2 text-[10px] font-semibold uppercase">
          <span className="text-[var(--wrong-edge)]">W</span>
          <span className="text-[var(--right-edge)]">R</span>
        </div>
      </div>
    </div>
  );
}
