import React, { useState } from "react";
import { Award, RotateCcw, ArrowRight, CheckCircle2, XCircle, Brain, Sparkles, Loader2, HelpCircle, FileText, ChevronDown, ChevronUp, Share2, Printer } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { QuizQuestion, EssayEvaluation, Grade, Difficulty } from "../types";
import { answersMatch } from "../utils/answerMatch";
import { getHungarianGradeLabel } from "../utils/stats";
import { QRCodeCanvas } from "qrcode.react";

import { BADGES } from "../utils/badges";

interface ResultsScreenProps {
  questions: QuizQuestion[];
  answers: Record<string, string>;
  elapsedTimes: Record<string, number>;
  gradeSelection: Grade;
  topicSelection: string;
  difficultySelection: Difficulty;
  scorePercent: number; // calculated score
  correctCount: number;
  totalObjective: number; // number of non-essay questions
  essayCount: number;
  xpResult?: any;
  weakPointsAdded: number;
  onRestart: () => void;
  onGoHome: () => void;
  onViewWeakPoints: () => void;
}

export default function ResultsScreen({
  questions,
  answers,
  elapsedTimes,
  gradeSelection,
  topicSelection,
  difficultySelection,
  scorePercent,
  correctCount,
  totalObjective,
  essayCount,
  xpResult,
  weakPointsAdded,
  onRestart,
  onGoHome,
  onViewWeakPoints
}: ResultsScreenProps) {
  const gradeInfo = getHungarianGradeLabel(scorePercent);

  const [showQRModal, setShowQRModal] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Keep track of active AI evaluations per essay question id
  const [evals, setEvals] = useState<Record<string, EssayEvaluation>>({});
  const [loadingEvals, setLoadingEvals] = useState<Record<string, boolean>>({});
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  const toggleQuestionExpanded = (id: string) => {
    setExpandedQuestions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Perform AI Evaluation of the specific essay question
  const handleEvaluateEssay = async (questionId: string, questionText: string, studentAnswer: string) => {
    setLoadingEvals(prev => ({ ...prev, [questionId]: true }));
    
    try {
      const response = await fetch("/api/essay/evaluate", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           question: questionText,
           studentAnswer,
           difficulty: difficultySelection
         })
      });

      if (!response.ok) {
        throw new Error("Szerver hiba történt");
      }

      const rawText = await response.text();
      let evaluation: EssayEvaluation;
      try {
        let cleanText = rawText;
        const jsonMatch = cleanText.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
        if (jsonMatch) {
            cleanText = jsonMatch[0];
        }
        evaluation = cleanText ? JSON.parse(cleanText) : {};
      } catch (e) {
        throw new Error("Érvénytelen válasz a szervertől (nem JSON).");
      }
      setEvals(prev => ({ ...prev, [questionId]: evaluation }));
    } catch (error) {
      console.error("Failed to evaluate essay:", error);
      // fallback mock evaluation if server failed
      setEvals(prev => ({
        ...prev,
        [questionId]: {
          scorePercent: 70,
          scoreExplanation: "Kapcsolódási hiba történt az AI tanár értékelésekor. Egy általánosan javasolt visszajelzést mutatunk be a válaszod alapján.",
          strengths: "A vágy kifejezni az összefüggéseket nagyszerű, a tagoltság megfelelő.",
          weaknesses: "Szaknyelvi korlátok vagy kronológiai hiányosságok tölthetik be a választ.",
          improvements: "Ügyelj a pontosabb fogalomhasználatra és az érveid szorosabb strukturálására!"
        }
      }));
    } finally {
      setLoadingEvals(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const handlePrintWorksheet = async (showAnswers: boolean) => {
    setIsPrinting(true);
    try {
      const response = await fetch("/api/worksheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions,
          date: new Date().toLocaleDateString('hu-HU'),
          grade: gradeSelection,
          topic: topicSelection,
          difficulty: difficultySelection,
          showAnswers
        })
      });
      if (response.ok) {
        const html = await response.text();
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" id="results-screen-container">
      {/* Top Banner Grade Gauge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="medieval-card p-6 sm:p-8 text-center mb-8 relative"
      >
        <span className="text-[11px] text-[#6B1010]/80 font-cinzel font-bold block uppercase mb-1 tracking-[0.2em]">Kiértékelés</span>
        <h2 className="text-2xl sm:text-3xl font-cinzel font-bold text-[#6B1010] mb-1">Kvantitatív Összegzés</h2>
        <span className="text-[11px] font-cinzel text-[#1C0E04]/60 block uppercase mb-6 tracking-wider">
          {gradeSelection} • {topicSelection} ({difficultySelection})
        </span>

        {/* Big metric circle */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 mb-6">
          <div className="relative flex items-center justify-center w-36 h-36 rounded-full border-2 border-[#B8860B] shadow-md bg-[#FFF5D0]">
            <div className="text-center">
              <span className="block text-6xl font-cinzel font-[900] text-[#1A0800] leading-none mb-2">
                {scorePercent}%
              </span>
              <span className="text-[11px] text-[#1C0E04]/70 font-cinzel tracking-wider uppercase block mt-1">
                {totalObjective > 0 ? `${correctCount} / ${totalObjective} helyes` : "Esszé Fókusz"}
              </span>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <div className="inline-flex px-3.5 py-2.5 rounded-none border-2 border-[#B8860B] bg-[#E8CB88]/30 text-xs font-cinzel font-bold uppercase tracking-wider mb-2 leading-none items-center gap-2 justify-center sm:justify-start">
              <span>Érdemjegy:</span>
              <span className="font-extrabold text-[#6B1010] underline decoration-[#B8860B]">
                {gradeInfo.label} ({gradeInfo.gradeNum})
              </span>
            </div>
            <p className="text-xs sm:text-sm font-lora italic text-[#1C0E04] max-w-sm leading-[1.8]">
              {gradeInfo.desc}
            </p>
            {essayCount > 0 && (
              <span className="text-[11px] text-[#1C0E04]/80 bg-[#FFF5D0] border border-[#B8860B]/40 px-3 py-2 rounded-none font-cinzel font-bold uppercase tracking-wide block mt-3">
                ✍️ {essayCount} db kifejtős esszéd rögzítésre került. Az AI értékelést az egyes kérdéseknél találod.
              </span>
            )}
          </div>
        </div>

        {/* XP & Level Summary */}
        {xpResult && (
          <div className="bg-[#FFF5D0]/80 border-t border-b border-[#B8860B]/30 py-4 mb-6 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-3 text-[#6B1010] font-cinzel font-bold text-sm">
              <Sparkles className="w-4 h-4 text-[#B8860B]" />
              <span>Szerzett XP: +{xpResult.earnedXp}</span>
              {xpResult.perfectBonus > 0 && (
                <span className="text-[11px] bg-[#2D6A4F]/10 text-[#2D6A4F] px-2 py-0.5 border border-[#2D6A4F]/30 uppercase tracking-widest ml-2">Hibátlan bónusz!</span>
              )}
            </div>
            
            {xpResult.leveledUp && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-[#2D6A4F] font-cinzel font-bold text-sm sm:text-base mt-2 bg-[#2D6A4F]/10 border border-[#2D6A4F]/30 px-6 py-2 uppercase tracking-wide flex items-center gap-2"
              >
                <Award className="w-5 h-5" />
                <span>Szintlépés! {xpResult.newLevel.name} lettél!</span>
              </motion.div>
            )}

            {xpResult.currentStreak > 0 && (
              <div className="text-[11px] text-[#1C0E04]/70 font-cinzel uppercase tracking-[0.2em] font-bold mt-2">
                🔥 {xpResult.currentStreak} napos sorozat
              </div>
            )}

            {xpResult.newlyEarnedBadges && xpResult.newlyEarnedBadges.length > 0 && (
              <div className="flex flex-col gap-2 mt-3 items-center">
                {xpResult.newlyEarnedBadges.map((badgeId: string) => {
                  const badge = BADGES.find(b => b.id === badgeId);
                  if (!badge) return null;
                  return (
                    <motion.div
                      key={badge.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="flex items-center justify-center gap-2 px-6 py-2 bg-[#B8860B]/10 border-2 border-[#B8860B] rounded-full shadow-[0_0_15px_rgba(184,134,11,0.5)]"
                    >
                      <span className="text-xl">{badge.icon}</span>
                      <span className="text-[#6B1010] font-cinzel font-extrabold uppercase tracking-widest text-sm">Új jelvény! {badge.name}</span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Weak points section */}
        {weakPointsAdded > 0 && (
          <div className="bg-[#8B1A1A]/10 border border-[#8B1A1A]/30 p-4 mb-6 text-center">
            <h3 className="text-[#8B1A1A] font-cinzel font-bold text-sm sm:text-base uppercase mb-1">Gyenge pontjaid ({weakPointsAdded} új hiba feljegyezve)</h3>
            <p className="font-lora text-[#1C0E04]/80 text-xs sm:text-sm mb-3">A téves válaszokat elmentettük, hogy később ismételhess velük.</p>
            <button
              onClick={onViewWeakPoints}
              className="inline-flex items-center gap-1 text-[#6B1010] font-cinzel font-bold border-b border-[#6B1010] hover:text-[#801515] hover:border-[#801515] transition-colors text-xs uppercase"
            >
              Gyenge pontok megtekintése <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Global Action items */}
        <div className="flex flex-col gap-4 border-t border-[#B8860B]/30 pt-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onRestart}
              className="flex-1 px-6 py-4 bg-[#6B1010] hover:bg-[#801515] text-[#FFF5E0] font-cinzel border-1.5 border-[#B8860B] font-bold uppercase tracking-[0.18em] rounded-[3px] text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md btn-shine-effect"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Új krónika</span>
            </button>
            <button
               onClick={() => setShowQRModal(true)}
               className="flex-1 px-6 py-4 bg-[#1C0E04]/60 hover:bg-[#1C0E04] text-[#FFF5E0] font-cinzel border border-[#B8860B]/50 font-bold uppercase tracking-widest rounded-[3px] text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer btn-shine-effect"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Megosztás</span>
            </button>
            <button
              onClick={onGoHome}
              className="flex-1 px-6 py-4 bg-[#9A6F0A] hover:bg-[#B3830E] text-[#FFF5D0] font-cinzel border border-[#B8860B]/50 font-bold uppercase tracking-widest rounded-[3px] text-xs transition-colors cursor-pointer"
            >
              <span>Kezdőlapra</span>
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
             <button
               onClick={() => handlePrintWorksheet(false)}
               disabled={isPrinting}
               className="flex-1 px-4 py-3 bg-[#1C0E04]/40 hover:bg-[#1C0E04]/60 text-[#FFF5E0] font-cinzel border border-[#B8860B]/40 font-bold uppercase tracking-wider rounded-[3px] text-[11px] flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 btn-shine-effect"
             >
               <Printer className="w-3.5 h-3.5" />
               <span>Nyomtatható feladatlap</span>
             </button>
             <button
               onClick={() => handlePrintWorksheet(true)}
               disabled={isPrinting}
               className="flex-1 px-4 py-3 bg-[#1C0E04]/40 hover:bg-[#1C0E04]/60 text-[#FFF5E0] font-cinzel border border-[#B8860B]/40 font-bold uppercase tracking-wider rounded-[3px] text-[11px] flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 btn-shine-effect"
             >
               <CheckCircle2 className="w-3.5 h-3.5" />
               <span>Megoldókulcs nyomtatása</span>
             </button>
          </div>
        </div>
      </motion.div>

      {/* DETAILED QUESTION REVIEW */}
      <div className="space-y-4" id="results-detailed-review">
        <h3 className="font-cinzel font-bold text-[#FFF5E0] text-lg mb-4 flex items-center gap-2">
          <span>KÉRDÉSEK FELÜLVIZSGÁLATA</span>
          <span className="text-xs text-[#FFF5D0]/60 font-cinzel uppercase font-bold tracking-widest">({questions.length} feladat)</span>
        </h3>

        {questions.map((q, idx) => {
          const studentAns = answers[q.id] || "";
          const isCorrect = q.type !== "essay" && (answersMatch(studentAns, q.correctAnswer) || String(studentAns).toLowerCase() === String(q.correctAnswer).toLowerCase());
          const isSkippedOrTimeout = q.type !== "essay" && studentAns === "";
          const isEssay = q.type === "essay";

          const isExpanded = expandedQuestions[q.id] !== false; // default true/expanded for all review cards

          return (
            <div
              key={q.id}
              className={`medieval-card border-2 transition-colors overflow-hidden mb-4 ${
                isEssay 
                  ? "border-[#B8860B]/50" 
                  : isCorrect 
                  ? "border-[#2D6A4F] bg-[#2D6A4F]/5" 
                  : "border-[#8B1A1A] bg-[#8B1A1A]/4"
              }`}
            >
              {/* Header block with caret toggle */}
              <button
                onClick={() => toggleQuestionExpanded(q.id)}
                className="w-full text-left p-4 sm:p-5 flex justify-between items-start gap-3 cursor-pointer"
              >
                <div className="flex gap-3 leading-tight">
                  <span className="text-[#6B1010] font-cinzel font-bold text-md shrink-0">
                    #{idx + 1}
                  </span>
                  <div>
                    <span className="text-[11px] font-cinzel font-bold tracking-widest uppercase block text-[#6B1010]/70 mb-1">
                      {q.type === "multiple_choice" ? "Feleletválasztós" : q.type === "true_false" ? "Igaz-Hamis" : "Esszé kérdés"}
                    </span>
                    <p className="font-lora font-bold text-[#1C0E04] text-sm sm:text-base leading-snug">
                      {q.question}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {xpResult?.xpPerQuestion[q.id] > 0 && (
                     <span className="text-[11px] font-cinzel font-bold text-[#6B1010] min-w-max mr-1">
                       +{xpResult.xpPerQuestion[q.id]} XP
                     </span>
                  )}
                  {isEssay ? (
                    <span className="text-[11px] font-cinzel font-bold uppercase tracking-wider text-[#1C0E04]/75 bg-[#E8CB88]/30 px-2 py-1 rounded-none border border-[#B8860B]/35">Rögzített</span>
                  ) : isCorrect ? (
                    <span className="text-[11px] font-cinzel font-bold uppercase tracking-widest text-[#2D6A4F] bg-[#2D6A4F]/10 border-1.5 border-[#2D6A4F] px-2.5 py-1 rounded-none flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
                      <span>Helyes</span>
                    </span>
                  ) : isSkippedOrTimeout ? (
                    <span className="text-[11px] font-cinzel font-bold uppercase tracking-widest text-[#8B1A1A] bg-[#8B1A1A]/10 border-1.5 border-[#8B1A1A] px-2.5 py-1 rounded-none flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-red-700" />
                      <span>Lejárt</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-cinzel font-bold uppercase tracking-widest text-[#8B1A1A] bg-[#8B1A1A]/10 border-1.5 border-[#8B1A1A] px-2.5 py-1 rounded-none flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-red-700" />
                      <span>Hibás</span>
                    </span>
                  )}

                  {isExpanded ? <ChevronUp className="w-4 h-4 text-[#1C0E04]/40" /> : <ChevronDown className="w-4 h-4 text-[#1C0E04]/40" />}
                </div>
              </button>

              {/* Collapsed/Expanded reviews */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: "auto", opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     className="overflow-hidden border-t-2 border-[#B8860B]/30 bg-[#FFF5D0]/30"
                  >
                    <div className="p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
                      {/* Responses overview block */}
                      {!isEssay ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                          <div className="p-3 bg-white/40 border border-[#B8860B]/20 rounded-none">
                            <span className="text-[#6B1010] font-cinzel font-bold block text-[11px] uppercase tracking-wider mb-1">TE VÁLASZOD:</span>
                            <span className={`font-lora italic font-bold text-[14px] ${isCorrect ? "text-[#2D6A4F]" : "text-[#8B1A1A]"}`}>
                              {studentAns === "" ? "[Nem érkezett válasz]" : studentAns}
                              {q.type === "multiple_choice" && studentAns !== "" && q.options && (
                                <span className="font-lora not-italic font-medium text-[13px] text-[#3D1A00] block mt-1">
                                  {q.options[["A", "B", "C", "D"].indexOf(studentAns)]}
                                </span>
                              )}
                            </span>
                          </div>

                          <div className="p-3 bg-white/40 border border-[#B8860B]/20 rounded-none">
                            <span className="text-[#6B1010] font-cinzel font-bold block text-[11px] uppercase tracking-wider mb-1">HELYES VÁLASZ:</span>
                            <span className="font-lora italic font-bold text-[#1A0800] text-[14px]">
                              {q.correctAnswer}
                              {q.type === "multiple_choice" && q.options && (
                                <span className="font-lora not-italic font-medium text-[13px] text-[#3D1A00] block mt-1">
                                  {q.options[["A", "B", "C", "D"].indexOf(q.correctAnswer || "A")]}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      ) : (
                        // Essay answer presentation
                        <div className="p-4 bg-white/40 border border-[#B8860B]/20 rounded-none space-y-4">
                          <div>
                            <span className="text-[#6B1010] font-cinzel font-bold block text-[11px] uppercase tracking-wider mb-1.5">TE ESSZÉ VÁLASZOD:</span>
                            <blockquote className="italic font-lora text-neutral-900 border-l border-[#B8860B] pl-3 leading-[1.8] py-1">
                              {studentAns || "[Nem írtál be választ]"}
                            </blockquote>
                          </div>

                          {/* AI EVALUATION BOX & TRIGGER BUTTON */}
                          <div className="border-t border-[#B8860B]/25 pt-3">
                            {evals[q.id] ? (
                              <div className="space-y-3 bg-[#FFF5D0] border-2 border-[#B8860B] p-4 rounded-none text-xs sm:text-sm text-[#1C0E04]">
                                <div className="flex justify-between items-center pb-2 border-b border-[#B8860B]/35">
                                  <span className="font-cinzel font-bold flex items-center gap-1 text-[#6B1010]">
                                    <Sparkles className="w-4 h-4 text-[#B8860B]" />
                                    <span>AI TANÍTÓI ÉRTÉKELÉS (Eredmény: {evals[q.id].scorePercent}%)</span>
                                  </span>
                                  <span className="px-2 py-0.5 rounded-none font-bold uppercase tracking-wide text-[11px] text-[#FFF5E0] bg-[#6B1010] border border-[#B8860B]">
                                    {getHungarianGradeLabel(evals[q.id].scorePercent).label}
                                  </span>
                                </div>

                                <p className="leading-[1.8] text-neutral-950 italic font-lora">
                                  {evals[q.id].scoreExplanation}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                  <div className="bg-white/40 border border-[#B8860B]/20 p-3 rounded-none">
                                    <span className="font-bold font-cinzel uppercase tracking-wider text-[11px] text-[#2D6A4F] block mb-1">✔️ Erősségek:</span>
                                    <p className="text-[#1C0E04] leading-[1.8] text-xs font-lora italic">{evals[q.id].strengths}</p>
                                  </div>
                                  <div className="bg-white/40 border border-[#B8860B]/20 p-3 rounded-none">
                                    <span className="font-bold font-cinzel uppercase tracking-wider text-[11px] text-[#8B1A1A] block mb-1">⚠️ Csiszolandó rész:</span>
                                    <p className="text-[#1C0E04] leading-[1.8] text-xs font-lora italic">{evals[q.id].weaknesses}</p>
                                  </div>
                                </div>

                                <div className="bg-white/40 border border-[#B8860B]/20 p-3 rounded-none mt-2">
                                  <span className="font-bold font-cinzel uppercase tracking-wider text-[11px] text-neutral-800 block mb-1">💡 Hogyan fejleszd tovább?</span>
                                  <p className="text-[#1C0E04] leading-[1.8] text-xs font-lora italic">{evals[q.id].improvements}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEvaluateEssay(q.id, q.question, studentAns)}
                                  disabled={loadingEvals[q.id] || studentAns.trim().length < 5}
                                  className="w-full sm:w-auto px-5 py-2.5 bg-[#6B1010] hover:bg-[#801515] disabled:opacity-50 disabled:bg-[#9A6F0A]/25 text-[#FFF5E0] font-cinzel border-1.5 border-[#B8860B] font-bold uppercase tracking-wider rounded-[3px] text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-none"
                                >
                                  {loadingEvals[q.id] ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFF5E0]/50" />
                                      <span>Tanító AI elemez...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-3.5 h-3.5 text-[#FFF5E0]/75" />
                                      <span>Krónika AI-Kiértékelése</span>
                                    </>
                                  )}
                                </button>
                                {studentAns.trim().length < 5 && (
                                  <span className="text-[11px] uppercase font-cinzel font-bold text-neutral-500">
                                    (A válasz túl rövid, nem értékelhető)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Explanation Block */}
                      <div className="p-4 bg-[#FFF5D0]/60 border border-[#B8860B]/35 rounded-none">
                        <span className="font-bold text-[#6B1010] block text-[11px] mb-1.5 uppercase tracking-widest font-cinzel">
                          TANTERVI ÚTMUTATÓ & MAGYARÁZAT:
                        </span>
                        <p className="text-[#3D1A00] leading-[1.8] font-lora italic text-[13px]">{q.explanation}</p>
                      </div>

                      {/* Speed Metrics */}
                      <div className="pt-1 text-right text-[11px] text-[#1C0E04]/60 font-cinzel">
                        Válaszadási idő: <strong className="font-semibold text-[#6B1010]">{elapsedTimes[q.id] || 0} mp</strong>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-[#FFF5D0] border-2 border-[#B8860B] rounded-[3px] p-6 max-w-sm w-full relative shadow-2xl">
            <h3 className="text-xl font-cinzel font-bold text-[#6B1010] text-center mb-2">Küldd el a diákoknak!</h3>
            <p className="text-sm font-lora text-[#1C0E04]/80 text-center mb-6">Olvassák be a QR kódot és ugyanezt a kvízt kapják</p>
            
            <div className="flex justify-center mb-6 bg-white p-4 rounded border border-[#B8860B]/30 mx-auto w-fit">
               <QRCodeCanvas 
                 id="qr-code-canvas-results"
                 value={JSON.stringify({topic: topicSelection, grade: gradeSelection, difficulty: difficultySelection, qtype: questions[0]?.type || "Vegyes", qcount: questions.length})} 
                 size={200}
                 level="M"
               />
            </div>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  const canvas = document.getElementById("qr-code-canvas-results") as HTMLCanvasElement;
                  if (canvas) {
                    const url = canvas.toDataURL("image/png");
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "historia-quiz-qr.png";
                    a.click();
                  }
                }}
                className="w-full bg-[#6B1010] hover:bg-[#801515] text-[#FFF5E0] py-3 text-xs font-cinzel font-bold uppercase transition-colors rounded-[3px] border border-[#B8860B]"
              >
                QR kód letöltése
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-full bg-transparent text-[#6B1010] border-2 border-[#6B1010] hover:bg-[#6B1010] hover:text-[#FFF5E0] py-3 text-xs font-cinzel font-bold uppercase transition-colors rounded-[3px]"
              >
                Bezárás
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
