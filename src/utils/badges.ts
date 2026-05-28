export const BADGES = [
  { id: "first_quiz", name: "Első lépés", icon: "🏛️", description: "Első befejezett gyakorlás" },
  { id: "ten_quizzes", name: "Tíz próba", icon: "⚔️", description: "10 befejezett gyakorlás" },
  { id: "perfect_quiz", name: "Tökéletes", icon: "👑", description: "Első 100%-os eredmény" },
  { id: "streak_5", name: "Szorgalmas", icon: "📜", description: "5 napos sorozat elérése" },
  { id: "master_level", name: "Mester", icon: "🔱", description: "Mester szint (1500+ XP) elérése" },
  { id: "explorer", name: "Felfedező", icon: "🗺️", description: "Kvíz kitöltése 3 különböző évfolyamból" },
  { id: "document_scholar", name: "Dokumentum tudós", icon: "📄", description: "Első kvíz feltöltött dokumentumból" },
  { id: "time_traveler", name: "Időutazó", icon: "🕰️", description: "Teljesíts egy történelmi szerepjáték küldetést" }
];

export function getEarnedBadges(): string[] {
  const raw = localStorage.getItem("hq_badges");
  return raw ? JSON.parse(raw) : [];
}

export function checkAndAwardBadges(
  historyCount: number,
  scorePercent: number,
  streak: number,
  xpStateLevel: string,
  gradeHistory: Set<string>,
  fromDocument: boolean
): string[] {
  const earned = getEarnedBadges();
  const newlyEarned: string[] = [];

  const checkAward = (id: string, condition: boolean) => {
    if (condition && !earned.includes(id)) {
      earned.push(id);
      newlyEarned.push(id);
    }
  };

  checkAward("first_quiz", historyCount >= 1);
  checkAward("ten_quizzes", historyCount >= 10);
  checkAward("perfect_quiz", scorePercent === 100);
  checkAward("streak_5", streak >= 5);
  checkAward("master_level", xpStateLevel === "Mester");
  checkAward("explorer", gradeHistory.size >= 3);
  checkAward("document_scholar", fromDocument);

  if (newlyEarned.length > 0) {
    localStorage.setItem("hq_badges", JSON.stringify(earned));
  }

  return newlyEarned;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  pct: number;
  topic: string;
  grade: string;
  date: string;
  xp: number;
}

export function getLeaderboard(): LeaderboardEntry[] {
  const raw = localStorage.getItem("hq_leaderboard");
  return raw ? JSON.parse(raw) : [];
}

export function saveLeaderboardEntry(entry: LeaderboardEntry) {
  if (entry.pct > 100 || entry.xp > 10000 || entry.name.length > 50) return;
  
  entry.name = entry.name
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

  const board = getLeaderboard();
  board.push(entry);
  
  // Sort by percentage descending, then by XP descending
  board.sort((a, b) => {
    if (b.pct !== a.pct) return b.pct - a.pct;
    return b.xp - a.xp;
  });

  // Keep top 10
  const top10 = board.slice(0, 10);
  localStorage.setItem("hq_leaderboard", JSON.stringify(top10));
}
