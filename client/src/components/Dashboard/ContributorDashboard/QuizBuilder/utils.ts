import { QuestionRecord } from "./types";

export const buildPreviewData = (
  qType: string,
  qStem: string,
  qOptions: string,
  qOptionsArr: string[],
  qLeftMatch: string[],
  qRightMatch: string[],
  qDragItems: string[],
  qImageUrl: string,
  qHotspots: any[],
  qAssertionA: string,
  qAssertionR: string
) => {
  const opts = (
    qOptionsArr && qOptionsArr.length ? qOptionsArr : qOptions.split("|")
  )
    .map((s) => String(s).trim())
    .filter(Boolean);

  switch (qType) {
    case "MCQ":
      return {
        type: "mcq",
        question: qStem || "Preview MCQ",
        options: opts.map((o, i) => ({ id: String(i), label: o })),
      };
    case "True/False":
      return {
        type: "true_false",
        question: qStem || "Preview True/False",
      };
    case "Multiple Response":
      return {
        type: "multiple_response",
        question: qStem || "Preview Multiple Response",
        options: opts.map((o, i) => ({ id: String(i), label: o })),
      };
    case "Fill-in-the-Blank":
      return {
        type: "fill_blank",
        question: qStem || "Preview Fill",
      };
    case "Matching":
      return {
        type: "matching",
        question: qStem || "Preview Matching",
        leftMatch: qLeftMatch.filter(Boolean),
        rightMatch: qRightMatch.filter(Boolean),
      };
    case "Drag and Drop":
      return {
        type: "drag_drop",
        question: qStem || "Preview DragDrop",
        options: qDragItems.filter(Boolean).map((o) => ({ id: o, label: o })),
      };
    case "Hotspot":
      return {
        type: "hotspot",
        question: qStem || "Preview Hotspot",
        image: qImageUrl || undefined,
        hotspots: qHotspots,
      };
    case "Assertion and Reasoning":
      return {
        type: "assertion_reasoning",
        question: qStem || "Preview Assertion",
        assertion: {
          A: qAssertionA || "Assertion text",
          R: qAssertionR || "Reason text",
        },
      };
    default:
      return {
        type: "mcq",
        question: qStem || "Preview",
        options: opts.map((o, i) => ({ id: String(i), label: o })),
      };
  }
};

export const buildQuestionData = (
  qType: string,
  qStem: string,
  qOptions: string,
  qOptionsArr: string[],
  qLeftMatch: string[],
  qRightMatch: string[],
  qDragItems: string[],
  qImageUrl: string,
  qHotspots: any[],
  qAssertionA: string,
  qAssertionR: string,
  qAnswer: string
) => {
  let data: any = { stem: qStem };

  if (qType === "MCQ") {
    data.options = qOptionsArr
      .filter(Boolean)
      .map((o, i) => ({ id: String(i), label: o }));
    data.answer = qAnswer;
  } else if (qType === "Multiple Response") {
    data.options = qOptionsArr
      .filter(Boolean)
      .map((o, i) => ({ id: String(i), label: o }));
    data.answer = qAnswer;
  } else if (qType === "True/False") {
    data.answer = qAnswer || "True";
  } else if (qType === "Fill-in-the-Blank") {
    data.answer = qAnswer;
  } else if (qType === "Matching") {
    data.leftMatch = qLeftMatch.filter(Boolean);
    data.rightMatch = qRightMatch.filter(Boolean);
  } else if (qType === "Drag and Drop") {
    data.options = qDragItems.filter(Boolean).map((o) => ({ id: o, label: o }));
  } else if (qType === "Hotspot") {
    data.image = qImageUrl;
    data.hotspots = qHotspots;
  } else if (qType === "Assertion and Reasoning") {
    data.assertion = { A: qAssertionA, R: qAssertionR };
  } else {
    data.raw = qOptions || "";
  }

  return data;
};

export const loadQuestionForEditing = (
  question: QuestionRecord,
  setters: {
    setQType: (v: string) => void;
    setQStem: (v: string) => void;
    setQOptions: (v: string) => void;
    setQOptionsArr: (arr: string[]) => void;
    setQLeftMatch: (arr: string[]) => void;
    setQRightMatch: (arr: string[]) => void;
    setQDragItems: (arr: string[]) => void;
    setQImageUrl: (v: string) => void;
    setQHotspots: (h: any[]) => void;
    setQAssertionA: (v: string) => void;
    setQAssertionR: (v: string) => void;
    setQAnswer: (v: string) => void;
  }
) => {
  const d = question.data || {};
  setters.setQType(question.type);
  setters.setQStem(d.stem || "");
  setters.setQOptions(d.raw || "");
  setters.setQOptionsArr(
    (d.options && d.options.map((o: any) => o.label)) || ["", ""]
  );
  setters.setQLeftMatch(d.leftMatch || [""]);
  setters.setQRightMatch(d.rightMatch || [""]);
  setters.setQDragItems(
    (d.options && d.options.map((o: any) => o.label)) || ["", ""]
  );
  setters.setQImageUrl(d.image || "");
  setters.setQHotspots(d.hotspots || []);
  setters.setQAssertionA((d.assertion && d.assertion.A) || "");
  setters.setQAssertionR((d.assertion && d.assertion.R) || "");
  setters.setQAnswer(d.answer || "");
};

export const resetQuestionForm = (setters: {
  setQStem: (v: string) => void;
  setQOptions: (v: string) => void;
  setQOptionsArr: (arr: string[]) => void;
  setQLeftMatch: (arr: string[]) => void;
  setQRightMatch: (arr: string[]) => void;
  setQDragItems: (arr: string[]) => void;
  setQImageUrl: (v: string) => void;
  setQHotspots: (h: any[]) => void;
  setQAssertionA: (v: string) => void;
  setQAssertionR: (v: string) => void;
  setQAnswer: (v: string) => void;
}) => {
  setters.setQStem("");
  setters.setQOptions("");
  setters.setQOptionsArr(["", ""]);
  setters.setQLeftMatch([""]);
  setters.setQRightMatch([""]);
  setters.setQDragItems(["", ""]);
  setters.setQImageUrl("");
  setters.setQHotspots([]);
  setters.setQAssertionA("");
  setters.setQAssertionR("");
  setters.setQAnswer("");
};
