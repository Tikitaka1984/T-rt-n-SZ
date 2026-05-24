import React, { useState, useEffect } from "react";
import { NEW_TOPICS } from "../data/newTopics";
import { motion } from "motion/react";

interface TopicSelectorProps {
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
  onGradeChange?: (grade: string) => void; 
}

export function TopicSelector({ selectedTopic, onTopicChange, onGradeChange }: TopicSelectorProps) {
  const mainCategories = Object.keys(NEW_TOPICS);
  
  // Try to find the initial state from selectedTopic
  let initialMain = mainCategories[0];
  let initialEra = Object.keys(NEW_TOPICS[initialMain])[0];
  
  for (const main of mainCategories) {
    for (const era of Object.keys(NEW_TOPICS[main])) {
      if (NEW_TOPICS[main][era].includes(selectedTopic)) {
        initialMain = main;
        initialEra = era;
        break;
      }
    }
  }

  const [mainCategory, setMainCategory] = useState(initialMain);
  const [era, setEra] = useState(initialEra);

  // Update grade (era) if parent needs it (e.g. for quiz generation prompt)
  useEffect(() => {
    if (onGradeChange) {
      onGradeChange(era);
    }
  }, [era, onGradeChange]);

  const handleMainChange = (main: string) => {
    setMainCategory(main);
    const firstEra = Object.keys(NEW_TOPICS[main])[0];
    setEra(firstEra);
    onTopicChange(NEW_TOPICS[main][firstEra][0]); // select first topic
  };

  const handleEraChange = (newEra: string) => {
    setEra(newEra);
    onTopicChange(NEW_TOPICS[mainCategory][newEra][0]);
  };

  const eras = Object.keys(NEW_TOPICS[mainCategory]);
  const topics = NEW_TOPICS[mainCategory][era] || [];

  return (
    <div className="space-y-6">
      {/* LEVEL 1 - Main category toggle */}
      <div className="flex flex-col sm:flex-row gap-2">
        {mainCategories.map(main => (
          <button
            key={main}
            onClick={() => handleMainChange(main)}
            className={`flex-1 py-3 px-4 rounded-[3px] border-2 font-cinzel font-bold text-sm uppercase tracking-wider transition-all duration-200 ${
              mainCategory === main
                ? "bg-[#6B1010] text-[#F7EAC8] border-[#B8860B] shadow-md transform scale-[1.02]"
                : "bg-[#FFF5D0] text-[#1C0E04] border-[#B8860B]/30 hover:border-[#B8860B]/60 hover:bg-[#FFF5D0]/80"
            }`}
          >
            {main}
          </button>
        ))}
      </div>

      {/* LEVEL 2 - Era chips */}
      <div className="space-y-2">
        <h3 className="font-cinzel text-xs font-bold text-[#1C0E04] uppercase tracking-wider">Korszak</h3>
        <div className="flex flex-wrap gap-2">
          {eras.map(e => {
            const isActive = era === e;
            return (
              <button
                key={e}
                onClick={() => handleEraChange(e)}
                className={`px-3 py-1.5 rounded-full text-xs font-lora font-bold transition-all border ${
                  isActive
                    ? "bg-[#B8860B] text-white border-[#8B1A1A] shadow-sm transform scale-[1.02]"
                    : "bg-[#FFF5D0] text-[#1C0E04] border-[#B8860B]/50 hover:bg-[#B8860B]/20"
                }`}
              >
                {e}
              </button>
            );
          })}
        </div>
      </div>

      {/* LEVEL 3 - Topic chips */}
      <div className="space-y-2">
        <h3 className="font-cinzel text-xs font-bold text-[#1C0E04] uppercase tracking-wider">Témakör</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {topics.map(t => {
            const isActive = selectedTopic === t;
            return (
              <button
                key={t}
                onClick={() => onTopicChange(t)}
                className={`text-left px-3 py-2.5 rounded-[3px] text-xs font-lora font-bold transition-all border-2 ${
                  isActive
                    ? "bg-[#6B1010] text-[#F7EAC8] border-[#B8860B] shadow-md transform scale-[1.02]"
                    : "bg-[#FFF5D0] text-[#1C0E04] border-[#B8860B]/30 hover:border-[#B8860B]"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="mt-4 p-3 bg-[#1C0E04]/5 rounded-[3px] border border-[#B8860B]/20">
        <p className="font-lora text-xs text-[#1C0E04]/80 font-bold">
          {mainCategory.split(' ')[0]} {mainCategory.split(' ').slice(1).join(' ')} &rarr; {era} &rarr; <span className="text-[#6B1010]">{selectedTopic}</span>
        </p>
      </div>
    </div>
  );
}
