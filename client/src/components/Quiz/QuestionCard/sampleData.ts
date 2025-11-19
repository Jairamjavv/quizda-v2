import { Question } from "./types";

export const SAMPLE_QUESTIONS: Question[] = [
  {
    id: "q1",
    type: "mcq",
    text: "What is the capital of France?",
    options: ["Paris", "Rome", "Madrid"],
  },
  {
    id: "q2",
    type: "truefalse",
    text: "The earth orbits the sun.",
  },
  {
    id: "q3",
    type: "multiple",
    text: "Select prime numbers.",
    options: ["2", "3", "4", "9"],
  },
  {
    id: "q4",
    type: "fill",
    text: "_____ is the process of water vapor turning into liquid.",
  },
  {
    id: "q5",
    type: "matching",
    text: "Match the country to its flag color.",
    leftMatch: ["France", "Italy"],
    rightMatch: ["Blue/White/Red", "Green/White/Red"],
  },
  {
    id: "q6",
    type: "dragdrop",
    text: "Order the steps to make tea.",
    options: ["Boil water", "Add tea", "Pour water", "Serve"],
  },
  {
    id: "q7",
    type: "hotspot",
    text: "Select the red area.",
    image: "/images/sample-map.png",
    hotspots: [{ id: "a1", x: 10, y: 20, w: 15, h: 10, label: "Red area" }],
  },
  {
    id: "q8",
    type: "assertion",
    text: "Assertion & Reasoning example",
    assertion: {
      A: "Light travels faster in vacuum.",
      R: "Vacuum has no medium to slow light",
    },
  },
];
