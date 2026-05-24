import React, { useState, useEffect, useRef } from "react";
import { Grade, Difficulty, PairQuizCard } from "../types";
import { TopicSelector } from "./TopicSelector";
import { Users, Crown, Play, Sparkles, AlertCircle, Loader2, StopCircle, ArrowRight, Check, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PairQuizScreenProps {
  onGoHome: () => void;
}

type PairSettings = {
  grade: Grade | string;
  topic: string;
  difficulty: Difficulty;
  count: number;
  timePerQuestion: number;
};

export default function PairQuizScreen({ onGoHome }: PairQuizScreenProps) {
  const [phase, setPhase] = useState<"settings" | "loading" | "intro1" | "active" | "swap" | "intro2" | "results">("settings");
  
  // Settings
  const [settings, setSettings] = useState<PairSettings>({
    grade: "⚱️ Őskor és ókori Kelet",
    topic: "Az őskor korszakai és jellemzői",
    difficulty: "Közepes",
    count: 5,
    timePerQuestion: 60
  });

  const [cards, setCards] = useState<PairQuizCard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [foundKeywords, setFoundKeywords] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  // Scoring
  const [player1Stats, setPlayer1Stats] = useState({ score: 0, keywords: 0, fastestTime: 999 });
  const [player2Stats, setPlayer2Stats] = useState({ score: 0, keywords: 0, fastestTime: 999 });
  
  const [error, setError] = useState<string | null>(null);

  // Timer
  useEffect(() => {
    let interval: any;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(pr => pr - 1);
      }, 1000);
    } else if (timeLeft <= 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const handleStartGenerate = async () => {
    setPhase("loading");
    setError(null);
    try {
      const resp = await fetch("/api/generate-pairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: settings.grade,
          topic: settings.topic,
          difficulty: settings.difficulty,
          count: settings.count
        })
      });
      const rawText = await resp.text();
      let data: any = {};
      try { data = rawText ? JSON.parse(rawText) : {}; } catch(e){}
      let text = data.text || data.response || data.content || JSON.stringify(data);
      if (typeof text !== "string") text = JSON.stringify(text);
      
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.cards && parsed.cards.length > 0) {
          setCards(parsed.cards);
          setPhase("intro1");
          return;
        }
      }
      throw new Error("Nem sikerült érvényes kártyákat generálni.");
    } catch(err: any) {
      setError(err?.message || "Hiba");
      setPhase("settings");
    }
  };

  const currentCard = cards[currentIdx];

  const handleStartRound = () => {
    setFoundKeywords([]);
    setTimeLeft(settings.timePerQuestion);
    setShowHint(false);
    setTimerActive(true);
    setPhase("active");
  };

  const handleKeywordClick = (kw: string) => {
    if (!foundKeywords.includes(kw)) {
      setFoundKeywords([...foundKeywords, kw]);
      
      // Update stats
      if (currentPlayer === 1) {
        setPlayer2Stats(pr => ({ ...pr, score: pr.score + 2, keywords: pr.keywords + 1 }));
      } else {
        setPlayer1Stats(pr => ({ ...pr, score: pr.score + 2, keywords: pr.keywords + 1 }));
      }

      // If all found, stop timer
      if (foundKeywords.length + 1 >= currentCard.keywords.length) {
        setTimerActive(false);
        const timeTaken = settings.timePerQuestion - timeLeft;
        // Bonus points
        const timeBonus = (timeLeft > settings.timePerQuestion / 2) ? 5 : 0;
        const allKeywordsBonus = 10;
        if (currentPlayer === 1) {
          setPlayer2Stats(pr => ({ ...pr, score: pr.score + timeBonus + allKeywordsBonus, fastestTime: Math.min(pr.fastestTime, timeTaken) }));
        } else {
          setPlayer1Stats(pr => ({ ...pr, score: pr.score + timeBonus + allKeywordsBonus, fastestTime: Math.min(pr.fastestTime, timeTaken) }));
        }
      }
    }
  };

  const handleNextCard = () => {
    const timeTaken = settings.timePerQuestion - timeLeft;
    if (currentPlayer === 1) {
       setPlayer2Stats(pr => ({ ...pr, fastestTime: Math.min(pr.fastestTime, timeTaken) }));
    } else {
       setPlayer1Stats(pr => ({ ...pr, fastestTime: Math.min(pr.fastestTime, timeTaken) }));
    }

    if (currentIdx + 1 < cards.length) {
      setCurrentIdx(currentIdx + 1);
      handleStartRound();
    } else {
      if (currentPlayer === 1) {
        setPhase("swap");
      } else {
        finalizeGame();
      }
    }
  };

  const finalizeGame = () => {
    setPhase("results");
    
    // Save to local storage
    const stored = localStorage.getItem("hq_pair_results");
    const history = stored ? JSON.parse(stored) : [];
    history.push({
      date: new Date().toISOString(),
      player1Score: player1Stats.score,
      player2Score: player2Stats.score,
      player1Keywords: player1Stats.keywords,
      player2Keywords: player2Stats.keywords,
      totalKeywordsAvailable: cards.length * 2 * cards[0].keywords.length // Approx, or exactly mapped
    });
    localStorage.setItem("hq_pair_results", JSON.stringify(history));
    
    // XP
    let xpStored = parseInt(localStorage.getItem("hq_xp") || "0", 10);
    // Both players get +5 per keyword
    xpStored += player1Stats.keywords * 5;
    xpStored += player2Stats.keywords * 5;
    localStorage.setItem("hq_xp", xpStored.toString());

    // Badges check: Páros bajnok -> both 80%+ keywords
    let totalKw = 0;
    cards.forEach(c => { totalKw += c.keywords.length; });
    const p1Pct = player1Stats.keywords / totalKw;
    const p2Pct = player2Stats.keywords / totalKw;
    
    if (p1Pct >= 0.8 && p2Pct >= 0.8) {
      const b = localStorage.getItem("hq_badges") || "[]";
      let p = JSON.parse(b);
      if (!p.includes("paros_bajnok")) {
        p.push("paros_bajnok");
        localStorage.setItem("hq_badges", JSON.stringify(p));
      }
    }
  };

  const handleSwap = () => {
    setCurrentPlayer(2);
    setCurrentIdx(0);
    setPhase("intro2");
  };

  const getTimerColor = () => {
    if (timeLeft > 15) return "text-[#2E8B57] border-[#2E8B57]";
    if (timeLeft > 5) return "text-[#D2691E] border-[#D2691E]";
    return "text-[#B22222] border-[#B22222]";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {phase === "settings" && (
        <div className="medieval-card p-6 sm:p-10 text-center">
          <h2 className="text-3xl font-cinzel font-bold text-[#6B1010] mb-2 uppercase flex justify-center items-center gap-3">
            <Users className="w-8 h-8" /> Páros kikérdezés
          </h2>
          <p className="text-[#1C0E04]/80 font-lora text-sm mb-8">
            Az egyik tanuló látja a választ és kulcsszavakat. Felolvassa a kérdést, a másik tanuló szóban válaszol. Minden kimondott kulcsszóra kattints! Majd cseréltek.
          </p>

          {error && <div className="bg-[#B22222]/10 border border-[#B22222] text-[#B22222] p-3 mb-6 font-bold">{error}</div>}

          <div className="mb-6 bg-[#D8C3A5]/50 p-4 rounded-sm">
            <TopicSelector 
              selectedTopic={settings.topic} 
              onTopicChange={(t) => setSettings({...settings, topic: t})} 
              onGradeChange={(g) => setSettings({...settings, grade: g})} 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 text-left">
            <div className="space-y-1">
               <label className="text-[11px] font-cinzel font-bold tracking-widest text-[#6B1010] uppercase">Nehézség</label>
               <select className="w-full bg-white/50 border border-[#B8860B] rounded-sm px-3 py-2 text-[#1C0E04]" value={settings.difficulty} onChange={e => setSettings({...settings, difficulty: e.target.value as Difficulty})}>
                 <option value="Könnyű">Könnyű</option>
                 <option value="Közepes">Közepes</option>
                 <option value="Nehéz">Nehéz</option>
               </select>
            </div>
            <div className="space-y-1">
               <label className="text-[11px] font-cinzel font-bold tracking-widest text-[#6B1010] uppercase">Kártyák száma</label>
               <select className="w-full bg-white/50 border border-[#B8860B] rounded-sm px-3 py-2 text-[#1C0E04]" value={settings.count} onChange={e => setSettings({...settings, count: parseInt(e.target.value)})}>
                 <option value={5}>5 Kártya</option>
                 <option value={8}>8 Kártya</option>
                 <option value={10}>10 Kártya</option>
               </select>
            </div>
            <div className="space-y-1 sm:col-span-2">
               <label className="text-[11px] font-cinzel font-bold tracking-widest text-[#6B1010] uppercase">Idő kérdésenként</label>
               <select className="w-full bg-white/50 border border-[#B8860B] rounded-sm px-3 py-2 text-[#1C0E04]" value={settings.timePerQuestion} onChange={e => setSettings({...settings, timePerQuestion: parseInt(e.target.value)})}>
                 <option value={60}>1 perc</option>
                 <option value={120}>2 perc</option>
               </select>
            </div>
          </div>

          <button onClick={handleStartGenerate} className="w-full bg-[#6B1010] hover:bg-[#8B1A1A] text-[#FFF5E0] font-cinzel font-bold uppercase py-4 border border-[#B8860B] shadow-md flex justify-center items-center gap-2">
            <Play className="w-5 h-5 fill-current" /> Játék indítása
          </button>
        </div>
      )}

      {phase === "loading" && (
        <div className="text-center py-20">
          <Loader2 className="w-16 h-16 animate-spin text-[#B8860B] mx-auto mb-4" />
          <h2 className="text-[#FFF5E0] font-cinzel font-bold text-xl uppercase tracking-widest">Kártyák előkészítése...</h2>
        </div>
      )}

      {(phase === "intro1" || phase === "intro2") && (
        <div className="medieval-card p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-2 bg-[#6B1010]"></div>
          <h2 className="text-4xl font-cinzel font-bold text-[#6B1010] mb-4">
            1. játékos: {phase === "intro1" ? "KÉRDEZŐ" : "VÁLASZOLÓ"}
          </h2>
          <h2 className="text-4xl font-cinzel font-bold text-[#1C0E04] mb-8">
            2. játékos: {phase === "intro1" ? "VÁLASZOLÓ" : "KÉRDEZŐ"}
          </h2>
          <button onClick={handleStartRound} className="mx-auto w-full max-w-sm bg-[#6B1010] text-[#FFF5E0] font-cinzel font-bold py-4 uppercase flex justify-center items-center gap-2">
            <Play className="w-5 h-5 fill-current" /> Játék kezdése
          </button>
        </div>
      )}

      {phase === "active" && (
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          {/* Left panel - Kérdező */}
          <div className="flex-1 bg-[#1A0A03] border border-[#B8860B]/50 p-6 rounded-sm shadow-xl flex flex-col relative text-[#FFF5E0]">
            <h3 className="text-[11px] font-cinzel font-bold text-[#B8860B] uppercase tracking-widest mb-4">Kérdező (Látja)</h3>
            <p className="font-cinzel text-xl sm:text-2xl font-bold leading-tight mb-4">
              {currentCard.question}
            </p>
            <p className="font-lora text-[#FFF5E0]/80 italic mb-6 text-sm">
              Súgó válasz: {currentCard.answer}
            </p>

            <div className="mt-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold font-cinzel text-[#FFF5E0]/70">
                  {foundKeywords.length} / {currentCard.keywords.length} kulcsszó
                </span>
                <button onClick={() => setShowHint(!showHint)} className="text-xs underline text-[#B8860B]">
                  {showHint ? "Tipp elrejtése" : "Tipp mutatása"}
                </button>
              </div>
              
              {showHint && (
                <div className="bg-[#6B1010]/20 border border-[#6B1010] p-3 text-xs mb-4">
                  Tipp: {currentCard.hint}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {currentCard.keywords.map((kw, i) => {
                  const isFound = foundKeywords.includes(kw);
                  return (
                    <button
                      key={i}
                      disabled={isFound || !timerActive}
                      onClick={() => handleKeywordClick(kw)}
                      className={`min-h-[44px] px-4 py-2 border rounded-sm font-cinzel text-sm font-bold transition-all flex items-center gap-2 ${isFound ? 'bg-[#2E8B57] text-[#FFF] border-[#2E8B57]' : 'bg-[#FFF5D0]/10 text-[#FFF5E0] border-[#B8860B] hover:bg-[#B8860B]/20'}`}
                    >
                      {kw} {isFound && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dividing line md+ */}
          <div className="hidden md:flex flex-col items-center justify-center">
             <div className="w-[2px] h-32 bg-gradient-to-b from-transparent to-[#B8860B]"></div>
             <Crown className="w-6 h-6 text-[#B8860B] my-2" />
             <div className="w-[2px] h-32 bg-gradient-to-t from-transparent to-[#B8860B]"></div>
          </div>

          {/* Right panel - Válaszoló */}
          <div className="flex-1 bg-[#FFF5D0] border border-[#B8860B] p-6 rounded-sm shadow-xl flex flex-col items-center justify-center relative text-[#1C0E04]">
            <h3 className="text-[11px] font-cinzel font-bold text-[#6B1010] uppercase tracking-widest absolute top-6 left-6">Válaszoló</h3>
            
            <p className="font-cinzel text-2xl font-bold leading-tight mt-10 mb-10 text-center">
              {currentCard.question}
            </p>

            <motion.div 
               animate={timeLeft <= 10 && timeLeft > 0 ? { scale: [1, 1.1, 1] } : {}}
               transition={{ duration: 1, repeat: Infinity }}
               className={`w-32 h-32 rounded-full border-[6px] flex items-center justify-center mb-8 ${getTimerColor()}`}
            >
               <span className="font-cinzel font-bold text-4xl">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}</span>
            </motion.div>

            {timerActive && (
               <button onClick={() => setTimerActive(false)} className="px-6 py-2 border-2 border-[#1C0E04] text-[#1C0E04] hover:bg-[#1C0E04] hover:text-[#FFF5D0] font-cinzel font-bold text-xs uppercase tracking-widest transition-colors mb-4">
                 Időm lejárt
               </button>
            )}

            {!timerActive && (
              <button onClick={handleNextCard} className="w-full bg-[#6B1010] text-[#FFF5E0] py-4 uppercase font-cinzel font-bold flex justify-center items-center gap-2 mt-auto border border-[#B8860B]">
                Következő kártya <ArrowRight className="w-4 h-4" />
              </button>
            )}
            
            {/* Bottom Bar Info */}
            <div className="w-full mt-4 flex justify-between items-center text-xs font-bold font-cinzel text-[#1C0E04]/60 border-t border-[#B8860B]/30 pt-4">
              <span>{currentIdx + 1} / {cards.length} kártya</span>
              <span className="flex items-center gap-1.5 text-[#6B1010]"><Trophy className="w-4 h-4"/> Pont ebből: {currentPlayer === 1 ? player2Stats.score : player1Stats.score}</span>
            </div>
          </div>
        </div>
      )}

      {phase === "swap" && (
        <div className="medieval-card p-10 text-center relative overflow-hidden">
          <div className="mb-6 flex flex-col items-center">
            <h2 className="text-xl font-cinzel font-bold text-[#1C0E04] mb-2 uppercase">Eredmény Félidőben</h2>
            <p className="font-lora text-lg font-bold text-[#6B1010]">2. Játékos Pontja: {player2Stats.score}</p>
          </div>
          <div className="flex justify-center mb-6 text-[#B8860B]">
             <motion.div animate={{ rotate: 180 }} transition={{ duration: 1 }}>
                <StopCircle className="w-16 h-16" />
             </motion.div>
          </div>
          <h2 className="text-3xl font-cinzel font-bold text-[#6B1010] mb-8">
            CSERE! Most te kérdezel!
          </h2>
          <button onClick={handleSwap} className="mx-auto w-full max-w-sm bg-[#6B1010] hover:bg-[#8B1A1A] text-[#FFF5E0] font-cinzel font-bold py-4 uppercase flex justify-center items-center gap-2 border border-[#B8860B]">
            Folytatás <Play className="w-4 h-4 fill-current"/>
          </button>
        </div>
      )}

      {phase === "results" && (
        <div className="medieval-card p-8">
          <h2 className="text-3xl font-cinzel font-bold text-[#6B1010] text-center mb-8">Végeredmény</h2>
          
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className={`flex-1 p-6 border-2 rounded-sm text-center relative ${player1Stats.score >= player2Stats.score ? 'border-[#B8860B] bg-[#B8860B]/10' : 'border-[#1C0E04]/20'}`}>
               {player1Stats.score >= player2Stats.score && player1Stats.score > 0 && <Crown className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 text-[#B8860B]" />}
               <h3 className="font-cinzel font-bold text-xl uppercase mb-2">1. Játékos</h3>
               <p className="text-4xl font-bold font-cinzel text-[#6B1010] mb-4">{player1Stats.score} pont</p>
               <div className="text-xs font-lora space-y-1">
                 <p>Megtalált kulcsszavak: <b>{player1Stats.keywords}</b></p>
                 <p>Sikerességi arány: <b>{Math.round(player1Stats.keywords / (cards.map(c => c.keywords.length).reduce((a,b)=>a+b, 0)) * 100)}%</b></p>
                 <p>Leggyorsabb kártya: <b>{player1Stats.fastestTime === 999 ? '-' : `${player1Stats.fastestTime} mp`}</b></p>
               </div>
            </div>
            <div className={`flex-1 p-6 border-2 rounded-sm text-center relative ${player2Stats.score > player1Stats.score ? 'border-[#B8860B] bg-[#B8860B]/10' : 'border-[#1C0E04]/20'}`}>
               {player2Stats.score > player1Stats.score && player2Stats.score > 0 && <Crown className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 text-[#B8860B]" />}
               <h3 className="font-cinzel font-bold text-xl uppercase mb-2">2. Játékos</h3>
               <p className="text-4xl font-bold font-cinzel text-[#6B1010] mb-4">{player2Stats.score} pont</p>
               <div className="text-xs font-lora space-y-1">
                 <p>Megtalált kulcsszavak: <b>{player2Stats.keywords}</b></p>
                 <p>Sikerességi arány: <b>{Math.round(player2Stats.keywords / (cards.map(c => c.keywords.length).reduce((a,b)=>a+b, 0)) * 100)}%</b></p>
                 <p>Leggyorsabb kártya: <b>{player2Stats.fastestTime === 999 ? '-' : `${player2Stats.fastestTime} mp`}</b></p>
               </div>
            </div>
          </div>

          <div className="flex gap-4">
             <button onClick={() => setPhase("settings")} className="flex-1 border-2 border-[#6B1010] text-[#6B1010] hover:bg-[#6B1010] hover:text-[#FFF5E0] py-4 uppercase font-cinzel font-bold transition-colors">
               Újra játszani
             </button>
             <button onClick={onGoHome} className="flex-1 bg-[#6B1010] text-[#FFF5E0] py-4 uppercase font-cinzel font-bold">
               Főmenü
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
