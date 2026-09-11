import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Volume1,
  Target,
  Trophy,
  Heart,
  ChevronRight,
  Plus,
} from "lucide-react";
import { DUROOD_LIST, DUROOD_HADITHS } from "../data/duroodData";
import { audioManager, AudioPlaybackEvent } from "../utils/audio";
import { DuroodItem } from "../types";

interface DuroodCounterProps {
  audioState: AudioPlaybackEvent;
}

export const DuroodCounter: React.FC<DuroodCounterProps> = ({ audioState }) => {
  const [selectedDurood, setSelectedDurood] = useState<DuroodItem>(DUROOD_LIST[0]);
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem("friday_durood_counts");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrateEnabled, setVibrateEnabled] = useState<boolean>(true);
  const [target, setTarget] = useState<number>(selectedDurood.defaultTarget);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play subtle haptic/audio tick on counter tap
  const playClickTick = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio context might be restricted before gesture
    }
  };

  const handleIncrement = () => {
    const currentCount = counts[selectedDurood.id] || 0;
    const newCount = currentCount + 1;

    const updated = { ...counts, [selectedDurood.id]: newCount };
    setCounts(updated);
    localStorage.setItem("friday_durood_counts", JSON.stringify(updated));

    playClickTick();

    if (vibrateEnabled && typeof navigator !== "undefined" && navigator.vibrate) {
      // Vibrate shortly on each tap, longer on milestone
      if (newCount % 33 === 0 || newCount === target) {
        navigator.vibrate([40, 60, 40]);
      } else {
        navigator.vibrate(15);
      }
    }
  };

  const handleReset = () => {
    const updated = { ...counts, [selectedDurood.id]: 0 };
    setCounts(updated);
    localStorage.setItem("friday_durood_counts", JSON.stringify(updated));
  };

  const handleSelectDurood = (item: DuroodItem) => {
    setSelectedDurood(item);
    setTarget(item.defaultTarget);
  };

  const currentCount = counts[selectedDurood.id] || 0;
  const totalAllCounts = (Object.values(counts) as number[]).reduce((a, b) => a + b, 0);
  const progressPercent = Math.min(100, Math.round((currentCount / target) * 100));

  const isPlayingThis = audioState.isPlaying && audioState.activeId === `durood_${selectedDurood.id}`;
  const isLoadingThis = audioState.isLoading && audioState.activeId === `durood_${selectedDurood.id}`;

  const handlePlayTTS = () => {
    audioManager.playText({
      id: `durood_${selectedDurood.id}`,
      title: selectedDurood.nameBangla,
      text: selectedDurood.arabic,
      lang: "arabic",
    });
  };

  return (
    <div id="durood-counter-container" className="space-y-6">
      {/* Top Banner & Virtue */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-emerald-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              রাসূলুল্লাহ (ﷺ)-এর প্রতি ভালোবাসার অর্ঘ্য
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-bangla text-white">
              জুমার দিনের দরূদ শরীফ তাসবীহ
            </h2>
            <p className="text-emerald-200/90 text-sm font-bangla max-w-2xl">
              নবীজী (ﷺ) বলেছেন: "তোমরা জুমার দিনে আমার ওপর প্রচুর পরিমাণে দরূদ পাঠ করো; কারণ তোমাদের পঠিত দরূদ সরাসরি আমার রওজা মুবারকে পেশ করা হয়।"
            </p>
          </div>

          <div className="bg-emerald-950/80 px-4 py-3 rounded-xl border border-emerald-600/40 text-center self-start sm:self-auto">
            <span className="text-xs text-emerald-300 font-bangla block">আজকের মোট দরূদ</span>
            <span className="text-2xl font-bold text-amber-300 font-sans">{totalAllCounts}</span>
          </div>
        </div>

        {/* Hadith cards */}
        <div className="mt-4 pt-3 border-t border-emerald-800/80 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-emerald-100 font-bangla">
          {DUROOD_HADITHS.map((h, i) => (
            <div key={i} className="bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-800/50">
              <p className="line-clamp-2 italic">"{h.text}"</p>
              <span className="text-[10px] text-amber-300/80 mt-1 block font-sans font-medium">— {h.source}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Durood Selection Pills */}
      <div className="flex flex-wrap gap-2">
        {DUROOD_LIST.map((item) => {
          const isSelected = selectedDurood.id === item.id;
          const count = counts[item.id] || 0;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectDurood(item)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium font-bangla transition-all border cursor-pointer ${
                isSelected
                  ? "bg-emerald-800 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-400"
                  : "bg-white text-gray-800 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/60"
              }`}
            >
              <span>{item.nameBangla}</span>
              <span
                className={`text-[10px] font-sans px-1.5 py-0.2 rounded-full ${
                  isSelected ? "bg-emerald-950 text-amber-300" : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Counter & Text Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Top: Interactive Tasbih Dial (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-emerald-200/80 p-6 shadow-sm flex flex-col items-center text-center">
          <div className="w-full flex items-center justify-between text-xs text-gray-500 mb-4 pb-2 border-b border-gray-100">
            <span className="font-bangla font-semibold text-emerald-900">ডিজিটাল তাসবীহ</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                />
                <Volume1 className="w-3.5 h-3.5 text-gray-600" />
              </label>
              <label className="flex items-center gap-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={vibrateEnabled}
                  onChange={(e) => setVibrateEnabled(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                />
                <span className="text-[11px] font-bangla">কম্পন</span>
              </label>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="w-full mb-3 flex items-center justify-between text-xs font-bangla text-emerald-800 font-medium">
            <span>লক্ষ্যমাত্রা: {target} বার</span>
            <span>{progressPercent}% সম্পন্ন</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Large Interactive Tap Button */}
          <button
            id="btn-tasbih-count"
            onClick={handleIncrement}
            className="group relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-b from-emerald-600 to-emerald-800 text-white shadow-xl hover:shadow-2xl active:scale-95 transition-all flex flex-col items-center justify-center border-4 border-emerald-400/40 cursor-pointer select-none outline-none focus:ring-4 focus:ring-emerald-300"
            style={{ touchAction: "manipulation" }}
          >
            <span className="text-xs sm:text-sm font-bangla font-semibold text-emerald-200 uppercase tracking-wider mb-1">
              পাঠ সংখ্যা
            </span>
            <span className="text-5xl sm:text-6xl font-bold font-sans tracking-tight text-white drop-shadow-sm">
              {currentCount}
            </span>
            <span className="text-xs text-amber-200 mt-2 font-bangla flex items-center gap-1 bg-emerald-950/40 px-3 py-1 rounded-full">
              <Plus className="w-3 h-3" /> স্পর্শ করে গণনা করুন
            </span>
          </button>

          {/* Target Quick Select & Reset */}
          <div className="mt-6 w-full flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-gray-500 font-bangla">টার্গেট:</span>
              {[33, 80, 100, 300, 1000].map((t) => (
                <button
                  key={t}
                  onClick={() => setTarget(t)}
                  className={`px-2 py-1 rounded-md text-xs font-sans transition-colors cursor-pointer ${
                    target === t
                      ? "bg-emerald-700 text-white font-bold"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors cursor-pointer font-bangla"
              title="গণনা শূন্য করুন"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>রিসেট</span>
            </button>
          </div>
        </div>

        {/* Right: Selected Durood Text, Meaning, Virtue & Audio (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-emerald-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md font-bangla">
                নির্বাচিত দরূদ
              </span>
              <h3 className="text-xl font-bold font-bangla text-emerald-950 mt-1">
                {selectedDurood.nameBangla}
              </h3>
            </div>

            {/* TTS Play Button */}
            <button
              id={`btn-play-durood-${selectedDurood.id}`}
              onClick={handlePlayTTS}
              disabled={isLoadingThis}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium font-bangla transition-all cursor-pointer ${
                isPlayingThis
                  ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
              }`}
            >
              {isLoadingThis ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <span>কণ্ঠ তৈরি হচ্ছে...</span>
                </>
              ) : isPlayingThis ? (
                <>
                  <VolumeX className="w-4 h-4 text-white" />
                  <span>থামান</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-700" />
                  <span>উচ্চারণ শুনুন (Gemini TTS)</span>
                </>
              )}
            </button>
          </div>

          {/* Arabic Text */}
          <div className="bg-sand-pattern p-5 rounded-xl border border-emerald-100/80 text-right">
            <p
              dir="rtl"
              className="font-arabic text-2xl sm:text-3xl text-emerald-950 font-normal leading-loose sm:leading-[2.3] tracking-wide"
            >
              {selectedDurood.arabic}
            </p>
          </div>

          {/* Bangla Pronunciation */}
          <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block mb-1 font-bangla">
              বাংলা উচ্চারণ:
            </span>
            <p className="text-emerald-950 text-sm sm:text-base font-bangla leading-relaxed">
              {selectedDurood.banglaTransliteration}
            </p>
          </div>

          {/* Bangla Meaning */}
          <div className="text-gray-800 text-sm sm:text-base font-bangla leading-relaxed">
            <span className="font-semibold text-emerald-900 mr-1.5">অনুবাদ:</span>
            {selectedDurood.banglaMeaning}
          </div>

          {/* Virtue Note */}
          <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200/80 text-xs sm:text-sm text-amber-950 font-bangla flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">ফজিলত ও গুরুত্ব:</span>
              {selectedDurood.virtue}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
