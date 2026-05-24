import React, { useState, useEffect } from "react";
import { BookOpen, XCircle, RotateCcw, AlertTriangle, Clock, Target, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { WeakPoint, getWeakPoints, removeWeakPoint, clearWeakPoints } from "../utils/weakPoints";

interface WeakPointsScreenProps {
  onGoHome: () => void;
  onStartReviewQuiz: (points: WeakPoint[]) => void;
}

export default function WeakPointsScreen({ onGoHome, onStartReviewQuiz }: WeakPointsScreenProps) {
  const [weakPoints, setWeakPoints] = useState<WeakPoint[]>([]);

  useEffect(() => {
    setWeakPoints(getWeakPoints());
  }, []);

  const handleDelete = (id: string) => {
    setWeakPoints(removeWeakPoint(id));
  };

  const handleClearAll = () => {
    if (window.confirm("Biztosan törölni szeretnéd az összes feljegyzett gyenge pontot?")) {
      clearWeakPoints();
      setWeakPoints([]);
    }
  };
  
  const handleStartQuiz = () => {
    if (weakPoints.length === 0) return;
    // We send up to 10 weakest points for the quiz
    const selected = [...weakPoints].sort((a, b) => b.wrongCount - a.wrongCount).slice(0, 10);
    onStartReviewQuiz(selected);
  };

  const getStats = () => {
    if (weakPoints.length === 0) return null;
    
    // Most problematic topic
    const topicCounts: Record<string, number> = {};
    weakPoints.forEach(wp => {
      topicCounts[wp.topic] = (topicCounts[wp.topic] || 0) + wp.wrongCount;
    });
    const worstTopic = Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0][0];

    // Longest standing (oldest lastSeen, but actually since we sort by lastSeen descending, it's the last element if we had firstSeen... 
    // let's just pick the one with highest wrongCount as most stubborn instead of oldest)
    const mostStubborn = [...weakPoints].sort((a, b) => b.wrongCount - a.wrongCount)[0];

    return { worstTopic, mostStubborn };
  };

  const stats = getStats();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8 relative">
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-cinzel font-bold tracking-tight text-[#F7EAC8] mb-2 uppercase"
        >
          Gyenge Pontok
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xs sm:text-sm text-[#FFF5D0]/70 font-cinzel font-medium uppercase tracking-widest"
        >
          Ismétlés a tudás anyja
        </motion.p>
      </div>

      {weakPoints.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="medieval-card p-12 text-center"
        >
          <CheckBadge />
          <h2 className="text-[#1C0E04]/60 font-cinzel font-bold text-lg uppercase tracking-widest mt-6">Nincsenek gyenge pontok</h2>
          <p className="text-[#1C0E04]/50 font-lora mt-2">Minden kvíz kérdésre hibátlanul válaszoltál mostanában!</p>
          <button
            onClick={onGoHome}
            className="mt-6 px-6 py-3 bg-[#6B1010] hover:bg-[#801515] text-[#F7EAC8] font-cinzel font-bold uppercase tracking-widest rounded-none border border-[#B8860B] transition-colors text-xs"
          >
            Vissza a kezdőlapra
          </button>
        </motion.div>
      ) : (
        <>
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#1A0A03] border border-[#B8860B]/50 p-4 shadow-lg text-center flex flex-col items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-[#8B1A1A] mb-2" />
                <span className="text-[10px] text-[#F7EAC8]/60 font-cinzel uppercase tracking-widest">Összes hiba</span>
                <span className="text-2xl text-[#F7EAC8] font-cinzel font-bold">{weakPoints.length}</span>
              </div>
              <div className="bg-[#1A0A03] border border-[#B8860B]/50 p-4 shadow-lg text-center flex flex-col items-center justify-center">
                <Target className="w-6 h-6 text-[#B8860B] mb-2" />
                <span className="text-[10px] text-[#F7EAC8]/60 font-cinzel uppercase tracking-widest">Legproblémásabb téma</span>
                <span className="text-sm text-[#F7EAC8] font-lora font-bold line-clamp-2">{stats.worstTopic}</span>
              </div>
              <div className="bg-[#1A0A03] border border-[#B8860B]/50 p-4 shadow-lg text-center flex flex-col items-center justify-center">
                <Clock className="w-6 h-6 text-[#B8860B] mb-2" />
                <span className="text-[10px] text-[#F7EAC8]/60 font-cinzel uppercase tracking-widest">Makacs kérdés</span>
                <span className="text-sm text-[#F7EAC8] font-lora font-bold line-clamp-2">{stats.mostStubborn.question}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              onClick={handleStartQuiz}
              className="flex-1 py-4 bg-[#6B1010] hover:bg-[#801515] text-[#F7EAC8] font-cinzel border-1.5 border-[#B8860B] font-bold uppercase tracking-[0.15em] rounded-[3px] text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(107,16,16,0.3)] transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ismétlő kvíz indítása</span>
            </button>
            <button
              onClick={handleClearAll}
              className="px-6 py-4 bg-transparent hover:bg-white/5 border border-red-900/50 text-red-400 font-cinzel font-bold uppercase tracking-widest rounded-[3px] text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Összes törlése</span>
            </button>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {weakPoints.map(wp => (
                <motion.div
                  key={wp.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0, margin: 0, overflow: 'hidden' }}
                  className="medieval-card p-4 sm:p-5 flex flex-col items-start gap-4"
                >
                  <div className="w-full flex justify-between gap-4 items-start">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="text-[9px] font-cinzel font-bold uppercase tracking-widest bg-[#2A1005] text-[#F7EAC8] px-2 py-0.5 border border-[#B8860B]/50 rounded-[2px]">{wp.grade}</span>
                        <span className="text-[9px] font-cinzel font-bold uppercase tracking-widest bg-[#1A0A03] text-[#F7EAC8]/70 px-2 py-0.5 border border-[#B8860B]/30 rounded-[2px]">{wp.topic.substring(0, 30)}{wp.topic.length > 30 ? "..." : ""}</span>
                      </div>
                      <p className="font-lora font-bold text-[#1C0E04] text-sm sm:text-base leading-snug mb-3">
                        {wp.question}
                      </p>
                      
                      <div className="space-y-1.5">
                        <div className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-[#8B1A1A] shrink-0 mt-0.5" />
                          <span className="text-xs font-lora text-[#8B1A1A] line-clamp-2">Te válaszod: <span className="font-bold">{wp.userAnswer}</span></span>
                        </div>
                        <div className="flex items-start gap-2">
                          <BookOpen className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                          <span className="text-xs font-lora text-[#2D6A4F]">Helyes megoldás: <span className="font-bold">{wp.correct}</span></span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <div className="bg-[#8B1A1A]/10 border border-[#8B1A1A]/30 px-3 py-1.5 text-center rounded-[2px]">
                         <span className="block text-xl font-cinzel font-bold text-[#8B1A1A] leading-none">{wp.wrongCount}×</span>
                         <span className="block text-[8px] font-cinzel uppercase tracking-[0.2em] text-[#8B1A1A]/80 mt-1">elrontva</span>
                      </div>
                      
                      <button 
                        onClick={() => handleDelete(wp.id)}
                        className="text-[10px] uppercase font-cinzel font-bold text-[#1C0E04]/40 hover:text-[#8B1A1A] flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Törlés
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}

function CheckBadge() {
  return (
    <div className="w-16 h-16 rounded-full border-4 border-[#2D6A4F]/30 mx-auto flex items-center justify-center bg-[#2D6A4F]/10">
      <svg className="w-8 h-8 text-[#2D6A4F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
}
