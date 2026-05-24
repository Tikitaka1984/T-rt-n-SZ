export interface WeakPoint {
  id: string; // To uniquely identify (use question.id if available or generate)
  question: string;
  correct: string;
  userAnswer: string;
  type: string;
  topic: string;
  grade: string;
  wrongCount: number;
  lastSeen: string;
}

export function getWeakPoints(): WeakPoint[] {
  const raw = localStorage.getItem("hq_weak_points");
  return raw ? JSON.parse(raw) : [];
}

export function saveWeakPoints(newPoints: WeakPoint[]) {
  localStorage.setItem("hq_weak_points", JSON.stringify(newPoints));
}

export function addWeakPoints(wrongItems: {
  id: string;
  question: string;
  correct: string;
  userAnswer: string;
  type: string;
  topic: string;
  grade: string;
}[]) {
  let points = getWeakPoints();
  const date = new Date().toISOString();
  let newlyAddedCount = 0;

  for (const item of wrongItems) {
    const existing = points.find(p => p.id === item.id || p.question === item.question);
    if (existing) {
      existing.wrongCount += 1;
      existing.lastSeen = date;
      existing.userAnswer = item.userAnswer; // update to the latest wrong answer
    } else {
      points.push({
        ...item,
        wrongCount: 1,
        lastSeen: date
      });
      newlyAddedCount++;
    }
  }

  // Sort by lastSeen descending
  points.sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());

  // Enforce max 50
  if (points.length > 50) {
    points = points.slice(0, 50);
  }

  saveWeakPoints(points);
  return newlyAddedCount;
}

export function removeWeakPoint(id: string) {
  const points = getWeakPoints();
  const filtered = points.filter(p => (p.id !== id && p.question !== id));
  saveWeakPoints(filtered);
  return filtered;
}

export function clearWeakPoints() {
  localStorage.removeItem("hq_weak_points");
}
