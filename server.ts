import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { getFallbackQuestions } from "./src/data/questions";
import multer from "multer";
import pdf from "pdf-parse";
import mammoth from "mammoth";

// Load environment variables
dotenv.config();

const TOPIC_KEYWORDS: Record<string, string> = {
  "Mohácsi csata": "1526, II. Lajos, Szulejmán szultán, Tomori Pál, Csele-patak, vereség, oszmán hódítás",
  "Reformkor": "Széchenyi István (Hitel, Világ, Stádium, Lánchíd), Kossuth Lajos, 1848, Deák Ferenc, jobbágyfelszabadítás, közteherviselés, magyar nyelv hivatalossá tétele",
  "1848-49": "március 15, Petőfi Sándor, Batthyány-kormány, Görgei Artúr, Bem József, Kossuth Lajos, tavaszi hadjárat, Világos, fegyverletétel, Kossuth-címer, Áprilisi törvények",
  "Árpád-kor": "Szent István (államalapítás, vármegyerendszer, egyházszervezés, Gellért püspök), Koppány, Aranybulla (1222, II. András, nemesi ellenállási jog), tatárjárás (1241-42, Muhi csata), IV. Béla (második honalapító, kővárak építése)",
  "Trianon": "1920. június 4., Apponyi Albert (védőbeszéd), békediktátum, területveszteség, lakosságcsere, Párizs (Nagy-Trianon kastély), utódállamok (Csehszlovákia, Románia, Szerb-Horvát-Szlovén Királyság)",
  "Hunyadi": "Hunyadi János (születése, törökellenes harcok, nándorfehérvári diadal 1456, déli harangszó), Hunyadi Mátyás (igazságos Mátyás, 1458-1490, fekete sereg, renenszánsz udvar, Corvina könyvtár, füstpénz, rendkívüli hadiadó)",
  "Középkor": "hűbériség, jobbágyság, céhek, skolasztika, pápaság és császárság harca, keresztes hadjáratok, Anjouk (I. Károly Róbert, kapuadó, harmincad, aranyforint, Nagy Lajos), Luxemburgi Zsigmond",
  "Török hódoltság": "Budavár bevétele (1541), három részre szakadt Magyarország (Királyi Magyarország, Hódoltság, Erdélyi Fejedelemség), végvári harcok, Dobó István (Eger, 1552), Zrínyi Miklós (Szigetvár, 1566), vilajet, pasa, bég, janicsár, szpáhi, kettős adózás",
  "Rákóczi": "II. Rákóczi Ferenc, szabadságharc (1703-1711), tábori kiáltvány (Breznai kiáltvány), kurucok, labancok, Ónodi országgyűlés (trónfosztás), Szatmári béke (1711, kompromisszumos béke)",
  "Ipari forradalom": "gőzgép (James Watt), vasút (George Stephenson), gyáripar, urbanizáció, munkásosztály, monopólium, futószalagos gyártás, belső égésű motor, elektromosság",
  "Első világháború": "1914-1918, szövetségi rendszerek (Antant, Központi Hatalmak), szarajevói merénylet (Ferenc Ferdinánd), állóháború, lövészárok, új fegyverek (gáz, tank), Osztrák-Magyar Monarchia, összeomlás",
  "Második világháború": "1939-1945, tengelyhatalmak, szövetségesek, Lengyelország lerohanása, Barbarossa hadművelet, Sztálingrád, D-Day (normandiai partraszállás), Pearl Harbor, holokauszt, atombomba (Hirosima, Nagaszaki), kapituláció",
  "Hidegháború": "szuperhatalmak (USA, Szovjetunió), fegyverkezési verseny, vasfüggöny, berlini fal, kubai rakétaválság, vietnami háború, NATO, Varsói Szerződés, űrverseny",
  "Mohács": "1526. augusztus 29., II. Lajos király halála, Szulejmán szultán, Tomori Pál, Csele-patak, vereség, végvári vonal összeomlása",
  "Rendszerváltás": "1989, Kádár-korszak vége, kerekasztal-tárgyalások, Nagy Imre újratemetése, Köztársaság kikiáltása, többpártrendszer, szovjet csapatok kivonulása, piacgazdaság",
  "Kereszténység": "Jézus Krisztus, Pál apostol, konstantini ediktum (313), milánói ediktum, egyházszakadás (1054, kelet és nyugati egyház), szerzetesrendek, Biblia, reformáció (Luther Márton, 1517)"
};

const getKeywordsForTopic = (topic: string): string => {
  if (!topic) return "";
  const t = topic.toLowerCase();
  
  for (const [key, val] of Object.entries(TOPIC_KEYWORDS)) {
    if (t.includes(key.toLowerCase()) || key.toLowerCase().includes(t)) {
      return val;
    }
  }
  
  const words = t.split(/[\s\-–,]+/).filter(w => w.length > 3);
  for (const [key, val] of Object.entries(TOPIC_KEYWORDS)) {
    const k = key.toLowerCase();
    if (words.some(word => k.includes(word))) {
      return val;
    }
  }
  
  return "";
};

const generateContentWithRetry = async (params: {
  model: string;
  contents: string;
  config?: any;
}, maxRetries = 5): Promise<any> => {
  let attempt = 0;
  let delay = 1500;

  while (attempt < maxRetries) {
    try {
      if (!ai) {
        throw new Error("AI client not initialized");
      }
      const response = await ai.models.generateContent(params);
      return response;
    } catch (error: any) {
      attempt++;
      console.warn(`[GEMINI-RETRY] Attempt ${attempt} failed: ${error?.message || error}`);
      
      const isTransient = 
        error?.status === 503 || 
        error?.status === 429 ||
        error?.message?.includes("503") || 
        error?.message?.includes("429") ||
        error?.message?.includes("UNAVAILABLE") ||
        error?.message?.includes("RESOURCE_EXHAUSTED") ||
        error?.message?.includes("high demand") ||
        error?.message?.includes("overloaded");

      if (isTransient && attempt < maxRetries) {
        console.log(`[GEMINI-RETRY] Transient error detected. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2.5; // exponential backoff with key multiplier
      } else {
        throw error;
      }
    }
  }
  throw new Error("Failed to generate content after retries");
};

const safeParseJSON = (text: string): any => {
  if (!text) return null;
  const trimmed = text.trim();
  
  try {
    return JSON.parse(trimmed);
  } catch (e) {}

  const firstBrace = trimmed.indexOf('{');
  const firstBracket = trimmed.indexOf('[');
  
  let startIdx = -1;
  let endChar = '';
  let startChar = '';
  
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    startChar = '{';
    endChar = '}';
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    startChar = '[';
    endChar = ']';
  }
  
  if (startIdx !== -1) {
    let depth = 0;
    let insideQuote = false;
    let escape = false;
    
    for (let i = startIdx; i < trimmed.length; i++) {
      const char = trimmed[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (char === '\\') {
        escape = true;
        continue;
      }
      if (char === '"') {
        insideQuote = !insideQuote;
        continue;
      }
      if (!insideQuote) {
        if (char === startChar) {
          depth++;
        } else if (char === endChar) {
          depth--;
          if (depth === 0) {
            const potentialJson = trimmed.substring(startIdx, i + 1);
            try {
              return JSON.parse(potentialJson);
            } catch (innerErr) {
              // Ignore and carry on searching or fallback
            }
          }
        }
      }
    }
  }

  const match = trimmed.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (e) {}
  }

  throw new Error("Invalid or truncated JSON response from AI");
};

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Setup multer for file uploads (max 10MB)
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

// Initialize Gemini API client safely
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY && API_KEY !== "MY_GEMINI_API_KEY" && API_KEY.trim() !== "") {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini client successfully initialized.");
  } catch (error) {
    console.error("Failed to initialize Gemini client:", error);
  }
} else {
  console.log("No valid GEMINI_API_KEY environment variable found. Falling back to local NAT 2020 history questions database.");
}


// 1. API: Quiz Generation Endpoint
app.post("/api/quiz/generate", async (req, res) => {
  const { grade, topic, difficulty, type, count } = req.body;

  if (!grade || !topic || !difficulty || !type || !count) {
    res.status(400).json({ error: "Hiányzó paraméterek. Szükségesek: grade, topic, difficulty, type, count" });
    return;
  }

  const requestedCount = Math.min(Math.max(parseInt(count, 10) || 5, 5), 20);

  // If Gemini is not initialized or fails, fallback immediately to local database
  if (!ai) {
    console.log(`[VISSALÉPÉS] Helyi adatbázis kvízkérdések kiszolgálása ehhez: ${grade} - ${topic}`);
    const localQs = getFallbackQuestions(grade, topic, type, requestedCount, difficulty);
    res.json({ questions: localQs, wasRealTimeAI: false });
    return;
  }

  const keywords = getKeywordsForTopic(topic);
  const keywordHint = keywords ? `Fontos kulcsszavak: ${keywords}` : "";
  let knowledgePrompt = keywordHint ? `\nAz alábbi érettségi kulcsszavak alapján generálj kérdéseket.\nKULCSSZAVAK:\n${keywordHint}\n\n` : "";
  let minReqText = "";

  // Define prompt for high quality NAT 2020 historical focus
  const typeInstruction = 
    type === "Csak feleletválasztós" ? "Kizárólag feleletválasztós (multiple_choice) kérdéseket generálj!" :
    type === "Igaz-Hamis" ? "Kizárólag Igaz-Hamis (true_false) kérdéseket generálj!" :
    type === "Rövid esszé" ? "Kizárólag rövid esszé (essay) kérdéseket generálj!" :
    "Kombináld a feleletválasztós (multiple_choice), igaz-hamis (true_false) és rövid esszé (essay) kérdéseket vegyesen!";

  const strictRule = `
KRITIKUS SZABÁLY: KIZÁRÓLAG a következő témakörről generálj kérdéseket: ${topic}
NE generálj kérdéseket más korszakokból vagy témákból!

Ellenőrzési lista minden kérdésnél:
- Ez a kérdés valóban a(z) ${topic} témakörről szól?
- Ha NEM → dobd ki és generálj újat!
- Az évszámok egyeznek a témakörrel? (${topic})
- A személyek ehhez a korszakhoz tartoznak?

Például:
- 'A második világháború' témánál: 
  CSAK 1939-1945 közötti eseményekről kérdezz!
  NEM az első világháborúról!
- 'Reformkor' témánál:
  CSAK 1825-1848 közötti eseményekről!
  NEM a szabadságharcról!
`;

  const geminiPrompt = `
Generálj pontosan ${requestedCount} db kiváló minőségű, történelmileg hiteles magyar történelem gyakorló kérdést középiskolásoknak.
Részletes beállítások:
- Évfolyam: ${grade}
- Témakör: ${topic}
- Nehézség: ${difficulty} (A kérdések mélysége és nyelvezete igazodjon ehhez!)
- Kérdések típusa: ${type} (${typeInstruction})
${minReqText}
${knowledgePrompt}
${strictRule}
Kérdéstípusok specifikációi (a generált 'type' mező értéke):
1. "multiple_choice": 4 válaszlehetőség. Az 'options' tömb tartalmazza az opciókat (pontosan 4 db), a 'correctAnswer' mező értéke pedig a helyes betűjel kell legyen: 'A', 'B', 'C' vagy 'D'.
2. "true_false": Igaz-Hamis állítás. Az 'options' üres tömb vagy null, a 'correctAnswer' pedig 'Igaz' vagy 'Hamis'.
3. "essay": Rövid kifejtős/esszé kérdés. Nincsenek opciók, a 'correctAnswer' üres string ("").

Minden egyes kérdéshez generálj:
- Egy rövid, támogató de nem túl egyértelmű segítséget magyarul ('hint' mező).
- Egy részletes magyarázatot magyarul ('explanation' mező), amely kifejti az összefüggéseket és megmagyarázza a helyes választ vagy esszé esetén az elvárt kulcsszempontokat.

Fontos: Minden szöveg nyelvtanilag hibátlan magyar nyelven készüljön!
`;

  try {
    const topicKeywords = topic.toLowerCase().replace(/[^a-záéíóöőúüű\s]/g, '').split(/\s+/).filter(w => w.length > 3 && !['korszakai', 'jellemzői', 'magyar', 'magyarország', 'története'].includes(w));
    let finalQuestions: any[] = [];
    let attempts = 0;

    while (finalQuestions.length < requestedCount && attempts < 3) {
      attempts++;
      const needed = requestedCount - finalQuestions.length;
      const currentPrompt = geminiPrompt.replace(`Generálj pontosan ${requestedCount} db`, `Generálj pontosan ${needed} db`);

      const response = await generateContentWithRetry({
        model: "gemini-1.5-flash",
        contents: currentPrompt,
        config: {
          systemInstruction: `Te egy tapasztalt, szigorú, de tanulóbarát magyar történelem szakos középiskolai tanár vagy. Feladatod prémium, történelmileg pontos NAT 2020-as kerettanterv szerinti gyakorlókérdések összeállítása és értékelése.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { 
                   type: Type.STRING, 
                   description: "A kérdés típusa: 'multiple_choice', 'true_false' vagy 'essay'." 
                },
                question: { 
                   type: Type.STRING, 
                   description: "Maga a kérdés vagy állítás szövege magyarul." 
                },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Pontosan 4 válaszopció feleletválasztós kérdésnél. Igaz-Hamis és Esszé esetén hagyd üresen."
                },
                correctAnswer: { 
                   type: Type.STRING, 
                   description: "Helyes válasz. Feleletválasztósnál 'A', 'B', 'C' vagy 'D'. Igaz-Hamisnál 'Igaz' vagy 'Hamis'. Esszénél üres string." 
                },
                hint: { 
                   type: Type.STRING, 
                   description: "Rövid, segítőkész téma-specifikus segítség magyarul (pl. évszám vagy személy megemlítése)." 
                },
                explanation: { 
                   type: Type.STRING, 
                   description: "Részletes, oktató jellegű történelmi magyarázat magyarul, miért ez a helyes válasz, vagy esszénél mik a főbb elvárt pontok." 
                }
              },
              required: ["type", "question", "hint", "explanation"]
            }
          }
        }
      });
 
      try {
        const parsed = safeParseJSON(response.text || "[]");
        const validBatch = parsed.filter((q: any) => {
          if (topicKeywords.length === 0) return true;
          const lowerQ = JSON.stringify(q).toLowerCase();
          return topicKeywords.some(k => lowerQ.includes(k));
        });
        finalQuestions = [...finalQuestions, ...validBatch];
      } catch (e) {
        console.error("JSON parse error on generation attempt", e);
      }
    }

    // Minor structural postcheck: ensure all questions have ids
    const resolvedQuestions = finalQuestions.slice(0, requestedCount).map((q: any, idx: number) => ({
      ...q,
      id: `ai_${Date.now()}_${idx}`
    }));

    res.json({ questions: resolvedQuestions, wasRealTimeAI: true });
  } catch (error) {
    console.error("[GEMINI-HIBA] Hiba történt a generálás során. Átváltás a helyi adatbázisra.", error);
    const localQs = getFallbackQuestions(grade || "12. évfolyam", topic || "Vegyes kérdések", type, requestedCount, difficulty);
    res.json({ questions: localQs, wasRealTimeAI: false, error: "AI error, used high-quality fallback questions." });
  }
});

// 2. API: Document Extraction Endpoint
app.post("/api/extract", upload.single("document"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Nincs feltöltött fájl." });
    return;
  }

  try {
    const ext = path.extname(req.file.originalname).toLowerCase();
    let text = "";

    if (ext === ".pdf") {
      try {
        const data = await pdf(req.file.buffer);
        const extractedText = data.text || "";
        
        if (!extractedText.trim() || extractedText.length < 50) {
          res.status(400).json({ 
            error: "A dokumentum nem tartalmaz olvasható szöveget. Próbálj egy másik PDF-fel!" 
          });
          return;
        }
        
        res.json({ 
          text: extractedText, 
          charCount: extractedText.length 
        });
        return;
      } catch (pdfError: any) {
        console.error("PDF parse error:", pdfError);
        res.status(400).json({ 
          error: "A PDF feldolgozása sikertelen. Lehet hogy a PDF védett vagy képekből áll." 
        });
        return;
      }
    } else if (ext === ".docx") {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      text = result.value;
    } else {
      res.status(400).json({ error: "Csak PDF és Word (.docx) fájl tölthető fel" });
      return;
    }

    const cleanText = text.replace(/\s+/g, " ").trim();
    if (cleanText.length === 0) {
      res.status(400).json({ error: "A dokumentum nem tartalmaz olvasható szöveget" });
      return;
    }

    res.json({
      text: cleanText,
      charCount: cleanText.length
    });
  } catch (error) {
    console.error("PDF parse error:", error);
    res.status(400).json({ 
      error: "A fájl feldolgozása nem sikerült" 
    });
  }
});

// 3. API: Essay Evaluation Endpoint
app.post("/api/essay/evaluate", async (req, res) => {
  const { question, studentAnswer, difficulty } = req.body;

  if (!question || !studentAnswer) {
    res.status(400).json({ error: "Hiányzó paraméterek. Szükségesek: question, studentAnswer" });
    return;
  }

  // Graceful response if student output is purely whitespace
  if (studentAnswer.trim().length < 5) {
    res.json({
      scorePercent: 0,
      scoreExplanation: "A válasz túl rövid vagy üres ahhoz, hogy érdemben értékelhető legyen. Kérünk, fejtsd ki részletesebben a gondolataidat!",
      strengths: "Nincs értékelhető tartalom.",
      weaknesses: "Túl rövid, hiányos válasz.",
      improvements: "Írj legalább 2-3 kerek mondatot a témáról, használva a történelmi szakkifejezéseket."
    });
    return;
  }

  // Fallback engine if Gemini AI is down or unavailable
  const generateFallbackEvaluation = (q: string, ans: string, diff: string) => {
    const len = ans.trim().length;
    let score = 40; // Base score for effort

    if (len > 80) score += 20;
    if (len > 150) score += 15;
    if (ans.includes(",") || ans.includes(".")) score += 10;
    if (ans.match(/(mert|mivel|emiatt|következtében|ezért)/i)) score += 10; // Causal relationships

    score = Math.min(score, 95); // Default cap for fallback pseudo-analysis

    return {
      scorePercent: score,
      scoreExplanation: `[Szimulált értékelés] Válaszod hossza (${len} karakter) és felépítése alapján a történelmi tartalom részben kifejtett. A részletesebb, személyre szabott értékeléshez kérjük, ellenőrizd a Gemini API elérhetőségét.`,
      strengths: "A vágy kifejezni az összefüggéseket pozitív, és a mondatstruktúrád követhető.",
      weaknesses: "Bizonyos kulcsfontosságú évszámok, nevek vagy földrajzi helyek nincsenek eléggé megemlítve.",
      improvements: "Igyekezz pontos évszámokat és történelmi szereplőket (pl. uralkodók, politikusok) megnevezni érvelésed során."
    };
  };

  if (!ai) {
    res.json(generateFallbackEvaluation(question, studentAnswer, difficulty || "Közepes"));
    return;
  }

  const evaluationPrompt = `
Értékeld a következő magyar történelem esszé-kérdésre adott diákválaszt!
Kérdés: "${question}"
Diák válasza: "${studentAnswer}"
Tervezett nehézségi szint: ${difficulty || "Közepes"}

Követelmények:
1. Határozz meg egy indokolt pontszámot százalékban (0-100%). Légy humánus, de kövesd a magyar érettségi pontozási szellemiségét (tartalom, szaknyelv, kronológia).
2. Fogalmazz meg egy tanári stílusú értékelést ('scoreExplanation') magyarul, amely 2-3 bátorító de korrekt mondatban összefoglalja a válaszadás minőségét.
3. Gyűjtsd össze az erősségeit ('strengths') külön rovatként röviden.
4. Mutass rá a konkrét hiányosságaira vagy tévedéseire ('weaknesses') építő jelleggel.
5. Fogalmazz meg egy konkrét javaslatot/tippet ('improvements') arra vonatkozóan, hogyan érhetne el jobb eredményt egy hasonló érettségi esszénél.

Minden szövegrész kiváló, barátságos, tanári hangvételű és helyes magyar nyelvezetű legyen.
`;

  try {
    const response = await generateContentWithRetry({
      model: "gemini-1.5-flash",
      contents: evaluationPrompt,
      config: {
        systemInstruction: "Te egy tapasztalt történelem érettségi javító tanár vagy, aki kiváló pedagógia érzékkel motiválja a diákokat a jobb eredmények elérésére.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scorePercent: { type: Type.INTEGER, description: "Percentage score (0-100)." },
            scoreExplanation: { type: Type.STRING, description: "A detailed but encouraging text reviewing the overall student performance." },
            strengths: { type: Type.STRING, description: "1-2 brief bullet points of positive aspects about the content or terminology used." },
            weaknesses: { type: Type.STRING, description: "1-2 areas of omissions, errors or lacks in the student's answer." },
            improvements: { type: Type.STRING, description: "1 clear action-oriented recommendation on how they can improve." }
          },
          required: ["scorePercent", "scoreExplanation", "strengths", "weaknesses", "improvements"]
        }
      }
    });

    const evaluation = safeParseJSON(response.text || "{}");
    res.json(evaluation);
  } catch (error) {
    console.error("[GEMINI-HIBA] Hiba az esszéértékelés során. Szimuláció használata.", error);
    res.json(generateFallbackEvaluation(question, studentAnswer, difficulty || "Közepes"));
  }
});

app.post("/api/generate-pairs", async (req, res) => {
  const { count, topic, grade, difficulty } = req.body;
  if (!topic || !grade || !difficulty) {
    res.status(400).json({ error: "Hiányzó paraméterek" });
    return;
  }
  if (!ai) {
    res.status(400).json({ error: "AI API nincs konfigurálva", text: "{}" });
    return;
  }
  
  const keywords = getKeywordsForTopic(topic);
  const keywordHint = keywords ? `Fontos kulcsszavak: ${keywords}` : "";
  let knowledgePrompt = keywordHint ? `\nAz alábbi érettségi kulcsszavak alapján generálj kérdéseket.\nKULCSSZAVAK:\n${keywordHint}\n\n` : "";

  try {
    const strictRule = `
KRITIKUS SZABÁLY: KIZÁRÓLAG a következő témakörről generálj tartalmat: ${topic}
NE generálj kérdéseket más korszakokból vagy témákból!

Ellenőrzési lista:
- Ez a kártya valóban a(z) ${topic} témakörről szól?
- Ha NEM → dobd ki és generálj újat!
- Az évszámok egyeznek a témakörrel? (${topic})
- A személyek ehhez a korszakhoz tartoznak?

Például:
- 'A második világháború' témánál: 
  CSAK 1939-1945 közötti eseményekről kérdezz!
  NEM az első világháborúról!
- 'Reformkor' témánál:
  CSAK 1825-1848 közötti eseményekről!
  NEM a szabadságharcról!
`;
    const prompt = `Magyar középiskolai történelemtanár vagy (NAT 2020).
Generálj ${count || 5} páros kikérdező kártyát.
Témakör: ${topic}. Évfolyam: ${grade}. 
Nehézség: ${difficulty}.
${knowledgePrompt}
${strictRule}
CSAK valid JSON:
{"cards":[
  {
    "question": "Mit tudsz X-ről?",
    "answer": "Teljes helyes válasz 2-3 mondatban.",
    "keywords": ["kulcsszó1","kulcsszó2","kulcsszó3",
                 "kulcsszó4","kulcsszó5"],
    "hint": "Tematikus tipp ha elakad"
  }
]}`;

    const topicKeywords = topic.toLowerCase().replace(/[^a-záéíóöőúüű\s]/g, '').split(/\s+/).filter(w => w.length > 3 && !['korszakai', 'jellemzői', 'magyar', 'magyarország', 'története'].includes(w));
    let responseText = "{}";
    let valid = false;
    let attempts = 0;

    while (!valid && attempts < 3) {
      attempts++;
      const response = await generateContentWithRetry({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      responseText = response.text || "{}";
      
      if (topicKeywords.length > 0) {
        const lowerResp = responseText.toLowerCase();
        if (topicKeywords.some(k => lowerResp.includes(k))) {
           valid = true;
        } else {
           console.warn("Retrying /api/generate-pairs due to topic validation failure.");
        }
      } else {
        valid = true;
      }
    }

    res.json({ text: responseText });
  } catch (error: any) {
    console.error("General prompt error:", error);
    if (error?.status === 429 || error?.toString().includes("429") || error?.message?.includes("Quota exceeded") || error?.message?.includes("429")) {
      res.status(429).json({ error: "Szerver terhelés (Rate limit)", text: "" });
    } else {
      res.status(400).json({ error: "Generálás sikertelen", text: "" });
    }
  }
});

app.post("/api/generate", async (req, res) => {
  const { prompt, topic } = req.body;

  if (!prompt) {
    res.status(400).json({ error: "Hiányzó prompt paraméter" });
    return;
  }

  if (!ai) {
    res.status(400).json({ error: "AI API nincs konfigurálva", text: "{}" });
    return;
  }

  let finalPrompt = prompt;
  if (topic) {
    const keywords = getKeywordsForTopic(topic);
    const keywordHint = keywords ? `Fontos kulcsszavak: ${keywords}` : "";
    if (keywordHint) {
      finalPrompt += `\n\nAz alábbi érettségi kulcsszavak alapján generálj kérdéseket:\nKULCSSZAVAK:\n${keywordHint}\n\n`;
    }
    const strictRule = `
KRITIKUS SZABÁLY: KIZÁRÓLAG a következő témakörről generálj tartalmat: ${topic}
NE generálj kérdéseket más korszakokból vagy témákból!

Ellenőrzési lista minden tartalomnál:
- Ez valóban a(z) ${topic} témakörről szól?
- Ha NEM → dobd ki és generálj újat!
- Az évszámok egyeznek a témakörrel? (${topic})
- A személyek ehhez a korszakhoz tartoznak?

Például:
- 'A második világháború' témánál: 
  CSAK 1939-1945 közötti eseményekről kérdezz/írj!
  NEM az első világháborúról!
- 'Reformkor' témánál:
  CSAK 1825-1848 közötti eseményekről!
  NEM a szabadságharcról!
`;
    finalPrompt += `\n\n${strictRule}\n\n`;
  }

  try {
    let responseText = "";
    if (topic) {
        const topicKeywords = topic.toLowerCase().replace(/[^a-záéíóöőúüű\s]/g, '').split(/\s+/).filter(w => w.length > 3 && !['korszakai', 'jellemzői', 'magyar', 'magyarország', 'története'].includes(w));
        let attempts = 0;
        let valid = false;
        while (!valid && attempts < 3) {
            attempts++;
            const response = await generateContentWithRetry({
              model: "gemini-1.5-flash",
              contents: finalPrompt,
              config: { responseMimeType: "application/json" }
            });
            responseText = response.text || "{}";
            if (topicKeywords.length > 0) {
               const lowerResp = responseText.toLowerCase();
               if (topicKeywords.some(k => lowerResp.includes(k))) {
                  valid = true;
               } else {
                  console.warn("Retrying /api/generate due to topic validation failure.");
               }
            } else {
               valid = true;
            }
        }
    } else {
        const response = await generateContentWithRetry({
          model: "gemini-1.5-flash",
          contents: finalPrompt,
          config: {
            responseMimeType: "application/json",
          }
        });
        responseText = response.text || "{}";
    }

    res.json({ text: responseText });
  } catch (error: any) {
    console.error("General prompt error:", error);
    if (error?.status === 429 || error?.toString().includes("429") || error?.message?.includes("Quota exceeded") || error?.message?.includes("429")) {
      res.status(429).json({ error: "Szerver terhelés (Rate limit)", text: "" });
    } else {
      res.status(400).json({ error: "Generálás sikertelen", text: "" });
    }
  }
});

app.post("/api/worksheet", async (req, res) => {
  const { questions, date, grade, topic, difficulty, showAnswers } = req.body;
  if (!questions || !Array.isArray(questions)) {
    res.status(400).json({ error: "Missing questions array" });
    return;
  }

  const html = `
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <title>HISTÓRIA QUIZ – Feladatlap</title>
  <style>
    body { font-family: 'Times New Roman', serif; margin: 40px; color: #000; background: #fff; }
    h1 { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; text-transform: uppercase; }
    .meta { font-style: italic; margin-bottom: 30px; }
    .question-block { margin-bottom: 30px; page-break-inside: avoid; }
    .question-text { font-weight: bold; margin-bottom: 10px; }
    .options { list-style-type: upper-alpha; margin-left: 20px; }
    .option { margin-bottom: 5px; }
    .correct-option { font-weight: bold; }
    .essay-lines { margin-top: 15px; }
    .essay-lines div { border-bottom: 1px solid #999; height: 30px; }
    .footer { margin-top: 50px; border-top: 1px solid #000; padding-top: 20px; display: flex; justify-content: space-between; }
    .correct-mark { color: black; font-weight: bold; margin-left: 5px; }
    @media print {
      body { margin: 0; padding: 15px; }
      @page { margin: 1cm; }
    }
  </style>
</head>
<body onload="window.print()">
  <h1>HISTÓRIA QUIZ – ${showAnswers ? 'Megoldókulcs' : 'Feladatlap'}</h1>
  <div class="meta">
    Dátum: ${date || new Date().toLocaleDateString('hu-HU')} | Évfolyam: ${grade || '-'} | Témakör: ${topic || '-'} | Nehézség: ${difficulty || '-'}
  </div>

  ${questions.map((q, i) => `
    <div class="question-block">
      <div class="question-text">${i + 1}. ${q.question}</div>
      ${q.type === 'multiple_choice' ? `
        <ul class="options">
          ${q.options.map((opt: string, optIdx: number) => {
            const letter = String.fromCharCode(65 + optIdx);
            const isCorrect = q.correctAnswer === letter;
            const mark = showAnswers && isCorrect ? '<span class="correct-mark">✓</span>' : '';
            return `<li class="option ${showAnswers && isCorrect ? 'correct-option' : ''}">${opt}${mark}</li>`;
          }).join('')}
        </ul>
      ` : q.type === 'true_false' ? `
        <div>
           Igaz &nbsp; □ &nbsp;&nbsp;&nbsp; Hamis &nbsp; □
           ${showAnswers ? `<br/><b>Helyes válasz: ${q.correctAnswer}</b>` : ''}
        </div>
      ` : `
        ${showAnswers ? `<div><b>Elvárt válasz / Kulcsszavak:</b><br/>${q.explanation || q.hint || '-'}</div>` : `
        <div class="essay-lines">
          <div></div><div></div><div></div><div></div>
        </div>
        `}
      `}
    </div>
  `).join('')}

  <div class="footer">
    <span>Név: _____________________________</span>
    <span>Osztály: _______</span>
    <span>Dátum: ________________</span>
  </div>
</body>
</html>
  `;
  res.send(html);
});

app.post("/api/validate-questions", async (req, res) => {
  const questions = req.body;
  if (!questions || !Array.isArray(questions)) {
    res.json({ valid: false, errors: ["A JSON lista formátuma érvénytelen (tömböt várunk)."] });
    return;
  }

  const errors: string[] = [];
  const validatedQuestions: any[] = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.type || !["multiple_choice", "true_false", "essay"].includes(q.type)) {
      errors.push(`${i + 1}. kérdés: Érvénytelen vagy hiányzó 'type' (multiple_choice, true_false, vagy essay)`);
      continue;
    }
    if (!q.question || typeof q.question !== "string") {
      errors.push(`${i + 1}. kérdés: Hiányzó 'question' mező`);
      continue;
    }
    
    // Add missing IDs dynamically
    const validatedQ: any = {
      id: `bank_${Date.now()}_${i}`,
      type: q.type,
      question: q.question,
      explanation: q.explanation || "Nincs magyarázat.",
      hint: q.hint || "Nincs tipp."
    };

    if (q.type === "multiple_choice") {
      if (!q.options || !Array.isArray(q.options) || q.options.length !== 4) {
         errors.push(`${i + 1}. kérdés (Feleletválasztós): Pontosan 4 válaszopció (options tömb) szükséges`);
         continue;
      }
      if (!q.correctAnswer || (typeof q.correctAnswer !== "string" && typeof q.correctAnswer !== "number")) {
         errors.push(`${i + 1}. kérdés: Hiányzó vagy érvénytelen 'correctAnswer' (string várt, pl. '1526' vagy 'A')`);
         continue;
      }
      validatedQ.options = q.options;
      validatedQ.correctAnswer = q.correctAnswer.toString();
    } else if (q.type === "true_false") {
      if (!('correctAnswer' in q) && !('correct' in q)) {
         errors.push(`${i + 1}. kérdés (Igaz-Hamis): Hiányzó 'correctAnswer' (Igaz / Hamis vagy true / false)`);
         continue;
      }
      let cVal = q.correctAnswer !== undefined ? q.correctAnswer : q.correct;
      validatedQ.correctAnswer = (cVal === true || cVal === "Igaz" || cVal === "true") ? "Igaz" : "Hamis";
    } else if (q.type === "essay") {
      validatedQ.correctAnswer = q.correctAnswer || q.correct || "";
    }
    
    validatedQuestions.push(validatedQ);
  }

  if (errors.length > 0) {
    res.json({ valid: false, errors });
    return;
  }

  res.json({ valid: true, count: validatedQuestions.length, validatedQuestions });
});

app.post("/api/generate-lesson", async (req, res) => {
  const { grade, topic, lessonType } = req.body;
  if (!grade || !topic || !lessonType) {
    res.status(400).json({ error: "Hiányzó paraméterek" });
    return;
  }
  if (!ai) {
    res.json({
      lessonTitle: `Bemutató lecke: ${topic}`,
      cards: [
        { type: "intro", icon: "⚔️", title: "Bevezetés", content: "Mivel nincs AI API kulcs beállítva, ez csak egy rövid, statikus bemutató lecke a rendszer működésének tesztelésére." },
        { type: "flashcard", question: "Mihez szükséges API kulcs?", answer: "Az interaktív és testreszabott oktatási anyagok valós idejű generálásához." },
        { type: "fun_fact", icon: "💡", content: "Ez az alkalmazás képes a NAT 2020 törzsanyagra épülő egyedi feladatsorok készítésére." }
      ]
    });
    return;
  }
  
  const keywords = getKeywordsForTopic(topic);
  const keywordHint = keywords ? `Fontos kulcsszavak: ${keywords}` : "";

  let knowledgeSection = "";
  if (keywordHint) {
    knowledgeSection = `
KÖTELEZŐ KULCSSZAVAK ÉS TUDÁSBÁZIS - CSAK EBBŐL DOLGOZZ:
${keywordHint}
`;
  }

  let minReqSection = "";

  try {
    const strictRule = `
SZIGORÚ SZABÁLYOK:
1. KIZÁRÓLAG erről a témáról: ${topic}
2. ${knowledgeSection}
3. ${minReqSection}
4. Az intro kártyák tartalmazzanak konkrét évszámokat,
   neveket és helyszíneket!
5. A kérdések legyenek specifikusak - 
   NE általánosak! Pl:
   ROSSZ: "Mi jellemzi a forradalmat?"
   JÓ: "Mikor fogadták el az Áprilisi törvényeket?"
6. Minden matching pair a témakör 
   kulcsfogalmaiból legyen!
`;

    const prompt = `Magyar középiskolai történelemtanár vagy (NAT 2020).
Generálj interaktív leckét.
Témakör: ${topic}. Évfolyam: ${grade}.
Lecke típusa: ${lessonType}.
${strictRule}
CSAK valid JSON:
{'lessonTitle': 'Cím',
 'cards': [
   {'type':'intro','icon':'👑',
    'title':'Cím','content':'Szöveg...'},
   {'type':'flashcard',
    'question':'?','answer':'Válasz.'},
   {'type':'multiple_choice',
    'question':'?',
    'options':['A','B','C','D'],
    'correct':'B',
    'explanation':'Magyarázat.'},
   {'type':'true_false',
    'statement':'Állítás.',
    'correct':true,
    'explanation':'Magyarázat.'},
   {'type':'fun_fact',
    'icon':'💡','content':'Tény.'},
   {'type':'matching',
    'pairs':[
      {'term':'Fogalom','definition':'Def.'},
      {'term':'Fogalom2','definition':'Def2.'},
      {'term':'Fogalom3','definition':'Def3.'},
      {'term':'Fogalom4','definition':'Def4.'}
    ]}
 ]}`;

    const topicKeywords = topic.toLowerCase().replace(/[^a-záéíóöőúüű\s]/g, '').split(/\s+/).filter(w => w.length > 3 && !['korszakai', 'jellemzői', 'magyar', 'magyarország', 'története'].includes(w));
    let validResponseData: any = null;
    let attempts = 0;

    while (!validResponseData && attempts < 3) {
      attempts++;
      const response = await generateContentWithRetry({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      let rawResponse = response.text || "{}";
      
      try {
        const parsed = safeParseJSON(rawResponse);
        if (topicKeywords.length > 0) {
          const lowerResp = JSON.stringify(parsed).toLowerCase();
          if (topicKeywords.some(k => lowerResp.includes(k))) {
            validResponseData = parsed;
          } else {
             console.warn("Retrying /api/generate-lesson due to topic validation failure.");
          }
        } else {
          validResponseData = parsed;
        }
      } catch (e) {
        console.error("JSON parse error:", e);
      }
    }

    if (!validResponseData) {
      res.status(400).json({ error: "Generálás sikertelen: nem megfelelő téma" });
      return;
    }

    res.json(validResponseData);
  } catch (error: any) {
    console.error("General prompt error:", error);
    if (error?.status === 429 || error?.toString().includes("429") || error?.message?.includes("Quota exceeded") || error?.message?.includes("429")) {
      res.status(429).json({ error: "Szerver terhelés (Rate limit)", text: "" });
    } else {
      res.status(400).json({ error: "Generálás sikertelen", text: "" });
    }
  }
});

// Serve frontend assets and build integration logic
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting full-stack server in Development Mode (with Vite integration)...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting full-stack server in Production Mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TörténÉSZ server successfully listening on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Critical error while starting Express server bootstrap:", err);
});
