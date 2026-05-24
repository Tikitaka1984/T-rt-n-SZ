import React, { useState, useEffect } from "react";
import { TopicSelector } from "./TopicSelector";
import { BookOpen, AlertCircle, X, ChevronRight, Loader2, Sparkles, Star, RotateCcw, ArrowRight, Home, Play } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { answersMatch } from "../utils/answerMatch";

interface LessonScreenProps {
  onGoHome: () => void;
}

export default function LessonScreen({ onGoHome }: LessonScreenProps) {
  const [selectedTopic, setSelectedTopic] = useState("Az őskor korszakai és jellemzői");
  const [selectedGrade, setSelectedGrade] = useState("Őskor és Ókor");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeLesson, setActiveLesson] = useState<any | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  
  // Stats
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [lessonFinished, setLessonFinished] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const lessons = [
    { title: "🌱 Alapfogalmak és bevezetés", reward: 50 },
    { title: "👑 Főszereplők és személyek", reward: 50 },
    { title: "⚡ Kulcsesemények", reward: 50 },
    { title: "🔍 Okok és következmények", reward: 50 },
    { title: "🎯 Érettségi összefoglaló", reward: 75 }
  ];

  const handleStartLesson = async (lessonTitle: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: selectedGrade,
          topic: selectedTopic,
          lessonType: lessonTitle
        })
      });

      if (!response.ok) {
        throw new Error("Hiba történt a lecke generálásakor.");
      }

      const data = await response.json();
      if (!data.cards || !Array.isArray(data.cards)) {
        throw new Error("Érvénytelen válasz a szervertől.");
      }

      setActiveLesson(data);
      setCurrentCardIndex(0);
      setCorrectAnswers(0);
      setTotalQuestions(data.cards.filter((c: any) => ["multiple_choice", "true_false", "matching"].includes(c.type)).length);
      setLessonFinished(false);
    } catch (err: any) {
      setError(err?.message || "Ismeretlen hiba.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextCard = () => {
    if (isAdvancing) return;
    setIsAdvancing(true);
    setTimeout(() => {
      if (activeLesson && currentCardIndex < activeLesson.cards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      } else {
        setLessonFinished(true);
        
        // Save stats to local storage
        const existing = localStorage.getItem(`hq_lessons_${selectedTopic}`) || "{}";
        const parsed = JSON.parse(existing);
        
        const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 100;
        let stars = 1;
        if (accuracy >= 90) stars = 3;
        else if (accuracy >= 70) stars = 2;

        parsed[activeLesson.lessonTitle] = { stars, xp: correctAnswers * 5, date: new Date().toISOString() };
        localStorage.setItem(`hq_lessons_${selectedTopic}`, JSON.stringify(parsed));
      }
      setIsAdvancing(false);
    }, 50);
  };

  if (activeLesson && !lessonFinished) {
    const card = activeLesson.cards[currentCardIndex];
    const progress = ((currentCardIndex) / activeLesson.cards.length) * 100;

    return (
      <div className="fixed inset-0 z-50 bg-[#0F0F1A] text-white flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between p-4 bg-[linear-gradient(135deg,#5C0A0A,#3D0505)] sticky top-0 z-10 shadow-md border-b-2 border-[#D4A017]">
          <div className="flex-1">
            <div className="h-2 bg-[#2A2A3E] rounded-full flex-1 overflow-hidden">
               <motion.div 
                 className="h-full bg-gradient-to-r from-[#F5A623] to-[#F0C040] shadow-[0_0_8px_rgba(245,166,35,0.8)] rounded-full" 
                 initial={{ width: 0 }} 
                 animate={{ width: `${progress}%` }} 
                 transition={{ duration: 0.3, ease: "easeOut" }}
               />
            </div>
          </div>
          <div className="mx-4 font-cinzel font-bold text-[#FDF3DC] text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Lecke {currentCardIndex + 1}/{activeLesson.cards.length}</div>
          <button onClick={() => setActiveLesson(null)} className="p-2 bg-[#1A0A00]/40 rounded-full hover:bg-[#1A0A00]/60 transition-colors">
            <X className="w-5 h-5 text-[#FDF3DC]" />
          </button>
        </div>

        <div className="flex-1 p-4 flex flex-col items-center justify-center">
          <AnimatePresence mode="sync">
            <motion.div
              key={currentCardIndex}
              initial={{ opacity: 0, x: window.innerWidth > 0 ? 100 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
              className="w-full max-w-lg"
            >
              <CardRenderer card={card} onNext={handleNextCard} onCorrect={() => setCorrectAnswers(p => p + 1)} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (lessonFinished && activeLesson) {
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 100;
    let stars = 1;
    if (accuracy >= 90) stars = 3;
    else if (accuracy >= 70) stars = 2;

    return (
      <div className="fixed inset-0 z-50 bg-[#1A0A00] flex flex-col items-center justify-center p-6 text-center">
        {/* Simple CSS Confetti */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i}
              className="absolute bg-[#D4A017] rounded-sm"
              style={{
                width: Math.random() * 8 + 4 + 'px',
                height: Math.random() * 12 + 6 + 'px',
                left: Math.random() * 100 + '%',
                top: -20,
                opacity: Math.random() + 0.5,
                transform: `rotate(${Math.random() * 360}deg)`,
                animation: `fall ${Math.random() * 3 + 2}s linear forwards`
              }}
            />
          ))}
        </div>
        <style>{`@keyframes fall { to { transform: translateY(100vh) rotate(720deg); } }`}</style>
        
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="medieval-card p-8 w-full max-w-md content-relative text-[#1A0800]">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ type: "spring", bounce: 0.6, duration: 0.8 }}
            className="text-6xl mb-4"
          >
            🏆
          </motion.div>
          <h2 className="text-3xl font-cinzel font-bold text-[#5C0A0A] mb-6 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">Lecke teljesítve!</h2>
          
          <div className="flex justify-center gap-2 mb-6 text-5xl">
            {[1, 2, 3].map(i => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: i * 0.3, type: "spring" }}
                className={i <= stars ? "text-[#D4A017] drop-shadow-[0_0_15px_rgba(212,160,23,0.8)]" : "text-[#5C3A10]/30"}
              >
                ★
              </motion.div>
            ))}
          </div>

          <div className="space-y-2 mb-8 text-[#5C3A10] font-lora">
            <p className="text-xl">Kérdések: <span className="font-bold text-[#1A0800]">{correctAnswers}/{totalQuestions}</span></p>
            <p className="text-lg">Pontosság: <span className="font-bold text-[#1A0800]">{Math.round(accuracy)}%</span></p>
            <p className="text-lg">Jutalmad: 
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="font-bold text-[#1E6B3C] ml-2"
              >
                +{correctAnswers * 5} XP
              </motion.span>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={() => { setActiveLesson(null); setLessonFinished(false); }} className="w-full bg-[linear-gradient(135deg,#5C0A0A,#3D0505)] hover:bg-[#3D0505] text-[#FDF3DC] font-cinzel font-bold py-3 rounded uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-[#D4A017] shadow-[0_4px_15px_rgba(0,0,0,0.3)] option-btn">
              <RotateCcw className="w-5 h-5" /> Vissza a leckékhez
            </button>
            <button onClick={onGoHome} className="w-full bg-[#1A0A00] hover:bg-[#3D0505] text-[#D4A017] font-cinzel font-bold py-3 rounded uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-[#D4A017] shadow-sm option-btn">
              <Home className="w-5 h-5" /> Főmenü
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Pre-load lesson states if available
  const existingLessonsStr = localStorage.getItem(`hq_lessons_${selectedTopic}`);
  const existingLessons = existingLessonsStr ? JSON.parse(existingLessonsStr) : {};

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8 border-b-2 border-[#B8860B] pb-4">
        <div>
          <h1 className="text-3xl font-cinzel font-bold text-[#6B1010]">Interaktív Leckék</h1>
          <p className="text-[#1C0E04] text-sm mt-1 font-lora">Feldolgozd a történelmet lépésenként, elmélet és gyakorlat egyensúlyával.</p>
        </div>
        <button onClick={onGoHome} className="p-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="mb-8 p-6 medieval-card">
        <h2 className="text-xl font-cinzel font-bold text-[#6B1010] mb-4">Válassz témakört:</h2>
        <TopicSelector 
          selectedTopic={selectedTopic} 
          onTopicChange={setSelectedTopic} 
          onGradeChange={setSelectedGrade} 
        />
      </div>

      {error && (
        <div className="bg-red-900 border-2 border-red-500 text-white p-4 mb-6 relative rounded flex items-center gap-3">
          <AlertCircle className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-cinzel font-bold text-lg text-[#1C0E04] border-b border-[#B8860B]/30 pb-2">Elérhető leckék ehhez a témához:</h3>
        
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-[#6B1010]">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-cinzel font-bold">Lecke előkészítése...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessons.map((lesson, idx) => {
              const status = existingLessons[lesson.title] || null;
              
              return (
                <div key={idx} className="bg-white border-2 border-[#B8860B]/40 p-4 rounded shadow-sm flex flex-col justify-between hover:border-[#B8860B] transition-colors relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-md text-[#6B1010] p-1 font-cinzel">{idx + 1}. {lesson.title}</h4>
                  </div>
                  
                  <div className="text-xs font-bold font-cinzel text-orange-600 mb-4 bg-orange-100 w-max px-2 py-1 rounded">
                    ⭐ MAX {lesson.reward} XP
                  </div>
                  
                  {status && (
                    <div className="text-xs text-yellow-600 font-bold mb-3 flex gap-1">
                      {Array.from({length: status.stars}).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                      <span className="ml-1 text-gray-500">Teljesítve</span>
                    </div>
                  )}

                  <button 
                    onClick={() => handleStartLesson(lesson.title)}
                    className="mt-auto bg-[#1C0E04] hover:bg-black text-[#FFF5E0] py-2 px-4 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded transition-colors"
                  >
                    <Play className="w-4 h-4" /> Indítás
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Subcomponents for Card Renderer

function CardRenderer({ card, onNext, onCorrect }: { card: any, onNext: () => void, onCorrect: () => void }) {
  const [answered, setAnswered] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSelect = (opt: string, isCorrectMatch: boolean) => {
    if (answered) return;
    setAnswered(true);
    setSelectedOpt(opt);
    setIsCorrect(isCorrectMatch);
    if(isCorrectMatch) onCorrect();
  };

  if (card.type === "intro") {
    const rawContent = card.content || "";
    // Auto bold uppercase words (4+ letters) that are not already bolded
    const autoBoldContent = rawContent.replace(/\b([A-ZÁÉÍÓÖŐÚÜŰ]{4,})\b/g, '**$1**');

    return (
      <div className="bg-[#1A0A00] p-6 rounded-xl text-center border-2 border-[#D4A017] shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex flex-col h-full min-h-[400px] justify-between relative overflow-hidden">
        <div className="relative z-10">
          {card.icon && <div className="text-[64px] mb-6 mt-4 drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] flex justify-center">{card.icon}</div>}
          <h2 className="text-[22px] font-cinzel font-bold text-white mb-6 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">{card.title}</h2>
          <div className="text-[#C8C8D8] font-lora text-[16px] leading-[1.8] text-left mx-auto markdown-body">
            <Markdown>{autoBoldContent}</Markdown>
          </div>
        </div>
        <button onClick={onNext} className="mt-8 text-[#D4A017] p-4 w-full uppercase tracking-widest text-sm transition-opacity animate-[pulse_2s_ease-in-out_infinite] text-center font-bold font-cinzel relative z-10">
          Koppints a folytatáshoz
        </button>
      </div>
    );
  }

  if (card.type === "flashcard") {
    return (
      <motion.div 
        animate={!answered ? { scale: [1, 1.02, 1] } : { scale: 1 }}
        transition={!answered ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : {}}
        className="bg-[#1A0A00] w-[85%] mx-auto rounded-xl text-center border-2 border-[#F5A623] shadow-[0_0_20px_rgba(245,162,35,0.3)] flex flex-col min-h-[400px] cursor-pointer" 
        onClick={() => !answered && setAnswered(true)}
      >
        {!answered ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-[17px] font-bold font-lora text-[#FDF3DC] mb-8 leading-[1.7]">{card.question}</div>
            <div className="text-[#F5A623]/60 animate-pulse font-cinzel uppercase text-sm mt-8 drop-shadow-md">Koppints a válaszért</div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-[15px] text-[#C8C8D8] mb-6 leading-[1.8]">{card.question}</div>
            <div className="text-[18px] font-bold font-lora text-[#D4A017] mb-8 border-t border-b border-[#5C3A10] py-6 w-full drop-shadow-sm">{card.answer}</div>
            <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="mt-auto bg-[linear-gradient(135deg,#5C0A0A,#3D0505)] hover:bg-[#3D0505] text-[#FDF3DC] p-4 w-full rounded-lg font-bold font-cinzel transition-all duration-200 border-2 border-[#D4A017] flex items-center justify-center gap-2 shadow-[0_4px_10px_rgba(0,0,0,0.5)] option-btn">
              Tovább <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </motion.div>
    );
  }

  if (card.type === "multiple_choice") {
    return (
      <div className="bg-[#1A0A00] p-6 rounded-xl border-2 border-[#D4A017] shadow-[0_10px_25px_rgba(0,0,0,0.6)] min-h-[450px] flex flex-col">
        <h2 className="text-[17px] font-bold font-lora text-[#FDF3DC] mb-6 leading-[1.7]">{card.question}</h2>
        <div className="space-y-3 flex-1">
          {card.options?.map((opt: string, i: number) => {
            const letter = String.fromCharCode(65+i);
            const isMatch = answersMatch(letter, (card.correct || card.correctAnswer)) || String((card.correct || card.correctAnswer)).toLowerCase() === String(letter).toLowerCase();
            const isSelected = selectedOpt === letter;
            
            let btnClass = "w-full p-4 flex items-center gap-4 text-[15px] font-lora border rounded-lg transition-all text-left min-h-[64px] ";
            if (!answered) {
              btnClass += "bg-[#1E1E35] border-[#3A3A55] text-[#FDF3DC] hover:border-[#F5A623] hover:bg-[#2A2A46] cursor-pointer shadow-sm";
            } else {
              if (isMatch) btnClass += "bg-[linear-gradient(135deg,#1E6B3C,#154F2B)] border-[#1E6B3C] text-white font-bold opacity-100 shadow-[0_0_15px_rgba(30,107,60,0.5)]";
              else if (isSelected) btnClass += "bg-[linear-gradient(135deg,#8B1515,#5C0A0A)] border-[#8B1515] text-white opacity-100";
              else btnClass += "bg-[#1E1E35] border-[#3A3A55] text-gray-400 opacity-40";
            }
            
            return (
              <button 
                key={i} 
                onClick={() => handleSelect(letter, isMatch)}
                disabled={answered}
                className={btnClass}
                style={{ transition: "all 0.1s ease" }}
              >
                <div className={`w-[32px] h-[32px] shrink-0 rounded-full flex items-center justify-center font-cinzel font-bold text-sm ${answered && isMatch ? 'bg-[#FDF3DC] text-[#1E6B3C]' : answered && isSelected ? 'bg-white/20 text-white' : 'bg-[#F5A623] text-[#1A0A00]'}`}>
                  {letter}
                </div>
                <span>{opt}</span>
              </button>
            )
          })}
        </div>

        <AnimatePresence>
          {answered && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }}
              className={`mt-6 p-4 rounded-lg flex flex-col gap-3 ${isCorrect ? 'bg-[linear-gradient(135deg,#1E6B3C,#154F2B)]' : 'bg-[linear-gradient(135deg,#8B1515,#5C0A0A)]'}`}
            >
              <div className="flex items-center gap-2">
                <div className="text-2xl">{isCorrect ? '✅' : '❌'}</div>
                <h3 className="font-cinzel font-bold text-white text-xl">{isCorrect ? "Helyes!" : "Helytelen!"}</h3>
                
                {/* Mini Árpád Face */}
                <div className="ml-auto text-2xl drop-shadow-md">
                   {isCorrect ? '🛡️' : '💔'}
                </div>
              </div>
              
              {!isCorrect && (
                <div className="text-[15px] font-lora font-bold text-[#F0C040]">
                  A helyes válasz: {card.options[card.correct?.charCodeAt(0) - 65] || card.options[card.correctAnswer?.charCodeAt(0) - 65]}
                </div>
              )}
              
              <p className="text-[14px] font-lora text-[#D4D0C8] leading-[1.8]">{card.explanation}</p>
              
              <button onClick={onNext} className="mt-2 bg-[#1A0A00] hover:bg-black text-[#FDF3DC] p-3 w-full rounded font-bold font-cinzel uppercase transition-colors option-btn text-sm border border-[#D4A017]/30">
                Tovább
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (card.type === "true_false") {
    return (
      <div className="bg-[#1A1A2E] p-6 rounded-lg border border-gray-700 shadow-xl min-h-[400px] flex flex-col text-center">
        <h2 className="text-2xl font-bold font-lora font-white mb-10 leading-[1.8] mx-auto my-auto">{card.statement || card.question}</h2>
        
        {!answered ? (
          <div className="flex gap-4 mt-auto pb-4">
            <button 
              onClick={() => handleSelect("Igaz", String(card.correct).toLowerCase() === "true" || String(card.correct).toLowerCase() === "igaz")}
              className="flex-1 bg-green-800 hover:bg-green-700 text-white font-bold font-cinzel py-5 rounded text-lg border border-green-600 transition-colors"
            >
              IGAZ ✓
            </button>
            <button 
              onClick={() => handleSelect("Hamis", String(card.correct).toLowerCase() === "false" || String(card.correct).toLowerCase() === "hamis")}
              className="flex-1 bg-red-800 hover:bg-red-700 text-white font-bold font-cinzel py-5 rounded text-lg border border-red-600 transition-colors"
            >
              HAMIS ✗
            </button>
          </div>
        ) : (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`mt-auto p-4 rounded border text-left ${isCorrect ? 'bg-green-900/30 border-green-500/50 text-green-200' : 'bg-red-900/30 border-red-500/50 text-red-200'}`}>
             <div className="font-bold flex items-center gap-2 mb-2 font-cinzel">
                {isCorrect ? "✅ Helyes!" : `❌ Helytelen! Helyes: ${card.correct}`}
             </div>
             <p className="text-[14px] font-lora text-[#D4D0C8] leading-[1.8]">{card.explanation}</p>
             <button onClick={onNext} className="mt-4 bg-gray-800 border border-gray-600 hover:bg-gray-700 text-white py-2 px-4 w-full rounded font-bold font-cinzel text-xs flex items-center justify-center gap-2">Tovább <ArrowRight className="w-4 h-4" /></button>
          </motion.div>
        )}
      </div>
    );
  }

  if (card.type === "fun_fact") {
    return (
      <div className="bg-[#1A1A2E] p-8 rounded-lg text-center border-2 border-yellow-600/50 bg-gradient-to-br from-[#1A1A2E] to-yellow-900/10 shadow-xl flex flex-col h-full min-h-[400px] justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>
        <div>
          <h2 className="text-2xl font-cinzel font-bold text-yellow-500 mb-8 flex items-center justify-center gap-2">
            <span className="text-3xl">{card.icon || "💡"}</span> Tudtad?
          </h2>
          <div className="text-gray-300 font-lora text-xl leading-[1.8] mx-auto italic">
            "{card.content}"
          </div>
        </div>
        <button onClick={onNext} className="mt-8 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-900/40 p-4 w-full rounded font-bold font-cinzel uppercase tracking-widest text-sm transition-colors">
          Koppints a folytatáshoz
        </button>
      </div>
    );
  }
  
  if (card.type === "matching") {
    return <MatchingCard card={card} onNext={onNext} onCorrect={onCorrect} />;
  }

  return (
      <div className="bg-[#1A1A2E] p-4 text-center rounded">
          Ismeretlen kártya: {card.type}
          <button onClick={onNext} className="mt-4 bg-gray-700 p-2 border rounded block mx-auto">Tovább</button>
      </div>
  );
}

function MatchingCard({ card, onNext, onCorrect }: { card: any, onNext: () => void, onCorrect: () => void }) {
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  
  const [shuffledDefs, setShuffledDefs] = useState<{def: string, termIdx: number}[]>([]);
  useEffect(() => {
    if (card.pairs && card.pairs.length > 0) {
      const arr = card.pairs.map((p: any, idx: number) => ({ def: p.definition, termIdx: idx }));
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      setShuffledDefs(arr);
    }
    // Also reset state in case card props change without unmounting
    setMatchedPairs([]);
    setSelectedTerm(null);
  }, [card]);

  const totalPairs = card.pairs?.length || 0;
  const isComplete = totalPairs > 0 && matchedPairs.length === totalPairs;

  const handleDefClick = (termIdxFromDef: number) => {
    if (selectedTerm === null) return;
    if (selectedTerm === termIdxFromDef) {
      setMatchedPairs(prev => [...prev, selectedTerm]);
      setSelectedTerm(null);
    } else {
      setSelectedTerm(null); // wrong match, deselect
    }
  };

  const handleTermClick = (idx: number) => {
    if (matchedPairs.includes(idx)) return;
    setSelectedTerm(prev => prev === idx ? null : idx); // Deselect if already selected
  };

  // Call onCorrect when complete, but only once!
  // Wait, the button handles onCorrect. We can just keep it on the button to ensure they get points when advancing.
  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCorrect();
    onNext();
  };

  return (
    <div className={`bg-[#1A1A2E] p-6 rounded-lg border shadow-xl min-h-[450px] flex flex-col transition-all duration-500 ${isComplete ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'border-gray-700'}`}>
      <h2 className="text-xl font-bold font-cinzel text-white mb-6 text-orange-400">Kösd össze!</h2>
      
      <div className="flex-1 flex gap-4">
        <div className="flex-1 space-y-3">
          {card.pairs?.map((p: any, idx: number) => {
             const isMatched = matchedPairs.includes(idx);
             const isSelected = selectedTerm === idx;
             let btnClass = "w-full p-4 text-sm font-lora border rounded-md transition-all h-full text-left flex items-center";
             if (isMatched) btnClass += " bg-green-900/30 border-green-600/50 text-green-200/50 opacity-30";
             else if (isSelected) btnClass += " bg-orange-900 border-orange-500 text-orange-100 shadow-[0_0_10px_rgba(249,115,22,0.5)]";
             else btnClass += " bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500 cursor-pointer";
             
             return (
               <div 
                 key={idx} 
                 onClick={() => handleTermClick(idx)}
                 className={btnClass}
               >
                 {p.term}
               </div>
             );
          })}
        </div>

        <div className="flex-1 space-y-3">
           {shuffledDefs.map((col, idx) => {
             const isMatched = matchedPairs.includes(col.termIdx);
             let btnClass = "w-full p-4 text-xs sm:text-sm font-lora border rounded-md transition-all h-full text-left flex items-center";
             if (isMatched) btnClass += " bg-green-900/30 border-green-600/50 text-green-200/50 opacity-30 !border-dashed";
             else if (selectedTerm !== null) btnClass += " bg-gray-800 border-gray-500 text-gray-200 cursor-pointer hover:bg-gray-700 shadow-md";
             else btnClass += " bg-gray-800 border-gray-700 text-gray-300 cursor-not-allowed";

             return (
               <div
                 key={idx}
                 onClick={() => !isMatched && handleDefClick(col.termIdx)}
                 className={btnClass}
               >
                 {col.def}
               </div>
             );
           })}
        </div>
      </div>

      {isComplete ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="mt-8 flex flex-col gap-4"
        >
          <div className="bg-green-900/40 p-3 rounded-lg border border-green-500/50 flex items-center justify-center gap-3 w-full">
            <span className="text-2xl">🛡️</span>
            <span className="text-green-300 font-bold font-lora italic">"Minden párt megtaláltál, vitéz!"</span>
          </div>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleNext(e); }} className="bg-green-700 hover:bg-green-600 text-white p-4 w-full rounded font-bold font-cinzel text-sm uppercase transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.4)]">
            Kiváló! Tovább <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      ) : (
        <div className="mt-6 text-center text-gray-500 text-xs font-lora">
          Koppints egy fogalomra a bal oldalon, majd a hozzá tartozó definícióra jobb oldalon.
        </div>
      )}
    </div>
  );
}
