export type RecentQuiz = {
  id: number;
  title: string;
  score?: number;
  date?: string;
};

export const generatePlaceholders = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i + 1,
    title: `Sample Quiz ${i + 1}`,
    score: Math.floor(Math.random() * 100),
    date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
  }));
};
