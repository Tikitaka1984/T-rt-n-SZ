export type Grade = "9. évfolyam" | "10. évfolyam" | "11. évfolyam" | "12. évfolyam" | "Vegyes (Ismétlés)";

export type QuestionType = "multiple_choice" | "true_false" | "essay";

export type QuestionTypeSetting = "Vegyes" | "Csak feleletválasztós" | "Igaz-Hamis" | "Rövid esszé";

export type Difficulty = "Könnyű" | "Közepes" | "Nehéz";

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // A, B, C, D for multiple_choice
  correctAnswer?: string; // A/B/C/D or "Igaz"/"Hamis"
  hint: string;
  explanation: string;
}

export interface EssayEvaluation {
  scorePercent: number;
  scoreExplanation: string;
  strengths: string;
  weaknesses: string;
  improvements: string;
}

export interface QuizSession {
  grade: Grade;
  topic: string;
  difficulty: Difficulty;
  questionTypeSetting: QuestionTypeSetting;
  count: number;
  questions: QuizQuestion[];
  answers: Record<string, string>; // questionId -> answer
  essayEvaluations?: Record<string, EssayEvaluation>; // questionId -> evaluation
  startTime: number;
  elapsedTimes: Record<string, number>; // questionId -> seconds taken
}

export interface QuizResult {
  id: string;
  date: string;
  grade: Grade;
  topic: string;
  difficulty: Difficulty;
  scorePercent: number;
  gradeLabel: string;
  totalQuestions: number;
  correctCount: number;
  essayCount: number;
}

export interface GlobalStats {
  completedCount: number;
  averagePercent: number;
  bestPercent: number;
  lastQuizDate: string | null;
  history: QuizResult[];
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  period: string;
}

export interface PairQuizCard {
  question: string;
  answer: string;
  keywords: string[];
  hint: string;
}

export interface PairQuizResult {
  player1Score: number;
  player2Score: number;
  player1Keywords: number;
  player2Keywords: number;
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  importance: "high" | "medium" | "low";
  category: string;
  persons?: string[];
  location?: string;
  significance?: string;
}
