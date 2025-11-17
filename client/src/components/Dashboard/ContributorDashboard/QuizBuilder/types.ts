export type QuestionRecord = {
  id: string;
  type: string;
  data: any;
};

export type QuestionFormState = {
  qType: string;
  qStem: string;
  qOptions: string;
  qOptionsArr: string[];
  qLeftMatch: string[];
  qRightMatch: string[];
  qDragItems: string[];
  qImageUrl: string;
  qHotspots: Array<{
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    label?: string;
  }>;
  qAssertionA: string;
  qAssertionR: string;
  qAnswer: string;
};

export const QUESTION_TYPES = [
  "MCQ",
  "True/False",
  "Matching",
  "Fill-in-the-Blank",
  "Multiple Response",
  "Hotspot",
  "Drag and Drop",
  "Assertion and Reasoning",
];
