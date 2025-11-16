export type QuizMode = "timed" | "zen";

export type QuizCategory = {
  id: string;
  name: string;
};

export type Question = {
  id: string;
  text: string;
  choices: string[];
  answerIndex: number;
};
