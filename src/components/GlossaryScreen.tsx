import React, { useState, useEffect, useRef } from "react";
import { 
  BookOpen, 
  Search, 
  Loader2, 
  ChevronLeft, 
  Trash2, 
  Printer, 
  ArrowLeftRight, 
  History, 
  FileText, 
  Plus, 
  Check, 
  Sparkles,
  BookOpenCheck,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Grade } from "../types";
import { TopicSelector } from "./TopicSelector";
import { triggerMascotAct } from "./KnightMascot";

interface GlossaryScreenProps {
  onGoHome: () => void;
}

interface ArticleSection {
  heading: string;
  content: string;
}

interface KeyFact {
  label: string;
  value: string;
}

interface TimelineItem {
  year: string;
  event: string;
}

interface ConceptArticle {
  title: string;
  subtitle: string;
  summary: string;
  sections: ArticleSection[];
  keyFacts: KeyFact[];
  relatedConcepts: string[];
  timeline: TimelineItem[];
  significance: string;
}

interface CompareResult {
  concept1: {
    title: string;
    korszak: string;
    helyszin: string;
    foszereplok: string;
    jelentoseg: string;
    kovetkezmenyek: string;
  };
  concept2: {
    title: string;
    korszak: string;
    helyszin: string;
    foszereplok: string;
    jelentoseg: string;
    kovetkezmenyek: string;
  };
}

interface JournalItem {
  term: string;
  definition: string;
  period: string;
}

const SUGGESTED_MAP: Record<string, string[]> = {
  "Őskor és az ókori Kelet": ["Neolitikum", "Hammurapi", "Múmia", "Ékírás", "Öntözéses gazdálkodás", "Monoteizmus", "Fáraó", "Gízai piramisok"],
  "Az ókori görög civilizáció": ["Polisz", "Démosz", "Arisztokrácia", "Periklész", "Demokrácia", "Olümpiák", "Spárta", "Milétoszi Thálész"],
  "Az ókori Róma": ["Patrícius", "Plebejus", "Szenátus", "Julius Caesar", "Augustus", "Légió", "Gladiátor", "Constantinus"],
  "Népvándorlás és a magyarok eredete": ["Uráli nyelvcsalád", "Nomád életmód", "Római Birodalom bukása", "Kettős honfoglalás", "Törzsszövetség", "Jurta"],
  "Honfoglalás és az Árpád-kor": ["Árpád vezér", "Szent István", "Aranybulla", "Királyi vármegye", "Kalandozások", "Szent Gellért", "Vérszerződés"],
  "A középkori Európa": ["Hűbérbirtok", "Céhrendszer", "Keresztes hadjáratok", "Skolasztika", "Nagy Károly", "Pápaság", "Szerzetesrendek"],
  "Magyar Királyság az Árpád-korban": ["I. István", "I. László", "Könyves Kálmán", "II. András", "Tatárjárás", "IV. Béla", "Muhi csata"],
  "Késő középkor – Hunyadiak kora": ["Hunyadi János", "Hunyadi Mátyás", "Nándorfehérvári diadal", "Fekete sereg", "Királyi kancellária", "Füstpénz"],
  "Kora újkor és reformáció": ["Luther Márton", "Kálvin János", "Könyvnyomtatás", "Földrajzi felfedezések", "Amerigo Vespucci", "Ellenreformáció"],
  "A török hódoltság Magyarországon": ["Mohácsi csata", "Buda bevétele", "Végvári rendszer", "Zrínyi Miklós", "Egri vár védelme", "Két pogány közt"],
  "Felvilágosodás és francia forradalom": ["Jean-Jacques Rousseau", "Montesquieu", "Hármas hatalmi ág", "Bastille bevétele", "Jakobinus diktatúra", "Emberi Jogok Nyilatkozata"],
  "A napóleoni korszak": ["Napóleon Bonaparte", "Waterlooi csata", "Code Civil", "Oroszországi hadjárat", "Trafalgari csata"],
  "Reformkor és 1848–49": ["Széchenyi István", "Kossuth Lajos", "Márciusi ifjak", "12 pont", "Áprilisi törvények", "Világosi fegyverletétel"],
  "Az ipari forradalom": ["Gőzgép", "James Watt", "Futószalagos gyártás", "Urbanizáció", "Vasútvonalak", "Monopóliumok"],
  "Az első világháború": ["Szarajevói merénylet", "Schlieffen-terv", "Állóháború", "Hármas szövetség", "Antant hatalmak", "Trianoni békeszerződés"],
  "A két háború közötti időszak": ["Nagy gazdasági világválság", "New Deal", "Bethlen István", "Horthy Miklós", "Kisantant"],
  "A második világháború": ["Molotov-Ribbentrop paktum", "Blitzkrieg", "Sztálingrádi csata", "Normandiai partraszállás", "Holokauszt", "Jaltai konferencia"],
  "A hidegháború": ["Vasfüggöny", "Berlini fal", "Kubai rakétaválság", "Varsói Szerződés", "NATO", "Vietnami háború", "Mihail Gorbacsov"],
  "Magyarország 1945–1990": ["Rákosi Mátyás", "1956-os forradalom", "Nagy Imre", "Kádár János", "Gulyáskommunizmus", "Rendszerváltás", "Szuverenitás"],
  "Rendszerváltás és jelenkor": ["Kerekasztal-tárgyalások", "Nagy Imre újratemetése", "Európai Unió", "Demokratikus parlamentarizmus", "Alkotmányozás"],
  "Teljes középiskolai anyag": ["Szent István", "Mohácsi csata", "Reformkor", "1956-os forradalom", "Aranybulla", "Trianon", "Hunyadi Mátyás"],
  "Érettségi felkészítő – egyetemes történelem": ["Demokrácia", "Julius Caesar", "Felvilágosodás", "Hidegháború", "Ipari forradalom", "Első világháború"],
  "Érettségi felkészítő – magyar történelem": ["Aranybulla", "Kossuth Lajos", "Kádár-korszak", "Horthy Miklós", "Hunyadi Mátyás", "Szent István"]
};

const DEFAULT_SUGGESTIONS = [
  "Szent István",
  "Mohácsi csata",
  "Reformkor",
  "1956-os forradalom",
  "Aranybulla",
  "Trianoni békeszerződés",
  "Hunyadi Mátyás",
  "Demokrácia"
];

const LOADING_PHRASES = [
  "Kutatom a krónikákat...",
  "Pergetek a tekercsen...",
  "Hamarosan megvan!"
];

export default function GlossaryScreen({ onGoHome }: GlossaryScreenProps) {
  const [grade, setGrade] = useState<string>("⚱️ Őskor és ókori Kelet");
  const [topic, setTopic] = useState<string>("Az őskor korszakai és jellemzői");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPhrase, setLoadingPhrase] = useState(LOADING_PHRASES[0]);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  // Explorer states
  const [activeArticle, setActiveArticle] = useState<ConceptArticle | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [journal, setJournal] = useState<JournalItem[]>([]);
  const [showJournal, setShowJournal] = useState(false);

  // Compare states
  const [isComparing, setIsComparing] = useState(false);
  const [showCompareInput, setShowCompareInput] = useState(false);
  const [compareSearch, setCompareSearch] = useState("");
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  // Load history & journal
  useEffect(() => {
    const hist = localStorage.getItem("hq_glossary_history");
    if (hist) {
      setSearchHistory(JSON.parse(hist));
    }
    const jr = localStorage.getItem("hq_glossary_journal");
    if (jr) {
      setJournal(JSON.parse(jr));
    }
  }, []);

  // Sync journal with local storage
  const saveJournal = (newJr: JournalItem[]) => {
    setJournal(newJr);
    localStorage.setItem("hq_glossary_journal", JSON.stringify(newJr));
  };

  // Sync search history
  const addtoHistory = (term: string) => {
    const filtered = searchHistory.filter(h => h.toLowerCase() !== term.toLowerCase());
    const updated = [term, ...filtered].slice(0, 5);
    setSearchHistory(updated);
    localStorage.setItem("hq_glossary_history", JSON.stringify(updated));
  };

  // Rotate loading text
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (loading || compareLoading) {
      let idx = 0;
      t = setInterval(() => {
        idx = (idx + 1) % LOADING_PHRASES.length;
        setLoadingPhrase(LOADING_PHRASES[idx]);
        triggerMascotAct('fact', LOADING_PHRASES[idx]);
      }, 2000);
    }
    return () => clearInterval(t);
  }, [loading, compareLoading]);

  // Handle Search API
  const handleSearch = async (termToSearch: string, isFromBreadcrumb = false) => {
    if (!termToSearch.trim()) return;
    setLoading(true);
    setSearch(termToSearch);
    setIsComparing(false);
    setShowCompareInput(false);
    setCompareResult(null);
    setErrorCode(null);
    
    // Set first mascot speech
    triggerMascotAct('fact', LOADING_PHRASES[0]);

    try {
      const prompt = `Magyar középiskolai történelemtanár vagy (NAT 2020).
Generálj részletes enciklopédia cikket erről: ${termToSearch}
Évfolyam kontextus: ${grade}
CSAK valid JSON:
{
  "title": "${termToSearch}",
  "subtitle": "Rövid alcím/korszak",
  "summary": "2-3 mondatos összefoglaló a témáról.",
  "sections": [
    {
      "heading": "Szekció cím (pl. Előzmények/Események/Hatások)",
      "content": "Részletes történelmi kifejtés. [[kapcsolódó fogalom]] formátumban jelöld a legfontosabb kapcsolódó történelmi fogalmakat, neveket vagy évszámokat a bekezdésben."
    }
  ],
  "keyFacts": [
    {"label": "Dátum", "value": "Érték/Évszám"},
    {"label": "Helyszín", "value": "Érték"},
    {"label": "Főszereplő", "value": "Érték"}
  ],
  "relatedConcepts": ["kapcsolódó1", "kapcsolódó2", "kapcsolódó3"],
  "timeline": [
    {"year": "Évszám", "event": "Rövid esemény leírás"}
  ],
  "significance": "Miért fontos ez a fogalom a magyar érettségin?"
}`;

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) {
        throw new Error("Generálás hiba");
      }

      const resData = await response.json();
      let cleanText = resData.text || "";
      if (cleanText.trim().startsWith("```json")) {
        cleanText = cleanText.replace(/```json|```/g, "").trim();
      } else if (cleanText.trim().startsWith("```")) {
        cleanText = cleanText.replace(/```/g, "").trim();
      }

      const parsed: ConceptArticle = JSON.parse(cleanText);
      setActiveArticle(parsed);
      addtoHistory(parsed.title || termToSearch);

      // Handle breadcrumbs navigation
      if (!isFromBreadcrumb) {
        setBreadcrumbs(prev => {
          // If already in path, slice to it, else append
          const lowerTerms = prev.map(p => p.toLowerCase());
          const existIdx = lowerTerms.indexOf(termToSearch.toLowerCase());
          if (existIdx !== -1) {
            return prev.slice(0, existIdx + 1);
          }
          return [...prev, parsed.title || termToSearch];
        });
      }

      triggerMascotAct('fact', "Megleltem a kódexben!");

    } catch (e) {
      console.error(e);
      setErrorCode("Sajnos nem sikerült beolvasni a kódexeket erről a fogalomról. Próbáld újra!");
      triggerMascotAct('wrong');
    } finally {
      setLoading(false);
    }
  };

  // Compare API
  const handleCompareSubmit = async () => {
    if (!activeArticle || !compareSearch.trim()) return;
    setCompareLoading(true);
    setErrorCode(null);

    triggerMascotAct('fact', "Összevetem a pergameneket...");

    try {
      const prompt = `Magyar középiskolai történelemtanár vagy (NAT 2020).
Hasonlítsd össze a következő két fogalmat: '${activeArticle.title}' és '${compareSearch}'.
CSAK valid JSON-t adj vissza pontosan ebben a formátumban, markdown kódjelek nélkül:
{
  "concept1": {
    "title": "${activeArticle.title}",
    "korszak": "Történelmi korszak leírása",
    "helyszin": "Földrajzi helyszín kiterjedés",
    "foszereplok": "Kulcsszereplők nevei",
    "jelentoseg": "Érettségi jelentőség és tartalom",
    "kovetkezmenyek": "Következmények és örökség"
  },
  "concept2": {
    "title": "${compareSearch}",
    "korszak": "Történelmi korszak leírása",
    "helyszin": "Földrajzi helyszín kiterjedés",
    "foszereplok": "Kulcsszereplők nevei",
    "jelentoseg": "Érettségi jelentőség és tartalom",
    "kovetkezmenyek": "Következmények és örökség"
  }
}`;

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) throw new Error("Compare failed");

      const resData = await response.json();
      let cleanText = resData.text || "";
      if (cleanText.trim().startsWith("```json")) {
        cleanText = cleanText.replace(/```json|```/g, "").trim();
      } else if (cleanText.trim().startsWith("```")) {
        cleanText = cleanText.replace(/```/g, "").trim();
      }

      const parsed: CompareResult = JSON.parse(cleanText);
      setCompareResult(parsed);
      setIsComparing(true);
      setShowCompareInput(false);
      triggerMascotAct('fact', "Itt az elemzés, vitéz tanuló!");

    } catch (e) {
      console.error(e);
      setErrorCode("Sikertelen összehasonlítás. Próbáld meg egy másik történelmi fogalommal!");
      triggerMascotAct('wrong');
    } finally {
      setCompareLoading(false);
    }
  };

  // Handle addition to student Concept journal
  const toggleJournalItem = () => {
    if (!activeArticle) return;
    const exists = journal.some(j => j.term.toLowerCase() === activeArticle.title.toLowerCase());
    if (exists) {
      // remove
      const updated = journal.filter(j => j.term.toLowerCase() !== activeArticle.title.toLowerCase());
      saveJournal(updated);
    } else {
      // add
      const newItem: JournalItem = {
        term: activeArticle.title,
        definition: activeArticle.summary,
        period: activeArticle.subtitle
      };
      saveJournal([...journal, newItem]);
      triggerMascotAct('correct');
    }
  };

  // Export all as black and white printable view
  const handleExportJournal = () => {
    if (journal.length === 0) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <title>HISTÓRIA FOGALOMNAPLÓ</title>
  <style>
    body { font-family: 'Times New Roman', serif; margin: 40px; color: #000; background: #fff; }
    h1 { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; text-transform: uppercase; }
    .term-block { margin-bottom: 25px; page-break-inside: avoid; }
    .term-title { font-size: 1.25rem; font-weight: bold; margin-bottom: 5px; text-decoration: underline; }
    .term-period { font-style: italic; font-size: 0.9rem; color: #555; }
    .term-definition { margin-top: 5px; line-height: 1.5; }
    @media print {
      body { margin: 0; padding: 15px; }
      @page { margin: 1cm; }
    }
  </style>
</head>
<body onload="window.print()">
  <h1>Saját Történelmi Fogalomnaplóm</h1>
  <div style="margin-bottom: 30px; text-align: center; font-style: italic;">
    Készült: ${new Date().toLocaleDateString('hu-HU')} | Rögzített fogalmak száma: ${journal.length} db
  </div>
  ${journal.map((item, idx) => `
    <div class="term-block">
      <div class="term-title">${idx + 1}. ${item.term} <span class="term-period">(${item.period})</span></div>
      <div class="term-definition">${item.definition}</div>
    </div>
  `).join('')}
</body>
</html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Render text containing [[concept]] links
  const renderContentWithLinks = (text: string) => {
    if (!text) return "";
    const parts = [];
    let currentIndex = 0;
    const regex = /\[\[([^\]]+)\]\]/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index;
      const fullMatch = match[0];
      const conceptName = match[1];

      if (matchIndex > currentIndex) {
        parts.push(text.substring(currentIndex, matchIndex));
      }

      parts.push(
        <button
          key={`link-${matchIndex}`}
          onClick={() => handleSearch(conceptName)}
          className="text-[#6B1010] hover:text-[#B8860B] underline font-bold transition-colors cursor-pointer mx-0.5"
        >
          {conceptName}
        </button>
      );

      currentIndex = matchIndex + fullMatch.length;
    }

    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Get active suggestions organized by Topic
  const activeSuggestions = SUGGESTED_MAP[topic] || DEFAULT_SUGGESTIONS;

  // Clear Breadcrumb / Back to Explorer Home
  const handleResetExplorer = () => {
    setActiveArticle(null);
    setBreadcrumbs([]);
    setIsComparing(false);
    setShowCompareInput(false);
    setCompareResult(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      
      {/* Breadcrumb Navigation Trail */}
      <div className="flex flex-wrap items-center gap-2 mb-6 text-xs sm:text-sm font-cinzel text-[#FFF5E0]/60 transition-all duration-200">
        <button 
          onClick={handleResetExplorer}
          className="hover:text-[#FFF5E0] active:scale-95 transition-transform cursor-pointer font-bold"
        >
          FOGALOMKUTATÓ
        </button>
        {breadcrumbs.map((b, idx) => (
          <React.Fragment key={idx}>
            <span className="text-[#B8860B]">/</span>
            <button
              onClick={() => {
                const targetPath = breadcrumbs.slice(0, idx + 1);
                setBreadcrumbs(targetPath);
                handleSearch(b, true);
              }}
              className={`hover:text-[#FFF5E0] hover:underline cursor-pointer active:scale-95 transition-transform ${
                idx === breadcrumbs.length - 1 ? "text-[#B8860B] font-bold" : ""
              }`}
            >
              {b}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Main Search Panel Card */}
      <div className="bg-[#1A0A03] p-6 border-2 border-[#B8860B] rounded-[3px] shadow-2xl mb-8 relative medieval-card">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6 border-b border-[#B8860B]/30 pb-4">
          <div>
            <h1 className="text-2xl font-cinzel font-bold text-[#FFF5E0] tracking-widest flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#B8860B]" />
              FOGALOMKUTATÓ
            </h1>
            <p className="text-[#FFF5E0]/60 text-xs font-lora mt-1 italic">
              Kutasd fel és vesd össze az érettségi legfontosabb történelmi fogalmait!
            </p>
          </div>
          
          {/* Dropdown filters for suggesting concepts */}
          <div className="bg-[#D8C3A5] p-3 rounded-[3px] border border-[#B8860B]/20 min-w-full lg:min-w-[400px]">
             <TopicSelector selectedTopic={topic} onTopicChange={setTopic} onGradeChange={setGrade} />
          </div>
        </div>

        {/* Large Search Input */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSearch(search); }}
          className="flex gap-2 rounded-[3px] overflow-hidden border-2 border-[#B8860B] focus-within:ring-1 focus-within:ring-[#B8860B]"
        >
          <div className="relative flex-1 bg-[#2A1005] flex items-center">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8860B]" />
            <input
              type="text"
              required
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Írj be egy történelmi fogalmat (pl. Aranybulla, Rákosi-korszak)..."
              className="w-full pl-12 pr-4 py-3 bg-transparent text-[#FFF5E0] font-lora text-sm focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#6B1010] hover:bg-[#801515] text-[#FFF5E0] font-cinzel font-bold tracking-wider text-xs px-6 py-3 cursor-pointer select-none transition-colors border-l border-[#B8860B] flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "KERESÉS"}
          </button>
        </form>

        {/* Suggested and scrollable Concept Chips */}
        <div className="mt-4">
          <p className="text-[11px] font-cinzel font-bold uppercase tracking-wider text-[#FFF5E0]/50 mb-2">Javasolt történelmi fogalmak ebben a témakörben:</p>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {activeSuggestions.map((term, i) => (
              <button
                key={i}
                onClick={() => handleSearch(term)}
                className="px-2.5 py-1 text-xs bg-[#4A1E05] hover:bg-[#B8860B]/20 text-[#FFF5E0] border border-[#B8860B]/40 rounded-full cursor-pointer transition-colors active:scale-95"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>

      {errorCode && (
        <div className="p-4 mb-6 bg-[#6B1010]/20 text-[#FCF3DB] border border-[#6B1010] rounded-[3px] text-sm font-lora">
          {errorCode}
        </div>
      )}

      {/* Main Content Areas */}
      <AnimatePresence mode="wait">
        
        {/* LOADING CONTAINER */}
        {(loading || compareLoading) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="relative mb-6">
              <Loader2 className="w-16 h-16 text-[#B8860B] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#FFF5D0] animate-pulse" />
              </div>
            </div>
            <p className="text-xl font-cinzel text-[#FFF5E0] tracking-widest uppercase font-bold text-center">
              {loadingPhrase}
            </p>
            <p className="text-sm font-lora text-[#FFF5E0]/60 mt-2 text-center max-w-sm">
              Levelesládák megnyitása, kódexek újraírása, krónikák rendezése...
            </p>
          </motion.div>
        )}

        {/* EMPTY STATE (No search loaded yet) */}
        {!loading && !compareLoading && !activeArticle && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-20 bg-[#1A0A03]/35 rounded-[3px] border border-[#B8860B]/20 px-6"
          >
            <BookOpenCheck className="w-16 h-16 text-[#B8860B]/30 mx-auto mb-4" />
            <h2 className="text-[#FFF5E0] font-cinzel font-bold text-xl uppercase tracking-widest">
              ⚔️ Mit szeretnél megismerni, vitéz?
            </h2>
            <p className="font-lora text-[#FFF5E0]/60 mt-2 max-w-lg mx-auto text-sm sm:text-base">
              Írj be egy tetszőleges korszakot vagy fogalmat a fenti kutatóba, de akár rákattinthatsz az előzmények vagy a témakör javaslataira is!
            </p>

            {/* Quick search history list */}
            {searchHistory.length > 0 && (
              <div className="mt-8 max-w-md mx-auto">
                <p className="text-xs font-cinzel font-bold uppercase tracking-wider text-[#FFF5E0]/40 mb-3 flex items-center justify-center gap-1.5">
                  <History className="w-3.5 h-3.5" /> Legutóbb keresett fogalmak:
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {searchHistory.slice(0, 3).map((histItem, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearch(histItem)}
                      className="px-3 py-1.5 bg-[#4A1E05]/40 hover:bg-[#4A1E05] hover:text-[#FFF5D0] border border-[#B8860B]/30 text-xs text-[#FFF5E0]/80 cursor-pointer rounded-[3px] transition-colors"
                    >
                      {histItem}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ACTIVE ARTICLE VIEW */}
        {!loading && !compareLoading && activeArticle && !isComparing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Header Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetExplorer}
                  className="px-3 py-1.5 border border-[#B8860B]/40 bg-[#4A1E05]/30 hover:bg-[#4A1E05] text-[#FFF5E0] rounded-[2px] cursor-pointer text-xs font-cinzel flex items-center gap-1 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Vissza
                </button>
                
                {/* COMPARE LAUNCH BUTTON */}
                <button
                  onClick={() => setShowCompareInput(!showCompareInput)}
                  className="px-3 py-1.5 bg-[#B8860B] hover:bg-[#D4A313] text-[#1C0E04] rounded-[2px] cursor-pointer text-xs font-cinzel font-bold flex items-center gap-1 shadow-md transition-all active:scale-95"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" /> Összehasonlítás
                </button>
              </div>

              {/* JOURNAL ADD BUTTON */}
              <button
                onClick={toggleJournalItem}
                className={`px-4 py-1.5 rounded-[2px] text-xs font-cinzel font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 ${
                  journal.some(j => j.term.toLowerCase() === activeArticle.title.toLowerCase())
                    ? "bg-green-800 text-white hover:bg-green-700"
                    : "bg-[#6B1010] hover:bg-[#801515] text-[#FFF5E0] border border-[#B8860B]"
                }`}
              >
                {journal.some(j => j.term.toLowerCase() === activeArticle.title.toLowerCase()) ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Mentve a Naplóba
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" /> Mentés a Naplóba
                  </>
                )}
              </button>
            </div>

            {/* Compare sliding input drawer */}
            {showCompareInput && (
              <div className="p-4 bg-[#2A1005] border border-[#B8860B] rounded-[3px] shadow-lg flex flex-col sm:flex-row gap-2 items-center">
                <span className="text-xs font-cinzel text-[#FFF5E0] uppercase font-bold shrink-0">
                  Mivel hasonlítsam össze?
                </span>
                <input
                  type="text"
                  required
                  value={compareSearch}
                  onChange={(e) => setCompareSearch(e.target.value)}
                  placeholder="Írd be a másik fogalmat..."
                  className="flex-1 px-3 py-1.5 bg-[#1A0A03] border border-[#B8860B]/50 text-[#FFF5E0] rounded-[3px] text-xs focus:outline-none focus:border-[#B8860B]"
                />
                <button
                  onClick={handleCompareSubmit}
                  className="bg-[#6B1010] hover:bg-[#801515] text-[#FFF5E0] px-4 py-1.5 text-xs font-cinzel font-bold rounded-[3px] cursor-pointer transition-colors shrink-0"
                >
                  Indítás
                </button>
              </div>
            )}

            {/* Encylopedia Article Card Style Screen */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* LEFT & CENTER CARD (Title, description, sections) */}
              <div className="lg:col-span-2 bg-[#FFF5D0] border-2 border-[#B8860B] rounded-[3px] p-6 shadow-xl relative overflow-hidden text-[#1C0E04]">
                
                {/* Elegant seal watermark or visual */}
                <div className="absolute right-4 top-4 opacity-10">
                  <BookOpen className="w-32 h-32 text-[#6B1010]" />
                </div>

                <div className="border-b-2 border-[#1C0E04]/20 pb-4 mb-6 relative">
                  <span className="text-[11px] font-cinzel font-bold text-[#6B1010] uppercase tracking-wider block mb-1">
                    HISTÓRIÁS ENCIKLOPÉDIA • {grade}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-cinzel font-bold text-[#6B1010] tracking-tight">
                    {activeArticle.title}
                  </h2>
                  <span className="inline-block mt-2 px-3 py-1 bg-[#2A1005] text-[#FFF5E0] text-[11px] sm:text-xs font-cinzel tracking-wider uppercase rounded-[2px] border border-[#B8860B]">
                    {activeArticle.subtitle || "Történelmi fogalom"}
                  </span>
                </div>

                {/* SUMMARY BOX: parchment layout */}
                <div className="bg-[#1C0E04]/5 border-l-4 border-[#B8860B] p-4 mb-6 rounded-r-[3px]">
                  <p className="font-lora italic text-sm sm:text-base leading-[1.8] text-[#1C0E04]">
                    {activeArticle.summary}
                  </p>
                </div>

                {/* FACTS LIST (pills horizontal scroll) */}
                {activeArticle.keyFacts && activeArticle.keyFacts.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[11px] font-cinzel font-bold text-[#6B1010] uppercase tracking-widest mb-2">FŐBB TÉNYEK • ADATOK:</p>
                    <div className="flex flex-wrap gap-2">
                      {activeArticle.keyFacts.map((fact, i) => (
                        <div key={i} className="px-3 py-1.5 bg-[#1C0E04]/10 rounded-[4px] text-xs font-lora">
                          <span className="font-cinzel font-bold text-[#6B1010] mr-1">{fact.label}:</span>
                          <span className="text-[#8B6508] font-bold">{fact.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SESSIONS / DISCUSSIONS TEXTS */}
                <div className="space-y-6">
                  {activeArticle.sections?.map((sec, i) => (
                    <div key={i} className="prose max-w-none">
                      <h3 className="font-cinzel font-bold text-[#6B1010] text-lg border-b border-[#1C0E04]/10 pb-1 mb-2">
                        {sec.heading}
                      </h3>
                      <p className="font-lora text-[#1C0E04]/90 text-sm sm:text-base leading-[1.8] whitespace-pre-wrap">
                        {renderContentWithLinks(sec.content)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* RELATED CONCEPTS AT BOTTOM */}
                {activeArticle.relatedConcepts && activeArticle.relatedConcepts.length > 0 && (
                  <div className="mt-8 pt-4 border-t border-[#1C0E04]/10">
                    <p className="text-xs font-cinzel font-bold text-[#6B1010] uppercase tracking-widest mb-2">
                      Kapcsolódó történelmi fogalmak:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {activeArticle.relatedConcepts.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSearch(item)}
                          className="px-3 py-1 bg-[#1C0E04]/10 hover:bg-[#6B1010]/20 text-[#6B1010] text-xs font-semibold rounded-[4px] cursor-pointer transition-all border border-[#1C0E04]/10"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT SIDE DETAILS (Timeline + Significance) */}
              <div className="space-y-6">
                
                {/* TIMELINE BOX */}
                {activeArticle.timeline && activeArticle.timeline.length > 0 && (
                  <div className="bg-[#FFF5D0] border border-[#B8860B]/70 rounded-[3px] p-5 shadow-lg text-[#1C0E04]">
                    <h3 className="text-sm font-cinzel font-bold text-[#6B1010] uppercase tracking-widest border-b border-[#1C0E04]/20 pb-2 mb-4 flex items-center gap-1.5">
                      <FileText className="w-4 h-4" /> Időrendi áttekintés
                    </h3>
                    <div className="relative border-l border-[#B8860B]/60 pl-4 ml-2 space-y-4">
                      {activeArticle.timeline.map((point, k) => (
                        <div key={k} className="relative">
                          {/* Dot */}
                          <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#B8860B]" />
                          <span className="font-mono text-xs font-bold text-[#6B1010] bg-[#1C0E04]/5 px-2 py-0.5 rounded border border-[#B8860B]/20">
                            {point.year}
                          </span>
                          <p className="font-lora text-xs text-[#1C0E04]/90 mt-1 max-w-full">
                            {point.event}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SIGNIFICANCE GAUGE / MATURA CRITICAL WARNING */}
                <div className="bg-[#EEF8E9] border-2 border-green-700/60 rounded-[3px] p-5 shadow-lg text-[#1A330E]">
                  <h3 className="text-xs font-cinzel font-bold text-green-800 uppercase tracking-widest border-b border-green-700/20 pb-2 mb-3 flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> Érettségi szempontból:
                  </h3>
                  <p className="font-lora text-xs sm:text-sm leading-[1.8] italic text-green-900">
                    {activeArticle.significance || "Kiemelten fontos érettségi kulcsfogalom, érdemes megjegyezni az esszéírásnál!"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* COMPARISON RESULTS VIEWS */}
        {!loading && !compareLoading && isComparing && compareResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center gap-2">
              <button
                onClick={() => setIsComparing(false)}
                className="px-3 py-1.5 border border-[#B8860B]/40 bg-[#4A1E05]/30 hover:bg-[#4A1E05] text-[#FFF5E0] rounded-[2px] cursor-pointer text-xs font-cinzel flex items-center gap-1 transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Vissza a fogalomhoz
              </button>
              <h2 className="text-xl font-cinzel font-bold text-[#FFF5E0] uppercase tracking-wider hidden sm:block">
                TÖRTÉNELMI ÖSSZEHASONLÍTÓ TABELLA
              </h2>
            </div>

            {/* Structured side-by-side comparative table card */}
            <div className="bg-[#FFF5D0] border-2 border-[#B8860B] rounded-[3px] shadow-2xl overflow-hidden text-[#1C0E04]">
              
              {/* Header Titles */}
              <div className="grid grid-cols-2 bg-[#6B1010] text-[#FFF5E0] p-4 text-center border-b-2 border-[#B8860B]">
                <div className="border-r border-[#FFF5D0]/20 pb-1">
                  <span className="text-[11px] font-cinzel tracking-wider text-[#B8860B] block">ELSŐ FOGALOM</span>
                  <button 
                    onClick={() => handleSearch(compareResult.concept1.title)}
                    className="text-lg sm:text-xl font-cinzel font-bold cursor-pointer hover:underline"
                  >
                    {compareResult.concept1.title}
                  </button>
                </div>
                <div className="pb-1">
                  <span className="text-[11px] font-cinzel tracking-wider text-[#B8860B] block">MÁSODIK FOGALOM</span>
                  <button 
                    onClick={() => handleSearch(compareResult.concept2.title)}
                    className="text-lg sm:text-xl font-cinzel font-bold cursor-pointer hover:underline"
                  >
                    {compareResult.concept2.title}
                  </button>
                </div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-[#1C0E04]/20 font-lora text-sm">
                
                {/* Row Korszak */}
                <div className="p-4 bg-[#1C0E04]/5 flex flex-col items-center">
                  <span className="text-[11px] font-cinzel font-bold text-[#6B1010] mb-2 tracking-widest block text-center bg-[#B8860B]/20 px-3 py-0.5 rounded">
                    TÖRTÉNELMI KOR / KOROSZTÁLY
                  </span>
                  <div className="grid grid-cols-2 gap-6 w-full text-center sm:text-left">
                    <div className="border-r border-[#1C0E04]/15 pr-3">
                      {compareResult.concept1.korszak}
                    </div>
                    <div className="pl-3">
                      {compareResult.concept2.korszak}
                    </div>
                  </div>
                </div>

                {/* Row Helyszin */}
                <div className="p-4 flex flex-col items-center">
                  <span className="text-[11px] font-cinzel font-bold text-[#6B1010] mb-2 tracking-widest block text-center bg-[#B8860B]/20 px-3 py-0.5 rounded">
                    HELYSZÍN / TERÜLET
                  </span>
                  <div className="grid grid-cols-2 gap-6 w-full text-center sm:text-left">
                    <div className="border-r border-[#1C0E04]/15 pr-3">
                      {compareResult.concept1.helyszin}
                    </div>
                    <div className="pl-3">
                      {compareResult.concept2.helyszin}
                    </div>
                  </div>
                </div>

                {/* Row Főszereplők */}
                <div className="p-4 bg-[#1C0E04]/5 flex flex-col items-center">
                  <span className="text-[11px] font-cinzel font-bold text-[#6B1010] mb-2 tracking-widest block text-center bg-[#B8860B]/20 px-3 py-0.5 rounded">
                    FŐBB JÁTÉKOSOK / SZEREPLŐK
                  </span>
                  <div className="grid grid-cols-2 gap-6 w-full text-center sm:text-left">
                    <div className="border-r border-[#1C0E04]/15 pr-3">
                      {compareResult.concept1.foszereplok}
                    </div>
                    <div className="pl-3">
                      {compareResult.concept2.foszereplok}
                    </div>
                  </div>
                </div>

                {/* Row Jelentőség */}
                <div className="p-4 flex flex-col items-center">
                  <span className="text-[11px] font-cinzel font-bold text-[#6B1010] mb-2 tracking-widest block text-center bg-[#B8860B]/20 px-3 py-0.5 rounded">
                    JELENTŐSÉGE AZ ÉRETTSÉGIN
                  </span>
                  <div className="grid grid-cols-2 gap-6 w-full text-center sm:text-left font-semibold">
                    <div className="border-r border-[#1C0E04]/15 pr-3 text-[#6B1010]">
                      {compareResult.concept1.jelentoseg}
                    </div>
                    <div className="pl-3 text-[#6B1010]">
                      {compareResult.concept2.jelentoseg}
                    </div>
                  </div>
                </div>

                {/* Row Következmények */}
                <div className="p-4 bg-[#1C0E04]/5 flex flex-col items-center">
                  <span className="text-[11px] font-cinzel font-bold text-[#6B1010] mb-2 tracking-widest block text-center bg-[#B8860B]/20 px-3 py-0.5 rounded">
                    TÖRTÉNELMI KÖVETKEZMÉNYEK
                  </span>
                  <div className="grid grid-cols-2 gap-6 w-full text-center sm:text-left">
                    <div className="border-r border-[#1C0E04]/15 pr-3">
                      {compareResult.concept1.kovetkezmenyek}
                    </div>
                    <div className="pl-3">
                      {compareResult.concept2.kovetkezmenyek}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Concept Journal Floating Button Bottom Right (above standard components) */}
      <button
        onClick={() => setShowJournal(true)}
        className="fixed bottom-24 right-4 z-40 bg-[#6B1010] hover:bg-[#801515] active:scale-95 text-[#FFF5E0] border-2 border-[#B8860B] w-12 h-12 rounded-full cursor-pointer shadow-2xl flex items-center justify-center transition-all group pointer-events-auto"
        title="Saját fogalomnaplóm megnyitása"
      >
        <span className="text-xl">📓</span>
        {journal.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] font-bold font-sans rounded-full w-5 h-5 flex items-center justify-center border border-white">
            {journal.length}
          </span>
        )}
      </button>

      {/* CONCEPT JOURNAL LIST MODAL */}
      <AnimatePresence>
        {showJournal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FFF5D0] border-2 border-[#B8860B] rounded-[3px] p-6 max-w-lg w-full relative shadow-2xl text-[#1C0E04]"
            >
              <h3 className="text-xl font-cinzel font-bold text-[#6B1010] tracking-wide mb-1 flex items-center gap-2">
                📓 SAJÁT FOGALOMNAPLÓ
              </h3>
              <p className="text-xs font-lora text-[#1C0E04]/70 mb-4 pb-2 border-b border-[#1C0E04]/10">
                A kigyűjtött történelmi kifejezések, amelyeket elmentettél a tanulás során.
              </p>

              {journal.length === 0 ? (
                <div className="text-center py-10 font-lora italic text-[#1C0E04]/40">
                  A fogalomnaplód még üres. Keress egy témát, és nyomd meg a "Mentés a Naplóba" gombot!
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto space-y-3 mb-6 pr-1 divide-y divide-[#1C0E04]/10">
                  {journal.map((item, idx) => (
                    <div key={idx} className="pt-3 first:pt-0 flex justify-between items-start gap-3">
                      <div className="space-y-1">
                        <span className="text-[11px] font-mono font-bold bg-[#1C0E04]/5 px-2 py-0.5 rounded border border-[#B8860B]/40">
                          {item.period}
                        </span>
                        <h4 className="font-cinzel font-bold text-[#1C0E04] text-base mt-1">{item.term}</h4>
                        <p className="font-lora text-xs text-[#1C0E04]/80 leading-[1.8] truncate max-w-sm sm:max-w-md">
                          {item.definition}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const updated = journal.filter(j => j.term.toLowerCase() !== item.term.toLowerCase());
                          saveJournal(updated);
                        }}
                        className="p-1 px-2 border border-red-800 text-red-800 hover:bg-red-800 hover:text-white rounded-[3px] cursor-pointer text-[11px] flex items-center gap-1 transition-colors self-start"
                      >
                        <Trash2 className="w-3 h-3" /> Törlés
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={journal.length === 0}
                  onClick={handleExportJournal}
                  className="flex-1 bg-green-800 hover:bg-green-700 disabled:opacity-50 text-white font-cinzel font-bold uppercase tracking-wider text-xs py-3 rounded-[3px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Összes exportálása
                </button>
                <button
                  onClick={() => setShowJournal(false)}
                  className="flex-1 bg-transparent text-[#6B1010] border-2 border-[#6B1010] hover:bg-[#6B1010] hover:text-[#FFF5D0] py-3 text-xs font-cinzel font-bold uppercase transition-colors rounded-[3px] cursor-pointer"
                >
                  Bezárás
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
