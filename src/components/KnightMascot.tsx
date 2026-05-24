import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

export const triggerMascotAct = (type: 'open' | 'correct' | 'wrong' | 'levelUp' | 'quizCompleted' | 'fact', overrideText?: string) => {
  window.dispatchEvent(new CustomEvent('mascot-action', { detail: { type, overrideText } }));
};

const OPEN_GREETINGS = [
  "Üdvözöllek a TörténÉSZ appban, vitéz!",
  "Készen állsz hogy igazi történész legyél?",
  "Jó napot, tudós! Ma mit tanulunk?",
  "Hej, pajtás! A könyvek kardnál is erősebbek!",
  "Helló! Árpád vagyok, a te históriás lovagod!"
];
const CORRECT_ANSWERS = [
  "Kiváló! Méltó vagy a lovagi rendhez!",
  "Brávó! Ezt a csatát megnyerted!",
  "Remek válasz, vitéz tudós!",
  "Így tovább! A Mester cím közeleg!"
];
const WRONG_ANSWERS = [
  "Ne add fel! A nagy hadvezérek is hibáztak!",
  "Semmi gond, a következőt már biztosan tudod!",
  "Minden hős megbotlik egyszer. Tovább!",
  "A vereség a legjobb tanítómester!"
];
const LEVEL_UPS = [
  "⚔️ SZINTLÉPÉS! Gratulálok, büszke vagyok rád!"
];
const QUIZ_COMPLETED = [
  "Megtetted! A história krónikása vagy!",
  "Fantasztikus teljesítmény, vitéz!"
];
const IDLE_DIALOGS = [
  "Hé! Ébren vagy? A történelem vár!",
  "Pszt! Ne szundikálj! Még sok téma vár!"
];
const FUN_FACTS = [
  "🏰 Tudtad? A római légió napi 30 km-t gyalogolt!",
  "⚔️ Tudtad? Mátyás király 15 évesen lett király!",
  "📜 Tudtad? Az első magyar iskola 996-ban nyílt!",
  "🗡️ Tudtad? A honfoglalás 895-96-ban zajlott!",
  "🏺 Tudtad? Atilla hunjai 453-ban értek Európába!",
  "📖 Tudtad? Az Aranybullát 1222-ben adták ki!",
  "🔥 Tudtad? Buda 1541-ben esett török kézre!",
  "⚡ Tudtad? 1848. március 15-én robbant ki a forradalom!"
];

function getRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

const KnightSVG = ({ mood, isWiggling }: { mood: string; isWiggling: boolean }) => {
  return (
    <motion.svg 
      width="100%" height="100%" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"
      animate={isWiggling ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
      transition={{ duration: 0.5 }}
    >
      {/* Cape */}
      <path d="M30 50 Q10 80 20 110 L90 110 Q80 80 80 50 Z" fill="#6B1010" />
      {/* Body Armor */}
      <rect x="35" y="60" width="40" height="40" rx="10" fill="#B8860B" />
      <rect x="40" y="65" width="30" height="30" rx="5" fill="#8B6508" />
      {/* Legs */}
      <rect x="42" y="100" width="10" height="15" fill="#4A0808" />
      <rect x="58" y="100" width="10" height="15" fill="#4A0808" />
      {/* Arms */}
      <rect x="25" y="65" width="15" height="25" rx="5" fill="#B8860B" />
      <rect x="70" y="65" width="15" height="25" rx="5" fill="#B8860B" 
        style={(mood === 'excited' || mood === 'levelUp') ? {transform: 'rotate(-45deg) translateY(-10px)', transformOrigin: '70px 65px'} : {}}
      />
      {/* Sword */}
      <rect x="15" y="70" width="5" height="40" fill="#E8CB88" />
      <rect x="10" y="80" width="15" height="5" fill="#1C0E04" />
      {/* Head */}
      <circle cx="55" cy="40" r="25" fill="#FFDAB9" />
      {/* Helmet */}
      <path d="M30 40 Q55 10 80 40 L80 50 L30 50 Z" fill="#D3D3D3" />
      <rect x="52" y="15" width="6" height="10" fill="#A9A9A9" />
      {/* Face / Expressions */}
      {mood === 'sad' && (
        <path d="M48 48 Q55 43 62 48" stroke="#1C0E04" strokeWidth="2" fill="none" />
      )}
      {(mood === 'idle' || mood === 'thinking') && (
        <path d="M48 46 Q55 52 62 46" stroke="#1C0E04" strokeWidth="2" fill="none" />
      )}
      {(mood === 'happy' || mood === 'excited' || mood === 'levelUp') && (
        <path d="M45 45 Q55 55 65 45" stroke="#1C0E04" strokeWidth="3" fill="none" />
      )}
      {/* Eyes */}
      <circle cx="48" cy="35" r="3" fill="#1C0E04" />
      <circle cx="62" cy="35" r="3" fill="#1C0E04" />
      {/* Thinking mark */}
      {mood === 'thinking' && (
        <text x="80" y="30" fontSize="20" fill="#F7EAC8" fontWeight="bold">?</text>
      )}
      {/* Excited stars */}
      {(mood === 'excited' || mood === 'levelUp') && (
        <g stroke="#E8CB88" strokeWidth="2">
          <path d="M20 20 L25 15 M25 15 L30 20 M25 15 L25 5" />
          <path d="M90 20 L95 15 M95 15 L100 20 M95 15 L95 5" />
        </g>
      )}
    </motion.svg>
  );
};

export default function KnightMascot({ forcedMood = 'idle' }: { forcedMood?: 'idle' | 'happy' | 'sad' | 'excited' | 'thinking' | 'levelUp' }) {
  const [isVisible, setIsVisible] = useState(false);
  const [bubbleText, setBubbleText] = useState("");
  const [mood, setMood] = useState<'idle' | 'happy' | 'sad' | 'excited' | 'thinking' | 'levelUp'>(forcedMood);
  const [isWiggling, setIsWiggling] = useState(false);
  
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const funFactTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showDialog = (text: string, newMood: typeof mood = 'idle') => {
    setIsVisible(true);
    setBubbleText(text);
    setMood(newMood);
    
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      setMood('idle');
    }, 4000); // hides after 4 secs
  };

  const resetActivityTimers = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (funFactTimerRef.current) clearTimeout(funFactTimerRef.current);
    
    idleTimerRef.current = setTimeout(() => {
      // Show idle dialog after 45 secs if not visible
      if (!isVisible) {
         showDialog(Math.random() > 0.5 ? getRandom(IDLE_DIALOGS) : 
            "Pszt! Tudtad hogy...? " + getRandom(FUN_FACTS), 'thinking');
      }
    }, 45000);
    
    // Fun fact every 3 minutes (180000ms)
    funFactTimerRef.current = setInterval(() => {
      showDialog(getRandom(FUN_FACTS), 'excited');
    }, 180000);
  };

  useEffect(() => {
    const handleMascotAction = (e: Event) => {
      resetActivityTimers();
      const ce = e as CustomEvent;
      const t = ce.detail.type;
      
      if (t === 'open') showDialog(ce.detail.overrideText || getRandom(OPEN_GREETINGS), 'happy');
      if (t === 'correct') showDialog(getRandom(CORRECT_ANSWERS), 'happy');
      if (t === 'wrong') showDialog(getRandom(WRONG_ANSWERS), 'sad');
      if (t === 'levelUp') showDialog(getRandom(LEVEL_UPS), 'levelUp');
      if (t === 'quizCompleted') showDialog(getRandom(QUIZ_COMPLETED), 'excited');
      if (t === 'fact') showDialog(getRandom(FUN_FACTS), 'excited');
    };

    window.addEventListener('mascot-action', handleMascotAction);
    
    // Initial activity
    resetActivityTimers();
    // Fire open on mount
    setTimeout(() => {
      showDialog(getRandom(OPEN_GREETINGS), 'happy');
    }, 1000);

    const activityListener = () => resetActivityTimers();
    window.addEventListener('click', activityListener);
    window.addEventListener('keydown', activityListener);

    return () => {
      window.removeEventListener('mascot-action', handleMascotAction);
      window.removeEventListener('click', activityListener);
      window.removeEventListener('keydown', activityListener);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (funFactTimerRef.current) clearInterval(funFactTimerRef.current);
    };
  }, []);

  useEffect(() => {
     if (forcedMood !== 'idle') {
        setMood(forcedMood);
     }
  }, [forcedMood]);

  const handleMascotClick = () => {
    setIsWiggling(true);
    showDialog(getRandom(FUN_FACTS), 'excited');
    setTimeout(() => setIsWiggling(false), 500);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isVisible && bubbleText && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-2 p-3 bg-[#FFF5D0] border-2 border-[#B8860B] rounded-xl rounded-br-none shadow-lg max-w-[200px]"
          >
            <p className="font-lora italic text-xs sm:text-sm text-[#1C0E04] leading-tight">
              {bubbleText}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {(isVisible || isWiggling) && (
          <motion.div
            initial={{ x: 150 }}
            animate={{ x: 0, y: [0, -8, 0] }}
            exit={{ x: 150 }}
            transition={{ 
              x: { type: 'spring', stiffness: 200, damping: 20 },
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
            className="cursor-pointer pointer-events-auto md:w-[120px] md:h-[120px] w-[80px] h-[80px]"
            onClick={handleMascotClick}
          >
            <KnightSVG mood={mood} isWiggling={isWiggling} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
