import { answersMatch } from "./answerMatch";
export const XP_MULTIPLIERS = {
  MULTIPLE_CHOICE_CORRECT: 10,
  TRUE_FALSE_CORRECT: 5,
  ESSAY_SUBMITTED: 15,
  PERFECT_BONUS: 50,
};

export const LEVELS = [
  { name: "Tanonc", minXp: 0, maxXp: 99 },
  { name: "Krónikás", minXp: 100, maxXp: 299 },
  { name: "Történész", minXp: 300, maxXp: 699 },
  { name: "Lovag", minXp: 700, maxXp: 1499 },
  { name: "Mester", minXp: 1500, maxXp: Infinity },
];

export function getLevelForXp(xp: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

export function calculateQuizXp(questions: any[], answers: Record<string, string>) {
  let earnedXp = 0;
  let allCorrect = true;
  const xpPerQuestion: Record<string, number> = {};

  if (questions.length === 0) allCorrect = false;

  for (const q of questions) {
    let qXp = 0;
    const ans = answers[q.id] || "";
    
    if (q.type === "multiple_choice") {
      if (answersMatch(ans, q.correctAnswer) || String(ans).toLowerCase() === String(q.correctAnswer).toLowerCase()) {
        qXp = XP_MULTIPLIERS.MULTIPLE_CHOICE_CORRECT;
      } else {
        allCorrect = false;
      }
    } else if (q.type === "true_false") {
      if (String(ans).toLowerCase() === String(q.correctAnswer).toLowerCase()) {
        qXp = XP_MULTIPLIERS.TRUE_FALSE_CORRECT;
      } else {
        allCorrect = false;
      }
    } else if (q.type === "essay") {
      if (ans.trim().length > 0) {
        qXp = XP_MULTIPLIERS.ESSAY_SUBMITTED;
      } else {
        allCorrect = false;
      }
    }

    earnedXp += qXp;
    xpPerQuestion[q.id] = qXp;
  }

  let perfectBonus = 0;
  if (allCorrect) {
    perfectBonus = XP_MULTIPLIERS.PERFECT_BONUS;
    earnedXp += perfectBonus;
  }

  return {
    earnedXp,
    xpPerQuestion,
    perfectBonus,
  };
}

export function saveXpAndStreak(newScore: number) {
  // Update XP
  const rawXp = localStorage.getItem("hq_xp");
  const currentXp = rawXp ? parseInt(rawXp, 10) : 0;
  const currentLevel = getLevelForXp(currentXp);

  const finalXp = currentXp + newScore;
  localStorage.setItem("hq_xp", finalXp.toString());

  const newLevel = getLevelForXp(finalXp);
  const leveledUp = newLevel.name !== currentLevel.name;

  // Update Streak
  const rawStreak = localStorage.getItem("hq_streak");
  let currentStreak = rawStreak ? parseInt(rawStreak, 10) : 0;
  const lastDate = localStorage.getItem("hq_last_date");

  const todayStr = new Date().toISOString().split("T")[0];
  let streakUpdated = false;

  if (lastDate === todayStr) {
    // Already did a quiz today
  } else if (lastDate) {
    const lastD = new Date(lastDate);
    const today = new Date(todayStr); // start of today
    
    const diffTime = Math.abs(today.getTime() - lastD.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays === 1) {
      currentStreak += 1;
    } else if (diffDays > 1) {
      currentStreak = 1; // Reset streak
    }
    streakUpdated = true;
  } else {
    // First time ever playing
    currentStreak = 1;
    streakUpdated = true;
  }

  if (streakUpdated) {
    localStorage.setItem("hq_streak", currentStreak.toString());
    localStorage.setItem("hq_last_date", todayStr);
  }

  return {
    finalXp,
    newLevel,
    leveledUp,
    currentStreak,
  };
}

export function getXpAndStreakState() {
  const rawXp = localStorage.getItem("hq_xp");
  const xp = rawXp ? parseInt(rawXp, 10) : 0;
  const level = getLevelForXp(xp);

  const rawStreak = localStorage.getItem("hq_streak");
  const currentStreak = rawStreak ? parseInt(rawStreak, 10) : 0;

  return {
    xp,
    level,
    currentStreak
  };
}
