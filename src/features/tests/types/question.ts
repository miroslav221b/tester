export type QuestionType = "single" | "multiple" | "order";
export type Question = {
  id: string;
  text: string;
  options: {
    index: number;
    text: string;
  }[];
  correctOptions: number[];
  type: QuestionType;
};
