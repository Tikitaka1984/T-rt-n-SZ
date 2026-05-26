import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  Shield, 
  HelpCircle, 
  Sparkles, 
  BookOpen, 
  AlertCircle, 
  Scroll, 
  Award, 
  Sparkle
} from "lucide-react";
import { TopicSelector } from "./TopicSelector";
import { triggerMascotAct } from "./KnightMascot";
import { saveXpAndStreak } from "../utils/xp";

// Typings
interface Choice {
  id: string;
  icon: string;
  label: string;
  description: string;
  isHistorical: boolean;
  consequence: string;
  historicalFact: string;
}

interface DecisionPoint {
  id: number;
  situation: string;
  dilemma: string;
  choices: Choice[];
}

interface RoleplayScenario {
  title: string;
  opening: string;
  character: string;
  decisions: DecisionPoint[];
  historicalOutcome: string;
  conclusion: string;
}

interface RoleplayScreenProps {
  onGoHome: () => void;
}

// Scenarios configuration
export const SCENARIOS_BY_GRADE: Record<string, string[]> = {
  "9. évfolyam": [
    "Honfoglaló vezér vagyok (895)",
    "Római légiós vagyok (Kr.e. 100)",
    "Ókori görög polgár vagyok (Kr.e. 450)"
  ],
  "10. évfolyam": [
    "Lovag vagyok a középkorban (1200)",
    "Hunyadi János hadjáratán vagyok (1456)",
    "Végvári katona vagyok (1552)"
  ],
  "11. évfolyam": [
    "1848-as honvéd vagyok",
    "Francia forradalmár vagyok (1789)",
    "Reformkori nemes vagyok (1840)"
  ],
  "12. évfolyam": [
    "Magyar ellenálló vagyok (1944)",
    "Hidegháborús diplomata vagyok (1956)",
    "Rendszerváltás résztvevője vagyok (1989)"
  ]
};

// Elegant procedurally generated backup scenarios if model API call fails
function getOfflineScenario(scenarioName: string, count: number): RoleplayScenario {
  // Let's deliver high quality customized templates according to the selected era.
  const is9thHonfoglalo = scenarioName.includes("Honfoglaló");
  const is10thHunyadi = scenarioName.includes("Hunyadi");
  const is11thHonved = scenarioName.includes("1848-as");
  const is12thDiplomata = scenarioName.includes("diplomata") || scenarioName.includes("1956");

  let title = `A dicső Krónika: ${scenarioName}`;
  let opening = "A történelem sodrában találod magad. Megváltoztathatod a nemzet elrendeltetett sorsát, vagy rátérhetsz az ősök által kitaposott törvényes ösvényre. Minden egyes döntésed kardcsapásként formálja a jövőt.";
  let character = "Kiválasztott Történelmi Hős";
  let hOutcome = "A történelem lapjai megőrizték az egykori igazságokat: a merész döntések vezettek a megmaradáshoz, míg a meggondolatlan tettek komoly áldozatokkal jártak.";
  let conclusion = "Kalandod véget ért. A magyar história krónikásaként hűen követted vagy éppen átírtad a múltat. Emléked megőrzik a dalnokok!";

  if (is9thHonfoglalo) {
    title = "Árpád népe: A Honfoglaló Vezér";
    opening = "895-ben járunk. A Kárpát-medencébe lépve a keleti törzsek vezéreként hont kell foglalnod és megvédened a népedet a besenyők s a bolgárok támadásaitól. A Vereckei-hágó mögött egy teljesen új világ áll előtted.";
    character = "Levedi törzsi vezér, Árpád hű szövetségese";
    hOutcome = "895-896-ban a magyarok Árpád fejedelem vezetésével sikeresen elfoglalták a Kárpát-medencét, szövetséget kötöttek a helyi törzsekkel, és megerősítették a védelmi határvonalakat.";
    conclusion = "Sikeresen biztosítottad az Árpád-ház vezetését s a magyarság megmaradását!";
  } else if (is10thHunyadi) {
    title = "Sár és Acél: Hunyadi János seregében";
    opening = "1456 nyara. Nándorfehérvár várát II. Mehmed oszmán szultán hatalmas serege ostromolja. Te Hunyadi János hűséges vitéze, egy lovas csapat parancsnoka vagy, akinek meg kell találnia az utat a túlerővel szemben.";
    character = "Vitéz Gergely, Hunyadi megbízható lovassági tisztje";
    hOutcome = "A nándorfehérvári diadalban Hunyadi leleményes folyami blokád-áttörése és Kapisztrán János kereszteseinek váratlan ellenrohama megfutamította a szultán főseregét, biztosítva Európának 70 év békét.";
    conclusion = "A harangok zúgása téged is dicsőít! Nándorfehérvár védőinek neve örökké fennmarad.";
  } else if (is11thHonved) {
    title = "Szabadság, Szerelem: Az 1848-as Honvéd";
    opening = "1848 ősze. A bécsi udvarral feszültté vált a viszony, Jellasics horvát bán csapatai már a főváros felé törnek. Te a frissen szervezett Kossuth-féle honvédsereg egyik bátor hadnagya vagy Pákozd síkján.";
    character = "Kovács István hadnagy, a harmadik honvédzászlóalj tisztje";
    hOutcome = "A pákozdi csatában a lelkes de tapasztalatlan magyar honvédek sikeresen visszaverték Jellasics horvát hadtestét, ami elvezetett a dicsőséges tavaszi hadjárat kibontakozásához.";
    conclusion = "A piros-fehér-zöld kokárda büszkén feszül a melleden, megharcoltál a nemzet szabadságáért!";
  } else if (is12thDiplomata) {
    title = "Forró Ősz: Hidegháborús diplomata (1956)";
    opening = "1956. október végének viharos napjai Budapesten. A lyukas zászlók lengenek az utcákon, s a külügyminisztérium ifjú titkáraként az a feladatod, hogy kapcsolatot teremts a nyugati hatalmakkal a semlegesség elismertetésére.";
    character = "Szalay Miklós, külügyi titkár és összekötő";
    hOutcome = "Az 1956-os forradalmat a szovjet hadsereg brutálisan leverte, miközben a nyugati hatalmak a szuezi válság miatt nem nyújtottak valós katonai vagy politikai segítséget.";
    conclusion = "Bár a történelem kereke könyörtelen volt, a magyar szabadságvágy lángja örökre világít a világ előtt.";
  }

  // Generate decision points list procedurally based on requested length
  const decisionPool = [
    {
      situation: "Hatalmas sereg közelít a jobb szárnyunk felé, mialatt a felderítők szerint a központ védtelen maradt.",
      dilemma: "Hova vezényled a tartalék alakulatokat, megkockáztatva a fősereg bekerítését?",
      choices: [
        {
          id: "a",
          icon: "🛡️",
          label: "Védelmi állás a centrumban",
          description: "Megszilárdítod a sáncokat és beváród az ellenség első rohamait.",
          isHistorical: true,
          consequence: "Az ellenség rohama megtörik a jól előkészített, rendíthetetlen magyar gyalogsági pajzsokon.",
          historicalFact: "A korszak hadvezérei előszeretettel használtak zárt, sáncokkal megerősített védelmi állásokat védekezésre."
        },
        {
          id: "b",
          icon: "⚔️",
          label: "Azonnali lovassági ellenroham",
          description: "Meglepetésszerű támadást indítasz a jobbszárnyon az erdőből.",
          isHistorical: false,
          consequence: "A nehéz lovasság elakad a mocsaras altalajban, komoly veszteségeket szenvedve az íjászoktól.",
          historicalFact: "A meggondolatlan támadások sokszor végzetesek voltak, ha a terepviszonyok hátráltatták a gyors manőverezést."
        },
        {
          id: "c",
          icon: "🏃",
          label: "Színlelt visszavonulás",
          description: "Gyors hátraarcot vezényelsz, hogy a szűk völgybe csalogasd őket.",
          isHistorical: true,
          consequence: "Az ellenség üldözőbe vesz, tágítva a soraikat, pont belefutva az oldalról lesben álló alakulatainkba.",
          historicalFact: "A színlelt visszavonulás a nomád magyarok és a korai csaták egyik leghíresebb és legsikeresebb taktikája volt."
        }
      ]
    },
    {
      situation: "Egy helyi nemes azzal gyanúsít meg, hogy tiltott könyveket terjesztesz, és feljelentéssel fenyeget a vármegyei főispánnál.",
      dilemma: "Hogyan kezeled a fenyegetést, hogy elkerüld a bebörtönzést?",
      choices: [
        {
          id: "a",
          icon: "🤝",
          label: "Tárgyalás és megvesztegetés",
          description: "Felajánlod a családi ezüst egy részét a nemes hallgatásáért cserébe.",
          isHistorical: false,
          consequence: "A nemes elfogadja az ajándékot, ám titokban mégis jelent, így mindened elveszik.",
          historicalFact: "A korrupció jelen volt, de a politikai gyanúsítások idején a megvesztegetés ritkán jelentett tartós biztonságot."
        },
        {
          id: "b",
          icon: "📜",
          label: "Hivatkozz a törvényes jogaidra",
          description: "Nyílt vitát kezdeményezel a vármegyei gyűlésen a nemesi szabadságjogok alapján.",
          isHistorical: true,
          consequence: "A többi reformpárti nemes melléd áll, így a főispán kénytelen ejteni az ügyet a népharagtól tartva.",
          historicalFact: "A 19. századi Magyarországon a vármegyei gyűlések adtak teret a liberális ellenzék bátor fellépésének."
        },
        {
          id: "c",
          icon: "🏃",
          label: "Menekülés éjszaka",
          description: "Mindent hátrahagyva elhagyod a vármegyét és álnéven egy másik birtokon vállalsz munkát.",
          isHistorical: false,
          consequence: "Életed végéig bujkálásra kényszerülsz, korábbi társadalmi státuszod és vagyonod odavész.",
          historicalFact: "Sokan kényszerültek emigrációba vagy belső bujkálásra az abszolutista elnyomás sötét éveiben."
        }
      ]
    },
    {
      situation: "A szövetséges követek titkos üzenetet küldenek, melyben azonnali csatlakozást kérnek az új politikai egyezményhez.",
      dilemma: "Aláírod-e a nyilatkozatot még a királyi kancellária jóváhagyása előtt?",
      choices: [
        {
          id: "a",
          icon: "🖋️",
          label: "Azonnali aláírás",
          description: "Nem vársz tovább, biztosítva a szövetség előnyeit a néped javára.",
          isHistorical: false,
          consequence: "A király árulásnak tekinti az önkényes lépést, és megfoszt tisztségedtől.",
          historicalFact: "A kora újkori Magyarországon az önálló külpolitika a rendi jogok védelmében gyakran felségsértésnek minősült."
        },
        {
          id: "b",
          icon: "🦉",
          label: "Halasztást és egyeztetést kérsz",
          description: "Diplomatikus levélben türelmet kérsz, amíg a kancellár véleményezi a pontokat.",
          isHistorical: true,
          consequence: "Sikerül időt nyerned s a királyi pecsét birtokában teljesen törvényes és erős szövetség jön létre.",
          historicalFact: "A sikeres magyar diplomaták, mint Hunyadi János vagy Bethlen Gábor, mindig ügyesen egyensúlyoztak a törvényesség és a gyorsaság mezsgyéjén."
        },
        {
          id: "c",
          icon: "📯",
          label: "Nyílt visszautasítás",
          description: "Büszkén elutasítod őket, hangoztatva az ország függetlenségét és erejét.",
          isHistorical: false,
          consequence: "A követek megsértődnek, s a szomszédos állam magára hagyja a magyar védelmi vonalakat a keleti veszéllyel szemben.",
          historicalFact: "A szövetségesek nélküli elszigetelődés több ízben hozzájárult a történelmi Magyarország tragédiáihoz."
        }
      ]
    }
  ];

  const decisions: DecisionPoint[] = [];
  for (let i = 0; i < count; i++) {
    const baseDecision = decisionPool[i % decisionPool.length];
    decisions.push({
      id: i + 1,
      situation: `${i + 1}. állomás: ${baseDecision.situation}`,
      dilemma: baseDecision.dilemma,
      choices: baseDecision.choices.map((c, idx) => ({
        ...c,
        id: idx === 0 ? "a" : idx === 1 ? "b" : "c"
      }))
    });
  }

  return {
    title,
    opening,
    character,
    decisions,
    historicalOutcome: hOutcome,
    conclusion
  };
}

export default function RoleplayScreen({ onGoHome }: RoleplayScreenProps) {
  const [phase, setPhase] = useState<"settings" | "loading" | "game" | "consequence" | "ending">("settings");
  
  // Settings selections
  const [grade, setGrade] = useState<string>("⚱️ Őskor és ókori Kelet");
  const [topic, setTopic] = useState<string>("Az őskor korszakai és jellemzői");
  const [difficulty, setDifficulty] = useState<"Könnyű" | "Közepes" | "Nehéz">("Közepes");
  
  // Active Game state
  const [loadedScenario, setLoadedScenario] = useState<RoleplayScenario | null>(null);
  const [currentDecisionIndex, setCurrentDecisionIndex] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  
  // Score tracking
  const [decisionsHistory, setDecisionsHistory] = useState<{
    situation: string;
    chosenLabel: string;
    isCorrect: boolean;
    consequence: string;
    fact: string;
  }[]>([]);
  
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [loadingText, setLoadingText] = useState<string>("A krónikák lapozgatása folyamatban...");
  const [badgeUnlocked, setBadgeUnlocked] = useState<boolean>(false);
  const [xpEarnedTotal, setXpEarnedTotal] = useState<number>(0);

  // Removed redundant set default scenario when grade changes
  
  const decisionCount = difficulty === "Könnyű" ? 3 : difficulty === "Közepes" ? 5 : 7;

  // Trigger Gemini AI scenario generation
  const handleStartAdventure = async () => {
    setPhase("loading");
    setLoadingText("A krónikák lapozgatása folyamatban...");
    triggerMascotAct("fact", "A kódexeket kiterítem, az idő kapui kitárulnak!");

    const promptText = `Magyar középiskolai történelemtanár vagy (NAT 2020).
Generálj történelmi szerepjáték forgatókönyvet.
Témakör: ${topic}. Évfolyam: ${grade}.
Nehézség: ${difficulty} (${decisionCount} döntési pont).
Karakter, akit a diák alakít, legyen a témakörnek megfelelő hiteles személy (pl. polgár, katona, uralkodó).
CSAK valid JSON válaszolj, formázás és sallang nélkül, ebben a formátumban:
{
  "title": "Kaland címe",
  "opening": "Bevezető szöveg 3-4 mondatban.",
  "character": "Karaktered neve és szerepe",
  "decisions": [
    {
      "id": 1,
      "situation": "Helyzet leírása 2-3 mondatban az adott korban.",
      "dilemma": "A döntési kérdés és dilemma.",
      "choices": [
        {
          "id": "a",
          "icon": "⚔️",
          "label": "Rövid cselekvési label",
          "description": "Egy mondatos ok-okozati magyarázat arról, mit tennél.",
          "isHistorical": true,
          "consequence": "Közvetlen következmény 2-3 mondatban az adott döntés után.",
          "historicalFact": "Valódi történelmi tény és magyarázat, miért ez volt a helyes döntés történelmileg."
        },
        {
          "id": "b",
          "icon": "🏃",
          "label": "Másik választás",
          "description": "Alternatív cselekvés leírása.",
          "isHistorical": false,
          "consequence": "Kedvezőtlen vagy váratlan következmény.",
          "historicalFact": "Hogyan tért el ez a javaslat a valós történelmi tényektől."
        },
        {
          "id": "c",
          "icon": "🤝",
          "label": "Harmadik választás",
          "description": "Harmadik alternatív cselekvés.",
          "isHistorical": false,
          "consequence": "Politikai vagy katonai következmény részletezése.",
          "historicalFact": "A valódi történelmi tények bemutatása."
        }
      ]
    }
  ],
  "historicalOutcome": "Rövid összefoglaló, hogy mi történt valójában ebben az időszakban.",
  "conclusion": "Záró történelmi értékelő és tanulságos szöveg magyarul."
}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(new Error("Timeout")), 90000);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("API hiba");
      }

      const resData = await response.json();
      let rawText = resData?.text || "";

      // Clean Markdown markers if present
      const jsonMatch = rawText.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      if (jsonMatch) {
         rawText = jsonMatch[0];
      } else {
        if (rawText.includes("```json")) {
          rawText = rawText.split("```json")[1]?.split("```")[0] || rawText;
        } else if (rawText.includes("```")) {
          rawText = rawText.split("```")[1]?.split("```")[0] || rawText;
        }
      }

      const parsed: RoleplayScenario = JSON.parse(rawText.trim());
      
      // Ensure we have correct number of decisions or fill up with offline templates
      if (!parsed.decisions || parsed.decisions.length === 0) {
        throw new Error("Nem jött át elég döntési pont");
      }

      // Cap or pad to match chosen count
      let finalDecisions = parsed.decisions;
      if (finalDecisions.length < decisionCount) {
        const fallback = getOfflineScenario(topic, decisionCount);
        while (finalDecisions.length < decisionCount) {
          const nextIdx = finalDecisions.length;
          finalDecisions.push(fallback.decisions[nextIdx % fallback.decisions.length]);
        }
      } else if (finalDecisions.length > decisionCount) {
        finalDecisions = finalDecisions.slice(0, decisionCount);
      }

      parsed.decisions = finalDecisions.map((dp, idx) => ({
        ...dp,
        id: idx + 1
      }));

      setLoadedScenario(parsed);
      setCurrentDecisionIndex(0);
      setDecisionsHistory([]);
      setCorrectCount(0);
      setPhase("game");
    } catch (err) {
      console.warn("Nem sikerült eléri az AI-t vagy hibás válasz jött, offline sablon betöltése...", err);
      // Fallback robustly
      const backup = getOfflineScenario(topic, decisionCount);
      setLoadedScenario(backup);
      setCurrentDecisionIndex(0);
      setDecisionsHistory([]);
      setCorrectCount(0);
      setPhase("game");
    }
  };

  const handleSelectChoice = (choice: Choice) => {
    setSelectedChoice(choice);
    
    // Play sound or reaction
    if (choice.isHistorical) {
      triggerMascotAct("correct");
    } else {
      triggerMascotAct("wrong");
    }

    setPhase("consequence");
  };

  const handleNextStep = () => {
    if (!loadedScenario || !selectedChoice) return;

    // Save decision history
    const currentPoint = loadedScenario.decisions[currentDecisionIndex];
    const isCorrect = selectedChoice.isHistorical;

    setDecisionsHistory(prev => [
      ...prev,
      {
        situation: currentPoint.situation,
        chosenLabel: selectedChoice.label,
        isCorrect: isCorrect,
        consequence: selectedChoice.consequence,
        fact: selectedChoice.historicalFact
      }
    ]);

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }

    // Go to next decision or end game
    if (currentDecisionIndex + 1 < loadedScenario.decisions.length) {
      setCurrentDecisionIndex(prev => prev + 1);
      setSelectedChoice(null);
      setPhase("game");
    } else {
      // Calculate final score & update global state
      const basePoints = loadedScenario.decisions.length * 15;
      const accuracyPct = isCorrect 
        ? ((correctCount + 1) / loadedScenario.decisions.length) * 100 
        : (correctCount / loadedScenario.decisions.length) * 100;
        
      const bonusPct = accuracyPct >= 80 ? 30 : accuracyPct >= 50 ? 15 : 0;
      const totalEarned = basePoints + bonusPct;
      setXpEarnedTotal(totalEarned);

      // Save persistent XP and check badge
      saveXpAndStreak(totalEarned);

      // Award "time_traveler" badge
      const earnedBadges = localStorage.getItem("hq_badges");
      let badgesList: string[] = earnedBadges ? JSON.parse(earnedBadges) : [];
      if (!badgesList.includes("time_traveler")) {
        badgesList.push("time_traveler");
        localStorage.setItem("hq_badges", JSON.stringify(badgesList));
        setBadgeUnlocked(true);
        triggerMascotAct("levelUp", "Kinyitottad az Időutazó 🕰️ raritást!");
      } else {
        triggerMascotAct("quizCompleted", `Elképesztő történet! ${totalEarned} XP bónusszal távozol.`);
      }

      setPhase("ending");
    }
  };

  // SVG Silhouette based on Scenario type for authentic medieval look
  const getEraSilhouette = () => {
    const scenarioStr = loadedScenario?.title || topic || "";
    if (scenarioStr.includes("Honfoglaló") || scenarioStr.includes("lovag") || scenarioStr.includes("Hunyadi")) {
      return (
        <svg viewBox="0 0 100 120" className="w-full h-full text-amber-100/20" fill="currentColor">
          {/* Knight Helmet & Shield Silhouette */}
          <path d="M50 15 C35 15 30 25 30 40 L30 65 C30 80 40 90 50 95 C60 90 70 80 70 65 L70 40 C70 25 65 15 50 15 Z" />
          <path d="M45 40 L55 40 L53 58 L47 58 Z" fill="#1e1b18" />
          <path d="M35 48 H65 V51 H35 Z" fill="#1e1b18" />
          {/* Shoulders */}
          <path d="M20 90 Q50 80 80 90 L85 115 H15 Z" />
        </svg>
      );
    }
    if (scenarioStr.includes("Római") || scenarioStr.includes("görög")) {
      return (
        <svg viewBox="0 0 100 120" className="w-full h-full text-amber-100/15" fill="currentColor">
          {/* Roman Centurion styled silhouette */}
          <path d="M50 10 L54 28 C64 28 66 38 66 45 L66 65 Q66 85 50 90 Q34 85 34 65 L34 45 C34 38 36 28 46 28 Z" />
          {/* Centurion brush plume */}
          <path d="M30 24 C30 14 42 10 50 10 C58 10 70 14 70 24 C62 18 58 18 50 18 C42 18 38 18 30 24 Z" fill="#6B1010" />
          <path d="M15 95 Q50 85 85 95 L90 120 H10 Z" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 100 120" className="w-full h-full text-amber-100/20" fill="currentColor">
        {/* Nobleman / Citizen profile with vintage coat silhouette */}
        <circle cx="50" cy="40" r="22" />
        <path d="M25 80 Q50 72 75 80 L80 125 H20 Z" />
        <path d="M45 61 L55 61 L58 85 L42 85 Z" fill="#4B0808" />
      </svg>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10" id="roleplay-root-container">
      {/* Back button */}
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={onGoHome}
          className="inline-flex items-center gap-2 text-xs font-cinzel text-[#FFF5E0] uppercase tracking-widest hover:text-white transition-colors border border-amber-500/20 px-3 py-1.5 bg-[#4A0808]/40"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Főmenü</span>
        </button>
        <span className="font-cinzel text-[11px] text-[#B8860B] uppercase tracking-widest border-b border-[#B8860B]/30 pb-0.5">
          ⚔️ TÖRTÉNELMI SZEREPJÁTÉK
        </span>
      </div>

      <AnimatePresence mode="wait">
        {/* Phase 1: Settings Screen */}
        {phase === "settings" && (
          <motion.div
            key="rp-settings"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="medieval-card p-6 sm:p-10"
          >
            <div className="ruled-lines p-2 text-center mb-8 max-w-2xl mx-auto">
              <Scroll className="w-10 h-10 text-[#6B1010] mx-auto mb-4 animate-pulse" />
              <h1 className="text-3xl sm:text-4xl font-cinzel font-bold text-[#6B1010] mb-2 leading-none">
                Történelmi Szerepjáték
              </h1>
              <p className="text-sm text-[#1C0E04] font-lora italic leading-[1.8]">
                Lépj be a történelembe! Hozz döntéseket és alakítsd a történelmet!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-6">
              {/* Left Column: Grade & Topic Selectors */}
              <div className="space-y-6">
                <div>
                  <TopicSelector selectedTopic={topic} onTopicChange={setTopic} onGradeChange={setGrade} />
                </div>
              </div>

              {/* Right Column: Difficulty Selection & Start button */}
              <div className="space-y-6 flex flex-col justify-between">
                <div>
                  <label className="block font-cinzel font-bold text-[11px] uppercase tracking-wider text-[#6B1010]/80 mb-2">
                    Döntési Pontok Száma (Nehézség)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: "Könnyű", desc: "3 pont" },
                      { name: "Közepes", desc: "5 pont" },
                      { name: "Nehéz", desc: "7 pont" }
                    ].map((d) => (
                      <button
                        key={d.name}
                        type="button"
                        onClick={() => setDifficulty(d.name as any)}
                        className={`py-3 px-2 flex flex-col items-center justify-center border cursor-pointer transition-all ${
                          difficulty === d.name
                            ? "bg-[#6B1010] text-[#FFF5E0] border-[#B8860B]"
                            : "bg-[#FFFDD0]/30 hover:bg-[#FFFDD0]/60 border-[#B8860B]/30 text-[#1C0E04]"
                        }`}
                      >
                        <span className="font-cinzel font-bold text-[11px]">{d.name}</span>
                        <span className="text-[11px] font-mono opacity-80 mt-0.5">{d.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#4A0808]/5 border border-[#B8860B]/20 p-4 rounded-none">
                  <span className="font-cinzel font-bold text-[11px] text-[#6B1010] block mb-1 uppercase tracking-widest">PEDAGÓGIAI ALAPOK</span>
                  <p className="font-lora text-[11px] text-[#1C0E04]/80 leading-[1.8]">
                    A szcenáriók a 2020-as Nemzeti Alaptanterv (NAT) törzsanyagaira épülnek. A döntések során figyelembe kell venni a valós történelmi körülményeket és geopolitikai érdekeket.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#B8860B]/25">
              <button
                onClick={handleStartAdventure}
                className="w-full bg-[#6B1010] hover:bg-[#801515] text-[#FFF5E0] font-cinzel font-bold uppercase tracking-[0.2em] px-6 py-5 border border-[#B8860B] rounded-none shadow-md cursor-pointer transition-all flex items-center justify-center gap-3 text-sm btn-shine-effect"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Kaland indítása</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Phase 2: Loading screen with rotating scroll & Árpád instruction */}
        {phase === "loading" && (
          <motion.div
            key="rp-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="medieval-card p-10 text-center flex flex-col items-center justify-center min-h-[400px]"
          >
            <div className="relative mb-8">
              <div className="w-20 h-20 border-3 border-dashed border-[#B8860B] rounded-full animate-spin flex items-center justify-center" />
              <Scroll className="w-8 h-8 text-[#6B1010] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            
            <h3 className="font-cinzel font-bold text-lg text-[#6B1010] mb-2 uppercase tracking-widest">
              Árpád lovag üzeni:
            </h3>
            <p className="text-[#1C0E04] font-lora text-sm max-w-md italic leading-[1.8]">
              &quot;{loadingText}&quot;
            </p>
            <div className="mt-6 text-[11px] font-cinzel text-[#8A6F27] tracking-widest uppercase animate-pulse">
              A történelem fonalának összefonása...
            </div>
          </motion.div>
        )}

        {/* Phase 3: Active Game Screen */}
        {phase === "game" && loadedScenario && (
          <motion.div
            key="rp-game"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
          >
            {/* Left Side Column: Atmospheric Scene Panel */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
              {/* Story scroll page in authentic parchment look */}
              <div className="bg-[#FDFAE3] border-4 border-double border-[#8C6D12] text-[#1C0E04] p-5 sm:p-8 relative overflow-hidden shadow-2xl flex-1 flex flex-col justify-between">
                
                {/* Vintage vignette shading */}
                <div className="absolute inset-0 bg-radial-gradient from-transparent to-amber-950/5 pointer-events-none" />

                {/* Ribbon details top corners */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#8C6D12]/30 m-2" />
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#8C6D12]/30 m-2" />

                <div>
                  <div className="flex justify-between items-center mb-4 border-b border-[#8C6D12]/20 pb-2">
                    <span className="font-cinzel text-xs font-bold text-[#6B1010] tracking-widest uppercase truncate max-w-[80%]">
                      {loadedScenario.title}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#8C6D12] shrink-0">
                      {currentDecisionIndex + 1} / {loadedScenario.decisions.length}
                    </span>
                  </div>

                  {/* Show Opening scene on 1st slide, or standard scene situation */}
                  {currentDecisionIndex === 0 && decisionsHistory.length === 0 ? (
                    <div className="space-y-4 animate-fadeIn">
                      <p className="font-lora text-sm sm:text-base leading-[1.8] text-justify italic font-medium pt-2">
                        {loadedScenario.opening}
                      </p>
                      <div className="bg-[#6B1010]/5 border border-[#6B1010]/15 p-3.5 my-3">
                        <span className="block font-cinzel font-bold text-[11px] text-[#6B1010] tracking-widest uppercase mb-1">
                          Karaktered és Szereped:
                        </span>
                        <p className="font-cinzel font-bold text-xs text-[#1C0E04]">
                          🎭 {loadedScenario.character}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {/* Standard situation text */}
                  {(currentDecisionIndex > 0 || decisionsHistory.length > 0) && (
                    <div className="space-y-4">
                      <p className="font-lora text-sm sm:text-base leading-[1.8] text-[#1C0E04] text-justify">
                        {loadedScenario.decisions[currentDecisionIndex].situation}
                      </p>
                    </div>
                  )}

                  {/* The core Historical dilemma statement */}
                  <div className="mt-6 bg-[#6B1010]/10 border-l-4 border-[#6B1010] p-4">
                    <span className="font-cinzel font-bold text-[11px] tracking-wider uppercase text-[#6B1010] block mb-1">
                      Kihívás előtt állsz:
                    </span>
                    <p className="font-lora font-bold text-xs text-[#1C0E04] leading-[1.8] italic">
                      &quot;{loadedScenario.decisions[currentDecisionIndex].dilemma}&quot;
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-8">
                  <div className="w-full bg-amber-900/10 h-1.5 rounded-none overflow-hidden border border-amber-900/10">
                    <div 
                      className="bg-[#6B1010] h-full transition-all duration-300"
                      style={{ width: `${((currentDecisionIndex) / loadedScenario.decisions.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-cinzel font-bold text-[#8C6D12]/80 uppercase tracking-widest block text-right mt-1.5">
                    {currentDecisionIndex} / {loadedScenario.decisions.length} döntés végrehajtva
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side Column: Portrait + Choices Panel */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
              {/* Silhouette portrait box */}
              <div className="bg-[#1C0E04]/50 border border-[#B8860B]/40 p-4 flex flex-col items-center justify-center relative aspect-[4/3] sm:aspect-auto sm:h-44 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  {getEraSilhouette()}
                </div>
                <div className="absolute bottom-2 text-center">
                  <span className="font-cinzel text-[11px] tracking-widest uppercase text-[#FFF5E0]/60 block">Személyes profil</span>
                  <span className="font-cinzel font-bold text-xs text-[#FFF5E0]">{loadedScenario.character}</span>
                </div>
              </div>

              {/* Action buttons list */}
              <div className="space-y-3 flex-1 flex flex-col justify-end">
                <span className="font-cinzel font-bold text-[11px] uppercase tracking-wider text-[#FFF5E0]/70 block mb-1">
                  Válassz egy megoldást és vállald a következményét:
                </span>
                {loadedScenario.decisions[currentDecisionIndex].choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => handleSelectChoice(choice)}
                    className="w-full text-left bg-gradient-to-r from-[#4A0808]/70 to-[#1C0E04]/80 hover:from-[#6B1010]/80 hover:to-[#4A0808]/90 border border-[#B8860B]/40 hover:border-[#B8860B] px-4 py-3 cursor-pointer transition-all flex items-start gap-3 text-white group"
                  >
                    <span className="text-xl bg-[#FFF]/10 p-1.5 border border-white/10 group-hover:scale-110 transition-transform shrink-0">
                      {choice.icon || "🛡️"}
                    </span>
                    <div className="space-y-0.5 min-w-0">
                      <span className="font-cinzel font-bold text-xs text-[#E8CB88] block group-hover:text-[#F8E3B6] transition-colors truncate">
                        {choice.label}
                      </span>
                      <p className="font-lora text-[11px] text-gray-300 leading-normal line-clamp-2">
                        {choice.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Phase 4: Immediate consequence & Historical fact box */}
        {phase === "consequence" && loadedScenario && selectedChoice && (
          <motion.div
            key="rp-consequence"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="medieval-card p-6 sm:p-10"
          >
            <div className="border-b border-[#B8860B]/20 pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="text-[11px] font-cinzel font-bold text-[#8C6D12] block uppercase tracking-wide">
                  DÖNTÉSED KÖVETKEZMÉNYE · {selectedChoice.isHistorical ? "BÖLCS DÖNTÉS" : "ALTERNATÍV ÖSVÉNY"}
                </span>
                <h3 className="text-xl font-cinzel font-bold text-[#6B1010] mt-1">
                  {selectedChoice.label}
                </h3>
              </div>
              <div className={`px-3 py-1 text-[11px] font-cinzel font-bold uppercase tracking-widest ${
                selectedChoice.isHistorical ? "bg-emerald-900/10 text-emerald-800 border-emerald-500/30" : "bg-amber-900/10 text-amber-800 border-amber-500/30"
              } border`}>
                {selectedChoice.isHistorical ? "📜 Történelmi Választás" : "🌀 Eltérő alternatíva"}
              </div>
            </div>

            {/* Mascot reaction speech bubble */}
            <div className="bg-[#FFFEE0] border-l-4 border-[#B8860B] p-4 my-6 flex items-start gap-3">
              <span className="text-2xl pt-1">🛡️</span>
              <div className="space-y-1">
                <span className="block font-cinzel font-bold text-[11px] uppercase tracking-wider text-[#6B1010]">
                  Árpád lovag reakciója:
                </span>
                <p className="font-lora italic text-[13px] text-[#1C0E04] font-medium">
                  {selectedChoice.isHistorical 
                    ? "„Bölcs döntés, vitéz! Keresve sem találhattál volna hűbb taktikát a kor krónikáiból!”" 
                    : "„Hmm, a történelem kereke mást mutat... De a döntésed bátor ötlet, hasznos tanulsággal szolgál!”"}
                </p>
              </div>
            </div>

            <div className="space-y-6 font-lora text-sm text-[#1C0E04]">
              {/* Consequences text */}
              <div>
                <span className="font-cinzel text-[11px] font-bold tracking-wider uppercase text-[#6B1010]/80 block mb-1">Aminek fültanúja lettél:</span>
                <p className="leading-[1.8] text-[#1C0E04]">
                  {selectedChoice.consequence}
                </p>
              </div>

              {/* Golden Fact box */}
              <div className="border-2 border-dashed border-[#B8860B] bg-[#FDFAF4] p-5 sm:p-6 text-xs text-[#1C0E04] leading-[1.8] relative overflow-hidden">
                <div className="absolute top-2 right-2 opacity-10">
                  <Scroll className="w-16 h-16 text-[#6B1010]" />
                </div>
                <div className="flex items-center gap-2 font-cinzel font-bold text-[#6B1010] mb-2">
                  <span className="text-lg">📜</span>
                  <span className="text-[11px] uppercase tracking-widest">TÖRTÉNELMI TÉNY</span>
                </div>
                <p className="font-lora italic">
                  {selectedChoice.historicalFact}
                </p>
              </div>

              <div className="text-emerald-800 text-xs font-cinzel font-bold flex items-center gap-1.5 bg-emerald-900/5 py-2 px-3 border border-emerald-500/10">
                <span className="text-sm">🪙</span>
                <span>Kalandor bónusz: +15 XP hozzáadva a kódexedhez!</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#B8860B]/25 flex justify-end">
              <button
                onClick={handleNextStep}
                className="bg-[#6B1010] hover:bg-[#801515] text-[#FFF5E0] font-cinzel font-bold uppercase tracking-[0.2em] px-6 py-4 border border-[#B8860B] rounded-none cursor-pointer transition-colors"
              >
                Folytatás
              </button>
            </div>
          </motion.div>
        )}

        {/* Phase 5: Ending Screen / Scores & Stars */}
        {phase === "ending" && loadedScenario && (
          <motion.div
            key="rp-ending"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="medieval-card p-6 sm:p-10 text-center"
          >
            <div className="ruled-lines p-4 mb-6">
              <Award className="w-12 h-12 text-[#B8860B] mx-auto mb-3 animate-bounce" />
              <h2 className="text-3xl font-cinzel font-bold text-[#1C0E04] leading-none mb-1">
                Kaland Sikeresen Befejezve!
              </h2>
              <span className="font-cinzel text-[11px] text-[#6B1010] uppercase tracking-widest block">
                {loadedScenario.title} krónikája lezárult
              </span>
            </div>

            {/* Stars decoration */}
            <div className="flex justify-center gap-2 my-6">
              {[1, 2, 3].map((starIndex) => {
                const ratio = correctCount / loadedScenario.decisions.length;
                const starActive = starIndex === 1 || (starIndex === 2 && ratio >= 0.5) || (starIndex === 3 && ratio >= 0.85);
                return (
                  <Star 
                    key={starIndex} 
                    className={`w-8 h-8 ${starActive ? "text-[#B8860B] fill-current animate-pulse" : "text-gray-300"}`} 
                  />
                );
              })}
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto my-6 text-left">
              <div className="bg-white/40 p-4 border border-[#B8860B]/20">
                <span className="block font-cinzel text-[11px] uppercase tracking-wider text-[#6B1010]">Történelmi Hűség</span>
                <span className="text-lg font-cinzel font-bold text-[#1C0E04]">
                  {correctCount} / {loadedScenario.decisions.length} döntés ({Math.round((correctCount / loadedScenario.decisions.length) * 100)}%)
                </span>
              </div>
              <div className="bg-white/40 p-4 border border-[#B8860B]/20">
                <span className="block font-cinzel text-[11px] uppercase tracking-wider text-[#6B1010]">Tudásszint növekedés</span>
                <span className="text-lg font-cinzel font-bold text-[#6B1010]">
                  +{xpEarnedTotal} XP szerzett
                </span>
              </div>
            </div>

            {/* Badge Unlocked Frame if applicable */}
            {badgeUnlocked && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border-2 border-emerald-500 bg-emerald-900/5 p-4 my-6 text-left max-w-xl mx-auto flex items-center gap-5"
              >
                <div className="w-14 h-14 bg-[#FFF5D0] border-2 border-[#B8860B] rounded-full flex items-center justify-center text-3xl shrink-0 animate-spin-slow">
                  🕰️
                </div>
                <div>
                  <div className="flex items-center gap-1 text-emerald-800 font-cinzel font-bold text-xs uppercase tracking-wider">
                    <Sparkle className="w-3.5 h-3.5" />
                    <span>ÚJ JELVÉNY FELOLDVA!</span>
                  </div>
                  <h4 className="font-cinzel font-bold text-sm text-[#1C0E04] mt-0.5">Időutazó</h4>
                  <p className="font-lora text-xs text-[#1C0E04]/80 leading-snug">
                    Sikeresen teljesítettél legalább egy szerep játék kódexet és formáltad meg a történelmet.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Ratings and concluding summaries */}
            <div className="bg-[#FFFEE0]/50 border border-[#B8860B]/30 p-5 sm:p-6 text-left max-w-xl mx-auto space-y-4 my-6">
              <div>
                <span className="font-cinzel text-[11px] font-bold text-[#6B1010] tracking-wider uppercase block mb-1">Te így döntöttél az ösvényen:</span>
                <p className="font-lora text-[13px] text-[#1C0E04] leading-[1.8] italic">
                  &quot;Bátran kísérleteztél a döntéseiddel. Törekedtél megtalálni az egykori vezetők logikáját.&quot;
                </p>
              </div>

              <div>
                <span className="font-cinzel text-[11px] font-bold text-[#6B1010] tracking-wider uppercase block mb-1">A történelemben valójában:</span>
                <p className="font-lora text-[12px] text-[#1C0E04]/95 leading-[1.8]">
                  {loadedScenario.historicalOutcome}
                </p>
              </div>

              <div className="pt-2 border-t border-[#B8860B]/15">
                <span className="font-cinzel text-[11px] font-bold text-[#6B1010] tracking-wider uppercase block mb-1">Történelmi Értékelés:</span>
                <p className="font-lora text-[12px] text-[#1C0E04]">
                  {loadedScenario.conclusion}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#B8860B]/25 flex flex-col sm:flex-row justify-center gap-3 max-w-xl mx-auto">
              <button
                onClick={() => setPhase("settings")}
                className="flex-1 bg-[#1C0E04]/90 hover:bg-[#1C0E04] text-[#FFF5E0] font-cinzel font-bold uppercase tracking-wider px-6 py-4 border border-[#B8860B]/50 rounded-none cursor-pointer text-xs flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Új kaland</span>
              </button>
              <button
                onClick={onGoHome}
                className="flex-1 bg-[#6B1010] hover:bg-[#801515] text-[#FFF5E0] font-cinzel font-bold uppercase tracking-wider px-6 py-4 border border-[#B8860B]/50 rounded-none cursor-pointer text-xs flex items-center justify-center gap-2"
              >
                Főmenü
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
