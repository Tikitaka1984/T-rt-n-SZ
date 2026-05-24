import React, { useState, useEffect } from "react";
import { Play, History, Sparkles, BookOpen, Clock, BrainCircuit, GraduationCap, Flame, Award, Target, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { QuizResult } from "../types";
import { getXpAndStreakState } from "../utils/xp";
import { BADGES, getEarnedBadges } from "../utils/badges";
import { getWeakPoints } from "../utils/weakPoints";

interface HomeScreenProps {
  onStartQuiz: () => void;
  onViewStats: () => void;
  onStartFlashcards: () => void;
  onStartGlossary: () => void;
  onViewWeakPoints: () => void;
  onStartTimeline: () => void;
  onStartPairQuiz: () => void;
  onStartChronology: () => void;
  onStartRoleplay: () => void;
  onStartLessons: () => void;
  onStartQuestionBank: () => void;
  recentResults: QuizResult[];
}

export default function HomeScreen({ 
  onStartQuiz, 
  onViewStats, 
  onStartFlashcards, 
  onStartGlossary,
  onViewWeakPoints, 
  onStartTimeline, 
  onStartPairQuiz, 
  onStartChronology, 
  onStartRoleplay, 
  onStartLessons,
  onStartQuestionBank,
  recentResults 
}: HomeScreenProps) {
  
  const [xpState, setXpState] = useState(getXpAndStreakState());
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [weakPointsCount, setWeakPointsCount] = useState<number>(0);
  
  // Section states
  const [expandedLearn, setExpandedLearn] = useState<boolean>(() => {
    const saved = localStorage.getItem("hq_home_learn");
    return saved ? JSON.parse(saved) : true;
  });
  const [expandedPractice, setExpandedPractice] = useState<boolean>(() => {
    const saved = localStorage.getItem("hq_home_practice");
    return saved ? JSON.parse(saved) : true;
  });
  const [expandedGames, setExpandedGames] = useState<boolean>(() => {
    const saved = localStorage.getItem("hq_home_games");
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    setXpState(getXpAndStreakState());
    setEarnedBadges(getEarnedBadges());
    setWeakPointsCount(getWeakPoints().length);
  }, [recentResults]);

  useEffect(() => {
    localStorage.setItem("hq_home_learn", JSON.stringify(expandedLearn));
  }, [expandedLearn]);
  useEffect(() => {
    localStorage.setItem("hq_home_practice", JSON.stringify(expandedPractice));
  }, [expandedPractice]);
  useEffect(() => {
    localStorage.setItem("hq_home_games", JSON.stringify(expandedGames));
  }, [expandedGames]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12" id="home-screen-wrap">
      {/* QUICK ACCESS BANNERS */}
      {weakPointsCount > 0 && (
        <div 
          onClick={onViewWeakPoints}
          className="mb-4 bg-orange-600 hover:bg-orange-700 cursor-pointer text-white font-bold text-center py-2 px-4 rounded shadow-md border-l-4 border-orange-300 font-cinzel transition-colors"
        >
          ⚠️ {weakPointsCount} gyenge pont vár rád! Gyakorolj egyet!
        </div>
      )}
      
      {xpState.currentStreak > 0 && (
        <div className="mb-8 bg-[#6B1010]/80 text-[#FFF5E0] font-bold text-center py-2 px-4 rounded shadow-md border border-[#B8860B] font-cinzel text-sm sm:text-base">
          🔥 {xpState.currentStreak} napos sorozat – ne törd meg ma!
        </div>
      )}

      {/* Hero Welcome Unit */}
      <div className="text-center mb-12 relative flex flex-col items-center">
        {/* XP and Streak display */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6">
           <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col bg-[#4A0808]/50 border border-[#B8860B]/50 rounded-none shadow-md overflow-hidden"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 text-[#FFF5E0] text-[11px] font-cinzel font-bold tracking-widest uppercase">
                <Award className="w-4 h-4 text-[#B8860B]" />
                <span>{xpState.level.name} ({xpState.xp} XP - {xpState.level.maxXp !== Infinity ? xpState.level.maxXp : 'Max'} XP)</span>
              </div>
              {xpState.level.maxXp !== Infinity && (
                <div className="w-full h-1 bg-[#1C0E04]/50">
                  <div 
                    className="h-full bg-[#B8860B] xp-fill" 
                    style={{ "--target-width": `${Math.max(0, Math.min(100, ((xpState.xp - xpState.level.minXp) / (xpState.level.maxXp - xpState.level.minXp)) * 100))}%` } as React.CSSProperties}
                  />
                </div>
              )}
            </motion.div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {BADGES.map((badge, idx) => {
            const isEarned = earnedBadges.includes(badge.id);
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 * idx }}
                className={`relative group flex items-center justify-center w-10 h-10 rounded-full border-2 ${isEarned ? "border-[#B8860B] bg-[#FFF5D0] shadow-md" : "border-[#1C0E04]/20 bg-[#1C0E04]/5 grayscale opacity-60"}`}
              >
                <span className="text-lg">{isEarned ? badge.icon : "🔒"}</span>
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center w-max max-w-[200px] z-10 bg-[#1A0A03] border border-[#B8860B] p-2 text-center shadow-lg">
                  <span className="text-[#FFF5E0] font-cinzel font-bold text-[11px] uppercase tracking-widest mb-1">{isEarned ? badge.name : "???"}</span>
                  <p className="text-[#FFF5D0]/70 text-[11px] font-lora leading-tight">{isEarned ? badge.description : "Teljesíts egy feltételt a feloldáshoz!"}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-cinzel font-bold tracking-tight text-[#FDF3DC] mb-4 leading-none drop-shadow-[0_2px_5px_rgba(0,0,0,0.4)]"
        >
          TÖRTÉN<span className="text-[#D4A017] font-black">ÉSZ</span>
        </motion.h1>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-12">
        {/* SECTION 1: TANULÁS */}
        <div className="bg-[#6B1010] p-1 border-2 border-[#B8860B] rounded-sm shadow-xl">
          <div 
            onClick={() => setExpandedLearn(!expandedLearn)}
            className="p-4 cursor-pointer flex justify-between items-center bg-[#1C0E04]/30 hover:bg-[#1C0E04]/50 transition-colors"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-[#FFF5E0]">📖 Tanulás</h2>
              <p className="text-[#D4B896] text-[14px] font-lora italic">Fedezd fel a történelmet lépésről lépésre</p>
            </div>
            <div className="text-[#B8860B]">
              {expandedLearn ? <ChevronUp /> : <ChevronDown />}
            </div>
          </div>
          <AnimatePresence>
            {expandedLearn && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-2 flex flex-col gap-3">
                  <button 
                    onClick={onStartLessons}
                    className="w-full bg-[#801515] hover:bg-[#9A1919] text-[#FFF5E0] font-cinzel font-bold uppercase tracking-wider py-5 border border-[#B8860B] rounded-[3px] shadow flex flex-col items-center justify-center gap-2 transition-colors btn-shine-effect"
                  >
                    <BookOpen className="w-6 h-6" />
                    <span className="text-lg">Leckék</span>
                  </button>
                  <div className="flex gap-3">
                    <button 
                      onClick={onStartFlashcards}
                      className="flex-1 bg-black/40 hover:bg-black/60 text-[#FFF5E0] font-cinzel font-bold uppercase py-3 border border-[#B8860B]/50 rounded-[3px] flex items-center justify-center gap-2 transition-colors text-sm"
                    >
                      <Sparkles className="w-4 h-4" /> Villámkártyák
                    </button>
                    <button 
                      onClick={onStartGlossary}
                      className="flex-1 bg-black/40 hover:bg-black/60 text-[#FFF5E0] font-cinzel font-bold uppercase py-3 border border-[#B8860B]/50 rounded-[3px] flex items-center justify-center gap-2 transition-colors text-sm"
                    >
                      <BookOpen className="w-4 h-4" /> Fogalomtár
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 2: GYAKORLÁS */}
        <div className="bg-[#9A6F0A] p-1 border-2 border-[#1C0E04] rounded-sm shadow-xl">
          <div 
            onClick={() => setExpandedPractice(!expandedPractice)}
            className="p-4 cursor-pointer flex justify-between items-center bg-[#1C0E04]/30 hover:bg-[#1C0E04]/50 transition-colors"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-[#FFF5E0]">🎯 Gyakorlás</h2>
              <p className="text-[#D4B896] text-[14px] font-lora italic">Teszteld tudásodat és készülj az érettségire</p>
            </div>
            <div className="text-[#1C0E04]">
              {expandedPractice ? <ChevronUp /> : <ChevronDown />}
            </div>
          </div>
          <AnimatePresence>
            {expandedPractice && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-2 flex flex-col gap-3">
                  <button 
                    onClick={onStartQuiz}
                    className="w-full bg-[#1C0E04] hover:bg-black text-[#FFF5E0] font-cinzel font-bold uppercase tracking-wider py-5 border border-[#B8860B] rounded-[3px] shadow flex flex-col items-center justify-center gap-2 transition-colors btn-shine-effect"
                  >
                    <Play className="w-6 h-6" />
                    <span className="text-lg">Kvíz indítása</span>
                  </button>
                  <div className="flex gap-3">
                    <button 
                      onClick={onViewWeakPoints}
                      className="flex-1 bg-black/40 hover:bg-black/60 text-[#FFF5E0] font-cinzel font-bold uppercase py-3 border border-[#B8860B]/50 rounded-[3px] flex items-center justify-center gap-2 transition-colors text-sm"
                    >
                      <Target className="w-4 h-4" /> Gyenge pontok
                    </button>
                    {/* Mock functionality for documentation for now as it uses Quiz */}
                    <button 
                      onClick={onStartQuiz}
                      className="flex-1 bg-black/40 hover:bg-black/60 text-[#FFF5E0] font-cinzel font-bold uppercase py-3 border border-[#B8860B]/50 rounded-[3px] flex items-center justify-center gap-2 transition-colors text-sm"
                    >
                      <FileText className="w-4 h-4" /> Dokumentumból
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 3: JÁTÉKOK */}
        <div className="bg-[#3D1F0A] p-1 border-2 border-[#B8860B] rounded-sm shadow-xl">
          <div 
            onClick={() => setExpandedGames(!expandedGames)}
            className="p-4 cursor-pointer flex justify-between items-center bg-black/30 hover:bg-black/50 transition-colors"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-[#FFF5E0]">⚔️ Játékok</h2>
              <p className="text-[#D4B896] text-[14px] font-lora italic">Játékos formában gyakorolj</p>
            </div>
            <div className="text-[#B8860B]">
              {expandedGames ? <ChevronUp /> : <ChevronDown />}
            </div>
          </div>
          <AnimatePresence>
            {expandedGames && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-2 flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={onStartChronology}
                    className="flex-1 bg-[#1C0E04] hover:bg-black text-[#FFF5E0] font-cinzel font-bold uppercase tracking-wider py-4 border border-[#B8860B]/50 rounded-[3px] shadow flex flex-col items-center justify-center gap-2 transition-colors"
                  >
                    <Clock className="w-5 h-5" />
                    <span className="text-sm">Kronológia</span>
                  </button>
                  <button 
                    onClick={onStartRoleplay}
                    className="flex-1 bg-[#1C0E04] hover:bg-black text-[#FFF5E0] font-cinzel font-bold uppercase tracking-wider py-4 border border-[#B8860B]/50 rounded-[3px] shadow flex flex-col items-center justify-center gap-2 transition-colors"
                  >
                    <span className="text-2xl block mb-1">🎭</span>
                    <span className="text-sm">Szerepjáték</span>
                  </button>
                  <button 
                    onClick={onStartPairQuiz}
                    className="flex-1 bg-[#1C0E04] hover:bg-black text-[#FFF5E0] font-cinzel font-bold uppercase tracking-wider py-4 border border-[#B8860B]/50 rounded-[3px] shadow flex flex-col items-center justify-center gap-2 transition-colors"
                  >
                    <BrainCircuit className="w-5 h-5" />
                    <span className="text-sm text-center">Páros<br/>kikérdezés</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* BOTTOM ROW (smaller buttons) */}
      <div className="flex flex-wrap justify-center gap-4 mb-4">
        <button
          onClick={onViewStats}
          className="border border-[#B8860B] bg-[#FFF5D0] hover:bg-[#E8CB88] text-[#1C0E04] px-4 py-2 font-cinzel font-bold text-xs uppercase tracking-wider rounded-[2px] transition-colors flex items-center gap-2"
        >
          <History className="w-4 h-4" /> Statisztikák
        </button>
        <button
          onClick={onStartQuestionBank}
          className="border border-[#B8860B] bg-[#FFF5D0] hover:bg-[#E8CB88] text-[#1C0E04] px-4 py-2 font-cinzel font-bold text-xs uppercase tracking-wider rounded-[2px] transition-colors flex items-center gap-2"
        >
          📚 Kérdésbank
        </button>
        <button
          onClick={() => {}}
          className="border border-[#B8860B] bg-[#FFF5D0] hover:bg-[#E8CB88] text-[#1C0E04] px-4 py-2 font-cinzel font-bold text-xs uppercase tracking-wider rounded-[2px] transition-colors flex items-center gap-2 opacity-50"
          title="Hamarosan"
        >
          👨‍🏫 Tanári eszközök
        </button>
      </div>

    </div>
  );
}
