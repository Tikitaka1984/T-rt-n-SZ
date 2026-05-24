import React, { useState, useEffect, useRef } from "react";
import { Clock, HelpCircle, Lightbulb, ArrowRight, AlertTriangle, Check, X, ShieldAlert, FileText, ArrowRightCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { QuizQuestion, QuestionType } from "../types";
import { triggerMascotAct } from "./KnightMascot";
import { answersMatch } from "../utils/answerMatch";

interface QuizScreenProps {
  questions: QuizQuestion[];
  onQuizFinished: (answers: Record<string, string>, elapsedTimes: Record<string, number>) => void;
  onAbort: () => void;
  grade: string;
  topic: string;
}

export default function QuizScreen({ questions, onQuizFinished, onAbort, grade, topic }: QuizScreenProps) {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIdx];

  const [timeLeft, setTimeLeft] = useState<number>(90); // 90 seconds per question
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [essayText, setEssayText] = useState<string>("");
  const [showHint, setShowHint] = useState<boolean>(false);

  // Stats / tracking
  const answersRef = useRef<Record<string, string>>({});
  const elapsedTimesRef = useRef<Record<string, number>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset timer and answer states for each new question
  useEffect(() => {
    setTimeLeft(90);
    setIsAnswered(false);
    setSelectedAnswer("");
    setShowHint(false);

    // If it was already essay, preserve text helper but start empty for new essay question
    if (questions[currentIdx]?.type === "essay") {
      setEssayText("");
    }

    // Start countdown timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Auto-timeout current question
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIdx]);

  // Handle when timer hits 0
  const handleTimeOut = () => {
    setIsAnswered(true);
    // Track timing
    elapsedTimesRef.current[currentQuestion.id] = 90;
    
    if (currentQuestion.type === "essay") {
      answersRef.current[currentQuestion.id] = essayText.trim() || "[Nem érkezett válasz az időkereten belül]";
    } else {
      answersRef.current[currentQuestion.id] = ""; // empty string denotes incorrect / unanswered
    }
  };

  // User submits key response during quiz
  const handleAnswerClick = (optionKey: string) => {
    if (isAnswered) return; // locked

    clearInterval(timerRef.current!);
    setIsAnswered(true);
    setSelectedAnswer(optionKey);

    // Record response
    answersRef.current[currentQuestion.id] = optionKey;
    elapsedTimesRef.current[currentQuestion.id] = 90 - timeLeft;

    if (answersMatch(optionKey, currentQuestion.correctAnswer) || 
        String(optionKey).toLowerCase() === String(currentQuestion.correctAnswer).toLowerCase()) {
       triggerMascotAct('correct');
    } else {
       triggerMascotAct('wrong');
    }
  };

  // Essay lock/save helper
  const handleSaveEssay = () => {
    if (isAnswered) return;

    clearInterval(timerRef.current!);
    setIsAnswered(true);

    answersRef.current[currentQuestion.id] = essayText.trim() || "[Üresen hagyott esszé]";
    elapsedTimesRef.current[currentQuestion.id] = 90 - timeLeft;
    
    // Suggest thinking or excited since they wrote an essay
    triggerMascotAct('fact', 'A krónikád rögzítve! Az ítélet hamarosan megszületik.');
  };

  // Navigates further
  const handleNextQuestion = () => {
    if (currentIdx + 1 < totalQuestions) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Finished all!
      onQuizFinished(answersRef.current, elapsedTimesRef.current);
    }
  };

  // Progress helpers
  const progressPercent = Math.round(((currentIdx) / totalQuestions) * 100);
  const activePercent = Math.round(((currentIdx + 1) / totalQuestions) * 100);

  // Timer colors & styling (Medieval Theme)
  let timerColorClass = "text-[#1C0E04] bg-[#FFF5D0] border-[#B8860B]";
  let shouldPulse = false;

  if (timeLeft < 30) {
    timerColorClass = "text-[#FFF5E0] bg-[#6B1010] border-[#B8860B] timer-pulse-glow";
    shouldPulse = true;
  } else if (timeLeft < 60) {
    timerColorClass = "text-[#1C0E04] bg-[#E8CB88] border-[#B8860B]/80";
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6" id="quiz-container">
      {/* Quiz Top Action Rail */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-[11px] font-bold text-[#F0C040]/85 font-cinzel tracking-widest block uppercase leading-none mb-1">
            {grade} • {topic}
          </span>
          <span className="text-xl sm:text-2xl font-bold uppercase tracking-widest text-[#FDF3DC] font-cinzel">
            {currentIdx + 1} <span className="text-[#F0C040]/70 text-sm">/ {totalQuestions}</span>
          </span>
        </div>

        <button
          onClick={onAbort}
          className="text-[11px] font-bold font-cinzel uppercase tracking-widest text-red-300 hover:text-red-200 hover:bg-[#6B1010]/30 px-3 py-1.5 border border-red-500/40 transition-all cursor-pointer rounded-lg"
        >
          Kilépés
        </button>
      </div>

      {/* Progress Bar Container - Full width thin bar at the very top */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#1A0A00] h-[6px] w-full border-b border-[#D4A017]/30">
        <div
          className="bg-[linear-gradient(90deg,#F5A623,#F0C040)] h-full transition-all duration-300 shadow-[0_0_8px_rgba(245,166,35,0.8)]"
          style={{ width: `${activePercent}%` }}
        />
      </div>

      {/* TIMER - Circular Top Right */}
      <div className="absolute top-20 right-4 sm:top-24 sm:right-8 w-14 h-14 rounded-full border-2 border-[#D4A017] flex items-center justify-center bg-[#1A0A00] shadow-[0_4px_10px_rgba(0,0,0,0.5)] z-40" id="quiz-countdown-timer">
         <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
           <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(212,160,23,0.2)" strokeWidth="6" />
           <circle cx="50" cy="50" r="46" fill="none" stroke={timeLeft <= 10 ? "#8B1515" : "#D4A017"} strokeWidth="6" strokeLinecap="round" strokeDasharray="289.026" strokeDashoffset={289.026 - (289.026 * (timeLeft / 90))} className="transition-all duration-1000 linear" />
         </svg>
         <span className={`font-cinzel font-bold text-sm z-10 ${timeLeft <= 10 ? "text-[#8B1515] animate-pulse" : "text-[#FDF3DC]"}`}>{timeLeft}</span>
      </div>

      {/* Quiz Question Box */}
      <div className="bg-[#1A0A00] p-6 sm:p-8 relative mt-6 border border-[#D4A017] rounded-xl shadow-lg" id="quiz-question-card">
        
        {/* Question Type Badge */}
        <div className="mb-6 pb-4 border-b border-[#D4A017]/20">
          <span className="text-[11px] uppercase tracking-wider font-bold font-cinzel text-[#FDF3DC] bg-[#5C0A0A] border border-[#D4A017]/50 px-3 py-1.5 inline-flex items-center gap-1.5 rounded-sm">
            {currentQuestion.type === "multiple_choice" ? "FELELETVÁLASZTÓ" : currentQuestion.type === "true_false" ? "IGAZ VAGY HAMIS" : "ESSZÉ"}
          </span>
        </div>

        {/* Question sentence - mobile responsive text size */}
        <h3 className="text-[18px] sm:text-xl font-serif font-bold text-[#FDF3DC] mb-8 leading-[1.7] font-lora" id="quiz-question-text">
          {currentQuestion.question}
        </h3>

        {/* INTERACTIVE INPUT ZONE */}
        <div className="mt-6 mb-8" id="quiz-interactive-input-zone">
          <AnimatePresence mode="wait">
            {/* MULTIPLE CHOICE TYPE */}
            {currentQuestion.type === "multiple_choice" && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option, idx) => {
                  const letter = ["A", "B", "C", "D"][idx];
                  
                  const isThisSelected = selectedAnswer === letter;
                  const isThisCorrect = answersMatch(letter, currentQuestion.correctAnswer);
                  
                  let optStyle = "border-[#D4A017]/40 hover:border-[#D4A017] hover:bg-[#F0E8D0]/10 text-[#F0E8D0] bg-[#1A0A00]/50";
                  let badgeStyle = "bg-[#5C0A0A] text-[#FDF3DC] font-cinzel font-bold";
                  let iconElement = null;

                  if (isAnswered) {
                    if (isThisCorrect) {
                      optStyle = "border-[#1E6B3C] bg-[#1E6B3C]/30 text-white shadow-sm";
                      badgeStyle = "bg-[#1E6B3C] text-white font-cinzel font-bold border-[#1E6B3C]";
                      iconElement = <Check className="w-5 h-5 text-[#1E6B3C] shrink-0 ml-auto" />;
                    } else if (isThisSelected) {
                      optStyle = "border-[#8B1515] bg-[#8B1515]/30 text-white shadow-sm";
                      badgeStyle = "bg-[#8B1515] text-white font-cinzel font-bold border-[#8B1515]";
                      iconElement = <X className="w-5 h-5 text-[#FF6B6B] shrink-0 ml-auto" />;
                    } else {
                      optStyle = "border-[#D4A017]/20 opacity-40 text-[#F0E8D0]/60 bg-transparent";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerClick(letter)}
                      disabled={isAnswered}
                      className={`w-full p-4 flex items-center text-left transition-all duration-200 cursor-pointer border-2 option-btn min-h-[64px] ${
                        isAnswered ? "cursor-default" : "active:bg-[#F0D898]"
                      } ${optStyle}`}
                    >
                      <span className={`w-[32px] h-[32px] rounded-full flex items-center justify-center text-xs shrink-0 mr-4 shadow-sm border border-[#D4A017]/30 ${badgeStyle}`}>
                        {letter}
                      </span>
                      <span className="pr-4 font-lora text-[15px] leading-snug break-words">{option}</span>
                      {iconElement}
                    </button>
                  );
                })}
              </div>
            )}

            {/* TRUE / FALSE TYPE */}
            {currentQuestion.type === "true_false" && (
              <div className="grid grid-cols-2 gap-4">
                {["Igaz", "Hamis"].map((optionValue) => {
                  const isThisSelected = selectedAnswer === optionValue;
                  const isThisCorrect = String(optionValue).toLowerCase() === String(currentQuestion.correctAnswer).toLowerCase();

                  let optStyle = "border-[#D4A017]/40 hover:border-[#D4A017] hover:bg-[#F0E8D0]/10 text-[#F0E8D0] bg-[#1A0A00]/50 rounded-[3px]";
                  let iconElement = null;

                  if (isAnswered) {
                    if (isThisCorrect) {
                      optStyle = "border-[#1E6B3C] bg-[#1E6B3C]/30 text-white";
                      iconElement = <Check className="w-5 h-5 text-[#1E6B3C] block mt-1" />;
                    } else if (isThisSelected) {
                      optStyle = "border-[#8B1515] bg-[#8B1515]/30 text-white";
                      iconElement = <X className="w-5 h-5 text-[#FF6B6B] block mt-1" />;
                    } else {
                      optStyle = "border-[#D4A017]/20 opacity-40 text-[#F0E8D0]/60 bg-transparent";
                    }
                  }

                  return (
                    <button
                      key={optionValue}
                      onClick={() => handleAnswerClick(optionValue)}
                      disabled={isAnswered}
                      className={`p-6 border flex flex-col items-center justify-center font-bold text-base transition-colors cursor-pointer option-btn ${
                        isAnswered ? "cursor-default" : "active:bg-[#FFFCE1]"
                      } ${optStyle}`}
                    >
                      <span className="font-cinzel text-lg">{optionValue}</span>
                      {iconElement}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ESSAY TYPE */}
            {currentQuestion.type === "essay" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold font-cinzel uppercase tracking-wider text-[#F0E8D0]/75 block mb-2" htmlFor="essay-input">
                    Fogalmazd meg a krónikás válaszod (minimum 1 kerek mondat):
                  </label>
                  <textarea
                    id="essay-input"
                    value={essayText}
                    onChange={(e) => setEssayText(e.target.value)}
                    disabled={isAnswered}
                    rows={5}
                    placeholder="Fejtsd ki a történelmi ismereteidet, utalva a legfőbb szereplőkre, dátumokra, ok-okozati összefüggésekre..."
                    className="w-full p-4 rounded-[3px] border-2 border-[#D4A017]/50 bg-[#1A0A00]/80 text-[#F0E8D0] text-[15px] focus:border-[#D4A017] focus:outline-none transition-colors disabled:opacity-70 font-lora placeholder:text-[#F0E8D0]/30"
                  />
                </div>

                <div className="flex justify-between items-center select-none">
                  <span className="text-[11px] font-bold text-[#D4A017] font-cinzel">
                    KARAKTERSZÁM: <strong className="font-bold text-[#F0E8D0]">{essayText.trim().length}</strong>
                  </span>
                  
                  {!isAnswered ? (
                    <button
                      onClick={handleSaveEssay}
                      disabled={essayText.trim().length < 5}
                      className="px-5 py-2.5 bg-[#6B1010] hover:bg-[#801515] disabled:bg-black/20 disabled:border-[#D4A017]/20 disabled:text-[#F0E8D0]/30 text-[#FFF5E0] text-[13px] font-cinzel font-bold uppercase tracking-wider rounded-[3px] border border-[#D4A017] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-none"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Krónika rögzítése</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#1E6B3C] bg-[#1E6B3C]/10 border border-[#1E6B3C] px-3 py-1.5 rounded-none flex items-center gap-1 font-cinzel">
                      <Check className="w-3.5 h-3.5 text-[#1E6B3C]" />
                      <span>Krónika elmentve</span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* HINT TOOL BUTTON */}
        <div className="border-t-2 border-[#B8860B]/20 pt-5 mt-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-[11px] font-bold uppercase tracking-widest text-[#FFF5D0] hover:text-white flex items-center gap-1.5 px-3 py-1.5 border-1.5 border-[#B8860B] bg-[#9A6F0A] hover:bg-[#B3830E] rounded-[3px] cursor-pointer transition-colors font-cinzel"
              id="hint-toggle-btn"
            >
              <Lightbulb className="w-3.5 h-3.5 text-[#FFF5E0]" />
              <span>{showHint ? "Súgó elrejtése" : "Segítség kérése (Krónikás Súgó)"}</span>
            </button>
          </div>

          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-[#1A0A00] border border-[#D4A017]/50 text-[#F0E8D0] text-xs sm:text-sm p-4 rounded-[3px] leading-[1.8] italic font-lora"
                id="hint-expanded-box"
              >
                <div className="flex gap-2.5">
                  <HelpCircle className="w-4 h-4 text-[#D4A017] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-cinzel font-bold block mb-1 text-[#D4A017]">Kodifikált útjelzés:</span>
                    <p className="text-[#F0E8D0] font-lora">{currentQuestion.hint}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FEEDBACK EXPLANATION DISPLAY */}
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-5 sm:p-6 bg-[#D4A017]/10 rounded-[3px] border border-[#D4A017]/40"
            id="immediate-explanation-box"
          >
            {/* Show Correct or Wrong alert */}
            {currentQuestion.type !== "essay" && (
              <div className="flex items-center gap-2 mb-3.5">
                {selectedAnswer === "" ? (
                  <div className="text-[#8B1A1A] text-[11px] font-bold font-cinzel uppercase tracking-widest bg-[#8B1A1A]/10 border border-[#8B1A1A] px-3 py-1.5 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-[#8B1A1A]" />
                    <span>Az idő homokszeme leperegve!</span>
                  </div>
                ) : (answersMatch(selectedAnswer, currentQuestion.correctAnswer) || String(selectedAnswer).toLowerCase() === String(currentQuestion.correctAnswer).toLowerCase()) ? (
                  <div className="text-[#2D6A4F] text-[11px] font-bold font-cinzel uppercase tracking-widest bg-[#2D6A4F]/20 border border-[#2D6A4F] px-3 py-1.5 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-[#2D6A4F]" />
                    <span>Hiteles válasz!</span>
                  </div>
                ) : (
                  <div className="text-[#FF6B6B] text-[11px] font-bold font-cinzel uppercase tracking-widest bg-[#FF6B6B]/10 border border-[#FF6B6B] px-3 py-1.5 flex items-center gap-1.5">
                    <X className="w-4 h-4 text-[#FF6B6B]" />
                    <span>Téves! (A helyes krónika: {currentQuestion.correctAnswer})</span>
                  </div>
                )}
              </div>
            )}

            {currentQuestion.type === "essay" && (
              <div className="flex items-center gap-1.5 text-[#D4A017] font-bold font-cinzel uppercase tracking-wider text-[11px] bg-[#1A0A00]/40 border border-[#D4A017]/50 px-2.5 py-1.5 mb-3 mr-auto w-fit">
                <FileText className="w-3.5 h-3.5 text-[#D4A017]" />
                <span>Tanító krónikás tanácsa az esszédhez</span>
              </div>
            )}

            <h4 className="text-[11px] font-bold text-[#D4A017] tracking-widest uppercase mb-1.5 font-cinzel">Részletes krónikás magyarázat:</h4>
            <p className="text-[15px] sm:text-[16px] text-[#F0E8D0] leading-[1.8] font-lora italic mb-5">
              {currentQuestion.explanation}
            </p>

            <button
              onClick={handleNextQuestion}
              className="w-full sm:w-auto ml-auto mt-4 px-6 py-4 bg-[#6B1010] hover:bg-[#801515] text-[#FFF5E0] border-1.5 border-[#B8860B] font-bold uppercase font-cinzel tracking-[0.15em] rounded-[3px] text-[11px] flex items-center justify-center gap-2 transition-colors cursor-pointer group shadow-none"
              id="next-question-btn"
            >
              <span>{currentIdx + 1 === totalQuestions ? "Krónika befejezése" : "Következő feladat"}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-[#B8860B]" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
