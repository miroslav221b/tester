import type { Question } from "../types/question";

export const sampleQuestions: Question[] = [
  {
    id: "1",
    text: "What is the capital of France?",
    type: "single",
    options: [
      { index: 0, text: "Berlin" },
      { index: 1, text: "Paris" },
      { index: 2, text: "Madrid" },
      { index: 3, text: "Rome" },
    ],
    correctOptions: [1],
  },
  {
    id: "2",
    text: "Which are prime numbers?",
    type: "multiple",
    options: [
      { index: 0, text: "2" },
      { index: 1, text: "4" },
      { index: 2, text: "7" },
      { index: 3, text: "9" },
    ],

    correctOptions: [0, 2],
  },
  {
    id: "3",
    text: "Order the planets by distance from the Sun (closest first).",
    type: "order",
    options: [
      { index: 0, text: "Mercury" },
      { index: 1, text: "Venus" },
      { index: 2, text: "Earth" },
      { index: 3, text: "Mars" },
    ],

    correctOptions: [0, 1, 2, 3],
  },
  {
    id: "4",
    text: "What is 12 × 8?",
    type: "single",
    options: [
      { index: 0, text: "84" },
      { index: 1, text: "96" },
      { index: 2, text: "104" },
      { index: 3, text: "108" },
    ],

    correctOptions: [1],
  },
  {
    id: "5",
    text: "Which languages are compiled?",
    type: "multiple",
    options: [
      { index: 0, text: "C" },
      { index: 1, text: "Python" },
      { index: 2, text: "Rust" },
      { index: 3, text: "JavaScript" },
    ],

    correctOptions: [0, 2],
  },
  {
    id: "6",
    text: "Order these historical events from earliest to latest.",
    type: "order",
    options: [
      { index: 0, text: "Moon landing" },
      { index: 1, text: "Fall of Berlin Wall" },
      { index: 2, text: "Invention of the printing press" },
      { index: 3, text: "World War II ends" },
    ],

    correctOptions: [2, 3, 0, 1],
  },
  {
    id: "7",
    text: "Which gas do plants absorb during photosynthesis?",
    type: "single",
    options: [
      { index: 0, text: "Oxygen" },
      { index: 1, text: "Nitrogen" },
      { index: 2, text: "Carbon dioxide" },
      { index: 3, text: "Hydrogen" },
    ],

    correctOptions: [2],
  },
  {
    id: "8",
    text: "Which are mammals?",
    type: "multiple",
    options: [
      { index: 0, text: "Dolphin" },
      { index: 1, text: "Shark" },
      { index: 2, text: "Bat" },
      { index: 3, text: "Penguin" },
    ],

    correctOptions: [0, 2],
  },
  {
    id: "9",
    text: "Order the water cycle steps.",
    type: "order",
    options: [
      { index: 0, text: "Evaporation" },
      { index: 1, text: "Condensation" },
      { index: 2, text: "Precipitation" },
      { index: 3, text: "Collection" },
    ],

    correctOptions: [0, 1, 2, 3],
  },
  {
    id: "10",
    text: "Who wrote Romeo and Juliet?",
    type: "single",
    options: [
      { index: 0, text: "Charles Dickens" },
      { index: 1, text: "William Shakespeare" },
      { index: 2, text: "Jane Austen" },
      { index: 3, text: "Mark Twain" },
    ],

    correctOptions: [1],
  },
  {
    id: "11",
    text: "Which are European Union founding members?",
    type: "multiple",
    options: [
      { index: 0, text: "France" },
      { index: 1, text: "Poland" },
      { index: 2, text: "Germany" },
      { index: 3, text: "Italy" },
    ],

    correctOptions: [0, 2, 3],
  },
  {
    id: "12",
    text: "Order these programming steps for a simple program.",
    type: "order",
    options: [
      { index: 0, text: "Write code" },
      { index: 1, text: "Define problem" },
      { index: 2, text: "Test program" },
      { index: 3, text: "Run compiler" },
    ],

    correctOptions: [1, 0, 3, 2],
  },
  {
    id: "13",
    text: "What is the chemical symbol for gold?",
    type: "single",
    options: [
      { index: 0, text: "Go" },
      { index: 1, text: "Gd" },
      { index: 2, text: "Au" },
      { index: 3, text: "Ag" },
    ],

    correctOptions: [2],
  },
  {
    id: "14",
    text: "Which instruments are in the string family?",
    type: "multiple",
    options: [
      { index: 0, text: "Violin" },
      { index: 1, text: "Flute" },
      { index: 2, text: "Cello" },
      { index: 3, text: "Trumpet" },
    ],

    correctOptions: [0, 2],
  },
  {
    id: "15",
    text: "Order these fractions from smallest to largest.",
    type: "order",
    options: [
      { index: 0, text: "1/2" },
      { index: 1, text: "1/4" },
      { index: 2, text: "3/4" },
      { index: 3, text: "1/8" },
    ],

    correctOptions: [3, 1, 0, 2],
  },
  {
    id: "16",
    text: "How many continents are there?",
    type: "single",
    options: [
      { index: 0, text: "5" },
      { index: 1, text: "6" },
      { index: 2, text: "7" },
      { index: 3, text: "8" },
    ],

    correctOptions: [2],
  },
  {
    id: "17",
    text: "Which are renewable energy sources?",
    type: "multiple",
    options: [
      { index: 0, text: "Solar" },
      { index: 1, text: "Coal" },
      { index: 2, text: "Wind" },
      { index: 3, text: "Natural gas" },
    ],

    correctOptions: [0, 2],
  },
  {
    id: "18",
    text: "Order the layers of Earth from surface to center.",
    type: "order",
    options: [
      { index: 0, text: "Crust" },
      { index: 1, text: "Mantle" },
      { index: 2, text: "Outer core" },
      { index: 3, text: "Inner core" },
    ],

    correctOptions: [0, 1, 2, 3],
  },
  {
    id: "19",
    text: "What is the largest ocean on Earth?",
    type: "single",
    options: [
      { index: 0, text: "Atlantic" },
      { index: 1, text: "Indian" },
      { index: 2, text: "Arctic" },
      { index: 3, text: "Pacific" },
    ],

    correctOptions: [3],
  },
  {
    id: "20",
    text: "Which are punctuation marks?",
    type: "multiple",
    options: [
      { index: 0, text: "Comma" },
      { index: 1, text: "Bracket" },
      { index: 2, text: "Semicolon" },
      { index: 3, text: "Vowel" },
    ],

    correctOptions: [0, 1, 2],
  },
];

export function getRandomQuestion(
  questions: Question[] = sampleQuestions,
): Question {
  return questions[Math.floor(Math.random() * questions.length)];
}
