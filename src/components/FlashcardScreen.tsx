import React, { useState, useEffect } from "react";
import { Play, ArrowLeft, ArrowRight, Loader2, RotateCcw } from "lucide-react";
import { Grade, Flashcard } from "../types";
import { TopicSelector } from "./TopicSelector";

interface FlashcardScreenProps {
  onGoHome: () => void;
}

type FlashcardPhase = "settings" | "loading" | "active" | "summary";

export default function FlashcardScreen({ onGoHome }: FlashcardScreenProps) {
  const [phase, setPhase] = useState<FlashcardPhase>("settings");
  const [grade, setGrade] = useState<string>("⚱️ Őskor és ókori Kelet");
  const [topic, setTopic] = useState<string>("Az őskor korszakai és jellemzői");
  const [count, setCount] = useState<number>(10);
  
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFading, setIsFading] = useState(false);
  
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCards, setUnknownCards] = useState<Flashcard[]>([]);

  const generateFlashcards = async (retryCards?: Flashcard[]) => {
    if (retryCards) {
      setCards(retryCards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsFading(false);
      setKnownCount(0);
      setUnknownCards([]);
      setPhase("active");
      return;
    }

    setPhase("loading");
    try {
      const prompt = `Generate ${count} flashcards. Format: {"flashcards":[{"front":"Fogalom vagy kérdés","back":"Részletes magyarázat"}]} Topic: ${grade}, ${topic}. Keep it historically accurate and in Hungarian.`;
      
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      
      const rawText = await response.text();
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (e) {
        throw new Error("Érvénytelen válasz a szervertől (nem JSON).");
      }
      
      let text = data.text || data.response || data.content || JSON.stringify(data);
      if (typeof text !== "string") {
         text = JSON.stringify(text);
      }
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.flashcards && parsed.flashcards.length > 0) {
             setCards(parsed.flashcards);
          } else {
             throw new Error("Üres flashcards lista.");
          }
        } else {
             throw new Error("Nem található JSON minta.");
        }
      } catch (e) {
        console.warn("Could not parse flashcards, using mock.");
        setCards(Array(count).fill(null).map((_, i) => ({
          front: `Minta fogalom ${i + 1} (${topic})`,
          back: `Ez a kártya leírása. Győződj meg róla, hogy a Gemini API megkapta a kért adatokat.`
        })));
      }
      
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsFading(false);
      setKnownCount(0);
      setUnknownCards([]);
      setPhase("active");
    } catch (err) {
      console.error(err);
      setCards(Array(count).fill(null).map((_, i) => ({
        front: `Hibás betöltés (${grade})`,
        back: `Az API generálás sikertelen volt. Kérlek indítsd újra a folyamatot vagy próbáld később.`
      })));
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsFading(false);
      setKnownCount(0);
      setUnknownCards([]);
      setPhase("active");
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      setIsFading(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
      setIsFading(false);
    }
  };

  const markKnown = () => {
    setKnownCount(prev => prev + 1);
    if (currentIndex < cards.length - 1) {
      handleNext();
    } else {
      setPhase("summary");
    }
  };

  const markUnknown = () => {
    setUnknownCards(prev => {
      if (prev.some(c => c.front === cards[currentIndex].front)) return prev;
      return [...prev, cards[currentIndex]];
    });
    if (currentIndex < cards.length - 1) {
      handleNext();
    } else {
      setPhase("summary");
    }
  };

  const handleFlipClick = () => {
    if (isFading) return;
    setIsFading(true);
    setTimeout(() => {
      setIsFlipped(prev => !prev);
      setIsFading(false);
    }, 150);
  };

  const handleRestartSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFading(false);
    setKnownCount(0);
    setUnknownCards([]);
    setPhase("active");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 1. Settings screen */}
      {phase === "settings" && (
        <div className="medieval-card p-6 sm:p-8">
          {/* Back button link to main dashboard/home */}
          <div className="mb-4">
            <button 
              onClick={onGoHome}
              className="text-[#F7EAC8] hover:text-[#B8860B] transition-colors font-cinzel text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              ← Vissza a főoldalra
            </button>
          </div>

          <div className="text-center mb-6 border-b-2 border-[#B8860B]/40 pb-4">
            <h2 className="text-2xl font-cinzel font-bold text-[#6B1010] uppercase">Villámkártyák</h2>
            <p className="text-sm font-lora text-[#1C0E04]/70 mt-2">Gyakorold a történelmi fogalmakat!</p>
          </div>
          
          <div className="space-y-5">
            <TopicSelector selectedTopic={topic} onTopicChange={setTopic} onGradeChange={setGrade} />

            <div className="space-y-1.5">
              <label className="text-xs font-cinzel font-bold uppercase tracking-wider text-[#1C0E04] block">
                Kártyák száma
              </label>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCount(n)}
                    className={`flex-1 py-2 text-sm font-cinzel font-bold rounded-[2px] transition-colors cursor-pointer ${
                      count === n ? "bg-[#6B1010] text-[#F7EAC8] border-2 border-[#B8860B]" : "bg-[#FFF5D0] text-[#1C0E04] border border-[#B8860B]/50 hover:bg-[#F0E6BD]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => generateFlashcards()}
              className="w-full py-3 mt-4 bg-[#6B1010] hover:bg-[#801515] text-[#F7EAC8] rounded-[3px] border-1.5 border-[#B8860B] text-sm font-cinzel font-bold uppercase tracking-widest flex justify-center items-center gap-2 transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> Kártyák generálása
            </button>
          </div>
        </div>
      )}

      {/* 2. Loading state */}
      {phase === "loading" && (
        <div className="text-center py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-[#B8860B] animate-spin mb-6" />
          <div className="bg-[#FFF5D0] border-2 border-[#B8860B] p-5 rounded-[4px] relative max-w-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            <p className="text-sm font-cinzel font-bold text-[#6B1010] text-center tracking-wider leading-relaxed">
              Árpád lovag: „Kártyák készítése...”
            </p>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#FFF5D0] border-r-2 border-b-2 border-[#B8860B] rotate-45"></div>
          </div>
        </div>
      )}

      {/* 3. Active session state */}
      {phase === "active" && cards.length > 0 && (
        <div className="flex flex-col items-center">
          
          {/* Header row with "← Vissza" on left and "N / TOTAL" centered */}
          <div className="w-full grid grid-cols-3 items-center mb-6">
            <button 
              onClick={() => setPhase("settings")} 
              className="text-[#F7EAC8] hover:text-[#B8860B] transition-colors font-cinzel text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer justify-self-start"
            >
              ← Vissza
            </button>
            
            <div className="font-cinzel font-bold text-[#F7EAC8] text-base uppercase tracking-widest text-center justify-self-center whitespace-nowrap">
              {currentIndex + 1} / {cards.length}
            </div>
            
            <div className="justify-self-end w-12"></div>
          </div>

          {/* Flashcard container */}
          <div 
            onClick={handleFlipClick}
            className={`w-full max-w-[500px] h-[320px] mx-auto border-2 border-[#B8860B] rounded-[4px] shadow-[0_8px_30px_rgba(0,0,0,0.4)] cursor-pointer select-none transition-all duration-300 ${
              isFlipped ? "bg-[#F0DCAA]" : "bg-[#F7EAC8]"
            } ${isFading ? "opacity-0" : "opacity-100"} transition-opacity duration-150 ease-in-out`}
          >
            {!isFlipped ? (
              // Front side content
              <div className="flex flex-col justify-between items-center h-full py-6 px-6 text-center">
                {/* Label at top */}
                <span className="font-cinzel text-[11px] font-bold uppercase tracking-widest text-[#B8860B]">
                  FOGALOM
                </span>
                
                {/* Center text */}
                <div className="flex-1 flex items-center justify-center py-4">
                  <h3 className="text-xl sm:text-2xl font-cinzel font-bold text-[#1C0E04] leading-snug">
                    {cards[currentIndex].front}
                  </h3>
                </div>
                
                {/* Hint at bottom */}
                <span className="font-lora text-xs text-[#1C0E04]/60 italic">
                  Kattints a kártyára a válaszhoz
                </span>
              </div>
            ) : (
              // Back side content
              <div className="flex flex-col justify-between items-center h-full py-6 px-6 text-center">
                {/* Label at top */}
                <span className="font-cinzel text-[11px] font-bold uppercase tracking-widest text-[#6B1010]">
                  VÁLASZ
                </span>
                
                {/* Center explanation text */}
                <div className="flex-1 flex items-center justify-center py-4 overflow-y-auto max-h-[190px] px-2">
                  <p className="text-sm sm:text-base font-lora italic text-[#1C0E04] leading-relaxed">
                    {cards[currentIndex].back}
                  </p>
                </div>
                
                {/* Spacer block to balance the layout perfectly */}
                <div className="h-4"></div>
              </div>
            )}
          </div>

          {/* Navigation & Tudtam / Nem tudtam buttons below the card */}
          <div className="w-full max-w-[500px] flex flex-col items-center mt-6">
            
            {/* 1. Score actions - only visible when card is flipped */}
            {isFlipped && (
              <div className="flex gap-4 mb-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markUnknown();
                  }}
                  className="px-6 py-2.5 bg-[#8B1A1A] hover:bg-[#6B1010] text-[#F7EAC8] font-cinzel font-bold text-xs uppercase tracking-widest rounded-[3px] border border-red-500/40 shadow-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  ✗ Nem tudtam
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markKnown();
                  }}
                  className="px-6 py-2.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-[#F7EAC8] font-cinzel font-bold text-xs uppercase tracking-widest rounded-[3px] border border-green-500/40 shadow-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  ✓ Tudtam
                </button>
              </div>
            )}

            {/* 2. Navigation bar: Previous and Next arrow buttons */}
            <div className="flex items-center justify-between w-full mt-2">
              <button
                disabled={currentIndex === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="px-4 py-2 bg-black/40 hover:bg-black/60 text-[#F7EAC8] rounded-[3px] border border-[#B8860B]/50 text-xs font-cinzel font-bold uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                ← Előző
              </button>
              
              <button
                disabled={currentIndex === cards.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="px-4 py-2 bg-black/40 hover:bg-black/60 text-[#F7EAC8] rounded-[3px] border border-[#B8860B]/50 text-xs font-cinzel font-bold uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Következő →
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4. Summary / End Screen */}
      {phase === "summary" && (
        <div className="medieval-card p-6 sm:p-10 text-center">
          <h2 className="text-2xl font-cinzel font-bold text-[#6B1010] uppercase mb-4">Értékelés</h2>
          
          <p className="text-lg font-cinzel font-bold text-[#1C0E04] mb-4">
            Tudtam: <span className="text-green-800">{knownCount}</span> / {cards.length}
          </p>

          {/* Progress bar visual */}
          <div className="w-full bg-[#1A0A03]/20 h-4 rounded-full overflow-hidden border border-[#B8860B]/55 mb-8">
            <div 
              className="bg-green-700 h-full rounded-full transition-all duration-700" 
              style={{ width: `${Math.round((knownCount / cards.length) * 100)}%` }}
            ></div>
          </div>

          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            {/* Show retry of wrong cards if any */}
            {unknownCards.length > 0 && (
              <button
                onClick={() => generateFlashcards(unknownCards)}
                className="w-full py-3 bg-[#6B1010] hover:bg-[#801515] text-[#F7EAC8] rounded-[3px] border border-[#B8860B] font-cinzel font-bold uppercase tracking-widest flex justify-center items-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4.5 h-4.5" /> Ismeretlenek ismétlése ({unknownCards.length})
              </button>
            )}
            
            <button
              onClick={handleRestartSession}
              className="w-full py-3 bg-[#B8860B]/10 hover:bg-[#6B1010]/10 text-[#6B1010] border border-[#B8860B] rounded-[3px] font-cinzel font-bold uppercase tracking-widest transition-colors cursor-pointer"
            >
              Újra
            </button>

            <button
              onClick={() => setPhase("settings")}
              className="w-full py-3 bg-[#1A0A03] hover:bg-[#2A1005] text-[#B8860B] rounded-[3px] border border-[#B8860B] font-cinzel font-bold uppercase tracking-widest transition-colors cursor-pointer"
            >
              Vissza
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
