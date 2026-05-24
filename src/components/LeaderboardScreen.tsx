import React, { useState, useEffect } from "react";
import { Trophy, Medal, Star, Calendar } from "lucide-react";
import { motion } from "motion/react";
import { getLeaderboard, LeaderboardEntry } from "../utils/badges";

interface LeaderboardScreenProps {
  onGoHome: () => void;
  currentPlayerName: string;
}

export default function LeaderboardScreen({ onGoHome, currentPlayerName }: LeaderboardScreenProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setLeaderboard(getLeaderboard());
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12" id="leaderboard-screen">
      <div className="text-center mb-8 relative">
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-cinzel font-bold tracking-tight text-[#FFF5E0] mb-2 uppercase"
        >
          Dicsőségtábla
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xs sm:text-sm text-[#FFF5D0]/70 font-cinzel font-medium uppercase tracking-widest"
        >
          A legkiválóbb krónikások rangsora
        </motion.p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="medieval-card p-4 sm:p-8"
      >
        {leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-[#B8860B]/30 mx-auto mb-4" />
            <p className="text-[#1C0E04]/60 font-cinzel font-bold text-lg uppercase tracking-widest">
              Üres a dicsőségtábla
            </p>
            <p className="text-[#1C0E04]/50 font-lora text-sm mt-2">
              Légy te az első, aki beírja magát a történelembe!
            </p>
            <button
              onClick={onGoHome}
              className="mt-6 px-6 py-3 bg-[#6B1010] hover:bg-[#801515] text-[#FFF5E0] font-cinzel font-bold uppercase tracking-widest rounded-none border border-[#B8860B] transition-colors text-xs"
            >
              Vissza a kezdőlapra
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-[#B8860B]/40 text-[#6B1010] font-cinzel font-bold text-[11px] uppercase tracking-widest">
                  <th className="p-3 text-center w-16">Hely.</th>
                  <th className="p-3">Név</th>
                  <th className="p-3">Eredmény</th>
                  <th className="p-3 hidden sm:table-cell">Témakör</th>
                  <th className="p-3 text-right">Dátum</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, idx) => {
                  const isTop3 = idx < 3;
                  let medal = null;
                  if (idx === 0) medal = "🥇";
                  else if (idx === 1) medal = "🥈";
                  else if (idx === 2) medal = "🥉";

                  // Check if it was "today" -- we could highlight current player session but we don't have user auth, so let's just highlight the top 3 with special styling
                  const isCurrentPlayer = entry.name === currentPlayerName && entry.name !== "Névtelen" && entry.name !== "";
                  
                  return (
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * idx }}
                      key={idx} 
                      className={`border-b border-[#B8860B]/20 last:border-b-0 hover:bg-[#FFF5D0]/30 transition-colors ${
                        idx === 0 ? "bg-[#B8860B]/10" : ""
                      } ${isCurrentPlayer ? "border-2 border-[#B8860B] shadow-[inset_0_0_10px_rgba(184,134,11,0.2)]" : ""}`}
                    >
                      <td className="p-3 text-center">
                        {medal ? (
                          <span className="text-2xl drop-shadow-sm">{medal}</span>
                        ) : (
                          <span className="text-[#1C0E04]/50 font-cinzel font-bold text-sm">{idx + 1}.</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-cinzel font-bold text-[#1C0E04] text-sm sm:text-base">
                          {entry.name}
                        </div>
                        <div className="text-[11px] text-[#6B1010]/70 uppercase tracking-widest font-cinzel sm:hidden mt-0.5">
                          {entry.topic.length > 20 ? entry.topic.substring(0, 20) + "..." : entry.topic}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-cinzel font-extrabold text-[#6B1010] text-sm sm:text-base">{entry.pct}%</span>
                          <span className="text-[11px] font-bold text-[#1C0E04]/60 bg-white/40 px-1.5 py-0.5 border border-[#B8860B]/20">
                            {entry.xp} XP
                          </span>
                        </div>
                      </td>
                      <td className="p-3 hidden sm:table-cell text-xs font-lora text-[#1C0E04]/80">
                        <span className="block truncate max-w-[200px]" title={entry.topic}>
                          {entry.topic}
                        </span>
                        <span className="text-[11px] font-cinzel text-[#6B1010]/70 uppercase tracking-widest block mt-0.5">
                          {entry.grade}
                        </span>
                      </td>
                      <td className="p-3 text-right text-xs font-cinzel tracking-wider text-[#1C0E04]/60">
                        {entry.date.replace("T", " ").substring(0, 10)}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
