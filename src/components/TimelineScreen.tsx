import React, { useState, useEffect } from "react";
import { Clock, Play, Loader2, Calendar, MapPin, Search, X, Globe, Landmark, Swords, Palette, Coins, Users, Flame, Microscope, CircleDot } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Grade, TimelineEvent } from "../types";
import { TopicSelector } from "./TopicSelector";
import { triggerMascotAct } from "./KnightMascot";

const HISTORICAL_MAPS: Record<string, { url: string; caption: string }> = {
  // 9. évfolyam
  "Őskor és az ókori Kelet": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Ancient_Egypt_map-en.svg/1200px-Ancient_Egypt_map-en.svg.png",
    caption: "Az ókori Kelet térképe"
  },
  "Az ókori görög civilizáció": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Greco-Persian_Wars.png/1200px-Greco-Persian_Wars.png",
    caption: "Az ókori görög világ"
  },
  "Az ókori Róma": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Roman_Empire_map.svg/1200px-Roman_Empire_map.svg.png",
    caption: "A Római Birodalom kiterjedése"
  },
  "Honfoglalás és az Árpád-kor": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Honfoglalas.png/1200px-Honfoglalas.png",
    caption: "A honfoglalás (895-896)"
  },
  // 10. évfolyam
  "A középkori Európa": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Europe_around_1000.svg/1200px-Europe_around_1000.svg.png",
    caption: "Középkori Európa"
  },
  "Magyar Királyság az Árpád-korban": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Kingdom_of_Hungary_1190.svg/1200px-Kingdom_of_Hungary_1190.svg.png",
    caption: "A Magyar Királyság az Árpád-korban"
  },
  "Késő középkor – Hunyadiak kora": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/thirty/Matthias_Corvinus_Hungary.svg/1200px-Matthias_Corvinus_Hungary.svg.png",
    caption: "Hunyadi Mátyás birodalma"
  },
  "A török hódoltság Magyarországon": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Ottoman_Hungary.svg/1200px-Ottoman_Hungary.svg.png",
    caption: "Török hódoltság Magyarországon"
  },
  // 11. évfolyam
  "Felvilágosodás és francia forradalom": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/France_1789.svg/1200px-France_1789.svg.png",
    caption: "Franciaország a forradalom idején"
  },
  "A napóleoni korszak": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Europe_1812_map_en.png/1200px-Europe_1812_map_en.png",
    caption: "Napóleon birodalma 1812-ben"
  },
  "Reformkor és 1848–49": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Europe_1848_map.svg/1200px-Europe_1848_map.svg.png",
    caption: "Az 1848-49-es forradalmak Európában"
  },
  "Az első világháború": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/WW1_TitleCard.png/1200px-WW1_TitleCard.png",
    caption: "Az első világháború frontjai"
  },
  // 12. évfolyam
  "A két háború közötti időszak": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Europe_1923_map.svg/1200px-Europe_1923_map.svg.png",
    caption: "Európa az első világháború után"
  },
  "A második világháború": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/WW2_Europe_1941.png/1200px-WW2_Europe_1941.png",
    caption: "A második világháború Európában"
  },
  "A hidegháború": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Cold_war_europe_military_alliances_map_en.png/1200px-Cold_war_europe_military_alliances_map_en.png",
    caption: "A hidegháború katonai szövetségei"
  },
  "Magyarország 1945–1990": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Soviet_bloc_in_europe.svg/1200px-Soviet_bloc_in_europe.svg.png",
    caption: "A szovjet blokk Európában"
  },
  "Rendszerváltás és jelenkor": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Europe_2000.svg/1200px-Europe_2000.svg.png",
    caption: "Európa a rendszerváltás után"
  }
};

interface TimelineScreenProps {
  onGoHome: () => void;
}

export default function TimelineScreen({ onGoHome }: TimelineScreenProps) {
  const [grade, setGrade] = useState<string>("⚱️ Őskor és ókori Kelet");
  const [topic, setTopic] = useState<string>("Az őskor korszakai és jellemzői");
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Custom interactive search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("mind");
  
  const [expandedTitle, setExpandedTitle] = useState<string | null>(null);
  const [expandedDetail, setExpandedDetail] = useState<{
    detail: string;
    significance: string;
    relatedEvents: string[];
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Map Feature states
  const [showMapView, setShowMapView] = useState<boolean>(false);
  const [mapExplanation, setMapExplanation] = useState<{
    explanation: string;
    keyPlaces: string[];
    historicalContext: string;
  } | null>(null);
  const [mapLoading, setMapLoading] = useState<boolean>(false);
  const [mapImageError, setMapImageError] = useState<boolean>(false);

  // Related Event Modal states
  const [relatedModalOpen, setRelatedModalOpen] = useState(false);
  const [relatedModalData, setRelatedModalData] = useState<{
    year: string;
    title: string;
    description: string;
    significance: string;
    relatedTopic: string;
  } | null>(null);
  const [relatedModalLoading, setRelatedModalLoading] = useState(false);

  const CATEGORIES = [
    { id: 'mind', label: '⚡ Mind', icon: Globe, color: '#6B1010' },
    { id: 'politika', label: '👑 Politika', icon: Landmark, color: '#8B1A1A' },
    { id: 'hadtortenet', label: '⚔️ Hadtörténet', icon: Swords, color: '#4A0808' },
    { id: 'kulttura', label: '🎨 Kultúra', icon: Palette, color: '#7A5208' },
    { id: 'gazdasag', label: '💰 Gazdaság', icon: Coins, color: '#2D5A27' },
    { id: 'tarsadalom', label: '👥 Társadalom', icon: Users, color: '#1A4A6B' },
    { id: 'vallas', label: '✝️ Vallás', icon: Flame, color: '#4A1A6B' },
    { id: 'tudomany', label: '🔬 Tudomány', icon: Microscope, color: '#1A5A5A' }
  ];

  const fetchMapExplanation = async (currentTopic: string) => {
    if (!currentTopic) return;
    setMapLoading(true);
    setMapExplanation(null);
    setMapImageError(false);
    
    try {
      const prompt = `Magyarázd el röviden (3-4 mondat) ezt a történelmi térképet középiskolásoknak:
Témakör: ${currentTopic}
Mit ábrázol a térkép és mi a történelmi jelentősége?
CSAK JSON: {"explanation": "Szöveg...", "keyPlaces": ["Helyszín 1", "Helyszín 2"], "historicalContext": "Rövid kontextus."}`;

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      
      if (response.ok) {
        const resData = await response.json();
        let cleanText = resData?.text || "";
        if (cleanText.trim().startsWith("```json")) {
          cleanText = cleanText.replace(/```json|```/g, "").trim();
        } else if (cleanText.trim().startsWith("```")) {
          cleanText = cleanText.replace(/```/g, "").trim();
        }
        
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleanText);
        setMapExplanation({
          explanation: parsed.explanation || "",
          keyPlaces: parsed.keyPlaces || [],
          historicalContext: parsed.historicalContext || ""
        });
      } else if (response.status === 429) {
        setMapExplanation({
          explanation: "Az AI egyelőre túlterhelt (Rate limit). Kérlek várj egy percet a térkép elemzéséhez!",
          keyPlaces: [],
          historicalContext: "Túl sok kérés"
        });
      } else {
        throw new Error("API call failed");
      }
    } catch (err) {
      console.error("Error generating map explanation:", err);
      setMapExplanation({
        explanation: `Ez a térkép a(z) "${currentTopic}" témakör kulcsfontosságú földrajzi és történelmi viszonyait ábrázolja, segítve az összefüggések és a korszak eseményeinek mélyebb megértését az érettségire való felkészülés során.`,
        keyPlaces: ["Fontos helyszínek"],
        historicalContext: "Történelmi háttér."
      });
    } finally {
      setMapLoading(false);
    }
  };

  useEffect(() => {
    if (showMapView && topic) {
      fetchMapExplanation(topic);
    }
  }, [showMapView, topic]);

  const generateTimeline = async (overrideTopic?: string) => {
    setLoading(true);
    setSearchTerm("");
    setSelectedCategory("Mind");
    setExpandedTitle(null);
    setExpandedDetail(null);
    
    try {
      const topicToUse = typeof overrideTopic === "string" ? overrideTopic : undefined;
      const prompt = `Magyar középiskolai történelemtanár vagy (NAT 2020).
 Generálj 20 részletes történelmi eseményt időszalaghoz.
 Témakör: ${topicToUse || `${grade}, ${topic}`}. Évfolyam: ${grade}.
 Minden eseménynek legyen pontos kategóriája és részletes leírása!
 CSAK valid JSON:
 {'events': [
   {
     'year': '1789',
     'title': 'Esemény rövid neve',
     'description': 'Részletes leírás 3-4 mondatban.',
     'importance': 'high/medium/low',
     'category': 'politika/hadtortenet/kulttura/gazdasag/tarsadalom/vallas/tudomany',
     'persons': ['Személy1', 'Személy2'],
     'location': 'Helyszín neve',
     'significance': 'Érettségi szempontból fontos mert...'
   }
 ]}`;
      
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      
      if (response.status === 429) {
        setEvents([{ year: "!", title: "Szerver terhelés (Rate limit)", description: "Túl sok kérés. Kérlek, várj fél percet az újabb generálás előtt!", importance: "high", category: "-" }]);
        setLoading(false);
        return;
      }
      
      const rawText = await response.text();
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (e) {
        throw new Error("Érvénytelen válasz a szervertől (nem JSON).");
      }
      let text = data?.text || data?.response || data?.content || JSON.stringify(data);
      if (typeof text !== "string") {
         text = JSON.stringify(text);
      }
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.events) {
             setEvents(parsed.events);
          }
        }
      } catch (e) {
        console.warn("Could not parse timeline, using mock.");
        const mock: TimelineEvent[] = Array(5).fill(0).map((_, i) => ({ year: `140${i}`, title: `Esemény ${i+1}`, description: "Rövid leírás az eseményről.", importance: "medium" as const, category: "politika" }));
        setEvents(mock);
      }
      
    } catch (err) {
      console.error(err);
      const mock: TimelineEvent[] = [{ year: "Ismeretlen", title: "Hiba", description: "Sikertelen generálás az API hiba miatt.", importance: "high" as const, category: "hiba" }];
      setEvents(mock);
    }
    setLoading(false);
  };

  // Safe category matching allowing loose match
  const matchesCategory = (event: any) => {
    if (selectedCategory === "mind") return true;
    if (!event.category) return false;
    const cat = event.category.toLowerCase().trim();
    return cat === selectedCategory || cat.includes(selectedCategory);
  };

  // Searches in year, title, and description fields
  const matchesSearch = (event: any) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const evYear = (event.year || "").toLowerCase();
    const evTitle = (event.title || "").toLowerCase();
    const evDesc = (event.description || "").toLowerCase();
    
    return evYear.includes(term) || evTitle.includes(term) || evDesc.includes(term);
  };

  const filteredEvents = events.filter(e => matchesCategory(e) && matchesSearch(e));

  const handleEventClick = async (event: any) => {
    const isExpanded = expandedTitle === event.title;
    if (isExpanded) {
      setExpandedTitle(null);
      setExpandedDetail(null);
      return;
    }
    
    setExpandedTitle(event.title);
    setExpandedDetail(null); 
    setDetailLoading(true);
    
    // Árpád mascot reacts
    triggerMascotAct('fact', 'Érdekes választás, vitéz!');
    
    try {
      const prompt = `Generálj részletes leírást erről a történelmi eseményről magyarul, 3-4 mondatban, középiskolásoknak: ${event.title} (${event.year || ''})
CSAK JSON: {'detail': 'Részletes szöveg...', 'significance': 'Miért fontos az érettségin?', 'relatedEvents': ['esemény1', 'esemény2']}`;

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      
      if (response.ok) {
        const resData = await response.json();
        let cleanText = resData.text || "";
        const jsonMatch = cleanText.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
        if (jsonMatch) {
            cleanText = jsonMatch[0];
        } else {
            if (cleanText.trim().startsWith("```json")) {
                cleanText = cleanText.replace(/```json|```/g, "").trim();
            } else if (cleanText.trim().startsWith("```")) {
                cleanText = cleanText.replace(/```/g, "").trim();
            }
        }
        
        const parsed = JSON.parse(cleanText);
        setExpandedDetail(parsed);
      } else if (response.status === 429) {
        setExpandedDetail({
          detail: "A szerver túlterhelt (Rate limit). Kérlek, várj pár másodpercet a részletes leírás betöltéséig!",
          significance: "-",
          relatedEvents: []
        });
      } else {
        throw new Error("Hiba a letöltés során.");
      }
    } catch (err) {
      console.error("Error generating details:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRelatedClick = async (relatedName: string) => {
    setSearchTerm("");
    setRelatedModalData(null);
    setRelatedModalOpen(true);
    setRelatedModalLoading(true);
    
    triggerMascotAct('fact', 'Érdekes kapcsolódás, vitéz!');
    
    try {
      const prompt = `Írj rövid leírást erről a történelmi eseményről magyarul, középiskolásoknak.
Esemény: ${relatedName}
CSAK JSON:
{"year": "1733",
 "title": "Esemény neve",
 "description": "3-4 mondatos leírás.",
 "significance": "Miért fontos?",
 "relatedTopic": "Kapcsolódó témakör neve"}`;

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      
      if (response.ok) {
        const resData = await response.json();
        let cleanText = resData.text || "";
        if (cleanText.trim().startsWith("\`\`\`json")) {
          cleanText = cleanText.replace(/\`\`\`json|\`\`\`/g, "").trim();
        } else if (cleanText.trim().startsWith("\`\`\`")) {
          cleanText = cleanText.replace(/\`\`\`/g, "").trim();
        }
        
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleanText);
        setRelatedModalData(parsed);
      } else if (response.status === 429) {
        setRelatedModalData({
          year: "!",
          title: "Szerver terhelés (Rate limit)",
          description: "Az AI egyelőre túlterhelt. Kérlek, várj pár másodpercet és próbáld újra!",
          significance: "-",
          relatedTopic: "Próbálkozz később"
        });
      } else {
        throw new Error("Failed to load");
      }
    } catch (err) {
      console.error("Error generating related event details:", err);
    } finally {
      setRelatedModalLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Related Event Modal Overlay */}
      <AnimatePresence>
        {relatedModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#FFF5D0] border-2 border-[#B8860B] rounded-[4px] p-6 max-w-lg w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setRelatedModalOpen(false)}
                className="absolute top-4 right-4 text-[#8B1A1A] hover:text-[#6B1010] font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Bezárás
              </button>

              <h2 className="text-sm font-cinzel font-bold text-[#8B1A1A] uppercase tracking-widest mb-4">
                Kapcsolódó esemény
              </h2>

              {relatedModalLoading ? (
                <div className="py-12 flex flex-col items-center">
                  <Loader2 className="w-8 h-8 text-[#B8860B] animate-spin mb-2" />
                  <p className="text-xs font-cinzel text-[#1C0E04]/70">Krónikák felkutatása...</p>
                </div>
              ) : relatedModalData ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="px-3 py-1 bg-[#1A0A03] border border-[#B8860B] text-[#FFF5E0] font-cinzel font-bold tracking-wider rounded-[2px] whitespace-nowrap mt-1">
                      {relatedModalData.year}
                    </div>
                    <div>
                      <h3 className="font-cinzel font-bold text-xl text-[#1C0E04]">
                        {relatedModalData.title}
                      </h3>
                    </div>
                  </div>

                  <p className="font-lora text-sm text-[#1C0E04]/90 leading-[1.8]">
                    {relatedModalData.description}
                  </p>

                  <div className="bg-[#1A0A03]/5 border-l-4 border-[#B8860B] p-3 rounded-r-[3px]">
                    <h4 className="text-[11px] font-cinzel font-bold text-[#6B1010] uppercase tracking-wider mb-1">
                      Történelmi jelentőség
                    </h4>
                    <p className="font-lora text-xs text-[#1C0E04]/80 italic">
                      {relatedModalData.significance}
                    </p>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-2 mt-2">
                    <button
                      onClick={() => {
                        setEvents(prev => {
                          const exists = prev.find(e => e.title === relatedModalData.title);
                          if (exists) return prev;
                          return [...prev, {
                            year: relatedModalData.year,
                            title: relatedModalData.title,
                            description: relatedModalData.description,
                            importance: "medium",
                            category: "Különálló"
                          }];
                        });
                        setRelatedModalOpen(false);
                        triggerMascotAct('correct', 'Sikeresen hozzáadva az időszalaghoz!');
                      }}
                      className="flex-1 py-3 px-3 border border-[#2D6A4F] bg-[#EEF8E9] hover:bg-[#D5EFCA] text-[#1A330E] text-xs font-cinzel font-bold uppercase tracking-wide rounded-[2px] cursor-pointer transition-colors"
                    >
                      ➕ Hozzáadás az időszalaghoz
                    </button>
                    
                    <button
                      onClick={() => {
                        setRelatedModalOpen(false);
                        generateTimeline(relatedModalData.relatedTopic);
                      }}
                      className="flex-1 py-3 px-3 border border-[#B8860B] bg-[#1A0A03] hover:bg-black text-[#FFF5E0] text-xs font-cinzel font-bold uppercase tracking-wide rounded-[2px] cursor-pointer transition-colors"
                    >
                      🔍 Új időszalag erről
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-lora text-red-700 py-4">Valami hiba történt a generálás során.</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Grade + topic dropdowns & 2. Generation Control (existing) */}
      <div className="mb-8 p-4 sm:p-6 bg-[#D8C3A5] rounded-sm shadow-xl">
        <TopicSelector selectedTopic={topic} onTopicChange={setTopic} onGradeChange={setGrade} />
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => generateTimeline()}
            disabled={loading}
            className="w-full md:w-auto px-6 py-2.5 bg-[#6B1010] hover:bg-[#801515] text-[#FFF5E0] font-cinzel font-bold uppercase tracking-widest rounded-[2px] border border-[#B8860B] disabled:opacity-50 flex justify-center items-center gap-2 text-xs transition-colors cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
            Időszalag generálása
          </button>
        </div>
      </div>

      {/* 3. Filter buttons (also serves as Categories legend) */}
      {events.length > 0 && !loading && (
        <div className="mb-4">
          <p className="text-[11px] font-cinzel font-bold uppercase tracking-wider text-[#FFF5E0]/50 mb-2">
            Szűrés kategóriák szerint:
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  backgroundColor: selectedCategory === cat.id ? cat.color : undefined,
                  borderColor: selectedCategory === cat.id ? '#B8860B' : `${cat.color}60`
                }}
                className={`px-3 py-1.5 text-xs font-cinzel font-bold tracking-wider rounded-[3px] cursor-pointer transition-colors border flex items-center justify-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? "text-[#FFF5E0] shadow-md"
                    : "bg-[#1C0E04]/60 hover:bg-[#1C0E04] text-[#FFF5E0]/80 hover:text-[#FFF5E0]"
                }`}
              >
                {selectedCategory !== cat.id && (
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                )}
                {cat.label}
              </button>
            ))}

            {/* TOGGLE BUTTON at top: "🗺️ Térkép" button next to filter buttons */}
            <button
              onClick={() => {
                const newValue = !showMapView;
                setShowMapView(newValue);
                if (newValue) {
                  triggerMascotAct('fact', "Nézd, vitéz! Így festett a világ akkoriban! A térkép mindent elárul a korszakról!");
                }
              }}
              className={`px-4 py-1.5 text-xs font-cinzel font-bold tracking-wider rounded-[3px] cursor-pointer transition-colors border flex items-center justify-center gap-1.5 font-bold ${
                showMapView
                  ? "bg-[#B8860B] text-[#1C0E04] border-[#B8860B]"
                  : "bg-[#1C0E04]/60 hover:bg-[#1C0E04] text-[#FFF5E0] border-[#B8860B]/40"
              }`}
            >
              <span>🗺️ Térkép</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. NEW: search bar */}
      {events.length > 0 && !loading && (
        <div className="mb-4">
          <div className="relative flex items-center bg-[#2A1005] border border-[#B8860B] rounded-[3px]">
            <Search className="absolute left-3 w-4 h-4 text-[#B8860B]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Esemény keresése..."
              className="w-full pl-10 pr-10 py-2.5 bg-transparent text-[#FFF5E0] font-lora text-sm focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 p-1 text-[#B8860B] hover:text-[#FFF5E0]"
              >
                <X className="w-4 h-4 text-[#B8860B]" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5. Result count */}
      {events.length > 0 && !loading && (
        <div className="mb-6">
          <p className="text-xs font-lora text-[#FFF5E0]/60 italic">
            {filteredEvents.length} esemény
          </p>
        </div>
      )}

      {/* Loading state indicator */}
      {loading ? (
        <div className="text-center py-20 flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-[#B8860B] animate-spin mb-4" />
          <p className="text-[#FFF5E0]/70 font-cinzel font-bold text-sm uppercase tracking-widest">Krónikák felkutatása...</p>
        </div>
      ) : events.length > 0 ? (
        <>
          {/* Header Bar */}
          <div className="bg-[#1A0A03] border-t-2 border-b-2 border-[#B8860B] py-6 px-4 mb-8 -mx-4 sm:mx-0 sm:rounded-[3px] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-1 bg-[#6B1010] text-[#FFF5E0] text-xs font-bold rounded-[2px] border border-[#B8860B]/50">{grade}</span>
                  <span className="text-[#B8860B] font-bold text-xs">{events.length} történelmi esemény</span>
                </div>
                <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#FFF5E0] tracking-widest">{topic}</h2>
              </div>
            </div>
          </div>

          {/* Historical Map Feature Section */}
          {showMapView && (
            <div className="mb-8 p-5 sm:p-6 bg-[#1A0A03] border-2 border-[#B8860B]/70 rounded-[4px] shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#B8860B]/20 pb-4 gap-2">
                <div>
                  <h3 className="font-cinzel font-bold text-sm sm:text-base text-[#FFF5E0] tracking-widest uppercase">
                    🗺️ Történelmi Térkép
                  </h3>
                  <p className="font-lora text-xs text-[#B8860B] italic mt-0.5">
                    Korszak: {topic}
                  </p>
                </div>
                <span className="text-[11px] font-mono text-[#FFF5E0]/40">
                  Forrás: Wikimedia Commons / AI Kartográfia
                </span>
              </div>

              {/* Image / Placeholder Block */}
              <div className="flex flex-col items-center">
                {(!HISTORICAL_MAPS[topic] || mapImageError) ? (
                  <div className="w-full h-64 bg-[#FFF5D0] border-2 border-[#B8860B] rounded-[4px] flex flex-col items-center justify-center p-6 text-center shadow-inner">
                    <span className="text-4xl mb-3">🗺️</span>
                    <h4 className="font-cinzel font-bold text-[#1C0E04] text-sm tracking-wide">
                      A térkép nem elérhető
                    </h4>
                    <p className="font-lora text-xs text-[#1C0E04]/70 mt-1">
                      Témakör: {topic}
                    </p>
                    <p className="font-lora text-[11px] text-[#1C0E04]/50 italic mt-2 max-w-sm">
                      Úgy tűnik, ehhez a specifikus témakörhöz nem tartozik beágyazott illusztráció, de az AI magyarázatot alább olvashatod!
                    </p>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center space-y-2">
                    <img
                      src={HISTORICAL_MAPS[topic].url}
                      alt={HISTORICAL_MAPS[topic].caption}
                      onError={() => setMapImageError(true)}
                      referrerPolicy="no-referrer"
                      className="w-full max-h-[400px] object-contain border-2 border-[#B8860B] rounded-[4px] shadow-lg bg-[#2A1005]"
                    />
                    <p className="font-lora text-xs text-[#FFF5E0]/70 italic text-center mt-1">
                      {HISTORICAL_MAPS[topic].caption}
                    </p>
                  </div>
                )}
              </div>

              {/* Map Explanation Panel */}
              <div className="space-y-4">
                {mapLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 bg-[#FFF5D0]/5 border border-[#B8860B]/30 rounded-[3px]">
                    <Loader2 className="w-8 h-8 text-[#B8860B] animate-spin mb-2" />
                    <p className="text-xs font-cinzel text-[#FFF5E0]/80 uppercase tracking-widest">
                      AI Kartográfus elemzése...
                    </p>
                  </div>
                ) : mapExplanation ? (
                  <div className="space-y-4">
                    {/* Explanation text in parchment box */}
                    <div className="bg-[#FFF5D0] border border-[#B8860B] p-5 rounded-[4px] shadow-inner text-[#1C0E04]">
                      <h4 className="text-[11px] font-cinzel font-bold text-[#8B1A1A] uppercase tracking-wider mb-2">
                        Az Ábrázolt Korszak Jelentősége:
                      </h4>
                      <p className="font-lora text-xs sm:text-sm leading-[1.8] whitespace-pre-line">
                        {mapExplanation.explanation}
                      </p>
                    </div>

                    {/* Meta info columns */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch">
                      {mapExplanation.keyPlaces && mapExplanation.keyPlaces.length > 0 && (
                        <div className="w-full md:w-1/2 bg-[#2A1005] border border-[#B8860B]/30 p-4 rounded-[3px] flex flex-col justify-between">
                          <div>
                            <h5 className="text-[11px] font-cinzel font-bold text-[#FFF5E0]/70 uppercase tracking-wider mb-2">
                              📍 Kulcsfontosságú Helyszínek:
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {mapExplanation.keyPlaces.map((place, pIdx) => (
                                <span
                                  key={pIdx}
                                  className="px-2 py-1 bg-[#B8860B]/10 hover:bg-[#B8860B]/20 text-[#FFF5E0] text-[11px] font-lora border border-[#B8860B]/30 rounded-[3px] shadow-sm flex items-center gap-1 transition-colors"
                                >
                                  📍 {place}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {mapExplanation.historicalContext && (
                        <div className="w-full md:w-1/2 bg-[#2A1005] border border-[#B8860B]/30 p-4 rounded-[3px] flex flex-col justify-center">
                          <h5 className="text-[11px] font-cinzel font-bold text-[#FFF5E0]/70 uppercase tracking-wider mb-1">
                            📜 Történelmi Háttér:
                          </h5>
                          <p className="font-lora text-xs text-[#FFF5E0]/90 leading-[1.8] italic border-l-2 border-[#B8860B]/40 pl-3">
                            {mapExplanation.historicalContext}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs font-lora text-[#FFF5E0]/40">
                    Sikertelen betöltés, de megnézheted az alatta lévő idővonalat!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* If no search results found */}
          {filteredEvents.length === 0 && searchTerm.trim() && (
            <div className="text-center py-12 bg-[#1A0A03] border border-[#6B1010]/30 rounded-sm mb-6">
              <p className="font-lora text-[#FFF5E0]/70 text-sm">
                Nincs találat erre: <strong className="text-[#B8860B]">'{searchTerm}'</strong>
              </p>
            </div>
          )}

          {/* 6. Timeline events (clickable + filterable) */}
          {filteredEvents.length > 0 && (
            <div className="relative py-4 pl-8 sm:pl-0">
              {/* Vertical line - hidden on small mobile, visible sm+ */}
              <div className="hidden sm:block absolute left-1/2 top-4 bottom-4 w-[3px] bg-gradient-to-b from-[#8B1A1A] via-[#B8860B] to-[#1A4A6B] -translate-x-1/2 z-0" style={{ backgroundImage: "linear-gradient(to bottom, #8B1A1A, #B8860B, #2D5A27, #1A4A6B)", maskImage: "repeating-linear-gradient(to bottom, transparent, transparent 4px, black 4px, black 12px)", WebkitMaskImage: "repeating-linear-gradient(to bottom, transparent, transparent 4px, black 4px, black 16px)" }}></div>
              {/* Vertical line - mobile only */}
              <div className="block sm:hidden absolute left-[15px] top-4 bottom-4 w-[3px] border-l-[3px] border-dashed border-[#B8860B]/60 -translate-x-1/2 z-0" style={{ borderImage: "linear-gradient(to bottom, #8B1A1A, #B8860B, #2D5A27, #1A4A6B) 1" }}></div>

              <div className="space-y-8 sm:space-y-12">
                {filteredEvents.map((event, idx) => {
                  const ev = event as TimelineEvent;
                  const isEven = idx % 2 === 0;
                  const isExpanded = expandedTitle === ev.title;
                  
                  // Map category to color
                  const catId = (ev.category || "").toLowerCase().trim();
                  const catData = CATEGORIES.find(c => catId === c.id || catId.includes(c.id)) || { id: 'unknown', label: '💠 Egyéb', icon: CircleDot, color: '#B8860B' };
                  
                  // Importance styles
                  const isHigh = ev.importance === "high";
                  const isLow = ev.importance === "low";
                  
                  const iconSize = isHigh ? "w-5 h-5 scale-110" : (isLow ? "w-3 h-3" : "w-4 h-4");
                  const dotWrapperSize = isHigh ? "w-10 h-10" : (isLow ? "w-6 h-6" : "w-8 h-8");
                  
                  const yearBadgeBg = isHigh ? "bg-[#6B1010] border-[#B8860B] text-[#FFF5E0] py-1.5 px-3" : (isLow ? "bg-[#4A4A4A] border-[#2A2A2A] text-[#FFF5E0] py-0.5 px-1.5" : "bg-[#3A2210] border-[#1C0E04] text-[#FFF5E0] py-1 px-2.5");
                  const yearFontSize = isHigh ? "text-lg" : (isLow ? "text-xs" : "text-sm");

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between ${isEven ? 'sm:flex-row' : 'sm:flex-row-reverse'} w-full group`}
                    >
                      <div className="hidden sm:block w-[45%]"></div>
                      
                      {/* Timeline Dot */}
                      <div className={`absolute left-0 sm:left-1/2 transform sm:-translate-x-1/2 -translate-y-1/2 ${dotWrapperSize} rounded-full bg-[#1A0A03] border-[3px] border-[#B8860B] flex items-center justify-center z-10 shadow-md`} style={{ top: '24px' }}>
                        <catData.icon 
                          className={`${iconSize} ${isHigh ? 'animate-pulse text-[#B8860B]' : ''} transition-all duration-300 drop-shadow-md`} 
                          style={{ color: isHigh ? '#B8860B' : catData.color }} 
                        />
                      </div>

                      {/* Content Box */}
                      <div className="w-full sm:w-[45%] pl-6 sm:pl-0 z-20">
                        <div 
                          onClick={() => handleEventClick(event)}
                          className={`bg-[#FFF5D0] p-5 rounded-sm shadow-lg relative transition-all duration-300 cursor-pointer overflow-hidden border-l-[6px] ${
                            isExpanded 
                              ? "shadow-[0_4px_25px_rgba(184,134,11,0.3)] -translate-y-[3px]" 
                              : "hover:shadow-[0_4px_15px_rgba(184,134,11,0.2)] hover:-translate-y-[3px]"
                          }`}
                          style={{ borderLeftColor: catData.color, borderTop: isExpanded ? `1px solid ${catData.color}40` : '1px solid #B8860B40', borderRight: isExpanded ? `1px solid ${catData.color}40` : '1px solid #B8860B40', borderBottom: isExpanded ? `1px solid ${catData.color}40` : '1px solid #B8860B40' }}
                        >
                          {/* High importance shimmer effect */}
                          {isHigh && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#B8860B]/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                          )}

                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className={`font-cinzel font-bold tracking-wider rounded-[2px] border ${yearBadgeBg} ${yearFontSize}`}>
                              {ev.year}
                            </span>
                            <span 
                              className="px-2 py-0.5 rounded-full text-[11px] font-bold text-white shadow-sm flex items-center gap-1"
                              style={{ backgroundColor: catData.color }}
                            >
                              {catData.label}
                            </span>
                          </div>
                          
                          <h3 className={`font-cinzel font-bold text-[#1C0E04] leading-tight mb-2 ${isExpanded ? "text-xl text-[#6B1010]" : "text-lg"}`}>
                            {ev.title}
                          </h3>
                          
                          <p className="font-lora text-[#1C0E04]/80 text-sm leading-[1.8] mb-3">
                            {ev.description}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-3 text-xs font-lora text-[#1C0E04]/60">
                            {ev.location && (
                              <div className="flex items-center gap-1">
                                <span className="text-[#8B1A1A]">📍</span>
                                <span>{ev.location}</span>
                              </div>
                            )}
                            {ev.persons && ev.persons.length > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="text-[#B8860B]">👤</span>
                                <span>{ev.persons.join(", ")}</span>
                              </div>
                            )}
                          </div>

                          {/* Detail Expansion Drawer */}
                          {isExpanded && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              className="mt-4 pt-4 border-t border-[#B8860B]/30 text-left overflow-hidden"
                            >
                              {detailLoading ? (
                                <div className="flex items-center justify-center gap-2 py-4 text-xs font-cinzel text-[#8B1A1A]">
                                  <Loader2 className="w-4 h-4 animate-spin text-[#8B1A1A]" />
                                  <span>Történelmi krónikák olvasása...</span>
                                </div>
                              ) : expandedDetail ? (
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-[11px] font-cinzel font-bold text-[#8B1A1A] uppercase tracking-wider block mb-1">Részletek:</h4>
                                    <p className="font-lora text-xs sm:text-sm text-[#1C0E04]/90 leading-[1.8] whitespace-pre-wrap">
                                      {expandedDetail.detail}
                                    </p>
                                  </div>

                                  {(expandedDetail.significance || ev.significance) && (
                                    <div className="bg-[#FFF8E7] border border-[#B8860B]/40 p-3 rounded-[3px] shadow-sm relative overflow-hidden">
                                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#B8860B]"></div>
                                      <h4 className="text-[11px] font-cinzel font-bold text-[#8B1A1A] uppercase tracking-widest block mb-1">
                                        Érettségi szempontból:
                                      </h4>
                                      <p className="font-lora text-xs leading-[1.8] italic text-[#1C0E04]">
                                        {expandedDetail.significance || ev.significance}
                                      </p>
                                    </div>
                                  )}

                                  {expandedDetail.relatedEvents && expandedDetail.relatedEvents.length > 0 && (
                                    <div>
                                      <h4 className="text-[11px] font-cinzel font-bold text-[#8B1A1A] uppercase tracking-wider block mb-1.5">
                                        Kapcsolódó események:
                                      </h4>
                                      <div className="flex flex-wrap gap-1.5">
                                        {expandedDetail.relatedEvents.map((related, rIdx) => (
                                          <button
                                            key={rIdx}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRelatedClick(related);
                                            }}
                                            className="px-2 py-1 bg-[#1C0E04]/10 hover:bg-[#6B1010]/20 text-[#6B1010] text-[11px] font-bold rounded-[3px] cursor-pointer transition-all border border-[#1C0E04]/10"
                                          >
                                            {related}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs font-lora text-red-700">A kiegészítő részletek betöltése sikertelen.</p>
                              )}
                              
                              <div className="flex justify-end pt-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedTitle(null);
                                    setExpandedDetail(null);
                                  }}
                                  className="px-3 py-1.5 text-[11px] font-cinzel font-bold uppercase tracking-wider text-red-800 border border-red-800/30 hover:bg-red-800 hover:text-[#FFF5D0] rounded-[2px] transition-colors cursor-pointer"
                                >
                                  Bezárás
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Summary Scorecard */}
          {events.length > 0 && !loading && (
            <div className="mt-12 bg-[#1A0A03] border-2 border-[#B8860B] rounded-[3px] p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Calendar className="w-32 h-32 text-[#B8860B]" />
              </div>
              <h3 className="font-cinzel font-bold text-xl text-[#FFF5E0] mb-6 uppercase tracking-widest flex items-center gap-2">
                <span>📊</span> Időszalag összefoglalója
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xs font-cinzel font-bold text-[#FFF5E0]/60 uppercase tracking-widest mb-3">Események eloszlása</h4>
                  <div className="space-y-2">
                    {CATEGORIES.map(cat => {
                      const count = events.filter(e => {
                        const c = e.category?.toLowerCase() || '';
                        return c === cat.id || c.includes(cat.id);
                      }).length;
                      if (count === 0) return null;
                      const percentage = (count / events.length) * 100;
                      return (
                        <div key={cat.id} className="flex items-center gap-3">
                          <span className="text-[11px] w-20 text-[#FFF5E0]/80 font-bold">{cat.label.split(' ')[1]}</span>
                          <div className="flex-1 h-3 bg-[#2A1005] rounded-full overflow-hidden border border-[#B8860B]/20">
                            <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: cat.color }}></div>
                          </div>
                          <span className="text-[11px] text-[#B8860B] w-4 text-right font-mono">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-cinzel font-bold text-[#FFF5E0]/60 uppercase tracking-widest mb-2">Időkeret</h4>
                    <p className="font-lora text-lg text-[#B8860B] font-bold bg-[#2A1005] border border-[#B8860B]/40 px-4 py-2 rounded-[2px] inline-block mb-6 shadow-sm">
                      {events[0]?.year} – {events[events.length - 1]?.year}
                    </p>
                    
                    <h4 className="text-xs font-cinzel font-bold text-[#FFF5E0]/60 uppercase tracking-widest mb-2">Kulcsfontosságú esemény</h4>
                    <p className="font-lora text-sm text-[#FFF5E0] italic border-l-2 border-[#8B1A1A] pl-3 py-1">
                      {events.find(e => e.importance === 'high')?.title || events[0]?.title}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => triggerMascotAct('fact', 'A tudás hatalom! Ebből a témából remek kvízt találhatsz a Kvíz menüpontban!')}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-[#B8860B] to-[#DAA520] hover:from-[#DAA520] hover:to-[#FFDF00] text-[#1A0A03] font-cinzel font-bold uppercase tracking-widest rounded-[3px] shadow-[0_0_15px_rgba(184,134,11,0.5)] transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer text-xs flex justify-center items-center gap-2"
                  >
                    🎯 Kvíz ebből az időszalagból
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-[#1A0A03] border border-[#B8860B]/20">
          <Clock className="w-16 h-16 text-[#B8860B]/30 mx-auto mb-4" />
          <p className="text-[#FFF5E0]/70 font-cinzel font-bold text-lg uppercase tracking-widest">Az időszalag még üres</p>
          <p className="font-lora text-[#FFF5E0]/50 mt-2">Válassz egy témakört, és utazz el a múltba!</p>
        </div>
      )}
    </div>
  );
}
