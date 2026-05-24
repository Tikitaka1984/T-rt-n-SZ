import { QuizResult, GlobalStats, Grade, Difficulty } from "../types";

const STATS_KEY = "HISTORIA_QUIZ_RESULTS_V1";

export function loadResults(): QuizResult[] {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QuizResult[];
  } catch (e) {
    console.error("Error reading quiz stats from localStorage:", e);
    return [];
  }
}

export function saveQuizResult(
  grade: Grade,
  topic: string,
  difficulty: Difficulty,
  scorePercent: number,
  gradeLabel: string,
  totalQuestions: number,
  correctCount: number,
  essayCount: number
): QuizResult {
  const results = loadResults();
  
  const newResult: QuizResult = {
    id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    date: new Date().toISOString(),
    grade,
    topic,
    difficulty,
    scorePercent,
    gradeLabel,
    totalQuestions,
    correctCount,
    essayCount
  };

  results.unshift(newResult); // Add to the start
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(results));
  } catch (e) {
    console.error("Failed to persist quiz result in localStorage:", e);
  }
  
  return newResult;
}

export function calculateGlobalStats(results: QuizResult[]): GlobalStats {
  if (results.length === 0) {
    return {
      completedCount: 0,
      averagePercent: 0,
      bestPercent: 0,
      lastQuizDate: null,
      history: []
    };
  }

  const completedCount = results.length;
  const totalPercent = results.reduce((sum, r) => sum + r.scorePercent, 0);
  const averagePercent = Math.round(totalPercent / completedCount);
  const bestPercent = Math.max(...results.map(r => r.scorePercent));
  const sortedDates = [...results].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastQuizDate = sortedDates[0]?.date || null;

  return {
    completedCount,
    averagePercent,
    bestPercent,
    lastQuizDate,
    history: results
  };
}

export function resetAllStats(): void {
  try {
    localStorage.removeItem(STATS_KEY);
  } catch (e) {
    console.error("Failed to clear localStorage stats:", e);
  }
}

// Convert score percentage to Hungarian School Class grading label
export function getHungarianGradeLabel(score: number): { label: string; gradeNum: number; colorClass: string; desc: string } {
  if (score >= 90) {
    return { label: "Jeles", gradeNum: 5, colorClass: "text-emerald-600 bg-emerald-50 border-emerald-200", desc: "Kiváló felkészültség!" };
  } else if (score >= 80) {
    return { label: "Jó", gradeNum: 4, colorClass: "text-blue-600 bg-blue-50 border-blue-200", desc: "Szép teljesítmény!" };
  } else if (score >= 60) {
    return { label: "Közepes", gradeNum: 3, colorClass: "text-amber-600 bg-amber-50 border-amber-200", desc: "Megfelelő szint, de van még hova fejlődni." };
  } else if (score >= 40) {
    return { label: "Elégséges", gradeNum: 2, colorClass: "text-orange-600 bg-orange-50 border-orange-200", desc: "Alapszintet elérő tudás." };
  } else {
    return { label: "Elégtelen", gradeNum: 1, colorClass: "text-rose-600 bg-rose-50 border-rose-200", desc: "További gyakorlásra van szükség." };
  }
}
