import React, { useState } from "react";
import { History, Trash2, Award, Calendar, ChevronRight, Sparkles, BookOpen, Clock, BarChart3, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GlobalStats, QuizResult } from "../types";
import { getHungarianGradeLabel } from "../utils/stats";

interface StatsScreenProps {
  stats: GlobalStats;
  onResetStats: () => void;
  onGoHome: () => void;
  onStartQuiz: () => void;
}

export default function StatsScreen({ stats, onResetStats, onGoHome, onStartQuiz }: StatsScreenProps) {
  const hasHistory = stats.completedCount > 0;
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("hu-HU", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handleClearHistory = () => {
    onResetStats();
    setShowConfirmReset(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" id="stats-screen-wrap">
      {/* 1. Dashboard Grid Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b-2 border-[#B8860B]/25">
        <div className="flex gap-2.5 items-center">
          <div>
            <span className="text-[10px] text-[#FFF5D0]/85 font-cinzel font-bold uppercase tracking-[0.2em] block mb-0.5">Krónika</span>
            <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-[#F7EAC8]">Eredmények & Kódexek</h2>
            <p className="text-xs font-lora italic text-[#FFF5D0]/80 leading-tight">Kövesd nyomon történelmi ismereteid fejlődését</p>
          </div>
        </div>

        {hasHistory && (
          <div className="relative">
            {!showConfirmReset ? (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="text-[10px] uppercase font-bold tracking-wider text-red-300 hover:text-red-200 hover:bg-[#6B1010]/30 px-3 py-1.5 rounded-[3px] border border-red-500/40 transition-colors flex items-center gap-1.5 cursor-pointer font-cinzel"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Krónikák Törlése</span>
              </button>
            ) : (
              <div className="bg-[#FFF5D0] border-2 border-[#B8860B] p-2.5 rounded-none absolute right-0 top-0 z-30 flex items-center gap-2 shadow-md w-max">
                <span className="text-[10px] text-[#1C0E04] font-cinzel font-bold uppercase tracking-wider">Törlöd?</span>
                <button
                  onClick={handleClearHistory}
                  className="bg-[#6B1010] hover:bg-[#801515] text-[#F7EAC8] font-cinzel rounded-[3px] px-2.5 py-1 text-[10px] uppercase font-bold"
                >
                  Igen
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="bg-[#9A6F0A] hover:bg-[#B3830E] text-[#FFF5D0] font-cinzel rounded-[3px] px-2.5 py-1 text-[10px] uppercase font-bold"
                >
                  Mégse
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. STATS SUMMARY BOXES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Box: Completed Count */}
        <div className="medieval-card p-5 text-center sm:text-left">
          <span className="text-[#6B1010] font-cinzel text-[9px] font-bold tracking-[0.18em] block mb-1">
            KITÖLTÖTT KRÓNIKÁK
          </span>
          <span className="text-3xl font-cinzel font-bold text-[#1C0E04] block mb-1">
            {stats.completedCount} <span className="text-xs font-cinzel font-bold uppercase tracking-wider text-[#1C0E04]/60">alkalom</span>
          </span>
          <span className="text-[10px] uppercase font-cinzel font-bold text-[#6B1010]/80 block">NAT 2020 feladatsor</span>
        </div>

        {/* Box: Average Score */}
        <div className="medieval-card p-5 text-center sm:text-left">
          <span className="text-[#6B1010] font-cinzel text-[9px] font-bold tracking-[0.18em] block mb-1">
            ÁTLAGEREDMÉNY
          </span>
          <span className="text-3xl font-cinzel font-bold text-[#1C0E04] block mb-1">
            {stats.averagePercent}%
          </span>
          <span className="text-[10px] uppercase font-cinzel font-bold text-[#6B1010]/80 block">
            {hasHistory ? `Érdemjegy: ${getHungarianGradeLabel(stats.averagePercent).label}` : "Nincs adat"}
          </span>
        </div>

        {/* Box: Best Score ever */}
        <div className="medieval-card p-5 text-center sm:text-left">
          <span className="text-[#6B1010] font-cinzel text-[9px] font-bold tracking-[0.18em] block mb-1">
            LEGJOBB KÍSÉRLET
          </span>
          <span className="text-3xl font-cinzel font-bold text-[#2D6A4F] block mb-1">
            {stats.bestPercent}%
          </span>
          <span className="text-[10px] uppercase font-cinzel font-bold text-[#6B1010]/80 block">
            {hasHistory ? `Érdemjegy: ${getHungarianGradeLabel(stats.bestPercent).label}` : "Nincs adat"}
          </span>
        </div>

        {/* Box: Last Quiz Date */}
        <div className="medieval-card p-5 text-center sm:text-left col-span-2 md:col-span-1">
          <span className="text-[#6B1010] font-cinzel text-[9px] font-bold tracking-[0.18em] block mb-1">
            UTOLSÓ ALKALOM
          </span>
          <span className="text-xs font-bold font-mono text-[#1C0E04] block mb-1.5 truncate">
            {stats.lastQuizDate ? formatDate(stats.lastQuizDate) : "Soha"}
          </span>
          <span className="text-[9px] text-[#6B1010]/80 font-cinzel font-bold block uppercase tracking-wider">
            {stats.lastQuizDate ? "Középiskola" : "Kezdj egy próbát!"}
          </span>
        </div>
      </div>

      {/* 3. CORE HISTORY OR EMPTY STATE */}
      <AnimatePresence mode="wait">
        {hasHistory ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <h3 className="font-cinzel font-bold text-[#F7EAC8] text-sm mb-3">
              KORÁBBI KITÖLTÉSEK KÓDEXE
            </h3>
            
            <div className="medieval-card overflow-hidden">
              <div className="divide-y-2 divide-[#B8860B]/20">
                {stats.history.map((r) => {
                  const gradeBadge = getHungarianGradeLabel(r.scorePercent);
                  
                  return (
                    <div
                      key={r.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-[#FFF5D0]/15 transition-colors"
                    >
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-cinzel font-bold uppercase tracking-wider text-[#F7EAC8] bg-[#6B1010] px-2 py-0.5 rounded-none border border-[#B8860B]/50">
                            {r.grade}
                          </span>
                          <span className="text-[9px] font-cinzel font-bold uppercase tracking-wider px-2 py-0.5 bg-[#FFF5D0] text-[#1C0E04] border border-[#B8860B]/35 rounded-none">
                            {r.difficulty}
                          </span>
                          <span className="text-[10px] text-[#FFF5D0]/80 font-cinzel items-center gap-1 flex">
                            <Calendar className="w-3 h-3 text-[#B8860B]" />
                            <span>{formatDate(r.date)}</span>
                          </span>
                        </div>
                        
                        <h4 className="font-cinzel font-bold text-[#1C0E04] text-md leading-tight">
                          {r.topic}
                        </h4>
                        
                        <div className="text-[10px] font-cinzel tracking-wider uppercase text-[#1C0E04]/70 flex items-center gap-2 font-bold">
                          <span>{r.totalQuestions} kérdés</span>
                          <span>•</span>
                          <span>Helyes: {r.correctCount} db</span>
                        </div>
                      </div>

                      {/* Score metrics side */}
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t-2 sm:border-t-0 pt-3 sm:pt-0 border-[#B8860B]/20">
                        <div className="text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto gap-2">
                          <span className="text-2xl font-cinzel font-bold text-[#6B1010]">
                            {r.scorePercent}%
                          </span>
                          <span className="text-[9px] font-cinzel font-bold inline-block px-2 py-0.5 rounded-none border border-[#B8860B]/40 bg-[#FFF5D0] uppercase tracking-widest text-[#2D6A4F]">
                            {gradeBadge.label} ({gradeBadge.gradeNum})
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center medieval-card p-10 sm:p-14 text-[#1C0E04]"
            id="stats-empty-state"
          >
            <div className="w-16 h-16 bg-[#FFF5D0] rounded-full border-2 border-[#B8860B] flex items-center justify-center text-[#6B1010] mx-auto mb-4 animate-pulse">
              <History className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-cinzel font-bold text-[#6B1010] mb-2">Még nincs krónikás feljegyzésed</h3>
            <p className="text-xs sm:text-sm font-lora italic text-[#1C0E04] max-w-sm mx-auto mb-6 leading-relaxed">
              Tölts ki egy kísérleti História tesztet, és itt láthatod majd az kódex szerinti százalékos kategóriákat és osztályzatokat!
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={onStartQuiz}
                className="px-5 py-3.5 bg-[#6B1010] hover:bg-[#801515] text-[#F7EAC8] font-cinzel border-1.5 border-[#B8860B] font-bold uppercase tracking-wider text-xs rounded-[3px] transition-colors cursor-pointer shadow-md"
              >
                Krónika indítása!
              </button>
              <button
                onClick={onGoHome}
                className="px-5 py-3.5 bg-[#9A6F0A] hover:bg-[#B3830E] text-[#FFF5D0] font-cinzel border border-[#B8860B]/50 font-bold uppercase tracking-wider text-xs rounded-[3px] transition-colors cursor-pointer"
              >
                Kezdőlapra
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
