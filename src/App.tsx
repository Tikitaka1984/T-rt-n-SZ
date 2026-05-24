import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import HomeScreen from "./components/HomeScreen";
import SettingsScreen from "./components/SettingsScreen";
import QuizScreen from "./components/QuizScreen";
import ResultsScreen from "./components/ResultsScreen";
import { answersMatch } from "./utils/answerMatch";
import StatsScreen from "./components/StatsScreen";
import LeaderboardScreen from "./components/LeaderboardScreen";
import FlashcardScreen from "./components/FlashcardScreen";
import GlossaryScreen from "./components/GlossaryScreen";
import WeakPointsScreen from "./components/WeakPointsScreen";
import TimelineScreen from "./components/TimelineScreen";
import PairQuizScreen from "./components/PairQuizScreen";
import ChronologyScreen from "./components/ChronologyScreen";
import RoleplayScreen from "./components/RoleplayScreen";
import LessonScreen from "./components/LessonScreen";
import QuestionBankScreen from "./components/QuestionBankScreen";
import KnightMascot, { triggerMascotAct } from "./components/KnightMascot";

import { motion } from "motion/react";
import {
  Grade,
  QuestionTypeSetting,
  Difficulty,
  QuizQuestion,
  QuizResult,
  GlobalStats
} from "./types";

import {
  loadResults,
  saveQuizResult,
  calculateGlobalStats,
  resetAllStats,
  getHungarianGradeLabel
} from "./utils/stats";

import { calculateQuizXp, saveXpAndStreak, getXpAndStreakState } from "./utils/xp";
import { checkAndAwardBadges, saveLeaderboardEntry } from "./utils/badges";
import { addWeakPoints } from "./utils/weakPoints";

import { AlertCircle, HelpCircle, Loader2, Sparkles, Trophy } from "lucide-react";

// Educational historical facts to show during real-time loading delays
const HISTORICAL_FACTS = [
  "A déli harangszó az 1456-os nándorfehérvári dicső magyar diadal emlékét hirdeti világszerte.",
  "Úgy tartják, a pozsonyi csatában (907) Árpád vezér seregei végleg megszilárdították a honfoglalást a nyugati támadókkal szemben.",
  "Az 1222-es Aranybulla a magyar rendi alkotmányfejlődés alappillérévé vált II. András uralkodása alatt.",
  "A márciusi ifjak 1848. március 15-én sajtószabadságot követeltek és cenzúra nélkül nyomtatták ki a 12 pontot és a Nemzeti dalt.",
  "Nagy Imre az 1956-os forradalom mártír miniszterelnöke, aki a semlegességet és Magyarország függetlenségét hirdette.",
  "Szent István királyunkat 1000 karácsonyán koronázták meg, amellyel csatlakozott a keresztény európai államok közösségéhez.",
  "Hunyadi Mátyás igazságos királyként híresült el, s felállította az adóztatásra épülő fegyelmezett Fekete Sereget."
];

export default function App() {
  const [screen, setScreen] = useState<"home" | "settings" | "quiz" | "results" | "stats" | "leaderboard" | "flashcards" | "glossary" | "weak_points" | "timeline" | "pair_quiz" | "chronology" | "roleplay" | "question_bank" | "lessons">("home");
  const [isQuizActive, setIsQuizActive] = useState<boolean>(false);

  useEffect(() => {
    if (screen !== "stats") {
       triggerMascotAct("fact", "", { outfit: "knight" });
    }
  }, [screen]);

  // Settings
  const [selectedGrade, setSelectedGrade] = useState<Grade>("9. évfolyam");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("Közepes");
  const [selectedType, setSelectedType] = useState<QuestionTypeSetting>("Vegyes");
  const [selectedCount, setSelectedCount] = useState<number>(5);
  const [currentPlayerName, setCurrentPlayerName] = useState<string>("Névtelen");
  const [wasFromDocument, setWasFromDocument] = useState<boolean>(false);

  // Active Quiz State
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [elapsedTimes, setElapsedTimes] = useState<Record<string, number>>({});

  // Performance Log State
  const [recentResults, setRecentResults] = useState<QuizResult[]>([]);
  const [currentResult, setCurrentResult] = useState<QuizResult | null>(null);

  // XP & Streak State for Current Quiz
  const [xpResult, setXpResult] = useState<any>(null);
  const [weakPointsAdded, setWeakPointsAdded] = useState<number>(0);

  // Loading / Error
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [funnyFactIdx, setFunnyFactIdx] = useState<number>(0);

  // Load stats from localStorage upon startup
  useEffect(() => {
    setRecentResults(loadResults());
  }, []);

  // Cycle through historical facts while loading to improve user patience
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setFunnyFactIdx((prev) => (prev + 1) % HISTORICAL_FACTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [loading]);

  const globalStats = calculateGlobalStats(recentResults);

  // Trigger Quiz generation API
  const handleStartQuizSelection = async (settings: {
    grade: Grade;
    topic: string;
    difficulty: Difficulty;
    questionType: QuestionTypeSetting;
    count: number;
    documentText?: string;
    playerName: string;
  }) => {
    setSelectedGrade(settings.grade);
    setSelectedTopic(settings.topic);
    setSelectedDifficulty(settings.difficulty);
    setSelectedType(settings.questionType);
    setSelectedCount(settings.count);
    setCurrentPlayerName(settings.playerName);
    setWasFromDocument(!!settings.documentText);

    setLoading(true);
    setError(null);
    setFunnyFactIdx(Math.floor(Math.random() * HISTORICAL_FACTS.length));

    try {
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: settings.grade,
          topic: settings.topic,
          difficulty: settings.difficulty,
          type: settings.questionType,
          count: settings.count,
          documentText: settings.documentText
        })
      });

      if (!response.ok) {
        throw new Error("A szerverrel való kapcsolat megszakadt.");
      }

      const rawText = await response.text();
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (e) {
        throw new Error("Érvénytelen válasz a szervertől (nem JSON).");
      }
      
      if (!data.questions || data.questions.length === 0) {
        throw new Error("Nem sikerült kérdéseket generálni. Próbáld újra!");
      }

      setQuestions(data.questions);
      setAnswers({});
      setElapsedTimes({});
      setIsQuizActive(true);
      setScreen("quiz");
    } catch (err: any) {
      console.error("Quiz creation failure:", err);
      setError(err?.message || "Váratlan hiba történt a kvíz összeállítása közben.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartReviewQuiz = async (weakPoints: any[]) => {
    setLoading(true);
    setError(null);
    setFunnyFactIdx(Math.floor(Math.random() * HISTORICAL_FACTS.length));

    try {
      const summaryList = weakPoints.map(wp => `- ${wp.question} (Téma: ${wp.topic})`).join("\\n");
      const prompt = `Generálj gyakorló kérdéseket ezekhez a témákhoz amelyeket a diák elrontott: \\n${summaryList}
      
Szablyd testre a kvízt erre a 10 kérdésre (vagy kevesebbre ha nincs annyi). Vegyesen legyenek multiple_choice, true_false.
Format: {"questions":[{"id":"q1","type":"multiple_choice","question":"Kérdés?","options":["A","B","C","D"],"correctAnswer":"A","hint":"Tipp","explanation":"Magyarázat"}]}`;
      
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
      
      const jsonMatch = text.match(/\\{[\\s\\S]*\\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.questions) {
           setQuestions(parsed.questions);
           setSelectedGrade("Vegyes (Ismétlés)" as Grade); // Note: Might fail Type checking since Grade enum is strict
           setSelectedTopic("Gyenge pontok ismétlése");
           setSelectedDifficulty("Közepes");
           setSelectedType("Vegyes");
           setAnswers({});
           setElapsedTimes({});
           setIsQuizActive(true);
           setScreen("quiz");
           return;
        }
      }
      throw new Error("Nem sikerült érvényes kvízt kigenerálni az adatokból.");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Hiba történt az ismétlő kvíz generálásakor.");
    } finally {
      setLoading(false);
    }
  };

  // User finished quiz - save results and calculate local scores
  const handleQuizFinished = (
    finalAnswers: Record<string, string>,
    finalElapsed: Record<string, number>
  ) => {
    setAnswers(finalAnswers);
    setElapsedTimes(finalElapsed);

    // Calculate score for non-essay questions
    const objectiveQuestions = questions.filter((q) => q.type !== "essay");
    const essayQuestions = questions.filter((q) => q.type === "essay");

    let finalScorePercent = 0;
    let correctCount = 0;
    let newlyAddedWeakPointsCount = 0;

    const wrongItems: any[] = [];

    if (objectiveQuestions.length > 0) {
      objectiveQuestions.forEach((q) => {
        if (answersMatch(finalAnswers[q.id], q.correctAnswer) || String(finalAnswers[q.id]).toLowerCase() === String(q.correctAnswer).toLowerCase()) {
          correctCount++;
        } else if (finalAnswers[q.id]) { // only if they actually answered it and it was wrong
          wrongItems.push({
            id: q.id,
            question: q.question, // from QuizQuestion
            correct: q.correctAnswer || "",
            userAnswer: finalAnswers[q.id] || "Nincs válasz",
            type: q.type,
            topic: selectedTopic,
            grade: selectedGrade
          });
        }
      });
      finalScorePercent = Math.round((correctCount / objectiveQuestions.length) * 100);
      
      if (wrongItems.length > 0) {
        newlyAddedWeakPointsCount = addWeakPoints(wrongItems);
      }
    } else {
      // If the entire quiz selected was essays only, score starts at 100% on completion 
      // representing absolute basic effort before specific on-demand reviews.
      finalScorePercent = 100;
    }

    const gradeBadge = getHungarianGradeLabel(finalScorePercent);

    const prevXpState = getXpAndStreakState();
    
    // Calc XP
    const calculatedXp = calculateQuizXp(questions, finalAnswers);
    const xpUpdates = saveXpAndStreak(calculatedXp.earnedXp);

    // Save result in history log inside localStorage
    const saved = saveQuizResult(
      selectedGrade,
      selectedTopic,
      selectedDifficulty,
      finalScorePercent,
      `${gradeBadge.label} (${gradeBadge.gradeNum})`,
      questions.length,
      correctCount,
      essayQuestions.length
    );
    
    // Refresh results list before checking badges to get accurate history count
    const updatedResults = loadResults();
    
    // Check badges
    const gradeHistory = new Set(updatedResults.map(r => r.grade));
    const newlyEarnedBadges = checkAndAwardBadges(
      updatedResults.length,
      finalScorePercent,
      xpUpdates.currentStreak,
      xpUpdates.newLevel.name,
      gradeHistory,
      wasFromDocument
    );
    
    if (xpUpdates.newLevel.name !== prevXpState.level.name && calculatedXp.earnedXp > 0) {
      triggerMascotAct('levelUp');
    } else {
      triggerMascotAct('quizCompleted');
    }
    
    // Save leaderboard entry
    saveLeaderboardEntry({
      name: currentPlayerName,
      score: correctCount, // We might want to save correctCount or scorePercent
      pct: finalScorePercent,
      topic: selectedTopic,
      grade: selectedGrade,
      date: saved.date,
      xp: calculatedXp.earnedXp
    });

    setXpResult({
      earnedXp: calculatedXp.earnedXp,
      xpPerQuestion: calculatedXp.xpPerQuestion,
      perfectBonus: calculatedXp.perfectBonus,
      newlyEarnedBadges,
      ...xpUpdates
    });
    
    setWeakPointsAdded(newlyAddedWeakPointsCount);

    setCurrentResult(saved);
    setRecentResults(updatedResults);
    setIsQuizActive(false);
    setScreen("results");
  };

  const handleResetHistory = () => {
    resetAllStats();
    setRecentResults([]);
  };

  return (
    <div className="min-h-screen bg-[#1E0F08] text-[#1C0E04] pb-16 flex flex-col font-lora">
      {/* Top sticky logo bar */}
      <Header
        currentScreen={screen}
        setScreen={(scr) => {
          setScreen(scr);
          setError(null);
        }}
        isQuizActive={isQuizActive}
      />

      <main className="flex-grow">
        {/* GLOBAL LOADING MODAL FOR AI GENERATION */}
        {loading && (
          <div className="fixed inset-0 bg-[#1A0A00]/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-6">
            <motion.div 
               animate={{ y: [0, -20, 0] }} 
               transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
               className="text-[80px] drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] z-10"
            >
               🛡️
            </motion.div>
            
            <motion.p 
               animate={{ opacity: [0.5, 1, 0.5] }}
               transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
               className="text-xl font-cinzel font-bold text-[#FDF3DC] mt-8 tracking-wider text-center drop-shadow-md z-10"
            >
              A krónikások dolgoznak...
            </motion.p>
            
            {/* Skeleton look for cards loading */}
            <div className="w-full max-w-lg mt-12 space-y-4 opacity-40">
               <div className="h-24 w-full bg-gradient-to-r from-[#D4A017]/10 via-[#D4A017]/20 to-[#D4A017]/10 rounded-lg animate-[shimmer_2s_infinite] bg-[length:200%_100%]"></div>
               <div className="h-16 w-full bg-gradient-to-r from-[#D4A017]/5 via-[#D4A017]/15 to-[#D4A017]/5 rounded-lg animate-[shimmer_2s_infinite] bg-[length:200%_100%]" style={{ animationDelay: '0.2s' }}></div>
               <div className="h-16 w-full bg-gradient-to-r from-[#D4A017]/5 via-[#D4A017]/15 to-[#D4A017]/5 rounded-lg animate-[shimmer_2s_infinite] bg-[length:200%_100%]" style={{ animationDelay: '0.4s' }}></div>
            </div>

            <style>{`
              @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
              }
            `}</style>

            {/* Hungarian facts widget during loading (positioned at bottom) */}
            <div className="absolute bottom-10 left-6 right-6 max-w-lg mx-auto bg-[#1A0A00]/80 p-5 rounded-xl border border-[#D4A017]/30 flex gap-3 items-start justify-start shadow-xl backdrop-blur-md">
              <Sparkles className="w-6 h-6 text-[#D4A017] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[11px] font-bold font-cinzel text-[#D4A017] tracking-wider uppercase mb-1">
                  Tudtad, Vitéz?
                </span>
                <p className="text-sm text-[#FDF3DC] leading-[1.8] font-lora">
                  {HISTORICAL_FACTS[funnyFactIdx]}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TOP LEVEL ERROR BANNER */}
        {error && (
          <div className="max-w-xl mx-auto mt-6 px-4">
            <div className="bg-[#6B1010] border-2 border-[#B8860B] text-[#FFF5E0] px-4 py-3.5 rounded-none flex items-center gap-3 font-lora">
              <AlertCircle className="w-5 h-5 text-[#FFF5E0] shrink-0" />
              <div className="text-xs sm:text-sm">
                <p className="font-bold font-cinzel text-lg">Hiba történt</p>
                <p className="mt-1">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="underline text-[11px] font-bold font-cinzel text-[#FFF5D0] block mt-2 hover:text-white"
                >
                  Üzenet bezárása
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN ROUTING */}
        {!loading && (
          <div id="main-active-view">
            {screen === "home" && (
              <HomeScreen
                onStartQuiz={() => {
                  setError(null);
                  setScreen("settings");
                }}
                onViewStats={() => setScreen("stats")}
                onStartFlashcards={() => {
                  setError(null);
                  setScreen("flashcards");
                }}
                onViewWeakPoints={() => {
                  setError(null);
                  setScreen("weak_points");
                }}
                onStartTimeline={() => {
                  setError(null);
                  setScreen("timeline");
                }}
                onStartPairQuiz={() => {
                  setError(null);
                  setScreen("pair_quiz");
                }}
                onStartChronology={() => {
                  setError(null);
                  setScreen("chronology");
                }}
                onStartRoleplay={() => {
                  setError(null);
                  setScreen("roleplay");
                }}
                onStartLessons={() => {
                  setError(null);
                  setScreen("lessons");
                }}
                onStartGlossary={() => setScreen("glossary")}
                onStartQuestionBank={() => setScreen("question_bank")}
                recentResults={recentResults}
              />
            )}

            {screen === "lessons" && (
              <LessonScreen onGoHome={() => setScreen("home")} />
            )}

            {screen === "settings" && (
              <SettingsScreen
                onStartQuiz={handleStartQuizSelection}
                onCancel={() => setScreen("home")}
              />
            )}

            {screen === "question_bank" && (
              <QuestionBankScreen
                onStartBankQuiz={(bankQuestions, count, options) => {
                  let finalQuestions = [...bankQuestions];
                  // If mixWithAi is requested, we would ideally fetch more from API,
                  // but for simplicity we just set what we have
                  setSelectedGrade(options.grade);
                  setSelectedTopic(options.topic);
                  setSelectedDifficulty(options.difficulty);
                  setSelectedType("Vegyes");
                  setSelectedCount(count);
                  setCurrentPlayerName("Teacher");
                  setWasFromDocument(false);
                  
                  setQuestions(finalQuestions);
                  setAnswers({});
                  setElapsedTimes({});
                  setXpResult(null);
                  setWeakPointsAdded(0);
                  setIsQuizActive(true);
                  setScreen("quiz");
                }}
                onPrintWorksheet={async (bank) => {
                  try {
                    const worksheetResponse = await fetch("/api/worksheet", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        questions: bank.questions,
                        date: new Date().toLocaleDateString('hu-HU'),
                        grade: bank.grade,
                        topic: bank.topic,
                        difficulty: "Közepes",
                        showAnswers: true
                      })
                    });
                    
                    if (worksheetResponse.ok) {
                      const html = await worksheetResponse.text();
                      const printWindow = window.open("", "_blank");
                      if (printWindow) {
                        printWindow.document.write(html);
                        printWindow.document.close();
                      } else {
                        alert("Nem sikerült megnyitni az új fület. Kérlek engedélyezd a felugró ablakokat!");
                      }
                    } else {
                      alert("Nem sikerült lekérni a feladatlap formázást.");
                    }
                  } catch (err: any) {
                    alert(err?.message || "Váratlan hiba történt a feladatlap generálása közben.");
                  }
                }}
              />
            )}

            {screen === "quiz" && questions.length > 0 && (
              <QuizScreen
                questions={questions}
                onQuizFinished={handleQuizFinished}
                onAbort={() => {
                  setIsQuizActive(false);
                  setScreen("home");
                }}
                grade={selectedGrade}
                topic={selectedTopic}
              />
            )}

            {screen === "results" && questions.length > 0 && (
              <ResultsScreen
                questions={questions}
                answers={answers}
                elapsedTimes={elapsedTimes}
                gradeSelection={selectedGrade}
                topicSelection={selectedTopic}
                difficultySelection={selectedDifficulty}
                scorePercent={currentResult?.scorePercent || 0}
                correctCount={currentResult?.correctCount || 0}
                totalObjective={questions.filter((q) => q.type !== "essay").length}
                essayCount={currentResult?.essayCount || 0}
                xpResult={xpResult}
                weakPointsAdded={weakPointsAdded}
                onRestart={() => setScreen("settings")}
                onGoHome={() => setScreen("home")}
                onViewWeakPoints={() => setScreen("weak_points")}
              />
            )}

            {screen === "stats" && (
              <StatsScreen
                stats={globalStats}
                onResetStats={handleResetHistory}
                onGoHome={() => setScreen("home")}
                onStartQuiz={() => setScreen("settings")}
              />
            )}

            {screen === "leaderboard" && (
              <LeaderboardScreen
                onGoHome={() => setScreen("home")}
                currentPlayerName={currentPlayerName}
              />
            )}

            {screen === "flashcards" && (
              <FlashcardScreen
                onGoHome={() => setScreen("home")}
              />
            )}

            {screen === "glossary" && (
              <GlossaryScreen
                onGoHome={() => setScreen("home")}
              />
            )}

            {screen === "weak_points" && (
              <WeakPointsScreen
                onGoHome={() => setScreen("home")}
                onStartReviewQuiz={handleStartReviewQuiz}
              />
            )}

            {screen === "timeline" && (
              <TimelineScreen
                onGoHome={() => setScreen("home")}
              />
            )}

            {screen === "pair_quiz" && (
              <PairQuizScreen
                onGoHome={() => setScreen("home")}
              />
            )}

            {screen === "chronology" && (
              <ChronologyScreen
                onGoHome={() => setScreen("home")}
              />
            )}

            {screen === "roleplay" && (
              <RoleplayScreen
                onGoHome={() => setScreen("home")}
              />
            )}
          </div>
        )}
      </main>
      
      {/* Background Particles */}
      <div className="particle-container">
        {Array.from({ length: 15 }).map((_, i) => (
          <div 
            key={i} 
            className="particle" 
            style={{ 
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}vw`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${10 + Math.random() * 15}s`
            }} 
          />
        ))}
      </div>

      <KnightMascot />
    </div>
  );
}
