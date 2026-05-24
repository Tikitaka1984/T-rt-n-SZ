import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  ArrowLeft, 
  Loader2, 
  RotateCcw, 
  Check, 
  X, 
  Star, 
  Calendar, 
  Clock, 
  Trophy, 
  Shuffle, 
  GripVertical, 
  Info, 
  ListOrdered 
} from "lucide-react";
import { Grade, Difficulty } from "../types";
import { TopicSelector } from "./TopicSelector";
import { saveXpAndStreak } from "../utils/xp";
import { motion, AnimatePresence, useDragControls, useAnimation } from "motion/react";

interface DraggableAvailableCardProps {
  key?: any;
  id: string | number;
  idx: number;
  event: string;
  description: string;
  isSelected: boolean;
  onTap: () => void;
  onDragStartAction: () => void;
  onDragEndAction: (point: { x: number; y: number }) => void;
  onDragAction: (point: { x: number; y: number }) => void;
}

export function DraggableAvailableCard({
  id,
  idx,
  event,
  description,
  isSelected,
  onTap,
  onDragStartAction,
  onDragEndAction,
  onDragAction
}: DraggableAvailableCardProps) {
  const dragControls = useDragControls();

  const entranceVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.08,
        duration: 0.3
      }
    })
  };

  return (
    <motion.div
      custom={idx}
      initial="hidden"
      animate="visible"
      variants={entranceVariants}
      drag
      dragListener={true}
      dragControls={dragControls}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.8}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 25 }}
      whileDrag={{
        scale: 1.05,
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
        rotate: Math.random() * 6 - 3,
        zIndex: 999,
        cursor: "grabbing"
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 8px 20px rgba(184,134,11,0.3)"
      }}
      transition={{
        duration: 0.15
      }}
      onDragStart={() => {
        onDragStartAction();
      }}
      onDrag={(e, info) => {
        onDragAction(info.point);
      }}
      onDragEnd={(e, info) => {
        onDragEndAction(info.point);
      }}
      onClick={onTap}
      className={`p-3 bg-[#F7EAC8] rounded-[2px] border-2 border-[#B8860B] shadow-[0_3px_12px_rgba(0,0,0,0.3)] cursor-grab active:cursor-grabbing hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)] flex items-center gap-3 relative overflow-hidden group select-none ${
        isSelected ? "ring-4 ring-yellow-400 bg-white scale-[1.02] border-yellow-600" : ""
      }`}
    >
      <div 
        onPointerDown={(e) => {
          dragControls.start(e);
        }}
        className="cursor-grab text-[#B8860B]/70 hover:text-[#B8860B] flex items-center justify-center p-1"
      >
        <GripVertical className="w-5 h-5 flex-shrink-0" />
      </div>
      
      <div className="flex-1">
        <h4 className="font-cinzel font-bold text-xs text-[#1C0E04] leading-normal tracking-wide pr-2">
          {event}
        </h4>
        <p className="text-[10px] font-lora text-[#1C0E04]/70 leading-relaxed mt-1 line-clamp-2">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

interface DraggableSlotCardProps {
  key?: any;
  id: string | number;
  event: string;
  description: string;
  onRemove: () => void;
  onDragStartAction: () => void;
  onDragEndAction: (point: { x: number; y: number }) => void;
  onDragAction: (point: { x: number; y: number }) => void;
}

export function DraggableSlotCard({
  id,
  event,
  description,
  onRemove,
  onDragStartAction,
  onDragEndAction,
  onDragAction
}: DraggableSlotCardProps) {
  const dragControls = useDragControls();

  return (
    <motion.div
      drag
      dragListener={true}
      dragControls={dragControls}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.8}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 25 }}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{
        duration: 0.3,
        ease: "easeInOut"
      }}
      whileDrag={{
        scale: 1.05,
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
        rotate: Math.random() * 6 - 3,
        zIndex: 999,
        cursor: "grabbing"
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 8px 20px rgba(184,134,11,0.3)"
      }}
      onDragStart={() => {
        onDragStartAction();
      }}
      onDrag={(e, info) => {
        onDragAction(info.point);
      }}
      onDragEnd={(e, info) => {
        onDragEndAction(info.point);
      }}
      className="w-full flex items-center justify-between gap-1 p-1 cursor-grab active:cursor-grabbing select-none"
    >
      <div className="flex-1">
        <h5 className="font-cinzel font-bold text-xs text-[#1C0E04] leading-normal">
          {event}
        </h5>
        <p className="text-[9px] font-lora text-[#1C0E04]/60 line-clamp-1 mt-0.5">
          {description}
        </p>
      </div>
      
      <div 
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="text-[10px] text-red-800 hover:text-red-600 font-cinzel uppercase tracking-tighter absolute right-1.5 top-1 p-1 cursor-pointer z-15"
      >
        ✖
      </div>
    </motion.div>
  );
}

interface ChronologyScreenProps {
  onGoHome: () => void;
}

interface ChronologyEvent {
  id: string | number;
  year: string;
  displayYear: string;
  event: string;
  description: string;
  correctIndex?: number; // 0-indexed true chronological position
}

type ModePhase = "settings" | "loading" | "active" | "results";

export default function ChronologyScreen({ onGoHome }: ChronologyScreenProps) {
  const [phase, setPhase] = useState<ModePhase>("settings");
  const [grade, setGrade] = useState<string>("⚱️ Őskor és ókori Kelet");
  const [topic, setTopic] = useState<string>("Az őskor korszakai és jellemzői");
  const [difficulty, setDifficulty] = useState<Difficulty>("Közepes");
  
  // Game states
  const [events, setEvents] = useState<ChronologyEvent[]>([]);
  const [availableIds, setAvailableIds] = useState<Array<string | number>>([]);
  const [slots, setSlots] = useState<Array<string | number | null>>([]);
  
  // Interaction states
  const [selectedCardId, setSelectedCardId] = useState<string | number | null>(null);
  const [draggedCardInfo, setDraggedCardInfo] = useState<{ id: string | number; source: "available" | number } | null>(null);
  const [draggedOverSlotIdx, setDraggedOverSlotIdx] = useState<number | null>(null);
  
  // Timer & Scoring states
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Final summary states
  const [finalScore, setFinalScore] = useState<number>(0);
  const [correctPositionsCount, setCorrectPositionsCount] = useState<number>(0);
  const [timeBonusPoints, setTimeBonusPoints] = useState<number>(0);
  const [xpAwarded, setXpAwarded] = useState<number>(0);
  const [stars, setStars] = useState<number>(0);
  const [showTimelineReview, setShowTimelineReview] = useState<boolean>(false);

  // Start stopwatch timer
  const startTimer = () => {
    stopTimer();
    setElapsedSeconds(0);
    timerRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopTimer();
  }, []);

  // Parse years helper to sort precisely (e.g., handling BCE / Kr. e.)
  const parseYearToNumeric = (yearStr: string): number => {
    if (!yearStr) return 0;
    const lower = yearStr.toLowerCase();
    const isBCE = lower.includes("kr. e.") || 
                  lower.includes("b.c.") || 
                  lower.includes("ie.") || 
                  lower.includes("i.e.") ||
                  lower.includes("század e.") ||
                  yearStr.startsWith("-");
    const digits = yearStr.match(/\d+/);
    if (!digits) return 0;
    const num = parseInt(digits[0], 10);
    
    // Support centuries (e.g., "XI. század") -> convert century numeral approximately if no plain digits
    if (lower.includes("század")) {
      // Roman numerals conversion roughly
      const romanMatch = yearStr.match(/(x|v|i)+/i);
      if (romanMatch) {
        const rom = romanMatch[0].toUpperCase();
        let cent = 0;
        if (rom === "XXI") cent = 21;
        else if (rom === "XX") cent = 20;
        else if (rom === "XIX") cent = 19;
        else if (rom === "XVIII") cent = 18;
        else if (rom === "XVII") cent = 17;
        else if (rom === "XVI") cent = 16;
        else if (rom === "XV") cent = 15;
        else if (rom === "XIV") cent = 14;
        else if (rom === "XIII") cent = 13;
        else if (rom === "XII") cent = 12;
        else if (rom === "XI") cent = 11;
        else if (rom === "X") cent = 10;
        else if (rom === "IX") cent = 9;
        else if (rom === "VIII") cent = 8;
        else if (rom === "VII") cent = 7;
        else if (rom === "VI") cent = 6;
        else if (rom === "V") cent = 5;
        else if (rom === "IV") cent = 4;
        else if (rom === "III") cent = 3;
        else if (rom === "II") cent = 2;
        else if (rom === "I") cent = 1;

        const yearGuess = (cent - 1) * 100 + 50;
        return isBCE ? -yearGuess : yearGuess;
      }
    }

    return isBCE ? -num : num;
  };

  // Generate historical events via the Gemini API
  const handleStartGame = async () => {
    setPhase("loading");
    setShowTimelineReview(false);
    
    let eventCount = 12;
    if (difficulty === "Könnyű") eventCount = 8;
    else if (difficulty === "Nehéz") eventCount = 15;

    try {
      const prompt = `Magyar középiskolai történelemtanár vagy (NAT 2020).
Generálj pontosan ${eventCount} történelmi eseményt kronológiai kihíváshoz. Témakör: ${topic}. Évfolyam: ${grade}.
Nehézség: ${difficulty}.
FONTOS: az events lista VEGYES sorrendben legyen, NEM időrendben - a diáknak kell sorba raknia!
CSAK valid JSON választható el más szövegek nélkül:
{
  "events": [
    {
      "id": 1,
      "year": "1526",
      "displayYear": "1526. augusztus 29.",
      "event": "Mohácsi csata",
      "description": "II. Lajos főserege megsemmisítő vereséget szenvedett I. Szulejmán szultán török hadaitól."
    }
  ]
}`;

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error("HTTP error: " + response.status);
      }

      const rawText = await response.text();
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (e) {
        throw new Error("Invalid json root.");
      }

      let textContent = data.text || data.response || data.content || JSON.stringify(data);
      if (typeof textContent !== "string") {
        textContent = JSON.stringify(textContent);
      }

      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
         throw new Error("JSON pattern mismatch.");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.events || !Array.isArray(parsed.events) || parsed.events.length === 0) {
         throw new Error("Events array is empty.");
      }

      setupGameWithEvents(parsed.events, eventCount);
    } catch (err) {
      console.warn("Using offline fallback template for Chronology Challenge...", err);
      // Construct historical mock events as fallback to make sure client never crashes
      const offlineEvents = generateOfflineEvents(grade, topic, eventCount);
      setupGameWithEvents(offlineEvents, eventCount);
    }
  };

  // Pre-seed offline mock databases for 100% reliable system tolerance
  const generateOfflineEvents = (g: string, t: string, count: number): ChronologyEvent[] => {
    // Generates a nice list of real events per grade
    const masterEvents: Record<string, Array<{year: string; displayYear: string; event: string; description: string}>> = {
      "9. évfolyam": [
        { year: "-3000", displayYear: "Kr. e. 3000 k.", event: "Egyiptomi Birodalom egyesítése", description: "Ménész fáraó egyesíti Alsó- és Felső-Egyiptomot, kezdetét veszi az archaikus kor." },
        { year: "-1800", displayYear: "Kr. e. 18. század", event: "Hammurapi törvénykönyve", description: "Babilónia uralkodója létrehozza híres, igazságos és kemény joggyűjteményét." },
        { year: "-1250", displayYear: "Kr. e. 1250 k.", event: "A trójai háború kora", description: "A Mükéné vezette görög szövetség ostromolja Trója várát Kis-Ázsiában." },
        { year: "-594", displayYear: "Kr. e. 594", event: "Szolón reformjai Athénban", description: "Eltörli az adósrabszolgaságot, megteremti a timokratikus athéni berendezkedés alapjait." },
        { year: "-490", displayYear: "Kr. e. 490", event: "Marathoni csata", description: "Miltiadész serege legyőzi a perzsákat, a hírnök kifulladásig fut Athénig." },
        { year: "-431", displayYear: "Kr. e. 431-404", event: "Peleponnészoszi háború", description: "Athén és Spárta pusztító háborúja a görög világ feletti fegyelemért." },
        { year: "-334", displayYear: "Kr. e. 334", event: "Nagy Sándor hódításának kezdete", description: "A makedón uralkodó átlépi a Hellészpontoszt, hogy térdre kényszerítse Perzsiát." },
        { year: "-753", displayYear: "Kr. e. 753", event: "Róma hagyományos alapítása", description: "A monda szerint Romulus és Remus megalapítja az Örök Várost a Tiberis partján." },
        { year: "-509", displayYear: "Kr. e. 509", event: "A római köztársaság alapítása", description: "Elűzik az utolsó etruszk királyt, Tarquinius Superbust, s kikiáltják a köztársaságot." },
        { year: "-44", displayYear: "Kr. e. 44", event: "Julius Caesar meggyilkolása", description: "Március idusán a szenátusban összeesküvők Brutus vezetésével merényletet követnek el ellene." },
        { year: "313", displayYear: "313", event: "Milánói ediktum", description: "I. Constantinus császár biztosítja a keresztények számára a szabad vallásgyakorlást." },
        { year: "395", displayYear: "395", event: "Római Birodalom kettéosztása", description: "Theodosius halála után a birodalom végleg Keletrómai és Nyugatrómai részekre bomlik." },
        { year: "476", displayYear: "476", event: "Nyugatrómai Birodalom bukása", description: "Odoaker germán vezér letaszítja a trónról Romulus Augustulust, az ókor vége." },
        { year: "895", displayYear: "895-896", event: "A magyarok honfoglalása", description: "Árpád vezetésével a hét törzs betelepül a Kárpát-medencébe a Vereckei-hágón át." },
        { year: "907", displayYear: "907", event: "Pozsonyi csata", description: "A magyar seregek megsemmisítő csatában tönkreverik a Keleti Frank Királyság seregét." }
      ],
      "10. évfolyam": [
        { year: "1000", displayYear: "1000 / 1001", event: "I. István király koronázása", description: "Magyarország keresztény önálló királysággá válik a pápától kapott szent koronával." },
        { year: "1054", displayYear: "1054", event: "A nagy egyházszakadás", description: "A római pápa és a konstantinápolyi pátriárka kölcsönösen kiközösíti egymást." },
        { year: "1222", displayYear: "1222", event: "Az Aranybulla kiadása", description: "II. András törvénybe foglalja a nemesi szabadságjogokat és az ellenállási jogot." },
        { year: "1241", displayYear: "1241-1242", event: "Tatárjárás Magyarországon", description: "Batu kán mongol seregei letarolják az országot, IV. Béla kénytelen elmenekülni." },
        { year: "1351", displayYear: "1351", event: "Nagy Lajos törvényei", description: "Megerősíti az Aranybullát, bevezeti az ősiséget és a kilenced adót." },
        { year: "1456", displayYear: "1456. július 22.", event: "Nándorfehérvári diadal", description: "Hunyadi János és Kapisztrán János serege történelmi vereséget mér a szultánra." },
        { year: "1458", displayYear: "1458", event: "Hunyadi Mátyás trónra lépése", description: "A rendek királlyá választják a rákosi országgyűlésen, bevezeti a Fekete Sereget." },
        { year: "1492", displayYear: "1492", event: "Amerika felfedezése", description: "Kolumbusz Kristóf spanyol királyi támogatással kiköt a Bahamákon, új kor kezdete." },
        { year: "1517", displayYear: "1517. október 31.", event: "A reformáció kezdete", description: "Luther Márton kiszegezi 95 tézisét a wittenbergi vártemplom kapujára." },
        { year: "1526", displayYear: "1526. augusztus 29.", event: "Mohácsi csata", description: "II. Lajos főserege vereséget szenved a töröktől, az uralkodó a Csele-patakba fullad." },
        { year: "1541", displayYear: "1541. augusztus 29.", event: "Buda török kézre kerülése", description: "I. Szulejmán csellel elfoglalja a várat, Magyarország három részre szakad." },
        { year: "1552", displayYear: "1552", event: "Egri vár hősies védelme", description: "Dobó István és az egri katonák sikeresen ellenállnak Kara Ahmed pasa gigantikus ostromának." },
        { year: "1568", displayYear: "1568", event: "Tordai országgyűlés", description: "A világon elsőként törvénybe iktatják a vallásszabadságot az erdélyi felekezeteknek." },
        { year: "1686", displayYear: "1686", event: "Buda felszabadítása a török alól", description: "A Szent Liga egyesült európai hadai végleg kiűzik a törököt a magyar fővárosból." }
      ],
      "11. évfolyam": [
        { year: "1703", displayYear: "1703-1711", event: "Rákóczi-szabadságharc", description: "Bercsényi és Rákóczi vezette függetlenségi harc a Habsburg elnyomás ellen." },
        { year: "1789", displayYear: "1789. július 14.", event: "A Bastille ostroma", description: "Párizsi felkelők elfoglalják az elnyomás szimbólumát, francia forradalom kezdete." },
        { year: "1804", displayYear: "1804", event: "Napóleon császárrá koronázása", description: "A tehetséges tüzértisztből Franciaország mindenható diktátora és uralkodója lesz." },
        { year: "1825", displayYear: "1825", event: "A reformkor kezdete", description: "Széchenyi István felajánlja egyéves jövedelmét a Magyar Tudományos Akadémiára." },
        { year: "1830", displayYear: "1830", event: "Széchenyi Hitel című műve", description: "Megjelenik a gazdasági és társadalmi reformok elméleti megalapozása." },
        { year: "1848", displayYear: "1848. március 15.", event: "Forradalom Pesten", description: "A márciusi ifjak kihirdetik a 12 pontot és a Nemzeti dalt, sajtószabadság születik." },
        { year: "1849", displayYear: "1849. augusztus 13.", event: "Világosi fegyverletétel", description: "Görgei Artúr tábornok az orosz cári csapatok előtt leteszi a fegyvert." },
        { year: "1867", displayYear: "1867", event: "Kiegyezés megkötése", description: "Létrejön az Osztrák-Magyar Monarchia, Ferenc Józsefet magyar királlyá koronázzák." },
        { year: "1914", displayYear: "1914. június 28.", event: "Szarajevói merénylet", description: "Gavrilo Princip meggyilkolja Ferenc Ferdinánd trónörököst, kirobban az I. világháború." },
        { year: "1918", displayYear: "1918. október 31.", event: "Őszirózsás forradalom", description: "Károlyi Mihály vezetésével polgári demokratikus forradalom zajlik Budapesten." }
      ],
      "12. évfolyam": [
        { year: "1920", displayYear: "1920. június 4.", event: "Trianoni békeszerződés", description: "Aláírják a történelmi Magyarország kétharmadát elcsatoló békediktátumot." },
        { year: "1939", displayYear: "1939. szeptember 1.", event: "A második világháború kitörése", description: "Németország hadüzenet nélkül megtámadja Lengyelországot, elszabadul a világégés." },
        { year: "1943", displayYear: "1943. január", event: "Don-kanyari katasztrófa", description: "A 2. magyar hadsereg megsemmisül a Vörös Hadsereg áttörése során a Don folyónál." },
        { year: "1944", displayYear: "1944. március 19.", event: "Magyarország német megszállása", description: "Hitler parancsára a Wehrmacht megszállja szövetségesét a kiugrás megakadályozására." },
        { year: "1945", displayYear: "1945. május 9.", event: "A második világháború vége Európában", description: "Németország aláírja a feltétel nélküli fegyverletételt a szövetséges erők előtt." },
        { year: "1953", displayYear: "1953", event: "Sztálin halála", description: "A szovjet diktátor életét veszti, megkezdődik egy átmeneti és enyhe olvadási korszak." },
        { year: "1956", displayYear: "1956. október 23.", event: "A magyar forradalom kitörése", description: "Budapesti egyetemisták tüntetése fegyveres felkeléssé növi ki magát a szovjet elnyomás ellen." },
        { year: "1962", displayYear: "1962", event: "Kubai rakétaválság", description: "A világ a nukleáris háború szélére sodródik a Kubába telepített szovjet atomrakéták miatt." },
        { year: "1989", displayYear: "1989. október 23.", event: "A harmadik Magyar Köztársaság kikiáltása", description: "Szűrös Mátyás ideiglenes köztársasági elnök kikiáltja a szabad és független köztársaságot." },
        { year: "2004", displayYear: "2004. május 1.", event: "Magyarország csatlakozása az EU-hoz", description: "Magyarország kilenc másik európai országgal együtt az Európai Unió tagjává válik." }
      ]
    };

    const sourceList = masterEvents[g] || masterEvents["9. évfolyam"];
    // Shuffle and pick
    const shuffled = [...sourceList].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, Math.min(count, shuffled.length));
    
    // Format perfectly
    return chosen.map((val, idx) => ({
      id: `fallback-${idx}`,
      year: val.year,
      displayYear: val.displayYear,
      event: val.event,
      description: val.description
    }));
  };

  // Prepares internal boards after fetching events
  const setupGameWithEvents = (rawEvents: ChronologyEvent[], targetCount: number) => {
    // 1. Assign numeric order to establish perfect sorting truth
    const sorted = [...rawEvents].sort((a, b) => parseYearToNumeric(a.year) - parseYearToNumeric(b.year));
    
    const eventsWithIndices = rawEvents.map(evt => {
      // Find where this event stands in the sorted list
      const correctIdx = sorted.findIndex(se => se.event === evt.event && se.year === evt.year);
      return {
        ...evt,
        correctIndex: correctIdx !== -1 ? correctIdx : 0
      };
    });

    // 2. Mix up the available pile order
    const shuffledAvailable = [...eventsWithIndices].sort(() => Math.random() - 0.5);

    setEvents(eventsWithIndices);
    setAvailableIds(shuffledAvailable.map(e => e.id));
    setSlots(Array(targetCount).fill(null));
    setSelectedCardId(null);
    setDraggedCardInfo(null);
    
    // Set active phase and boot timer
    setPhase("active");
    startTimer();
  };

  // Helper selectors
  const getEventById = (id: string | number) => {
    return events.find(e => e.id === id);
  };

  const isAllSlotsFilled = () => {
    return slots.every(s => s !== null);
  };

  // Native HTML5 Drag and Drop events
  const handleDragStart = (e: React.DragEvent, id: string | number, source: "available" | number) => {
    setDraggedCardInfo({ id, source });
    // Keep it standard for browser engine drag feedback
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify({ id, source }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnSlot = (e: React.DragEvent, targetSlotIdx: number) => {
    e.preventDefault();
    if (!draggedCardInfo) return;
    
    const { id, source } = draggedCardInfo;
    placeEventInSlot(id, source, targetSlotIdx);
    setDraggedCardInfo(null);
  };

  const handleDropOnAvailable = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedCardInfo) return;

    const { id, source } = draggedCardInfo;
    if (source !== "available") {
      // Remove from slot
      const newSlots = [...slots];
      newSlots[source] = null;
      setSlots(newSlots);

      // Add back to available block if not already there
      if (!availableIds.includes(id)) {
        setAvailableIds(prev => [...prev, id]);
      }
    }
    setDraggedCardInfo(null);
  };

  // Framer Motion Drag and Drop helpers using screen coordinates (to support mobile + multi-touch seamlessly)
  const handleCardDrag = (point: { x: number; y: number }) => {
    const el = document.elementFromPoint(point.x, point.y);
    let target = el;
    let slotIdx: number | null = null;
    while (target) {
      if (target.hasAttribute("data-slot-idx")) {
        slotIdx = parseInt(target.getAttribute("data-slot-idx") || "", 10);
        break;
      }
      target = target.parentElement;
    }
    
    if (slotIdx !== null && !isNaN(slotIdx)) {
      setDraggedOverSlotIdx(slotIdx);
    } else {
      setDraggedOverSlotIdx(null);
    }
  };

  const handleCardDragEnd = (id: string | number, source: "available" | number, point: { x: number; y: number }) => {
    const el = document.elementFromPoint(point.x, point.y);
    let target = el;
    let slotIdx: number | null = null;
    let isAvailablePile = false;

    while (target) {
      if (target.hasAttribute("data-slot-idx")) {
        slotIdx = parseInt(target.getAttribute("data-slot-idx") || "", 10);
        break;
      }
      if (target.hasAttribute("data-available-pile")) {
        isAvailablePile = true;
        break;
      }
      target = target.parentElement;
    }

    if (slotIdx !== null && !isNaN(slotIdx)) {
      placeEventInSlot(id, source, slotIdx);
    } else if (source !== "available" && isAvailablePile) {
      // Remove from slot back to available
      const newSlots = [...slots];
      newSlots[source] = null;
      setSlots(newSlots);

      if (!availableIds.includes(id)) {
        setAvailableIds(prev => [...prev, id]);
      }
    }

    setDraggedCardInfo(null);
    setDraggedOverSlotIdx(null);
  };

  // Implementation core for putting cards inside position slots
  const placeEventInSlot = (id: string | number, source: "available" | number, targetSlotIdx: number) => {
    const newSlots = [...slots];
    const previousOccupantId = slots[targetSlotIdx];

    if (source === "available") {
      // Remove card from available pile
      setAvailableIds(prev => prev.filter(item => item !== id));
      
      // Target slot has occupant?
      if (previousOccupantId !== null) {
        // Swap! Return previous occupant to available
        setAvailableIds(prev => [...prev, previousOccupantId]);
      }
      newSlots[targetSlotIdx] = id;
    } else {
      // Shifting from slot source to slot target
      newSlots[source] = previousOccupantId; // can be null if target was empty
      newSlots[targetSlotIdx] = id;
    }

    setSlots(newSlots);
    setSelectedCardId(null);
  };

  // Click & Tap placement for smooth desktop/mobile alternative accessibility
  const handleCardTap = (id: string | number) => {
    if (selectedCardId === id) {
      setSelectedCardId(null);
    } else {
      setSelectedCardId(id);
    }
  };

  const handleSlotTap = (slotIdx: number) => {
    const occupantId = slots[slotIdx];

    if (selectedCardId !== null) {
      // Placing selected card in this slot
      // Is card currently in available, or in some slot?
      const isInAvailable = availableIds.includes(selectedCardId);
      const sourceIdx = slots.findIndex(s => s === selectedCardId);

      const source = isInAvailable ? "available" : sourceIdx;
      if (source !== -1) {
        placeEventInSlot(selectedCardId, source, slotIdx);
      }
    } else if (occupantId !== null) {
      // No selected card + tapping a filled slot -> return occupant to available pile
      const newSlots = [...slots];
      newSlots[slotIdx] = null;
      setSlots(newSlots);
      
      if (!availableIds.includes(occupantId)) {
        setAvailableIds(prev => [...prev, occupantId]);
      }
    }
  };

  // Calculates correctness, score bonuses, XP and persistent level updates
  const handleCheckResults = () => {
    stopTimer();
    
    let correctCount = 0;
    slots.forEach((eventId, idx) => {
      if (eventId !== null) {
        const evt = getEventById(eventId);
        if (evt && evt.correctIndex === idx) {
          correctCount++;
        }
      }
    });

    setCorrectPositionsCount(correctCount);

    // Scoring formula: +10 pts per correct position
    const basePts = correctCount * 10;
    
    // Time bonus: under 60s +50pts, under 120s +30pts, under 180s +10pts
    let tBonus = 0;
    if (elapsedSeconds < 60) tBonus = 50;
    else if (elapsedSeconds < 120) tBonus = 30;
    else if (elapsedSeconds < 180) tBonus = 10;
    setTimeBonusPoints(tBonus);

    // Perfect order bonus: +100 points
    const perfectBonus = correctCount === slots.length ? 100 : 0;

    const totalCalculated = basePts + tBonus + perfectBonus;
    setFinalScore(totalCalculated);

    // Stars rating calculation
    const ratio = correctCount / slots.length;
    let starResult = 0;
    if (ratio === 1.0) starResult = 3;
    else if (ratio >= 0.7) starResult = 2;
    else if (ratio >= 0.4) starResult = 1;
    setStars(starResult);

    // XP awarded: +correct_count * 5 XP
    const calculatedXp = correctCount * 5;
    setXpAwarded(calculatedXp);

    // Save and commit actual XP to persistent storage profile using imported utility
    try {
      if (calculatedXp > 0) {
        saveXpAndStreak(calculatedXp);
      }
    } catch (err) {
      console.warn("Unable to save persistent levels inside localStorage, sandbox context restricted.", err);
    }

    setPhase("results");
  };

  const handleRestart = () => {
    setPhase("settings");
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Knight words based on stars
  const getMascotVerdictSpeech = (starRating: number) => {
    if (starRating === 3) return "Mesterkronológus vagy, vitéz! 👑";
    if (starRating === 2) return "Jó munka! Még egy próbát megér!";
    return "Gyakorolj tovább, majd sikerül!";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" id="chronology-wrapper">
      
      {/* 1. CONFIGURATION / SETTINGS STAGE */}
      {phase === "settings" && (
        <div className="max-w-2xl mx-auto medieval-card p-6 sm:p-8 transition-transform duration-300">
          <div className="mb-4">
            <button 
              onClick={onGoHome}
              className="text-[#F7EAC8] hover:text-[#B8860B] transition-colors font-cinzel text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              ← Vissza a főoldalra
            </button>
          </div>

          <div className="text-center mb-6 border-b-2 border-[#B8860B]/40 pb-4">
            <h2 className="text-2xl font-cinzel font-bold text-[#6B1010] uppercase flex items-center justify-center gap-2">
              ⏳ Kronológia Kihívás
            </h2>
            <p className="text-sm font-lora text-[#1C0E04]/70 mt-2">
              Tedd próbára az időérzéked! Rendezd helyes kronológiai sorrendbe a kiválasztott korszak eseményeit.
            </p>
          </div>

          <div className="space-y-5">
            <TopicSelector selectedTopic={topic} onTopicChange={setTopic} onGradeChange={setGrade} />

            <div className="space-y-1.5">
              <label className="text-xs font-cinzel font-bold uppercase tracking-wider text-[#1C0E04] block">
                Nehézség (Események száma)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Könnyű", count: 8 },
                  { label: "Közepes", count: 12 },
                  { label: "Nehéz", count: 15 }
                ].map(opt => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setDifficulty(opt.label as Difficulty)}
                    className={`py-2 px-1 text-center font-cinzel font-bold rounded-[2px] transition-colors cursor-pointer text-xs flex flex-col items-center justify-center gap-0.5 border ${
                      difficulty === opt.label 
                        ? "bg-[#6B1010] text-[#F7EAC8] border-[#B8860B]" 
                        : "bg-[#FFF5D0] text-[#1C0E04] border-[#B8860B]/40 hover:bg-[#F0E6BD]"
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="text-[10px] opacity-75">({opt.count} esemény)</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#FFF5D0]/80 border-l-4 border-[#B8860B] p-4 rounded-[2px] text-xs text-[#1C0E04]">
              <span className="font-cinzel font-bold text-[#6B1010] block mb-1">SZABÁLYOK:</span>
              <p className="font-lora leading-relaxed">
                Rendezd időrendi sorrendbe a történelmi eseményeket! Húzd a kártyákat a megfelelő helyre.
                Mobil eszközön először koppints egy kártyára a kiválasztáshoz, majd kattints a cél helyére történő beillesztéshez.
              </p>
            </div>

            <button
              onClick={handleStartGame}
              className="w-full py-4 mt-4 bg-[#6B1010] hover:bg-[#801515] text-[#F7EAC8] rounded-[3px] border-1.5 border-[#B8860B] font-cinzel font-bold uppercase tracking-widest flex justify-center items-center gap-2 transition-colors cursor-pointer text-sm"
            >
              <Play className="w-4 h-4 fill-current" /> Játék indítása
            </button>
          </div>
        </div>
      )}

      {/* 2. LOADING SCREEN */}
      {phase === "loading" && (
        <div className="text-center py-24 flex flex-col items-center justify-center">
          <Loader2 className="w-14 h-14 text-[#B8860B] animate-spin mb-6" />
          <div className="bg-[#FFF5D0] border-2 border-[#B8860B] p-6 rounded-[4px] relative max-w-sm shadow-[0_4px_25px_rgba(0,0,0,0.35)]">
            <p className="text-sm font-cinzel font-bold text-[#6B1010] text-center tracking-wider leading-relaxed">
              Árpád lovag: „Események betöltése...”
            </p>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#FFF5D0] border-r-2 border-b-2 border-[#B8860B] rotate-45"></div>
          </div>
        </div>
      )}

      {/* 3. ACTIVE SIMULATION BOARD */}
      {phase === "active" && (
        <div className="space-y-6">
          
          {/* Header Bar Area */}
          <div className="w-full bg-[#1A0A03]/90 border-2 border-[#B8860B]/70 rounded-[4px] p-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-[#F7EAC8] shadow-md">
            <div>
              <span className="text-[10px] font-cinzel font-bold tracking-widest text-[#B8860B] uppercase">KRONOLÓGIA</span>
              <h3 className="font-cinzel font-bold text-sm sm:text-base leading-none tracking-wide text-white block mt-1">{topic}</h3>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 border border-[#B8860B]/30 rounded-[2px]">
                <Clock className="w-4 h-4 text-[#B8860B] animate-pulse" />
                <span className="font-mono text-sm tracking-wider font-bold text-white">{formatTimer(elapsedSeconds)}</span>
              </div>
              <div className="flex items-center gap-2 bg-[#6B1010]/50 px-3 py-1.5 border border-[#B8860B]/40 rounded-[2px]">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="font-cinzel text-xs font-bold tracking-widest">KORSZAK: {difficulty}</span>
              </div>
            </div>
            
            <button
              onClick={() => {
                stopTimer();
                onGoHome();
              }}
              className="px-3 py-1.5 border border-red-500/40 hover:bg-red-900/10 text-red-100 rounded-[2px] font-cinzel text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
            >
              Kilépés
            </button>
          </div>

          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-[#F7EAC8] uppercase tracking-wide">
              Rendezd időrendbe a kártyákat!
            </h2>
            <p className="text-xs font-loror text-[#FFF5D0]/70 italic mt-1">
              Fogd meg és húzd kártyáidat jobb oldali üres sorszámokhoz, vagy koppints rájuk a helyük kiválasztásához!
            </p>
          </div>

          {/* Active Worksite Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Hand: Available Events pile */}
            <div className="lg:col-span-5 bg-black/35 border-2 border-[#B8860B]/30 rounded-[4px] p-4 min-h-[300px] lg:sticky lg:top-4">
              <div className="border-b border-[#B8860B]/20 pb-2 mb-4 flex justify-between items-center text-[#F7EAC8]">
                <span className="text-[11px] font-cinzel font-bold tracking-wider uppercase block">
                  Elérhető eseménykártyák ({availableIds.length} db)
                </span>
                {selectedCardId && (
                  <span className="text-[10px] font-lora text-[#B8860B] italic animate-pulse">
                    Válassz cél helyet!
                  </span>
                )}
              </div>

              {availableIds.length === 0 ? (
                <div className="h-44 flex flex-col items-center justify-center text-center opacity-65" data-available-pile="true">
                  <ListOrdered className="w-10 h-10 text-[#B8860B] mb-2" />
                  <p className="text-xs font-lora text-white">Mindegyik esemény elhelyezve a listában!</p>
                  <p className="text-[10px] font-lora text-white/70 italic mt-0.5">Nyomd meg az Ellenőrzést a pontozáshoz.</p>
                </div>
              ) : (
                <div 
                  data-available-pile="true"
                  className="space-y-3 max-h-[500px] overflow-y-auto pr-1"
                  onDragOver={handleDragOver}
                  onDrop={handleDropOnAvailable}
                >
                  {availableIds.map((id, index) => {
                    const evt = getEventById(id);
                    if (!evt) return null;
                    const isSelected = selectedCardId === id;
                    
                    return (
                      <DraggableAvailableCard
                        key={id}
                        id={id}
                        idx={index}
                        event={evt.event}
                        description={evt.description}
                        isSelected={isSelected}
                        onTap={() => handleCardTap(id)}
                        onDragStartAction={() => {
                          setDraggedCardInfo({ id, source: "available" });
                        }}
                        onDragAction={(point) => {
                          handleCardDrag(point);
                        }}
                        onDragEndAction={(point) => {
                          handleCardDragEnd(id, "available", point);
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Hand: 1 to N Sorted Placements List */}
            <div className="lg:col-span-7 bg-[#FFF5D0]/10 border-2 border-[#B8860B]/30 rounded-[4px] p-4">
              <span className="text-[11px] font-cinzel font-bold tracking-wider text-[#F7EAC8] uppercase block border-b border-[#B8860B]/20 pb-2 mb-4">
                IDŐRENDI LÉPCSŐFOKOK (korábbitól a legújabbig)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {slots.map((occupantId, idx) => {
                  const hasOccupant = occupantId !== null;
                  const evt = occupantId !== null ? getEventById(occupantId) : null;
                  const isHighlighted = draggedOverSlotIdx === idx;
                  
                  return (
                    <motion.div
                      key={idx}
                      data-slot-idx={idx}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (draggedOverSlotIdx !== idx) {
                          setDraggedOverSlotIdx(idx);
                        }
                      }}
                      onDragLeave={() => {
                        if (draggedOverSlotIdx === idx) {
                          setDraggedOverSlotIdx(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDraggedOverSlotIdx(null);
                        if (draggedCardInfo) {
                          placeEventInSlot(draggedCardInfo.id, draggedCardInfo.source, idx);
                          setDraggedCardInfo(null);
                        }
                      }}
                      onClick={() => handleSlotTap(idx)}
                      animate={{
                        scale: isHighlighted ? 1.03 : 1,
                        borderColor: isHighlighted 
                          ? "#B8860B" 
                          : hasOccupant 
                            ? "#B8860B" 
                            : "rgba(184,134,11,0.5)",
                        backgroundColor: isHighlighted 
                          ? "rgba(184,134,11,0.1)" 
                          : hasOccupant 
                            ? "#FFF5D0" 
                            : "rgba(0,0,0,0.2)"
                      }}
                      transition={{
                        duration: 0.15
                      }}
                      className={`min-h-[76px] rounded-[3px] border-2 flex items-stretch cursor-pointer`}
                    >
                      {/* Numbered rail on left */}
                      <div className="w-10 bg-black/40 border-r border-[#B8860B]/30 flex flex-col items-center justify-center flex-shrink-0 select-none text-[#B8860B] font-mono font-bold text-xs">
                        <span>{idx + 1}.</span>
                        <span className="text-[8px] uppercase tracking-tighter text-[#B8860B]/60 font-cinzel font-light">hely</span>
                      </div>

                      {/* Content block */}
                      <div className="flex-1 p-2 flex items-center relative select-none">
                        {evt ? (
                          <DraggableSlotCard
                            id={evt.id}
                            event={evt.event}
                            description={evt.description}
                            onRemove={() => {
                              const newSlots = [...slots];
                              newSlots[idx] = null;
                              setSlots(newSlots);
                              
                              if (!availableIds.includes(evt.id)) {
                                setAvailableIds(prev => [...prev, evt.id]);
                              }
                            }}
                            onDragStartAction={() => {
                              setDraggedCardInfo({ id: evt.id, source: idx });
                            }}
                            onDragAction={(point) => {
                              handleCardDrag(point);
                            }}
                            onDragEndAction={(point) => {
                              handleCardDragEnd(evt.id, idx, point);
                            }}
                          />
                        ) : (
                          <div className="w-full text-center text-[10px] font-cinzel uppercase tracking-widest text-[#B8860B]/50">
                            {selectedCardId ? "Koppints ide az elhelyezéshez" : "Húzz ide kártyát..."}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Action Trigger Block */}
              <div className="mt-8 pt-4 border-t border-[#B8860B]/25 flex flex-col items-center">
                <button
                  disabled={!isAllSlotsFilled()}
                  onClick={handleCheckResults}
                  className={`w-full max-w-sm py-4 rounded-[3px] border-1.5 font-cinzel font-bold uppercase tracking-widest text-xs flex justify-center items-center gap-2 transition-all duration-200 cursor-pointer ${
                    isAllSlotsFilled()
                      ? "bg-green-700 hover:bg-green-600 text-[#F7EAC8] border-green-500 shadow-lg"
                      : "bg-[#4A0808]/15 text-[#F7EAC8]/45 border-[#B8860B]/20 cursor-not-allowed"
                  }`}
                >
                  <Check className="w-4 h-4" /> Ellenőrzés
                </button>
                {!isAllSlotsFilled() && (
                  <p className="text-[10px] text-red-300 font-lora italic text-center mt-2 font-medium">
                    Töltsd ki az összes pozíciót ({slots.filter(s=>s!==null).length}/{slots.length} kész) az ellenőrzés futtatásához!
                  </p>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* 4. CLINCHED SUMMARY / SCORE RESULTS PANELS */}
      {phase === "results" && (
        <div className="max-w-4xl mx-auto space-y-8" id="chronology-results">
          
          {/* Main Scoring Core Card */}
          <div className="medieval-card p-6 sm:p-10 text-center transition-all">
            <h2 className="text-3xl font-cinzel font-bold text-[#6B1010] uppercase mb-1">
              {stars > 0 ? "Kiváló krónikás teljesítmény!" : "A csata véget ért!"}
            </h2>
            <p className="text-xs font-cinzel font-semibold tracking-wider text-[#B8860B] uppercase">Gyakorlat sikeresen zárva</p>

            {/* Big Verdict Mascot box */}
            <div className="my-6 max-w-md mx-auto bg-[#FFF5D0] border-2 border-[#B8860B] p-4 rounded-[4px] relative shadow-md">
              <span className="text-[9px] font-cinzel font-bold text-[#B8860B] block tracking-widest mb-1 uppercase">ÁRPÁD LOVAG SZÓL:</span>
              <p className="text-sm font-cinzel font-bold text-[#6B1010] text-center leading-relaxed">
                „{getMascotVerdictSpeech(stars)}”
              </p>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#FFF5D0] border-r-2 border-b-2 border-[#B8860B] rotate-45"></div>
            </div>

            {/* Animated Stars row */}
            <div className="flex justify-center gap-4 my-8">
              {[1, 2, 3].map(num => {
                const isLit = stars >= num;
                return (
                  <div key={num} className="transition-transform duration-500 scale-110">
                    <Star 
                      className={`w-12 h-12 ${isLit ? "text-yellow-500 fill-yellow-500 stroke-[#1C0E04] stroke-2" : "text-black/20"}`} 
                    />
                  </div>
                );
              })}
            </div>

            {/* Performance Numbers Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto my-6">
              
              <div className="bg-white/40 p-4 border border-[#B8860B]/20 text-center">
                <span className="block text-[#1C0E04]/60 text-[10px] uppercase font-cinzel tracking-wider font-bold mb-1">PONTOS HELY</span>
                <span className="text-xl font-cinzel font-bold text-[#6B1010]">
                  {correctPositionsCount} / {slots.length}
                </span>
              </div>

              <div className="bg-white/40 p-4 border border-[#B8860B]/20 text-center">
                <span className="block text-[#1C0E04]/60 text-[10px] uppercase font-cinzel tracking-wider font-bold mb-1">TELJES PONT</span>
                <span className="text-xl font-cinzel font-bold text-green-800">
                  {finalScore} pont
                </span>
              </div>

              <div className="bg-white/40 p-4 border border-[#B8860B]/20 text-center">
                <span className="block text-[#1C0E04]/60 text-[10px] uppercase font-cinzel tracking-wider font-bold mb-1">IDŐERŐ</span>
                <span className="text-xl font-mono font-bold text-slate-800">
                  {formatTimer(elapsedSeconds)}
                </span>
              </div>

              <div className="bg-white/40 p-4 border border-[#B8860B]/20 text-center">
                <span className="block text-[#1C0E04]/60 text-[10px] uppercase font-cinzel tracking-wider font-bold mb-1">szerzett XP</span>
                <span className="text-xl font-cinzel font-bold text-amber-800 flex items-center justify-center gap-1">
                  +{xpAwarded} XP
                </span>
              </div>

            </div>

            {timeBonusPoints > 0 && (
              <p className="text-xs text-green-700 italic font-medium font-lora mb-4">
                🕰️ Kaptál {timeBonusPoints} pont gyorsasági bónuszt, mivel {elapsedSeconds} másodpercen belül befejezted!
              </p>
            )}

            {correctPositionsCount === slots.length && (
              <p className="text-xs text-amber-700 font-bold font-cinzel uppercase tracking-wider mb-6">
                ✨ 100 pontos tökéletes történelmi sorrend bónusz jóváírva (+100)! ✨
              </p>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-3 max-w-md mx-auto">
              <button
                onClick={() => setShowTimelineReview(!showTimelineReview)}
                className="flex-1 py-3 bg-[#B8860B] hover:bg-[#8A6305] text-[#F7EAC8] rounded-[3px] font-cinzel font-bold uppercase tracking-wider transition-colors cursor-pointer text-xs"
              >
                {showTimelineReview ? "Sorrend elrejtése" : "Helyes sorrend megtekintése"}
              </button>
              
              <button
                onClick={handleRestart}
                className="flex-1 py-3 bg-[#6B1010] hover:bg-[#801515] text-[#F7EAC8] border border-[#B8860B] rounded-[3px] font-cinzel font-bold uppercase tracking-wider transition-colors cursor-pointer text-xs"
              >
                Újra próbálom
              </button>

              <button
                onClick={onGoHome}
                className="flex-1 py-3 bg-[#1C0E04] hover:bg-[#2A1005] text-[#B8860B] border border-[#B8860B]/60 rounded-[3px] font-cinzel font-bold uppercase tracking-wider transition-colors cursor-pointer text-xs"
              >
                Főmenü
              </button>
            </div>

          </div>

          {/* Correct Placements Map for Visual Feedback */}
          <div className="bg-black/35 border-2 border-[#B8860B]/40 rounded-[4px] p-6 transition-all">
            <h3 className="text-base font-cinzel font-bold text-[#F7EAC8] uppercase tracking-wider border-b border-[#B8860B]/30 pb-2 mb-6 text-center">
              Kiértékelt elrendezésed eredménye
            </h3>
            
            <div className="space-y-4">
              {slots.map((eventId, idx) => {
                if (eventId === null) return null;
                const userEvt = getEventById(eventId);
                if (!userEvt) return null;
                
                const isCorrect = userEvt.correctIndex === idx;
                
                // Find correct event for this slot to render corrected indicators if wrong
                const correctEventAtThisIndex = events.find(e => e.correctIndex === idx);
                
                return (
                  <motion.div 
                    key={idx}
                    animate={isCorrect ? {
                      scale: [1, 1.08, 1],
                      borderColor: ["#16a34a", "#22c55e", "#16a34a"],
                      boxShadow: [
                        "0 0 0px rgba(34,197,94,0)",
                        "0 0 15px rgba(34,197,94,0.6)",
                        "0 0 0px rgba(34,197,94,0)"
                      ]
                    } : {
                      x: [0, -8, 8, -6, 6, 0],
                      borderColor: ["#dc2626", "#ef4444", "#dc2626"],
                      boxShadow: [
                        "0 0 0px rgba(220,38,38,0)",
                        "0 0 12px rgba(220,38,38,0.5)",
                        "0 0 0px rgba(220,38,38,0)"
                      ]
                    }}
                    transition={{
                      duration: 0.4,
                      ease: "easeInOut"
                    }}
                    className={`p-4 rounded-[4px] border-l-4 text-left relative overflow-hidden flex flex-col md:flex-row justify-between md:items-center gap-4 ${
                      isCorrect 
                        ? "bg-[#2D6A4F]/10 border-green-600 border-2" 
                        : "bg-[#8B1A1A]/10 border-[#dc2626] border-2"
                    }`}
                  >
                    {/* Visual Stamp badge */}
                    <div className="absolute top-1 right-2 font-mono font-bold text-sm tracking-widest uppercase py-0.5 px-1.5 rounded-[2px]">
                      {isCorrect ? (
                        <span className="text-green-500 flex items-center gap-1">✓ {userEvt.year}</span>
                      ) : (
                        <span className="text-red-500 flex items-center gap-1">✗ {userEvt.year}</span>
                      )}
                    </div>

                    <div className="flex-1 pr-14">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-yellow-500 bg-black/40 px-2 py-0.5 border border-[#B8860B]/20">
                          Slot #{idx + 1}
                        </span>
                        <h4 className="font-cinzel font-bold text-[#F7EAC8] text-xs sm:text-sm">
                          {userEvt.event}
                        </h4>
                      </div>
                      <p className="text-[11px] font-lora text-[#FFF5D0]/80 leading-relaxed mt-1">
                        {userEvt.description}
                      </p>
                    </div>

                    {!isCorrect && correctEventAtThisIndex && (
                      <div className="md:w-56 bg-black/45 border border-red-500/25 p-2 rounded-[2px] mt-2 md:mt-0 flex flex-col gap-0.5">
                        <span className="text-[9px] font-cinzel text-red-400 font-bold uppercase tracking-wider block leading-none mb-1">
                          IDE KELLENE KERÜLNIE:
                        </span>
                        <span className="font-cinzel font-bold text-white text-[11px] leading-tight block truncate">
                          e.g., {correctEventAtThisIndex.event}
                        </span>
                        <span className="font-mono text-yellow-500 text-[10px] font-bold">
                          Évszám: {correctEventAtThisIndex.displayYear || correctEventAtThisIndex.year}
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* 5. CORRECT TIMELINE VIEW REVEAL */}
          {showTimelineReview && (
            <div className="bg-[#1A0A03]/90 border-2 border-[#B8860B] rounded-[4px] p-6 text-center animate-fade-in transition-all">
              <div className="border-b border-[#B8860B]/30 pb-2 mb-6">
                <span className="text-[10px] font-cinzel font-bold tracking-widest text-yellow-500 uppercase">KRONOLÓGIKUS REZEPTÚRA</span>
                <h3 className="font-cinzel font-bold text-base text-white mt-1">A KORSZAK VALÓS IDŐSZALAGJA</h3>
                <p className="text-xs font-loror text-[#FFF5D0]/60 italic">Helyes kronológiai sorrend évszámokkal és részletekkel</p>
              </div>

              {/* Central vertical chain timeline */}
              <div className="relative max-w-xl mx-auto space-y-6 before:absolute before:inset-0 before:left-3 md:before:left-1/2 before:w-0.5 before:bg-[#B8860B]/30">
                {events
                  .map(e => e)
                  .sort((a,b) => parseYearToNumeric(a.year) - parseYearToNumeric(b.year))
                  .map((evt, index) => {
                    return (
                      <div 
                        key={evt.id} 
                        className={`relative flex flex-col md:flex-row gap-4 items-start md:items-center ${
                          index % 2 === 0 ? "md:flex-row-reverse" : ""
                        }`}
                      >
                        {/* central dot anchor */}
                        <div className="absolute left-3 md:left-1/2 -translate-x-[5px] md:-translate-x-[5px] w-3 h-3 bg-[#B8860B] border border-black rounded-full z-10"></div>
                        
                        <div className="flex-1 w-full pl-8 md:pl-0 md:text-right">
                          {index % 2 === 0 ? (
                            <div className="md:pr-8 text-left md:text-right">
                              <span className="inline-block font-mono font-bold text-sm text-[#E8CB88] bg-black/60 border border-[#B8860B]/40 px-2 py-0.5 rounded-[2px] mb-1">
                                {evt.displayYear || evt.year}
                              </span>
                              <h4 className="font-cinzel font-bold text-white text-xs sm:text-sm tracking-wide">
                                {evt.event}
                              </h4>
                              <p className="text-[10px] font-lora text-white/70 italic mt-0.5 leading-relaxed line-clamp-3">
                                {evt.description}
                              </p>
                            </div>
                          ) : (
                            <div className="hidden md:block"></div>
                          )}
                        </div>

                        <div className="flex-1 w-full pl-8 md:pl-0 md:text-left">
                          {index % 2 !== 0 ? (
                            <div className="md:pl-8 text-left">
                              <span className="inline-block font-mono font-bold text-sm text-[#E8CB88] bg-black/60 border border-[#B8860B]/40 px-2 py-0.5 rounded-[2px] mb-1">
                                {evt.displayYear || evt.year}
                              </span>
                              <h4 className="font-cinzel font-bold text-white text-xs sm:text-sm tracking-wide">
                                {evt.event}
                              </h4>
                              <p className="text-[10px] font-lora text-white/70 italic mt-0.5 leading-relaxed line-clamp-3">
                                {evt.description}
                              </p>
                            </div>
                          ) : (
                            <div className="hidden md:block"></div>
                          )}
                        </div>
                      </div>
                    );
                })}
              </div>

              <div className="mt-8 pt-4 border-t border-[#B8860B]/20">
                <button
                  onClick={() => {
                    setShowTimelineReview(false);
                    // scroll back up smoothly
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className="px-6 py-2 border border-[#B8860B] text-[#B8860B] hover:bg-[#B8860B]/10 font-cinzel text-xs uppercase font-bold tracking-widest rounded-[2px] transition-all cursor-pointer"
                >
                  Bezárás
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
