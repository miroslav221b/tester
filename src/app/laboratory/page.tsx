"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { TestPreview } from "@/features/components/testPreview";
import { TestModal } from "@/features/laboratory/components/testModal";
import { useAppDispatch, useAppSelector } from "@/features/store/hooks";
import { selectAllTests } from "@/features/store/selectors";
import { deleteTest } from "@/features/store/slices/testsSlice";

export default function LaboratoryPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const tests = useAppSelector(selectAllTests);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | undefined>();

  const openCreateTestModal = () => {
    setEditingTestId(undefined);
    setTestModalOpen(true);
  };

  const openEditTestModal = (testId: string) => {
    setEditingTestId(testId);
    setTestModalOpen(true);
  };

  const handleDeleteTest = (testId: string) => {
    dispatch(deleteTest(testId));
    if (editingTestId === testId) {
      setEditingTestId(undefined);
      setTestModalOpen(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Laboratory</h1>
          <p className="text-sm text-muted-foreground">
            Select a test to open its editor.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/tests">
            <Button variant="outline">Tests</Button>
          </Link>
          <Button type="button" variant="outline" onClick={openCreateTestModal}>
            Create test
          </Button>
        </div>
      </div>

      {tests.length === 0 ? (
        <p className="text-muted-foreground">No tests available yet.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-6">
          {tests.map((test) => (
            <TestPreview
              key={test.id}
              title={test.title}
              type={test.type}
              className="w-full"
              showStartButton={false}
              showEditButton
              showDeleteButton
              onEdit={() => openEditTestModal(test.id)}
              onDelete={() => handleDeleteTest(test.id)}
              onStart={() => router.push(`/laboratory/${test.id}`)}
            />
          ))}
        </div>
      )}

      <TestModal
        testId={editingTestId}
        open={testModalOpen}
        onOpenChange={setTestModalOpen}
      />
    </main>
  );
}
