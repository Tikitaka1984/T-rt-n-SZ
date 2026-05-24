import React, { useState, useEffect } from "react";
import { Grade, QuestionType, QuizQuestion } from "../types";
import { Download, Upload, Trash2, Edit2, Play, Search, AlertCircle, FileText, Printer, FileJson } from "lucide-react";
import { motion } from "motion/react";
import { triggerMascotAct } from "./KnightMascot";

interface QuestionBank {
  id: string;
  title: string;
  grade: string;
  topic: string;
  questions: QuizQuestion[];
  dateAdded: string;
}

interface QuestionBankScreenProps {
  onStartBankQuiz: (questions: QuizQuestion[], count: number, startOptions: any) => void;
  onPrintWorksheet: (bank: QuestionBank) => void;
}

export default function QuestionBankScreen({ onStartBankQuiz, onPrintWorksheet }: QuestionBankScreenProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "saved" | "quiz">("upload");
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  
  // Method A: JSON Upload States
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  
  // Method B: Manual Input States
  const [manualTitle, setManualTitle] = useState("");
  const [manualGrade, setManualGrade] = useState<Grade | string>("9. évfolyam");
  const [manualTopic, setManualTopic] = useState("");
  const [manualQuestions, setManualQuestions] = useState<QuizQuestion[]>([]);
  const [currentManualQType, setCurrentManualQType] = useState<QuestionType>("multiple_choice");
  const [currentManualQ, setCurrentManualQ] = useState("");
  const [currentManualOpts, setCurrentManualOpts] = useState(["", "", "", ""]);
  const [currentManualCorrect, setCurrentManualCorrect] = useState("0");
  const [currentManualBool, setCurrentManualBool] = useState(true);
  const [currentManualExp, setCurrentManualExp] = useState("");
  const [currentManualHint, setCurrentManualHint] = useState("");

  // Saved Banks States
  const [expandedBankId, setExpandedBankId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Quiz Setup States
  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([]);
  const [quizQuestionCount, setQuizQuestionCount] = useState<number>(10);
  const [mixWithAi, setMixWithAi] = useState<boolean>(false);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(true);

  // Initialize
  useEffect(() => {
    const saved = localStorage.getItem("hq_question_banks");
    if (saved) {
      setBanks(JSON.parse(saved));
    }
    triggerMascotAct("fact", "Töltsd fel saját kérdéseidet, vitéz tanár!");
  }, []);

  const saveBanks = (newBanks: QuestionBank[]) => {
    setBanks(newBanks);
    localStorage.setItem("hq_question_banks", JSON.stringify(newBanks));
  };

  const handleJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target?.result as string;
        const data = JSON.parse(text);

        // Validate via API
        const response = await fetch("/api/validate-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data.questions || [])
        });
        
        const result = await response.json();
        if (!result.valid) {
          setUploadError("Hibás JSON formátum: " + (result.errors || []).join(", "));
          return;
        }

        const newBank: QuestionBank = {
          id: "bank_" + Date.now().toString(),
          title: data.title || "Névtelen kérdéssor",
          grade: data.grade || "Vegyes",
          topic: data.topic || "Nincs megadva",
          questions: result.validatedQuestions,
          dateAdded: new Date().toISOString()
        };

        saveBanks([...banks, newBank]);
        setUploadSuccess(`✅ ${result.count} kérdés betöltve.`);
      } catch (err) {
         setUploadError("❌ Hiba történt a fájl olvasása során.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const downloadTemplate = () => {
    const template = {
      title: "Saját kérdéssor neve",
      grade: "10. évfolyam",
      topic: "Mohács és török hódoltság",
      questions: [
        {
          type: "multiple_choice",
          question: "Mikor volt a mohácsi csata?",
          options: ["1514", "1526", "1541", "1552"],
          correctAnswer: "1526",
          explanation: "1526. augusztus 29-én...",
          hint: "II. Lajos király idején"
        },
        {
          type: "true_false",
          question: "Buda 1541-ben esett török kézre.",
          correctAnswer: "Igaz",
          explanation: "Valóban 1541-ben csellel foglalták el...",
          hint: "Szulejmán szultán idején"
        },
        {
          type: "essay",
          question: "Mutasd be a mohácsi csata okait!",
          correctAnswer: "Főpontok: belső viszályok, török túlerő...",
          explanation: "Belső és külső okok komplexitása...",
          hint: "Gondolj a védelem hiányosságaira"
        }
      ]
    };
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kerdes_sablon.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const addManualQuestion = () => {
    if (!currentManualQ.trim()) return;
    
    let correctAnswer = "";
    let options: string[] | undefined;

    if (currentManualQType === "multiple_choice") {
      options = currentManualOpts;
      correctAnswer = currentManualOpts[parseInt(currentManualCorrect)];
    } else if (currentManualQType === "true_false") {
      correctAnswer = currentManualBool ? "Igaz" : "Hamis";
    } else {
      correctAnswer = currentManualCorrect;
    }

    const newQ: QuizQuestion = {
      id: "q_man_" + Date.now().toString(),
      type: currentManualQType,
      question: currentManualQ,
      options,
      correctAnswer,
      explanation: currentManualExp,
      hint: currentManualHint
    };

    setManualQuestions([...manualQuestions, newQ]);
    
    // Reset fields
    setCurrentManualQ("");
    setCurrentManualOpts(["", "", "", ""]);
    setCurrentManualExp("");
    setCurrentManualHint("");
    setCurrentManualCorrect("0");
    setCurrentManualBool(true);
  };

  const saveManualBank = () => {
    if (manualQuestions.length === 0) return;
    const newBank: QuestionBank = {
      id: "bank_" + Date.now().toString(),
      title: manualTitle || "Kézi kérdéssor",
      grade: manualGrade,
      topic: manualTopic || "Általános",
      questions: manualQuestions,
      dateAdded: new Date().toISOString()
    };
    saveBanks([...banks, newBank]);
    setManualQuestions([]);
    setManualTitle("");
    setManualTopic("");
    alert("Mentve a kérdésbankba!");
  };

  const deleteBank = (id: string) => {
    if (window.confirm("Biztosan törlöd ezt a kérdéssort?")) {
      saveBanks(banks.filter(b => b.id !== id));
    }
  };
  
  const startQuizFromBanks = () => {
    if (selectedBankIds.length === 0) return;
    let questions: QuizQuestion[] = [];
    selectedBankIds.forEach(id => {
      const bank = banks.find(b => b.id === id);
      if (bank) questions.push(...bank.questions);
    });
    
    if (shuffleQuestions) {
       questions = questions.sort(() => 0.5 - Math.random());
    }
    
    onStartBankQuiz(questions.slice(0, quizQuestionCount), quizQuestionCount, {
       mixWithAi,
       grade: "Vegyes",
       topic: "Saját kérdések",
       difficulty: "Közepes"
    });
  };

  // Filter 
  const filteredBanks = banks.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 relative">
      <div className="flex gap-4 mb-6 sticky top-0 bg-[#F5E6CD] z-30 p-2 rounded border border-[#B8860B] shadow-sm">
        <button 
          onClick={() => setActiveTab("upload")}
          className={`flex-1 py-2 px-4 rounded-[3px] font-cinzel font-bold text-sm tracking-wider transition-colors ${activeTab === 'upload' ? 'bg-[#6B1010] text-[#FFF5E0]' : 'bg-[#E3CBA8] text-[#1C0E04] hover:bg-[#D4B68E]'}`}
        >
          📤 Feltöltés
        </button>
        <button 
          onClick={() => setActiveTab("saved")}
          className={`flex-1 py-2 px-4 rounded-[3px] font-cinzel font-bold text-sm tracking-wider transition-colors ${activeTab === 'saved' ? 'bg-[#6B1010] text-[#FFF5E0]' : 'bg-[#E3CBA8] text-[#1C0E04] hover:bg-[#D4B68E]'}`}
        >
          📋 Saját kérdések ({banks.length})
        </button>
        <button 
          onClick={() => setActiveTab("quiz")}
          className={`flex-1 py-2 px-4 rounded-[3px] font-cinzel font-bold text-sm tracking-wider transition-colors ${activeTab === 'quiz' ? 'bg-[#6B1010] text-[#FFF5E0]' : 'bg-[#E3CBA8] text-[#1C0E04] hover:bg-[#D4B68E]'}`}
        >
          🎯 Kvíz ebből
        </button>
      </div>

      <div className="bg-[#FFFDD0]/30 p-6 rounded border-2 border-[#B8860B] shadow-xl relative min-h-[60vh]">
        {activeTab === "upload" && (
          <div className="space-y-8">
            {/* METHOD A */}
            <div className="bg-[#1A0A03] border border-[#B8860B] rounded p-6 text-[#FFF5E0]">
              <h3 className="font-cinzel text-xl font-bold mb-4 flex items-center gap-2"><FileJson className="w-6 h-6 text-[#B8860B]" /> METHOD A: JSON Fájl Feltöltése</h3>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="relative p-8 border-2 border-dashed border-[#B8860B]/50 rounded-lg text-center hover:bg-[#B8860B]/10 transition-colors cursor-pointer group">
                    <input type="file" accept=".json" onChange={handleJsonUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <Upload className="w-10 h-10 mx-auto mb-2 text-[#B8860B] group-hover:text-[#FFF5E0] transition-colors" />
                    <p className="font-lora text-sm">Húzd ide a JSON fájlt vagy kattints a tallózáshoz</p>
                  </div>
                  {uploadError && <p className="text-red-400 font-bold text-sm">{uploadError}</p>}
                  {uploadSuccess && <p className="text-green-400 font-bold text-sm">{uploadSuccess}</p>}
                  
                  <button onClick={downloadTemplate} className="w-full py-2 bg-[#B8860B] hover:bg-[#9A6F0A] text-[#1C0E04] font-cinzel font-bold tracking-wider rounded transition-colors flex justify-center items-center gap-2">
                    <Download className="w-4 h-4" /> 📥 Sablon letöltése
                  </button>
                </div>
                
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wider text-[#B8860B] mb-2 font-cinzel font-bold">JSON Minta:</p>
                  <pre className="bg-black/50 p-4 rounded text-xs font-mono text-[#D4B68E] overflow-x-auto max-h-[250px] overflow-y-auto border border-[#B8860B]/30">
                    {`{
  "title": "Saját kérdéssor neve",
  "grade": "10. évfolyam",
  "topic": "Mohács és török hódoltság",
  "questions": [
    {
      "type": "multiple_choice",
      "question": "Mikor volt a mohácsi csata?",
      "options": ["1514","1526","1541","1552"],
      "correctAnswer": "1526",
      "explanation": "1526. augusztus...",
      "hint": "II. Lajos király..."
    }
  ]
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* METHOD B */}
            <div className="bg-[#D8C3A5] border border-[#B8860B] rounded p-6">
              <h3 className="font-cinzel text-xl font-bold mb-4 text-[#1C0E04] flex items-center gap-2"><Edit2 className="w-6 h-6 text-[#6B1010]" /> METHOD B: Kézi Bevitel</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs uppercase tracking-wider font-cinzel font-bold text-[#6B1010] block mb-1">Kérdéssor Neve</label>
                  <input value={manualTitle} onChange={e=>setManualTitle(e.target.value)} className="w-full p-2 rounded bg-white/50 border border-[#B8860B] focus:outline-none" placeholder="Pl: Dolgozat felkészítő" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider font-cinzel font-bold text-[#6B1010] block mb-1">Témakör</label>
                  <input value={manualTopic} onChange={e=>setManualTopic(e.target.value)} className="w-full p-2 rounded bg-white/50 border border-[#B8860B] focus:outline-none" placeholder="Pl: Honfoglalás" />
                </div>
              </div>

              <div className="bg-white/40 p-4 rounded border border-[#B8860B]/40 mb-4">
                <div className="mb-4">
                  <label className="text-xs uppercase tracking-wider font-cinzel font-bold text-[#1C0E04] block mb-1">Kérdés Típusa</label>
                  <select value={currentManualQType} onChange={e=>setCurrentManualQType(e.target.value as any)} className="w-full p-2 rounded bg-white border border-[#B8860B] focus:outline-none font-bold">
                    <option value="multiple_choice">Feleletválasztós (A, B, C, D)</option>
                    <option value="true_false">Igaz-Hamis</option>
                    <option value="essay">Rövid Esszé</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="text-xs uppercase tracking-wider font-cinzel font-bold text-[#1C0E04] block mb-1">Kérdés Szövege</label>
                  <textarea value={currentManualQ} onChange={e=>setCurrentManualQ(e.target.value)} className="w-full p-2 rounded bg-white border border-[#B8860B] focus:outline-none resize-none" rows={2} />
                </div>

                {currentManualQType === "multiple_choice" && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {currentManualOpts.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input type="radio" name="man_opt_correct" checked={currentManualCorrect === i.toString()} onChange={() => setCurrentManualCorrect(i.toString())} />
                        <input value={opt} onChange={e=>{
                          const newOpts = [...currentManualOpts];
                          newOpts[i] = e.target.value;
                          setCurrentManualOpts(newOpts);
                        }} className="flex-1 p-2 border border-[#B8860B]/50 rounded text-sm bg-white" placeholder={`${i+1}. válasz`} />
                      </div>
                    ))}
                  </div>
                )}

                {currentManualQType === "true_false" && (
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer font-bold"><input type="radio" checked={currentManualBool} onChange={()=>setCurrentManualBool(true)} /> Igaz</label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold"><input type="radio" checked={!currentManualBool} onChange={()=>setCurrentManualBool(false)} /> Hamis</label>
                  </div>
                )}
                
                {currentManualQType === "essay" && (
                  <div className="mb-4">
                     <label className="text-xs uppercase tracking-wider font-cinzel font-bold text-[#1C0E04] block mb-1">Kulcsszavak / Helyes tartalom</label>
                     <textarea value={currentManualCorrect} onChange={e=>setCurrentManualCorrect(e.target.value)} className="w-full p-2 rounded bg-white border border-[#B8860B] focus:outline-none text-sm" placeholder="A helyes értékeléshez szükséges kulcsszavak..." rows={2} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider font-cinzel font-bold text-[#1C0E04] block mb-1">Magyarázat</label>
                    <input value={currentManualExp} onChange={e=>setCurrentManualExp(e.target.value)} className="w-full p-2 rounded bg-white border border-[#B8860B] focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider font-cinzel font-bold text-[#1C0E04] block mb-1">Tipp / Segítség</label>
                    <input value={currentManualHint} onChange={e=>setCurrentManualHint(e.target.value)} className="w-full p-2 rounded bg-white border border-[#B8860B] focus:outline-none text-sm" />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button onClick={addManualQuestion} className="px-4 py-2 bg-[#6B1010] text-[#FFF5E0] rounded font-cinzel uppercase tracking-wider text-xs font-bold hover:bg-[#801515] transition-colors">
                    ➕ Kérdés hozzáadása
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#B8860B]/30 pt-4">
                <span className="font-cinzel font-bold text-[#6B1010]">{manualQuestions.length} kérdés hozzáadva</span>
                <div className="flex gap-2">
                  <button onClick={()=>setManualQuestions([])} className="px-3 py-2 border border-[#6B1010] text-[#6B1010] rounded text-xs font-bold uppercase hover:bg-[#6B1010]/10">🗑️ Törlés</button>
                  <button onClick={saveManualBank} disabled={manualQuestions.length === 0} className="px-4 py-2 bg-[#1A0A03] text-[#FFF5E0] rounded text-xs font-bold font-cinzel uppercase tracking-wider disabled:opacity-50 flex items-center gap-1">
                   💾 Mentés Kérdésbankba
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === "saved" && (
          <div>
            <div className="mb-4 relative">
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-[#B8860B]" />
              <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Keresés kérdéssorok között..." className="w-full pl-10 pr-4 py-2 border-2 border-[#B8860B] bg-[#FFF5D0] rounded font-lora text-[#1C0E04] focus:outline-none" />
            </div>

            {filteredBanks.length === 0 ? (
              <p className="text-center py-10 font-cinzel font-bold text-[#1C0E04]/50">Nincs még elmentett kérdéssorod.</p>
            ) : (
              <div className="grid gap-4">
                {filteredBanks.map(bank => (
                  <div key={bank.id} className="border-2 border-[#B8860B] bg-[#FFF5D0] rounded p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2 cursor-pointer" onClick={() => setExpandedBankId(expandedBankId === bank.id ? null : bank.id)}>
                      <div>
                        <h4 className="font-cinzel font-bold text-lg text-[#6B1010] uppercase tracking-wider">{bank.title}</h4>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[11px] bg-[#B8860B]/20 text-[#6B1010] px-2 py-0.5 rounded font-bold uppercase">{bank.grade}</span>
                          <span className="text-[11px] bg-[#B8860B]/20 text-[#6B1010] px-2 py-0.5 rounded font-bold uppercase">{bank.topic}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block font-bold text-sm text-[#1C0E04]">{bank.questions.length} kérdés</span>
                        <span className="text-[11px] text-[#A0A0A0]">{new Date(bank.dateAdded).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-4 text-xs font-bold text-[#1C0E04]/70 mb-4 border-b border-[#B8860B]/20 pb-2">
                       <span><span className="text-green-700">MC:</span> {bank.questions.filter(q=>q.type === 'multiple_choice').length}</span>
                       <span><span className="text-blue-700">I/H:</span> {bank.questions.filter(q=>q.type === 'true_false').length}</span>
                       <span><span className="text-orange-700">Esszé:</span> {bank.questions.filter(q=>q.type === 'essay').length}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button onClick={()=> { setSelectedBankIds([bank.id]); setActiveTab("quiz"); }} className="px-3 py-1.5 bg-[#6B1010] text-[#FFF5E0] rounded-[2px] text-xs font-cinzel font-bold uppercase tracking-wider flex items-center gap-1"><Play className="w-3 h-3" /> Kvíz Indítása</button>
                      <button onClick={()=> onPrintWorksheet(bank)} className="px-3 py-1.5 bg-[#1C0E04] text-[#FFF5E0] rounded-[2px] text-xs font-cinzel font-bold uppercase tracking-wider flex items-center gap-1"><Printer className="w-3 h-3" /> Feladatlap</button>
                      <button onClick={()=> deleteBank(bank.id)} className="px-3 py-1.5 border border-[#B22222] text-[#B22222] rounded-[2px] text-xs font-cinzel font-bold uppercase tracking-wider flex items-center gap-1 ml-auto"><Trash2 className="w-3 h-3" /> Törlés</button>
                    </div>

                    {expandedBankId === bank.id && (
                      <div className="mt-4 pt-4 border-t border-[#B8860B]/30 space-y-2 max-h-60 overflow-y-auto">
                        {bank.questions.map((q, idx) => (
                           <div key={idx} className="p-2 border border-[#B8860B]/20 rounded bg-white/40 flex items-start gap-2">
                             <span className={`text-[11px] px-1.5 py-0.5 rounded font-bold uppercase mt-0.5 ${q.type==='multiple_choice'?'bg-green-100 text-green-800' : q.type==='true_false'?'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                               {q.type==='multiple_choice' ? 'MC' : q.type==='true_false' ? 'I/H' : 'Esszé'}
                             </span>
                             <p className="text-sm font-lora">{q.question}</p>
                           </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "quiz" && (
           <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-[#FFF5D0] p-6 border-2 border-[#B8860B] rounded">
                <h3 className="font-cinzel text-xl font-bold mb-4 uppercase text-[#6B1010]">Melyik kérdéssorokból induljon a kvíz?</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto mb-6">
                  {banks.map(bank => (
                    <label key={bank.id} className="flex items-center gap-3 p-2 hover:bg-[#B8860B]/10 cursor-pointer rounded">
                      <input type="checkbox" className="w-4 h-4" checked={selectedBankIds.includes(bank.id)} onChange={(e) => {
                         if (e.target.checked) setSelectedBankIds([...selectedBankIds, bank.id]);
                         else setSelectedBankIds(selectedBankIds.filter(id => id !== bank.id));
                      }} />
                      <span className="font-bold text-[#1C0E04]">{bank.title} <span className="text-xs font-normal opacity-70">({bank.questions.length} kérdés)</span></span>
                    </label>
                  ))}
                  {banks.length === 0 && <p className="text-sm italic opacity-50">Nincs elmentett kérdéssor.</p>}
                </div>

                <h3 className="font-cinzel text-lg font-bold mb-2 uppercase text-[#1C0E04]">Kvíz beállítások</h3>
                <div className="space-y-4 text-sm font-lora border-t border-[#B8860B]/20 pt-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={mixWithAi} onChange={e=>setMixWithAi(e.target.checked)} className="w-4 h-4" />
                    <span>AI kérdések keverése mellé (kiegészítés)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={shuffleQuestions} onChange={e=>setShuffleQuestions(e.target.checked)} className="w-4 h-4" />
                    <span>Kérdések összekeverése</span>
                  </label>
                  <div className="flex items-center gap-4">
                     <span className="whitespace-nowrap font-bold">Kérdések száma:</span>
                     <input type="range" min="5" max="50" step="5" value={quizQuestionCount} onChange={e=>setQuizQuestionCount(parseInt(e.target.value))} className="flex-1 accent-[#6B1010]" />
                     <span className="font-bold bg-[#1C0E04] text-[#FFF5E0] px-2 py-0.5 rounded">{quizQuestionCount} db</span>
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <button 
                     onClick={startQuizFromBanks}
                     disabled={selectedBankIds.length === 0}
                     className="px-8 py-3 bg-[#6B1010] hover:bg-[#801515] text-[#FFF5E0] font-cinzel tracking-widest font-bold uppercase rounded-[2px] disabled:opacity-50 transition-colors shadow-lg cursor-pointer flex items-center gap-2"
                  >
                    <Play className="w-5 h-5"/> Kvíz Indítása
                  </button>
                </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
