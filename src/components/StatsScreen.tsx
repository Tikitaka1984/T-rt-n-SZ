import React, { useState, useEffect } from "react";
import { BookOpen, Scroll, Flame, Check, HelpCircle, ArrowRight, Home, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TopicSelector } from "./TopicSelector";
import { triggerMascotAct } from "./KnightMascot";
import { answersMatch } from "../utils/answerMatch";

interface KronikaScreenProps {
  stats: any;
  onResetStats: () => void;
  onGoHome: () => void;
  onStartQuiz: () => void;
}

type Chapter = {
  number: number;
  title: string;
  atmosphere: string;
  story: string;
  dramaticMoment: string;
  question: {
    text: string;
    options: string[];
    correct: string;
    chroniclerResponse: {
      correct: string;
      wrong: string;
    };
  };
  historicalFact: string;
};

type KronikaData = {
  title: string;
  chronicler: string;
  chapters: Chapter[];
};

export default function StatsScreen({ onGoHome }: KronikaScreenProps) {
  const [phase, setPhase] = useState<"setup" | "loading" | "reading" | "end">("setup");
  const [topic, setTopic] = useState("Az őskor korszakai és jellemzői");
  const [grade, setGrade] = useState("⚱️ Őskor és ókori Kelet");
  const [data, setData] = useState<KronikaData | null>(null);
  
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [revealChars, setRevealChars] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  
  const [correctCount, setCorrectCount] = useState(0);
  const [totalXp, setTotalXp] = useState(0);

  const handleGenerate = async () => {
    setPhase("loading");
    triggerMascotAct("fact", "Hallgasd figyelemmel e sorokat, kedves olvasó...", { outfit: 'scribe' });
    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: "", // We embed everything in the prompt so no raw outline is attached
          prompt: `Te Frater Benedek, egy középkori szerzetes krónikás vagy, aki saját szemével látta a történelmi eseményeket és egy mai diáknak meséli el azokat. Témakör: ${topic}. Évfolyam: ${grade}. Írj egy lebilincselő, első személyű krónikát amely 5 fejezetből áll. Minden fejezet: Atmoszferikus bevezetés, fõesemény leírása, drámai fordulópont, egy kérdés a diáknak 4 opcióval, és a helyes válasz magyarázata. Stílus: középkori szerzetes, 'kedves olvasó' megszólítás (SOSE használd a 'vitéz' szót), faktikusan pontos! A chroniclerResponse.correct és wrong mezőkbe ezekhez hasonlókat írj: "Helyesen ítéled meg, kedves olvasó...", "Nem így történt valójában... Halld az igazságot..."
CSAK valid JSON hiba nélkül:
{
  "title": "A Krónika Címe",
  "chronicler": "Takács mester",
  "chapters": [
    {
      "number": 1,
      "title": "Cím",
      "atmosphere": "Szöveg...",
      "story": "Szöveg...",
      "dramaticMoment": "Szöveg...",
      "question": {
        "text": "Kérdés?",
        "options": ["O1", "O2", "O3", "O4"],
        "correct": "Helyes opció szövege",
        "chroniclerResponse": {
          "correct": "Válasz helyes esetben",
          "wrong": "Válasz hibás esetben"
        }
      },
      "historicalFact": "Tény..."
    }
  ]
}`
        })
      });
      const resData = await resp.json();
      let raw = resData?.text;
      if (raw.trim().startsWith("\`\`\`json")) {
        raw = raw.replace(/\`\`\`json|\`\`\`/g, "").trim();
      } else if (raw.trim().startsWith("\`\`\`")) {
        raw = raw.replace(/\`\`\`/g, "").trim();
      }
      const parsed = JSON.parse(raw);
      setData(parsed);
      setCurrentChapterIdx(0);
      setRevealChars(0);
      setSelectedAnswer(null);
      setCorrectCount(0);
      setTotalXp(0);
      setPhase("reading");
    } catch (err) {
      console.error(err);
      alert("Hiba történt a Krónika megnyitásakor. Próbáld újra!");
      setPhase("setup");
    }
  };

  useEffect(() => {
    if (phase === "reading" && selectedAnswer === null) {
      const interval = setInterval(() => {
        setRevealChars(prev => prev + 3);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [phase, currentChapterIdx, selectedAnswer]);

  const ch = data?.chapters[currentChapterIdx];

  const handleSkipTyping = () => {
    setRevealChars(99999);
  };

  const handleAnswer = (opt: string) => {
    if (selectedAnswer !== null) return; // already answered
    setSelectedAnswer(opt);
    setRevealChars(99999); // show full text
    
    const isCorrect = answersMatch(opt, ch?.question?.correct) || String(opt).toLowerCase() === String(ch?.question?.correct).toLowerCase();
    if (isCorrect) {
      setCorrectCount(c => c + 1);
      setTotalXp(x => x + 15);
      // Give XP in real storage
      const existing = parseInt(localStorage.getItem("hq_xp") || "0", 10);
      localStorage.setItem("hq_xp", (existing + 15).toString());
    } else {
      setTotalXp(x => x + 5);
      const existing = parseInt(localStorage.getItem("hq_xp") || "0", 10);
      localStorage.setItem("hq_xp", (existing + 5).toString());
    }
  };

  const handleGoHome = () => {
    triggerMascotAct("fact", "", { outfit: 'knight' });
    onGoHome();
  };

  const nextChapter = () => {
    if (currentChapterIdx + 1 < (data?.chapters.length || 0)) {
      setCurrentChapterIdx(c => c + 1);
      setRevealChars(0);
      setSelectedAnswer(null);
    } else {
      setPhase("end");
      triggerMascotAct("fact", "Milyen gazdag história! Tanultál belőle, kedves olvasó?", { outfit: 'scribe' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0500] text-[#FDF3DC] relative font-lora">
      {/* Background candle effect */}
      <div className="fixed inset-0 pointer-events-none candle-flicker">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4A017]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8B1515]/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        
        {phase === "setup" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[70vh]">
            <div className="mb-8 relative flex items-center justify-center">
               <Scroll className="w-24 h-24 text-[#D4A017] opacity-80" />
               <Flame className="w-10 h-10 text-[#FF9500] absolute -top-4 candle-flicker" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-[#D4A017] mb-2 drop-shadow-[0_2px_10px_rgba(212,160,23,0.3)]">📜 Krónika</h1>
            <p className="text-lg text-[#FDF3DC]/70 italic mb-12">Hallgasd a történelem hangját, kedves olvasó...</p>
            
            <div className="w-full max-w-2xl bg-[#1A0A00]/80 p-6 md:p-8 rounded-xl border border-[#D4A017]/30 shadow-[0_0_20px_rgba(212,160,23,0.1)] mb-10">
              <TopicSelector 
                 selectedTopic={topic} 
                 onTopicChange={setTopic} 
                 onGradeChange={setGrade} 
              />
            </div>
            
            <button 
              onClick={handleGenerate}
              className="px-8 py-4 bg-[#8B1515] hover:bg-[#6B1010] text-[#FDF3DC] font-cinzel font-bold text-xl rounded border-2 border-[#D4A017] shadow-[0_0_20px_rgba(139,21,21,0.5)] transition-all transform hover:scale-105 flex items-center gap-3"
            >
              🕯️ Nyisd fel a Krónikát
            </button>
          </motion.div>
        )}

        {phase === "loading" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[70vh]">
             <Flame className="w-16 h-16 text-[#D4A017] candle-flicker mb-6" />
             <h2 className="text-2xl font-cinzel text-[#D4A017] animate-pulse">A Krónikás bevezeti pennáját...</h2>
             <p className="italic text-[#FDF3DC]/60 mt-4">Készül a történelmi elbeszéléséd.</p>
          </motion.div>
        )}

        {phase === "reading" && ch && (
          <div className="pb-24">
            {/* Top Bar */}
            <div className="flex justify-between items-center border-b border-[#D4A017]/30 pb-4 mb-8">
              <div className="flex items-center gap-3">
                <BookOpen className="text-[#D4A017] w-6 h-6" />
                <span className="font-cinzel text-xl font-bold tracking-widest text-[#D4A017]">Krónika</span>
              </div>
              <div className="font-cinzel text-[#FDF3DC]/80 font-bold">
                {ch.number}. Fejezet / 5.
              </div>
              <button onClick={handleGoHome} className="text-[#D4A017] hover:text-[#FF9500] transition-colors p-2">✕</button>
            </div>

            {/* Content Area - clickable to skip typing */}
            <div onClick={handleSkipTyping} className="cursor-pointer">
              
              <div className="flex justify-between items-start mb-6">
                 <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-[#FDF3DC]">{ch.title}</h2>
                 <div className="flex flex-col items-center">
                    <svg width="40" height="40" viewBox="0 0 100 100" className="mb-1 text-[#D4A017] drop-shadow-[0_2px_4px_rgba(212,160,23,0.3)]">
                      <circle cx="50" cy="40" r="15" fill="currentColor" />
                      <path d="M25 90 C25 60, 40 55, 50 55 C60 55, 75 60, 75 90 Z" fill="none" stroke="currentColor" strokeWidth="4" />
                      <rect x="35" y="80" width="30" height="15" fill="currentColor" />
                      <path d="M70 70 Q80 60 85 45 Q75 55 65 65 Z" fill="currentColor" />
                    </svg>
                    <span className="font-cinzel text-[11px] text-[#D4A017]">{data?.chronicler}</span>
                 </div>
              </div>

              {/* Text Blocks */}
              <div className="space-y-8 min-h-[40vh]">
                {/* Atmosphere */}
                {revealChars > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                    <p className="italic text-[#D4A017] text-[15px] max-w-2xl mx-auto leading-[1.8]">
                      {ch.atmosphere.substring(0, revealChars)}
                    </p>
                    {revealChars >= ch.atmosphere.length && (
                       <div className="text-[#D4A017]/40 text-center mt-4">═══════ ⚜️ ═══════</div>
                    )}
                  </motion.div>
                )}

                {/* Story */}
                {revealChars > ch.atmosphere.length && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="text-[#FDF3DC] text-[18px] leading-[2] drop-cap text-justify indent-8">
                       {ch.story.substring(0, revealChars - ch.atmosphere.length)}
                    </p>
                  </motion.div>
                )}

                {/* Dramatic Moment */}
                {revealChars > ch.atmosphere.length + ch.story.length && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 border-l-4 border-[#8B1515] pl-4 py-2">
                    <p className="text-[#8B1515] font-bold text-xl bg-[#8B1515]/10 p-4 font-cinzel rounded-r">
                       ⚔️ Ekkor... {ch.dramaticMoment.substring(0, revealChars - ch.atmosphere.length - ch.story.length)}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Question appears after typing completes */}
            {revealChars >= ch.atmosphere.length + ch.story.length + ch.dramaticMoment.length && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 bg-[#FDF3DC] text-[#1A0A00] p-6 md:p-8 rounded border-4 border-[#D4A017] shadow-[0_10px_30px_rgba(212,160,23,0.2)]">
                 <h3 className="text-xl md:text-2xl font-cinzel font-bold mb-6 border-b-2 border-[#1A0A00]/10 pb-4">
                   🤔 Mit gondolsz, kedves olvasó... <br/><span className="text-[#8B1515] text-lg mt-2 block">{ch?.question?.text}</span>
                 </h3>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {ch?.question?.options?.map((opt, i) => {
                     const isSelected = selectedAnswer === opt;
                     const isCorrect = answersMatch(ch?.question?.correct, opt) || String(ch?.question?.correct).toLowerCase() === String(opt).toLowerCase();
                     const alreadyAnswered = selectedAnswer !== null;

                     let bgClass = "bg-[#1A0A00]/5 hover:bg-[#1A0A00]/10 border-[#1A0A00]/20";
                     if (alreadyAnswered) {
                        if (isCorrect) bgClass = "bg-green-700 text-white border-green-800 shadow-[0_0_15px_rgba(34,197,94,0.5)]";
                        else if (isSelected) bgClass = "bg-red-700 text-white border-red-800 shadow-[0_0_15px_rgba(239,68,68,0.5)]";
                        else bgClass = "opacity-50 border-[#1A0A00]/10 bg-transparent";
                     }

                     return (
                       <button
                         key={i}
                         disabled={alreadyAnswered}
                         onClick={() => handleAnswer(opt)}
                         className={`p-4 rounded border-2 text-left font-bold transition-all flex items-start gap-4 ${bgClass}`}
                       >
                         <span className={`w-8 h-8 flex items-center justify-center rounded-full font-cinzel shrink-0 border-2 ${alreadyAnswered && isCorrect ? 'border-white text-white' : 'border-[#1A0A00] text-[#1A0A00]'}`}>
                           {["A", "B", "C", "D"][i]}
                         </span>
                         <span className="pt-1">{opt}</span>
                       </button>
                     );
                   })}
                 </div>

                 {/* Feedback from chronicler */}
                 {selectedAnswer !== null && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-8 pt-6 border-t-2 border-[#1A0A00]/10">
                     <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#1A0A00] rounded-full flex items-center justify-center shrink-0 border border-[#D4A017]/30">
                          <svg width="24" height="24" viewBox="0 0 100 100" className="text-[#D4A017]">
                            <circle cx="50" cy="40" r="15" fill="currentColor" />
                            <path d="M25 90 C25 60, 40 55, 50 55 C60 55, 75 60, 75 90 Z" fill="none" stroke="currentColor" strokeWidth="4" />
                            <rect x="35" y="80" width="30" height="15" fill="currentColor" />
                          </svg>
                        </div>
                        <div>
                           <p className="font-cinzel font-bold text-lg text-[#1A0A00]">
                             {(answersMatch(selectedAnswer, ch?.question?.correct) || String(selectedAnswer).toLowerCase() === String(ch?.question?.correct).toLowerCase()) ? '📜 Helyesen ítéled meg...' : '📜 Nem így történt...'}
                           </p>
                           <p className="mt-2 text-[15px] leading-[1.8]">
                             {(answersMatch(selectedAnswer, ch?.question?.correct) || String(selectedAnswer).toLowerCase() === String(ch?.question?.correct).toLowerCase()) ? ch?.question?.chroniclerResponse?.correct : ch?.question?.chroniclerResponse?.wrong}
                           </p>
                           <p className="mt-4 italic text-[#8B1515] font-bold text-sm">
                             📜 Frater Benedek feljegyezte: {ch?.historicalFact}
                           </p>
                           
                           {/* +XP feedback */}
                           <div className="mt-4 text-[#D4A017] font-cinzel font-bold flex items-center gap-2">
                             <Flame className="w-5 h-5 text-[#FF9500]" /> 
                             {(answersMatch(selectedAnswer, ch?.question?.correct) || String(selectedAnswer).toLowerCase() === String(ch?.question?.correct).toLowerCase()) ? '+15 tudáspont bejegyezve a krónikába' : '+5 tudáspont bejegyezve a krónikába'}
                           </div>
                        </div>
                     </div>

                     <button 
                       onClick={nextChapter}
                       className="w-full mt-8 py-4 bg-[#1A0A00] hover:bg-[#2A1505] text-[#D4A017] font-cinzel font-bold uppercase tracking-widest rounded border border-[#D4A017] transition-all flex justify-center items-center gap-2"
                     >
                       📖 Folytasd a Krónikát <ChevronRight className="w-5 h-5" />
                     </button>
                   </motion.div>
                 )}
              </motion.div>
            )}
          </div>
        )}

        {phase === "end" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[70vh]">
             <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-[#D4A017] mb-8 text-center drop-shadow-[0_2px_10px_rgba(212,160,23,0.3)]">
               📜 A Krónika lezárult
             </h1>
             
             <div className="bg-[#1A0A00]/80 p-8 md:p-12 rounded border border-[#D4A017]/30 max-w-2xl text-center shadow-[0_0_30px_rgba(212,160,23,0.1)] relative">
                {/* Seal SVG */}
                <svg className="absolute -top-10 -right-10 w-32 h-32 text-[#8B1515] drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)]" viewBox="0 0 100 100">
                   <circle cx="50" cy="50" r="45" fill="currentColor" />
                   <circle cx="50" cy="50" r="38" fill="none" stroke="#D4A017" strokeWidth="2" strokeDasharray="4 4" />
                   <text x="50" y="55" fontFamily="Cinzel" fontSize="14" fill="#D4A017" textAnchor="middle" fontWeight="bold">TörténÉSZ</text>
                </svg>

                <p className="text-xl italic text-[#FDF3DC]/90 mb-10 leading-[1.8] font-lora text-justify">
                  "Így végződik e korszak históriája, kedves olvasó. Remélem, hogy e sorok segítenek megérteni a múlt nagy titkait..."
                </p>

                <div className="grid grid-cols-2 gap-4 mb-10">
                   <div className="bg-[#D4A017]/10 border border-[#D4A017]/30 p-4 rounded">
                      <div className="text-[11px] uppercase font-cinzel tracking-widest text-[#D4A017]">Helyes Válaszok</div>
                      <div className="text-3xl font-cinzel font-bold mt-1">{correctCount} <span className="text-lg">/ {data?.chapters.length}</span></div>
                   </div>
                   <div className="bg-[#D4A017]/10 border border-[#D4A017]/30 p-4 rounded">
                      <div className="text-[11px] uppercase font-cinzel tracking-widest text-[#D4A017]">Szerzett XP</div>
                      <div className="text-3xl font-cinzel font-bold text-[#FF9500] mt-1">+{totalXp}</div>
                   </div>
                   <div className="bg-[#D4A017]/10 border border-[#D4A017]/30 p-4 rounded col-span-2">
                      <div className="text-[11px] uppercase font-cinzel tracking-widest text-[#D4A017]">Pontosság</div>
                      <div className="text-xl font-cinzel font-bold mt-1">{Math.round((correctCount / (data?.chapters.length || 1)) * 100)}%</div>
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => setPhase("setup")}
                    className="px-6 py-3 bg-[#8B1515] hover:bg-[#6B1010] text-[#FDF3DC] font-cinzel font-bold rounded border border-[#D4A017] transition-colors flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-5 h-5"/> Új Krónika nyitása
                  </button>
                  <button 
                    onClick={handleGoHome}
                    className="px-6 py-3 bg-transparent hover:bg-[#D4A017]/10 text-[#D4A017] font-cinzel font-bold rounded border border-[#D4A017] transition-colors flex items-center justify-center gap-2"
                  >
                    <Home className="w-5 h-5"/> Főmenü
                  </button>
                </div>
             </div>
          </motion.div>
        )}

      </div>
      
      {/* Chapter Navigation Dots (if reading) */}
      {phase === "reading" && data && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0A0500] border-t border-[#D4A017]/20 p-4 flex justify-between items-center z-40">
           <div className="max-w-4xl mx-auto w-full flex justify-between items-center sm:px-4">
              <div className="w-24 text-[11px] font-cinzel text-[#8B1515] uppercase">{currentChapterIdx > 0 ? "← Előző" : ""}</div>
              <div className="flex gap-3">
                 {data.chapters.map((c, i) => (
                   <div key={i} className="relative group cursor-pointer" onClick={() => {}}>
                     <div className={`w-3 h-3 rounded-full border border-[#D4A017] transition-all ${i === currentChapterIdx ? 'bg-[#D4A017] shadow-[0_0_10px_rgba(212,160,23,0.8)]' : i < currentChapterIdx ? 'bg-[#D4A017]/40' : 'bg-transparent'}`} />
                     {/* Tooltip */}
                     <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#1A0A00] border border-[#D4A017] text-[#D4A017] text-[11px] font-cinzel whitespace-nowrap px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity rounded pointer-events-none">
                       {c.title}
                     </div>
                   </div>
                 ))}
              </div>
              <div className="w-24 text-right text-[11px] font-cinzel text-[#8B1515] uppercase">{currentChapterIdx < data.chapters.length - 1 ? "Következő →" : ""}</div>
           </div>
        </div>
      )}
    </div>
  );
}
