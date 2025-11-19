export type QuestionType =
  | "mcq"
  | "truefalse"
  | "multiple"
  | "fill"
  | "matching"
  | "dragdrop"
  | "hotspot"
  | "assertion";

export interface HotspotArea {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
}

export interface Question {
  id?: string;
  type: QuestionType;
  text: string;
  options?: string[];
  leftMatch?: string[];
  rightMatch?: string[];
  image?: string;
  hotspots?: HotspotArea[];
  assertion?: { A: string; R: string };
}
