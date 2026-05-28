export function answersMatch(userAnswer: string | boolean | null | undefined, correct: string | boolean | null | undefined): boolean {
  if (userAnswer === undefined || userAnswer === null) return false;
  if (correct === undefined || correct === null) return false;

  const userStr = String(userAnswer).toLowerCase().trim();
  const correctStr = String(correct).toLowerCase().trim();

  // Special case for true/false boolean matching
  if ((userStr === "igaz" || userStr === "true") && (correctStr === "igaz" || correctStr === "true")) {
      return true;
  }
  if ((userStr === "hamis" || userStr === "false") && (correctStr === "hamis" || correctStr === "false")) {
      return true;
  }

  const normalize = (s: string) => s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/\s+/g, " ")           // normalize spaces
    .replace(/[.,;:!?]/g, "");      // remove punctuation
  
  const result = normalize(userStr) === normalize(correctStr);
  return result;
}
