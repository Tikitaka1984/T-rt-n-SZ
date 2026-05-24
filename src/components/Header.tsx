import React from "react";
import { BookOpen, Trophy, History, Shield, Brain, Home, Swords, BarChart3, Menu, X, BookText } from "lucide-react";

interface HeaderProps {
  currentScreen: "home" | "settings" | "quiz" | "results" | "stats" | "leaderboard" | "flashcards" | "glossary" | "weak_points" | "timeline" | "pair_quiz" | "chronology" | "roleplay" | "question_bank" | "lessons";
  setScreen: (screen: "home" | "settings" | "quiz" | "results" | "stats" | "leaderboard" | "flashcards" | "glossary" | "weak_points" | "timeline" | "pair_quiz" | "chronology" | "roleplay" | "question_bank" | "lessons") => void;
  isQuizActive: boolean;
}

const BrandIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#D4A017] mb-[2px]">
    {/* Book */}
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    {/* Sword crossing it */}
    <path d="M9 10l9 -9m-2 0h2v2m-9 7l-2 2a2 2 0 1 1 -3 -3l2 -2m2 3l-1.5 1.5" />
  </svg>
);

export default function Header({ currentScreen, setScreen, isQuizActive }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    if (!isQuizActive) setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[linear-gradient(135deg,#5C0A0A,#3D0505)] border-b-2 border-[#D4A017] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Brand / Title */}
            <button
              onClick={() => !isQuizActive && setScreen("home")}
              disabled={isQuizActive}
              className={`flex flex-col text-left transition-all duration-200 ${
                isQuizActive ? "cursor-not-allowed opacity-70" : "hover:opacity-80"
              }`}
              id="header-logo-btn"
            >
              <h1 className="text-2xl font-cinzel font-bold tracking-wide text-[#FDF3DC] leading-tight flex items-center gap-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                <BrandIcon />
                <span>Történ<span className="text-[#D4A017] text-[110%] font-black">ÉSZ</span></span>
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-[#F0C040]/70 font-cinzel font-semibold leading-none mt-1">
                Tanulj okosan. Gondolkodj történészként.
              </p>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden sm:flex space-x-4 sm:space-x-8" id="header-nav-container">
              <button
                onClick={() => setScreen("home")}
                disabled={isQuizActive}
                className={`pb-1 text-xs font-cinzel font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer nav-link ${
                  currentScreen === "home" || currentScreen === "settings"
                    ? "text-[#FDF3DC] opacity-100 nav-link-active"
                    : "text-[#FDF3DC]/60 hover:text-[#D4A017] hover:opacity-100"
                } ${isQuizActive ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                Gyakorlás
              </button>

              <button
                onClick={() => setScreen("stats")}
                disabled={isQuizActive}
                className={`pb-1 text-xs font-cinzel font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer nav-link ${
                  currentScreen === "stats"
                    ? "text-[#FDF3DC] opacity-100 nav-link-active"
                    : "text-[#FDF3DC]/60 hover:text-[#D4A017] hover:opacity-100"
                } ${isQuizActive ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                Krónika
              </button>
              <button
                onClick={() => setScreen("leaderboard")}
                disabled={isQuizActive}
                className={`pb-1 text-xs font-cinzel font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer nav-link ${
                  currentScreen === "leaderboard"
                    ? "text-[#FDF3DC] opacity-100 nav-link-active"
                    : "text-[#FDF3DC]/60 hover:text-[#D4A017] hover:opacity-100"
                } ${isQuizActive ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                Toplista
              </button>
              <button
                onClick={() => setScreen("lessons")}
                disabled={isQuizActive}
                className={`pb-1 text-xs font-cinzel font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer nav-link ${
                  currentScreen === "lessons"
                    ? "text-[#FDF3DC] opacity-100 nav-link-active"
                    : "text-[#FDF3DC]/60 hover:text-[#D4A017] hover:opacity-100"
                } ${isQuizActive ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                Leckék
              </button>
              <button
                onClick={() => setScreen("question_bank")}
                disabled={isQuizActive}
                className={`pb-1 text-xs font-cinzel font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer nav-link flex items-center gap-1 ${
                  currentScreen === "question_bank"
                    ? "text-[#FDF3DC] opacity-100 nav-link-active"
                    : "text-[#FDF3DC]/60 hover:text-[#D4A017] hover:opacity-100"
                } ${isQuizActive ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                📚 Kérdésbank
              </button>
            </nav>
            
            {/* Mobile Hamburger (hidden for now since we use Bottom Tab Bar, but present for extra items if needed) */}
            <button 
              className="sm:hidden p-2 text-[#FDF3DC]"
              onClick={toggleMobileMenu}
              disabled={isQuizActive}
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            {/* Badge indicator */}
            <div className="hidden lg:flex items-center text-[10px] font-cinzel font-bold uppercase tracking-widest text-[#FDF3DC]/70 border border-[#D4A017]/40 px-3 py-1.5 bg-[#1A0A00]/40 rounded-sm">
              <Shield className="w-3.5 h-3.5 mr-1 text-[#D4A017]" />
              <span>9–12. Évfolyam</span>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu (for items not in Bottom Bar) */}
        {mobileMenuOpen && !isQuizActive && (
          <div className="sm:hidden absolute top-20 left-0 w-full bg-[linear-gradient(135deg,#5C0A0A,#3D0505)] border-b-2 border-[#D4A017] shadow-xl py-4 px-6 flex flex-col gap-4 z-50">
            <button onClick={() => { setScreen("glossary"); setMobileMenuOpen(false); }} className="text-left text-[#FDF3DC] font-cinzel uppercase font-bold tracking-wider py-2 border-b border-white/10">Fogalomtár</button>
            <button onClick={() => { setScreen("timeline"); setMobileMenuOpen(false); }} className="text-left text-[#FDF3DC] font-cinzel uppercase font-bold tracking-wider py-2 border-b border-white/10">Időszalag</button>
            <button onClick={() => { setScreen("question_bank"); setMobileMenuOpen(false); }} className="text-left text-[#FDF3DC] font-cinzel uppercase font-bold tracking-wider py-2 border-b border-white/10">Kérdésbank</button>
          </div>
        )}
      </header>
      
      {/* Mobile Bottom Tab Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FDF3DC] border-t-2 border-[#D4A017] shadow-[0_-4px_15px_rgba(0,0,0,0.3)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-16 px-2 text-[#5C3A10]">
          <button 
            onClick={() => !isQuizActive && setScreen("home")}
            disabled={isQuizActive}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${currentScreen === "home" ? "text-[#5C0A0A]" : "opacity-70 hover:opacity-100"} ${isQuizActive ? "opacity-30" : ""}`}
          >
            <Home size={22} className={currentScreen === "home" ? "text-[#D4A017]" : ""} />
            <span className="text-[10px] font-bold font-cinzel uppercase tracking-wider">Főoldal</span>
          </button>
          
          <button 
            onClick={() => !isQuizActive && setScreen("home")} // "Gyakorlás" is on home basically, maybe open weak points?
            disabled={isQuizActive}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${currentScreen === "weak_points" ? "text-[#5C0A0A]" : "opacity-70 hover:opacity-100"} ${isQuizActive ? "opacity-30" : ""}`}
          >
            <Brain size={22} className={currentScreen === "weak_points" ? "text-[#D4A017]" : ""} />
            <span className="text-[10px] font-bold font-cinzel uppercase tracking-wider">Gyakorlás</span>
          </button>

          <button 
            onClick={() => !isQuizActive && setScreen("lessons")}
            disabled={isQuizActive}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${currentScreen === "lessons" ? "text-[#5C0A0A]" : "opacity-70 hover:opacity-100"} ${isQuizActive ? "opacity-30" : ""}`}
          >
            <BookText size={22} className={currentScreen === "lessons" ? "text-[#D4A017]" : ""} />
            <span className="text-[10px] font-bold font-cinzel uppercase tracking-wider">Leckék</span>
          </button>
          
          <button 
            onClick={() => !isQuizActive && setScreen("home")} // Minigames on home
            disabled={isQuizActive}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors opacity-70 hover:opacity-100 ${isQuizActive ? "opacity-30" : ""}`}
          >
            <Swords size={22} />
            <span className="text-[10px] font-bold font-cinzel uppercase tracking-wider">Játékok</span>
          </button>

          <button 
            onClick={() => !isQuizActive && setScreen("stats")}
            disabled={isQuizActive}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${currentScreen === "stats" ? "text-[#5C0A0A]" : "opacity-70 hover:opacity-100"} ${isQuizActive ? "opacity-30" : ""}`}
          >
            <BarChart3 size={22} className={currentScreen === "stats" ? "text-[#D4A017]" : ""} />
            <span className="text-[10px] font-bold font-cinzel uppercase tracking-wider">Krónika</span>
          </button>
        </div>
      </nav>
    </>
  );
}
