"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { LayoutList, Plus } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { QuestionModal } from "@/features/laboratory/components/questionModal";
import {
  SequenceFlowCanvas,
  type SequenceFlowCanvasHandle,
} from "@/features/laboratory/components/sequenceFlowCanvas";
import { useAppDispatch, useAppSelector } from "@/features/store/hooks";
import { deleteQuestion } from "@/features/store/slices/questionsSlice";
import {
  removeQuestionIdFromTest,
  syncSequenceSchemeWithQuestionIds,
} from "@/features/store/slices/testsSlice";
import { selectTestById } from "@/features/store/selectors";

export default function LaboratoryTestPage() {
  const dispatch = useAppDispatch();
  const params = useParams<{ test: string }>();
  const testId = params.test;
  const test = useAppSelector(selectTestById(testId));
  const [editingQuestionId, setEditingQuestionId] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const sequenceCanvasRef = useRef<SequenceFlowCanvasHandle>(null);

  const handleAutoLayout = useCallback(() => {
    sequenceCanvasRef.current?.autoLayout();
  }, []);

  const handleCreateQuestion = useCallback(() => {
    setEditingQuestionId(undefined);
    setModalOpen(true);
  }, []);

  const handleEditQuestion = useCallback((questionId: string) => {
    setEditingQuestionId(questionId);
    setModalOpen(true);
  }, []);

  const handleDeleteQuestion = useCallback(
    (questionId: string) => {
      dispatch(removeQuestionIdFromTest({ testId, questionId }));
      dispatch(deleteQuestion(questionId));
      dispatch(syncSequenceSchemeWithQuestionIds(testId));
    },
    [dispatch, testId],
  );

  const handleModalOpenChange = useCallback((open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setEditingQuestionId(undefined);
    }
  }, []);

  if (!test) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <p className="text-muted-foreground">Test not found.</p>
        <Link href="/laboratory">
          <Button variant="outline">Back to laboratory</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="flex h-[calc(100dvh-0px)] flex-col">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-6">
        <div className="min-w-0 space-y-0.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Sequence editor
          </p>
          <h1 className="truncate text-lg font-semibold">{test.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <p className="hidden text-xs text-muted-foreground sm:block">
            Start has one output · questions have W and R · changes save automatically
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAutoLayout}
          >
            <LayoutList className="size-4" />
            Tidy layout
          </Button>
          <Button type="button" size="sm" onClick={handleCreateQuestion}>
            <Plus className="size-4" />
            New question
          </Button>
          <Link href="/laboratory">
            <Button variant="outline" size="sm">
              Back
            </Button>
          </Link>
        </div>
      </header>

      <div className="sequence-flow-editor relative min-h-0 flex-1">
        <SequenceFlowCanvas
          ref={sequenceCanvasRef}
          testId={testId}
          onEditQuestion={handleEditQuestion}
          onDeleteQuestion={handleDeleteQuestion}
        />
      </div>

      <QuestionModal
        testId={testId}
        questionId={editingQuestionId}
        open={modalOpen}
        onOpenChange={handleModalOpenChange}
      />
    </main>
  );
}
