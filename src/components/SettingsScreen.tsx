import React, { useState, useEffect } from "react";
import { Sliders, Sparkles, BookOpen, Clock, AlertCircle, ArrowRight, Play, Upload, FileText, CheckCircle2, Loader2, X } from "lucide-react";
import { motion } from "motion/react";
import { Grade, QuestionTypeSetting, Difficulty } from "../types";
import { TOPICS } from "../data/topics";
import { MINIMUM_REQUIREMENTS } from "../data/minimumRequirements";
import { QRCodeCanvas } from "qrcode.react";
import { TopicSelector } from "./TopicSelector";

interface SettingsScreenProps {
  onStartQuiz: (settings: {
    grade: Grade | string;
    topic: string;
    difficulty: Difficulty;
    questionType: QuestionTypeSetting;
    count: number;
    documentText?: string;
    playerName: string;
  }) => void;
  onCancel: () => void;
}

export default function SettingsScreen({ onStartQuiz, onCancel }: SettingsScreenProps) {
  const [mode, setMode] = useState<"topic" | "document">("topic");
  const [showQRModal, setShowQRModal] = useState(false);
  
  // Minimum requirements modal
  const [showReqModal, setShowReqModal] = useState(false);
  
  // Player name
  const [playerName, setPlayerName] = useState<string>("");

  // Preset defaults
  const [grade, setGrade] = useState<string>("⚱️ Őskor és ókori Kelet");
  const [topic, setTopic] = useState<string>("Az őskor korszakai és jellemzői");
  const [difficulty, setDifficulty] = useState<Difficulty>("Közepes");
  const [questionType, setQuestionType] = useState<QuestionTypeSetting>("Vegyes");
  const [count, setCount] = useState<number>(5);

  // Document mode state
  const [documentText, setDocumentText] = useState<string>("");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadError, setUploadError] = useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // States for direct print option
  const [worksheetLoading, setWorksheetLoading] = useState<"student" | "teacher" | null>(null);
  const [worksheetError, setWorksheetError] = useState<string>("");

  const handleGenerateWorksheetDirectly = async (showAnswers: boolean) => {
    if (mode === "document" && !documentText) {
      setWorksheetError("Kérlek először tölts fel egy dokumentumot.");
      return;
    }
    
    setWorksheetLoading(showAnswers ? "teacher" : "student");
    setWorksheetError("");
    
    try {
      // 1. Generate the questions via /api/quiz/generate
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade,
          topic: mode === "document" ? "Forrás: feltöltött dokumentum" : topic,
          difficulty,
          type: questionType,
          count,
          documentText: mode === "document" ? documentText : undefined
        })
      });

      if (!response.ok) {
        throw new Error("Sikertelen kérdésgenerálás a szervertől.");
      }

      const rawText = await response.text();
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (e) {
        throw new Error("Érvénytelen válasz a szervertől (nem JSON).");
      }

      if (!data.questions || data.questions.length === 0) {
        throw new Error("Nem sikerült kérdéseket generálni.");
      }

      // 2. Fetch the formatted HTML from /api/worksheet
      const worksheetResponse = await fetch("/api/worksheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: data.questions,
          date: new Date().toLocaleDateString('hu-HU'),
          grade,
          topic: mode === "document" ? "Saját dokumentum" : topic,
          difficulty,
          showAnswers
        })
      });

      if (worksheetResponse.ok) {
        const html = await worksheetResponse.text();
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
        } else {
          throw new Error("Nem sikerült megnyitni az új fület. Kérlek engedélyezd a felugró ablakokat!");
        }
      } else {
        throw new Error("Nem sikerült lekérni a feladatlap formázást.");
      }
    } catch (err: any) {
      console.error(err);
      setWorksheetError(err?.message || "Váratlan hiba történt a feladatlap generálása közben.");
    } finally {
      setWorksheetLoading(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "document" && !documentText) {
      return;
    }
    onStartQuiz({
      grade,
      topic: mode === "document" ? "Forrás: feltöltött dokumentum" : topic,
      difficulty,
      questionType,
      count,
      documentText: mode === "document" ? documentText : undefined,
      playerName: playerName || "Névtelen"
    });
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    // Validate size (10 MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus("error");
      setUploadError("A fájl túl nagy (maximum 10 MB)");
      return;
    }

    const ext = file.name.slice((file.name.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
    if (ext !== "pdf" && ext !== "docx") {
      setUploadStatus("error");
      setUploadError("Csak PDF és Word (.docx) fájl tölthető fel");
      return;
    }

    setUploadStatus("uploading");
    setUploadError("");
    setDocumentText("");
    setUploadedFileName(file.name);

    const formData = new FormData();
    formData.append("document", file);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errMsg = "A fájl feldolgozása nem sikerült";
        try {
          const rawErr = await response.text();
          const errData = rawErr ? JSON.parse(rawErr) : {};
          if (errData.error) errMsg = errData.error;
        } catch (e) {}
        throw new Error(errMsg);
      }

      const rawText = await response.text();
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (e) {
        throw new Error("Érvénytelen válasz a szervertől (nem JSON).");
      }
      
      if (!data.text || data.text.trim().length === 0) {
        throw new Error("A dokumentum nem tartalmaz olvasható szöveget");
      }

      setDocumentText(data.text);
      setUploadStatus("success");
    } catch (err: any) {
      console.error(err);
      setUploadStatus("error");
      setUploadError(err.message || "A fájl feldolgozása nem sikerült");
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8" id="settings-screen-wrap">
      <div className="medieval-card p-6 sm:p-8">
        {/* Title */}
        <div className="flex gap-3 items-center mb-6 pb-4 border-b-2 border-[#B8860B]/40" id="settings-header">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#6B1010] block font-cinzel font-bold mb-1">Konfiguráció</span>
            <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-[#6B1010]">Gyakorló beállításai</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" id="settings-form">
          {/* Mode Toggle */}
          <div className="flex bg-[#FFF5D0]/60 p-1 rounded-[3px] border-2 border-[#B8860B]/30 mb-6 font-cinzel font-bold">
            <button
              type="button"
              className={`flex-1 py-2 text-xs uppercase tracking-wider transition-colors rounded-[2px] ${mode === "topic" ? "bg-[#6B1010] text-[#F7EAC8] shadow-md border border-[#B8860B]" : "text-[#1C0E04] hover:bg-[#FFF5D0]"}`}
              onClick={() => setMode("topic")}
            >
              Témakörből
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-xs uppercase tracking-wider transition-colors rounded-[2px] ${mode === "document" ? "bg-[#6B1010] text-[#F7EAC8] shadow-md border border-[#B8860B]" : "text-[#1C0E04] hover:bg-[#FFF5D0]"}`}
              onClick={() => setMode("document")}
            >
              Saját dokumentumból
            </button>
          </div>

          {/* Player Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-cinzel font-bold uppercase tracking-wider text-[#1C0E04] block" htmlFor="input-name">
              Neved (toplista bejegyzéshez)
            </label>
            <input
              type="text"
              id="input-name"
              placeholder="pl. Kovács Péter"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3.5 py-3 rounded-[3px] border-2 border-[#B8860B] bg-[#FFF5D0] text-[#1C0E04] text-xs sm:text-sm focus:border-[#6B1010] focus:outline-none font-lora font-bold"
            />
          </div>

          {mode === "topic" ? (
            <div className="space-y-4">
              <TopicSelector selectedTopic={topic} onTopicChange={setTopic} onGradeChange={setGrade} />
              
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowReqModal(true)}
                  className="px-4 py-3 bg-[#6B1010] hover:bg-[#801515] text-[#F7EAC8] rounded-[3px] border border-[#B8860B] text-xs font-cinzel font-bold uppercase tracking-wider transition-colors flex items-center justify-center whitespace-nowrap cursor-pointer shadow-sm btn-shine-effect"
                >
                  📋 Min. követelmények
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 pb-2">
              <label className="text-xs font-cinzel font-bold uppercase tracking-wider text-[#1C0E04] block">
                Új Kódex Feltöltése
              </label>
              
              <div 
                className={`border-2 border-dashed ${uploadStatus === "uploading" ? "border-[#6B1010]/60 bg-[#6B1010]/5" : "border-[#B8860B] bg-[#FFF5D0]/60 hover:bg-[#FFF5D0] cursor-pointer"} rounded-[3px] p-6 text-center transition-colors relative flex flex-col items-center justify-center`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => uploadStatus !== "uploading" && fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".pdf,.docx" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                
                {uploadStatus === "idle" && (
                  <>
                    <Upload className="w-8 h-8 text-[#6B1010] mb-2" />
                    <p className="font-lora text-sm text-[#1C0E04] font-bold">Húzd ide a fájlt vagy kattints a feltöltéshez</p>
                    <p className="text-[10px] font-cinzel text-[#6B1010]/70 uppercase tracking-widest mt-2">Csak PDF & DOCX (Max 10MB)</p>
                  </>
                )}

                {uploadStatus === "uploading" && (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-8 h-8 text-[#6B1010] animate-spin mb-2" />
                    <p className="font-cinzel text-xs font-bold text-[#6B1010] uppercase tracking-wider">Kódex tartalmának kinyerése...</p>
                  </div>
                )}

                {uploadStatus === "error" && (
                  <>
                    <X className="w-8 h-8 text-[#8B1A1A] mb-2" />
                    <p className="font-lora text-sm text-[#8B1A1A] font-bold">{uploadError}</p>
                    <p className="font-cinzel text-[10px] mt-2 underline text-[#8B1A1A] uppercase">Próbálkozz újból</p>
                  </>
                )}

                {uploadStatus === "success" && (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-[#2D6A4F] mb-1" />
                    <p className="font-cinzel text-xs font-bold text-[#2D6A4F] uppercase tracking-wider mt-1 mb-3">{uploadedFileName}</p>
                    <div className="text-left w-full max-w-sm mt-1 border-t-2 border-[#B8860B]/30 pt-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-cinzel text-[#6B1010] font-bold uppercase tracking-widest mb-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{documentText.length} karakter kinyerve</span>
                      </div>
                      <p className="text-xs font-lora italic text-[#1C0E04]/70 line-clamp-3 bg-white/40 p-2 border border-[#B8860B]/30">
                        "{documentText.substring(0, 200)}..."
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Grid layout for remaining options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 3. Difficulty */}
            <div className="space-y-1.5">
              <label className="text-xs font-cinzel font-bold uppercase tracking-wider text-[#1C0E04] block" htmlFor="select-difficulty">
                Nehézségi szint
              </label>
              <select
                id="select-difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-3.5 py-3 rounded-[3px] border-2 border-[#B8860B] bg-[#FFF5D0] text-[#1C0E04] text-xs sm:text-sm focus:border-[#6B1010] focus:outline-none cursor-pointer font-lora font-bold"
              >
                <option value="Könnyű">Könnyű (Alapfogalmak)</option>
                <option value="Közepes">Közepes (Átlagos érettségi)</option>
                <option value="Nehéz">Nehéz (Emelt szintű)</option>
              </select>
            </div>

            {/* 4. Question Count */}
            <div className="space-y-1.5">
              <label className="text-xs font-cinzel font-bold uppercase tracking-wider text-[#1C0E04] block" htmlFor="select-count">
                Kérdések száma
              </label>
              <select
                id="select-count"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-3 rounded-[3px] border-2 border-[#B8860B] bg-[#FFF5D0] text-[#1C0E04] text-xs sm:text-sm focus:border-[#6B1010] focus:outline-none cursor-pointer font-lora font-bold"
              >
                <option value={5}>5 kérdés</option>
                <option value={10}>10 kérdés</option>
                <option value={15}>15 kérdés</option>
                <option value={20}>20 kérdés</option>
              </select>
            </div>
          </div>

          {/* 5. Question type */}
          <div className="space-y-1.5">
            <label className="text-xs font-cinzel font-bold uppercase tracking-wider text-[#1C0E04] block">
              Kérdések típusa
            </label>
            <div className="grid grid-cols-2 gap-2" id="question-type-picker">
              {(["Vegyes", "Csak feleletválasztós", "Igaz-Hamis", "Rövid esszé"] as QuestionTypeSetting[]).map((type) => {
                const isSelected = questionType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setQuestionType(type)}
                    className={`py-3 px-3 rounded-[3px] text-xs font-cinzel font-bold uppercase tracking-wider border-2 text-center transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#6B1010] border-[#B8860B] text-[#F7EAC8] shadow-md"
                        : "bg-[#FFF5D0]/60 border-[#B8860B]/35 text-[#1C0E04] hover:border-[#6B1010] hover:bg-[#FFF5D0]"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tanári gyorsfeladatlap fül */}
          <div className="border hover:border-dashed border-[#B8860B]/50 rounded-[3px] p-4 bg-[#FFF5D0]/30 space-y-3">
            <div>
              <h4 className="text-[10px] font-cinzel font-bold text-[#6D1B1B] uppercase tracking-wider block mb-1">Tanári gyors nyomtatás</h4>
              <p className="text-xs text-[#1C0E04]/75 font-lora">Generálj le és nyomtass ki azonnal egy egyedi feladatlapot a fenti beállításokkal, anélkül, hogy végigjátszanád a kvízt.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                disabled={worksheetLoading !== null || (mode === "document" && uploadStatus !== "success")}
                onClick={() => handleGenerateWorksheetDirectly(false)}
                className="flex-1 py-2 sm:py-2.5 bg-[#B8860B]/10 hover:bg-[#6B1010]/10 disabled:opacity-50 text-[#6B1010] rounded-[3px] border border-[#B8860B] text-xs font-cinzel font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {worksheetLoading === "student" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6B1010]" />
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 100 4h12M9 21h6M9 17h6M5 13h14M17 17v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4"></path></svg>
                )}
                <span>📝 Feladatlap</span>
              </button>
              
              <button
                type="button"
                disabled={worksheetLoading !== null || (mode === "document" && uploadStatus !== "success")}
                onClick={() => handleGenerateWorksheetDirectly(true)}
                className="flex-1 py-2 sm:py-2.5 bg-[#B8860B]/15 hover:bg-[#6B1010]/15 disabled:opacity-50 text-[#8B1A1A] rounded-[3px] border border-[#B8860B] text-xs font-cinzel font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {worksheetLoading === "teacher" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8B1A1A]" />
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                )}
                <span>🗝️ Megoldókulcs</span>
              </button>
            </div>
            {worksheetError && (
              <p className="text-xs text-red-700 font-lora italic text-center mt-1">{worksheetError}</p>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3.5 border-1.5 border-[#B8860B] bg-[#9A6F0A] hover:bg-[#B3830E] text-[#FFF5D0] rounded-[3px] text-xs font-cinzel font-bold uppercase tracking-widest transition-colors cursor-pointer btn-shine-effect"
              >
                Mégse
              </button>
              <button
                type="submit"
                disabled={mode === "document" && uploadStatus !== "success"}
                className="flex-2 py-3.5 bg-[#6B1010] hover:bg-[#801515] disabled:opacity-50 disabled:bg-[#9A6F0A]/20 text-[#F7EAC8] rounded-[3px] border-1.5 border-[#B8860B] text-xs font-cinzel font-bold uppercase tracking-[0.18em] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:cursor-not-allowed btn-shine-effect"
                id="submit-settings-btn"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Indítás</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <button
               type="button"
               onClick={() => setShowQRModal(true)}
               className="w-full py-3 bg-[#1C0E04]/60 hover:bg-[#1C0E04] text-[#F7EAC8] rounded-[3px] border border-[#B8860B]/50 text-xs font-cinzel font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer btn-shine-effect"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
              <span>Megosztás</span>
            </button>
          </div>
        </form>
      </div>

      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-[#FFF5D0] border-2 border-[#B8860B] rounded-[3px] p-6 max-w-sm w-full relative shadow-2xl">
            <h3 className="text-xl font-cinzel font-bold text-[#6B1010] text-center mb-2">Küldd el a diákoknak!</h3>
            <p className="text-sm font-lora text-[#1C0E04]/80 text-center mb-6">Olvassák be a QR kódot és ugyanezt a kvízt kapják</p>
            
            <div className="flex justify-center mb-6 bg-white p-4 rounded border border-[#B8860B]/30 mx-auto w-fit">
               <QRCodeCanvas 
                 id="qr-code-canvas"
                 value={JSON.stringify({topic, grade, difficulty, qtype: questionType, qcount: count})} 
                 size={200}
                 level="M"
               />
            </div>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement;
                  if (canvas) {
                    const url = canvas.toDataURL("image/png");
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "historia-quiz-qr.png";
                    a.click();
                  }
                }}
                className="w-full bg-[#6B1010] hover:bg-[#801515] text-[#F7EAC8] py-3 text-xs font-cinzel font-bold uppercase transition-colors rounded-[3px] border border-[#B8860B]"
              >
                QR kód letöltése
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-full bg-transparent text-[#6B1010] border-2 border-[#6B1010] hover:bg-[#6B1010] hover:text-[#F7EAC8] py-3 text-xs font-cinzel font-bold uppercase transition-colors rounded-[3px]"
              >
                Bezárás
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minimum Requirements Modal */}
      {showReqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FFF5D0] border-2 border-[#B8860B] rounded-[3px] p-6 max-w-2xl w-full relative shadow-2xl max-h-[85vh] flex flex-col">
            <button 
              onClick={() => setShowReqModal(false)}
              className="absolute top-4 right-4 text-[#8B1A1A] hover:text-[#6B1010] font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
              Bezárás
            </button>

            <h3 className="text-lg sm:text-xl font-cinzel font-bold text-[#6B1010] mb-4 pr-16 leading-tight">
              Minimum követelmények – {topic}
            </h3>
            
            <div className="overflow-y-auto flex-1 pr-2 space-y-6">
              {MINIMUM_REQUIREMENTS[topic as keyof typeof MINIMUM_REQUIREMENTS] ? (
                <>
                  <div>
                    <h4 className="font-cinzel text-sm font-bold text-[#1C0E04] uppercase tracking-wider mb-2 border-b border-[#B8860B]/30 pb-1">Fogalmak</h4>
                    <div className="flex flex-wrap gap-2">
                       {MINIMUM_REQUIREMENTS[topic as keyof typeof MINIMUM_REQUIREMENTS].fogalmak.map(f => (
                         <span key={f} className="px-2.5 py-1 bg-[#B8860B] text-[#1C0E04] border border-[#9A6F0A] rounded-[2px] text-xs font-lora font-bold shadow-sm whitespace-nowrap">{f}</span>
                       ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-cinzel text-sm font-bold text-[#1C0E04] uppercase tracking-wider mb-2 border-b border-[#B8860B]/30 pb-1">Személyek</h4>
                    <div className="flex flex-wrap gap-2">
                       {MINIMUM_REQUIREMENTS[topic as keyof typeof MINIMUM_REQUIREMENTS].szemelyek.map(sz => (
                         <span key={sz} className="px-2.5 py-1 bg-[#8B1A1A] text-[#F7EAC8] border border-[#6B1010] rounded-[2px] text-xs font-lora font-bold shadow-sm whitespace-nowrap">{sz}</span>
                       ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-cinzel text-sm font-bold text-[#1C0E04] uppercase tracking-wider mb-2 border-b border-[#B8860B]/30 pb-1">Topográfia</h4>
                    <div className="flex flex-wrap gap-2">
                       {MINIMUM_REQUIREMENTS[topic as keyof typeof MINIMUM_REQUIREMENTS].topografia.map(t => (
                         <span key={t} className="px-2.5 py-1 bg-[#3A2210] text-[#F7EAC8] border border-[#2A1005] rounded-[2px] text-xs font-lora font-bold shadow-sm whitespace-nowrap">{t}</span>
                       ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-cinzel text-sm font-bold text-[#1C0E04] uppercase tracking-wider mb-2 border-b border-[#B8860B]/30 pb-1">Évszámok</h4>
                    <div className="flex flex-wrap gap-2">
                       {MINIMUM_REQUIREMENTS[topic as keyof typeof MINIMUM_REQUIREMENTS].evszamok.map(e => (
                         <span key={e} className="px-2.5 py-1 bg-[#2D6A4F] text-[#F7EAC8] border border-[#1B4332] rounded-[2px] text-xs font-lora font-bold shadow-sm">{e}</span>
                       ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center bg-[#1C0E04]/5 rounded-[3px] border border-[#B8860B]/20">
                  <p className="font-lora text-sm font-bold text-[#6B1010]">Ehhez a témakörhöz nem tartozik külön minimum követelmény lista.</p>
                  <p className="font-lora text-xs text-[#1C0E04]/60 mt-2">Általános történelmi tudás szükséges.</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-[#B8860B]/30 flex justify-between items-center text-[10px] sm:text-xs">
              <span className="font-lora italic text-[#1C0E04]/70">Forrás: Érettségi követelmények 2017-</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
