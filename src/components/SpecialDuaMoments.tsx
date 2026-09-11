import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Volume2,
  VolumeX,
  Clock,
  Check,
  Copy,
  HeartHandshake,
  Timer,
  AlertCircle,
  HelpCircle,
  Plus,
  Trash2,
  Send,
} from "lucide-react";
import { SPECIAL_DUA_MOMENTS_INFO, FRIDAY_DUAS } from "../data/duaData";
import { audioManager, AudioPlaybackEvent } from "../utils/audio";
import { FridayDuaItem } from "../types";

interface SpecialDuaMomentsProps {
  audioState: AudioPlaybackEvent;
}

export const SpecialDuaMoments: React.FC<SpecialDuaMomentsProps> = ({ audioState }) => {
  const [selectedCategory, setSelectedCategory] = useState<"between_khutbahs" | "before_maghrib">("between_khutbahs");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // User's custom personal Duas list
  const [customDuas, setCustomDuas] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("user_friday_custom_duas");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newDuaInput, setNewDuaInput] = useState("");

  const handleAddCustomDua = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDuaInput.trim()) return;
    const updated = [...customDuas, newDuaInput.trim()];
    setCustomDuas(updated);
    localStorage.setItem("user_friday_custom_duas", JSON.stringify(updated));
    setNewDuaInput("");
  };

  const handleRemoveCustomDua = (index: number) => {
    const updated = customDuas.filter((_, i) => i !== index);
    setCustomDuas(updated);
    localStorage.setItem("user_friday_custom_duas", JSON.stringify(updated));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePlayDua = (dua: FridayDuaItem) => {
    audioManager.playText({
      id: `dua_${dua.id}`,
      title: dua.titleBangla,
      text: dua.arabic,
      lang: "arabic",
    });
  };

  const handlePlayCustomDua = (text: string, index: number) => {
    audioManager.playText({
      id: `custom_dua_${index}`,
      title: `আমার ব্যক্তিগত দোয়া #${index + 1}`,
      text,
      lang: "bangla",
    });
  };

  const activeInfo = SPECIAL_DUA_MOMENTS_INFO.find(
    (m) => (selectedCategory === "between_khutbahs" ? m.id === "khutbah_interval" : m.id === "before_maghrib")
  )!;

  const filteredDuas = FRIDAY_DUAS.filter((d) => d.timing === selectedCategory);

  return (
    <div id="special-dua-moments-container" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-emerald-700/50">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-400/20 text-amber-300 border border-amber-400/30">
            <Timer className="w-3.5 h-3.5 text-amber-400" />
            দোয়া কবুলের সুবর্ণ মুহূর্ত (সা‘আতুল ইস্তিজাবাহ)
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-bangla text-white">
            জুমার দুটি বিশেষ দোয়া কবুলের সময়
          </h2>
          <p className="text-emerald-200/90 text-sm font-bangla max-w-2xl leading-relaxed">
            রাসূলুল্লাহ (ﷺ) জুমার দিনে একটি বিশেষ সময় রয়েছে উল্লেখ করে বলেছেন: কোনো মুসলিম বান্দা সালাতরত অবস্থায় সে মুহূর্তটি পেয়ে আল্লাহর কাছে যা চায়, আল্লাহ তাকে তা দান করেন। (সহীহ বুখারী ও মুসলিম)
          </p>
        </div>
      </div>

      {/* Two Moment Tabs Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <button
          id="btn-tab-khutbah"
          onClick={() => setSelectedCategory("between_khutbahs")}
          className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
            selectedCategory === "between_khutbahs"
              ? "bg-emerald-800 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400"
              : "bg-white text-gray-800 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
              selectedCategory === "between_khutbahs" ? "bg-emerald-950 text-amber-300" : "bg-emerald-100 text-emerald-800"
            }`}>
              মুহূর্ত ১
            </span>
            <Clock className={`w-4 h-4 ${selectedCategory === "between_khutbahs" ? "text-amber-300" : "text-gray-400"}`} />
          </div>
          <h3 className="font-bold text-base font-bangla mb-1">
            দুই খুতবার মধ্যবর্তী ক্ষণ
          </h3>
          <p className={`text-xs font-bangla ${selectedCategory === "between_khutbahs" ? "text-emerald-200" : "text-gray-600"}`}>
            ইমাম যখন প্রথম খুতবা শেষ করে মিম্বারে বসেন (প্রায় ২০-৩০ সেকেন্ড)
          </p>
        </button>

        <button
          id="btn-tab-maghrib"
          onClick={() => setSelectedCategory("before_maghrib")}
          className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
            selectedCategory === "before_maghrib"
              ? "bg-emerald-800 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400"
              : "bg-white text-gray-800 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
              selectedCategory === "before_maghrib" ? "bg-emerald-950 text-amber-300" : "bg-emerald-100 text-emerald-800"
            }`}>
              মুহূর্ত ২ (সর্বাধিক বিশুদ্ধ ও প্রত্যাশিত)
            </span>
            <Sparkles className={`w-4 h-4 ${selectedCategory === "before_maghrib" ? "text-amber-300" : "text-gray-400"}`} />
          </div>
          <h3 className="font-bold text-base font-bangla mb-1">
            আসর থেকে মাগরিবের পূর্ববর্তী প্রহর
          </h3>
          <p className={`text-xs font-bangla ${selectedCategory === "before_maghrib" ? "text-emerald-200" : "text-gray-600"}`}>
            জুমার আসরের পর সূর্যাস্তের আগ পর্যন্ত কায়মনোবাক্যে দোয়ায় রত থাকা
          </p>
        </button>
      </div>

      {/* Selected Moment Guidance Box */}
      <div className="bg-white rounded-2xl border border-emerald-200/80 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md font-bangla">
              সময় ও আমলের রূপরেখা
            </span>
            <h3 className="text-xl font-bold font-bangla text-emerald-950 mt-1">
              {activeInfo.titleBangla}
            </h3>
          </div>
          <div className="text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 font-bangla">
            {activeInfo.timingDesc}
          </div>
        </div>

        {/* Hadith citation */}
        <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-100 font-bangla text-xs sm:text-sm text-emerald-950 space-y-1">
          <span className="font-bold text-emerald-900 block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" /> হাদিসের দলিল:
          </span>
          <p className="italic leading-relaxed">{activeInfo.hadithProof}</p>
        </div>

        {/* Etiquette & Rules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-bangla">
          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            <span className="font-bold text-gray-800 block mb-1">দোয়ার আদব ও নিয়ম:</span>
            <p className="text-gray-700 leading-relaxed">{activeInfo.rules}</p>
          </div>
          <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-100">
            <span className="font-bold text-amber-900 block mb-1">অনুরোধকৃত আমল:</span>
            <p className="text-amber-950 leading-relaxed">{activeInfo.recommendedAction}</p>
          </div>
        </div>
      </div>

      {/* Recommended Duas List */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold font-bangla text-emerald-950 flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-emerald-700" />
          এই মুহূর্তের বিশেষ সুন্নাহসম্মত দোয়াসমূহ ({filteredDuas.length}টি)
        </h4>

        <div className="grid grid-cols-1 gap-4">
          {filteredDuas.map((dua) => {
            const isPlayingThis = audioState.isPlaying && audioState.activeId === `dua_${dua.id}`;
            const isLoadingThis = audioState.isLoading && audioState.activeId === `dua_${dua.id}`;

            return (
              <div
                key={dua.id}
                id={`card-dua-${dua.id}`}
                className={`rounded-2xl border transition-all p-5 sm:p-6 shadow-xs ${
                  isPlayingThis
                    ? "bg-emerald-50/90 border-emerald-500 ring-1 ring-emerald-500"
                    : "bg-white border-gray-200 hover:border-emerald-300"
                }`}
              >
                <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md font-bangla">
                      {dua.timingLabelBangla}
                    </span>
                    <h5 className="font-bold text-sm sm:text-base font-bangla text-emerald-950">
                      {dua.titleBangla}
                    </h5>
                  </div>

                  <button
                    onClick={() => handleCopy(`${dua.arabic}\n\n${dua.banglaTransliteration}\n${dua.banglaMeaning}`, `dua_${dua.id}`)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                    title="দোয়া ও অর্থ কপি করুন"
                  >
                    {copiedId === `dua_${dua.id}` ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Arabic Text */}
                <div className="bg-sand-pattern p-4 sm:p-5 rounded-xl border border-emerald-100 text-right">
                  <p
                    dir="rtl"
                    className="font-arabic text-2xl sm:text-3xl text-emerald-950 font-normal leading-loose sm:leading-[2.4] tracking-wide"
                  >
                    {dua.arabic}
                  </p>
                </div>

                {/* Transliteration */}
                <div className="mt-3 bg-emerald-50/60 rounded-xl p-3 border border-emerald-100">
                  <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block mb-0.5 font-bangla">
                    উচ্চারণ:
                  </span>
                  <p className="text-emerald-950 text-sm sm:text-base font-bangla leading-relaxed">
                    {dua.banglaTransliteration}
                  </p>
                </div>

                {/* Meaning */}
                <div className="mt-2.5 text-gray-800 text-sm sm:text-base font-bangla leading-relaxed">
                  <span className="font-semibold text-emerald-900 mr-1.5">অনুবাদ:</span>
                  {dua.banglaMeaning}
                </div>

                {/* Significance & Reference */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs">
                  <span className="text-emerald-700 font-medium font-bangla">
                    {dua.significance}
                  </span>
                  <span className="text-gray-400 font-sans">
                    সূত্র: {dua.reference}
                  </span>
                </div>

                {/* TTS Play Button */}
                <div className="mt-4 pt-2 flex items-center justify-between">
                  <button
                    id={`btn-play-dua-${dua.id}`}
                    onClick={() => handlePlayDua(dua)}
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
                        <span>কণ্ঠ তৈরি হচ্ছে (Gemini TTS)...</span>
                      </>
                    ) : isPlayingThis ? (
                      <>
                        <VolumeX className="w-4 h-4 text-white" />
                        <span>দোয়া পাঠ থামান</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-emerald-700" />
                        <span>তিলাওয়াত শুনুন (Gemini TTS)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Personal Dua Notebook (ব্যবহারকারীর নিজস্ব প্রার্থনাসমূহ) */}
      <div className="bg-white rounded-2xl border border-emerald-200/80 p-6 shadow-sm space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md font-bangla">
            ব্যক্তিগত মুনাজাত ডায়রি
          </span>
          <h4 className="text-lg font-bold font-bangla text-emerald-950 mt-1">
            জুমার এই পুণ্যলগ্নে আপনার মনের যত আরজি ও দোয়া লিখে রাখুন
          </h4>
          <p className="text-xs text-gray-500 font-bangla mt-0.5">
            যা কিছু চান—সুস্থতা, রিজিক, মা-বাবার মাগফিরাত, মনের প্রশান্তি—এখানে লিখে রাখুন এবং Gemini TTS-এর কণ্ঠে শুনে শুনে মোনাজাত করুন।
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAddCustomDua} className="flex gap-2">
          <input
            type="text"
            value={newDuaInput}
            onChange={(e) => setNewDuaInput(e.target.value)}
            placeholder="আপনার একটি ব্যক্তিগত দোয়া লিখুন (যেমন: হে আল্লাহ! আমার পিতামাতাকে সুস্থ রাখুন ও ক্ষমা করুন...)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bangla"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-medium font-bangla flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>যুক্ত করুন</span>
          </button>
        </form>

        {/* Saved list */}
        {customDuas.length > 0 ? (
          <div className="space-y-2.5 pt-2">
            {customDuas.map((duaText, idx) => {
              const isPlayingThis = audioState.isPlaying && audioState.activeId === `custom_dua_${idx}`;
              const isLoadingThis = audioState.isLoading && audioState.activeId === `custom_dua_${idx}`;

              return (
                <div
                  key={idx}
                  className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center justify-between gap-3 text-sm font-bangla text-emerald-950"
                >
                  <div className="flex items-start gap-2 flex-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center text-xs font-bold font-sans shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed">{duaText}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handlePlayCustomDua(duaText, idx)}
                      disabled={isLoadingThis}
                      className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors cursor-pointer"
                      title="TTS কণ্ঠে শুনুন"
                    >
                      {isLoadingThis ? (
                        <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      ) : isPlayingThis ? (
                        <VolumeX className="w-4 h-4 text-emerald-900" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleRemoveCustomDua(idx)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400 text-xs font-bangla border border-dashed border-gray-200 rounded-xl">
            এখনো কোনো ব্যক্তিগত দোয়া যোগ করা হয়নি। উপরের বক্সে লিখে যুক্ত করুন।
          </div>
        )}
      </div>
    </div>
  );
};
