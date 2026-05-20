import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { sampleQuestions } from "@/features/tests/data/sampleQuestions";
import type { Question, QuestionType } from "@/features/tests/types/question";

export type QuestionsState = {
  items: Question[];
};

const initialState: QuestionsState = {
  items: sampleQuestions,
};

type QuestionOption = Question["options"][number];

function findQuestionIndex(state: QuestionsState, id: string) {
  return state.items.findIndex((q) => q.id === id);
}

const questionsSlice = createSlice({
  name: "questions",
  initialState,
  reducers: {
    createQuestion: (state, action: PayloadAction<Question>) => {
      if (state.items.some((q) => q.id === action.payload.id)) return;
      state.items.push(action.payload);
    },
    updateQuestion: (
      state,
      action: PayloadAction<{ id: string; changes: Partial<Question> }>,
    ) => {
      const index = findQuestionIndex(state, action.payload.id);
      if (index === -1) return;
      state.items[index] = { ...state.items[index], ...action.payload.changes };
    },
    deleteQuestion: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((q) => q.id !== action.payload);
    },
    setQuestionText: (
      state,
      action: PayloadAction<{ id: string; text: string }>,
    ) => {
      const index = findQuestionIndex(state, action.payload.id);
      if (index === -1) return;
      state.items[index].text = action.payload.text;
    },
    setQuestionType: (
      state,
      action: PayloadAction<{ id: string; type: QuestionType }>,
    ) => {
      const index = findQuestionIndex(state, action.payload.id);
      if (index === -1) return;
      state.items[index].type = action.payload.type;
    },
    setQuestionOptions: (
      state,
      action: PayloadAction<{ id: string; options: QuestionOption[] }>,
    ) => {
      const index = findQuestionIndex(state, action.payload.id);
      if (index === -1) return;
      state.items[index].options = action.payload.options;
    },
    addQuestionOption: (
      state,
      action: PayloadAction<{ id: string; option: QuestionOption }>,
    ) => {
      const index = findQuestionIndex(state, action.payload.id);
      if (index === -1) return;
      state.items[index].options.push(action.payload.option);
    },
    updateQuestionOption: (
      state,
      action: PayloadAction<{
        id: string;
        optionIndex: number;
        changes: Partial<QuestionOption>;
      }>,
    ) => {
      const question = state.items.find((q) => q.id === action.payload.id);
      const option = question?.options.find(
        (o) => o.index === action.payload.optionIndex,
      );
      if (!option) return;
      Object.assign(option, action.payload.changes);
    },
    removeQuestionOption: (
      state,
      action: PayloadAction<{ id: string; optionIndex: number }>,
    ) => {
      const question = state.items.find((q) => q.id === action.payload.id);
      if (!question) return;
      question.options = question.options.filter(
        (o) => o.index !== action.payload.optionIndex,
      );
      question.correctOptions = question.correctOptions.filter(
        (i) => i !== action.payload.optionIndex,
      );
    },
    setCorrectOptions: (
      state,
      action: PayloadAction<{ id: string; correctOptions: number[] }>,
    ) => {
      const index = findQuestionIndex(state, action.payload.id);
      if (index === -1) return;
      state.items[index].correctOptions = action.payload.correctOptions;
    },
    replaceAllQuestions: (state, action: PayloadAction<Question[]>) => {
      state.items = action.payload;
    },
  },
});

export const {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  setQuestionText,
  setQuestionType,
  setQuestionOptions,
  addQuestionOption,
  updateQuestionOption,
  removeQuestionOption,
  setCorrectOptions,
  replaceAllQuestions,
} = questionsSlice.actions;

export const questionsReducer = questionsSlice.reducer;
