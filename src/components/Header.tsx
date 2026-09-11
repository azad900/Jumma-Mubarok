import React from "react";
import { Sparkles, Volume2, Calendar, Clock, Moon } from "lucide-react";
import { VoiceName } from "../utils/audio";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentVoice: VoiceName;
  onVoiceChange: (voice: VoiceName) => void;
  onOpenCustomTTS: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentVoice,
  onVoiceChange,
  onOpenCustomTTS,
}) => {
  const today = new Date();
  const dayName = today.toLocaleDateString("bn-BD", { weekday: "long" });
  const dateFormatted = today.toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const navTabs = [
    { id: "kahf", label: "সূরা আল-কাহাফ", icon: "📖", badge: "আলোর সুসংবাদ" },
    { id: "durood", label: "দরূদ শরীফ তাসবীহ", icon: "📿", badge: "৮০ বছরের সওয়াব" },
    { id: "dua", label: "দোয়া কবুলের প্রহর", icon: "🤲", badge: "খুতবা ও মাগরিব" },
    { id: "sunnah", label: "জুমার সুন্নতসমূহ", icon: "✨", badge: "৮টি আমল" },
  ];

  return (
    <header id="app-header" className="relative bg-emerald-950 text-white overflow-hidden shadow-lg border-b border-emerald-800/60">
      {/* Decorative Islamic geometric background */}
      <div className="absolute inset-0 opacity-10 bg-islamic-pattern pointer-events-none" />
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-emerald-800/80 text-emerald-200 border border-emerald-700/50">
                <Moon className="w-3.5 h-3.5 text-amber-400" />
                সাপ্তাহিক শ্রেষ্ঠ দিন • সাইয়্যিদুল আইয়্যাম
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-300/80 font-bangla">
                <Calendar className="w-3 h-3" /> {dayName}, {dateFormatted}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-bangla tracking-tight flex items-center gap-2.5 text-amber-100">
              জুম্মা মোবারক <span className="text-emerald-400 text-lg sm:text-2xl font-normal">| الجمعة المباركة</span>
            </h1>
            <p className="text-emerald-200/90 text-sm sm:text-base mt-1 font-bangla max-w-2xl">
              সূরা কাহাফ তিলাওয়াত, প্রচুর দরূদ পাঠ এবং দুই খুতবার মাঝে ও মাগরিবের পূর্বে দোয়ার বিশেষ আমল।
            </p>
          </div>

          {/* Right side controls: Voice picker & Custom TTS button */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              id="btn-custom-tts"
              onClick={onOpenCustomTTS}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 transition-colors shadow-sm cursor-pointer"
              title="যেকোনো আয়াত বা দোয়া অডিওতে রূপান্তর করুন"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>টেক্সট-টু-স্পিচ (TTS)</span>
            </button>

            <div className="flex items-center gap-1.5 bg-emerald-900/80 border border-emerald-700/60 rounded-lg px-2.5 py-1.5 text-xs">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300/90 hidden sm:inline">ভয়েস:</span>
              <select
                id="select-voice"
                aria-label="কুরআন ও দোয়ার তিলাওয়াত কণ্ঠস্বর"
                value={currentVoice}
                onChange={(e) => onVoiceChange(e.target.value as VoiceName)}
                className="bg-emerald-950 text-emerald-100 text-xs rounded px-2 py-0.5 border border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Kore">Kore (কোমল ও ভক্তিপূর্ণ)</option>
                <option value="Zephyr">Zephyr (গম্ভীর ও ধীরলয়)</option>
                <option value="Puck">Puck (স্পষ্ট ও সুললিত)</option>
                <option value="Charon">Charon (গভীর ও শান্ত)</option>
                <option value="Fenrir">Fenrir (ভারী ও গম্ভীর)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation bar */}
        <nav id="main-navigation" className="mt-6 flex flex-wrap gap-2 pt-2 border-t border-emerald-900/60">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium font-bangla transition-all cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40 border border-emerald-400/40"
                    : "bg-emerald-900/40 text-emerald-200 hover:bg-emerald-900/80 hover:text-white border border-transparent"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-emerald-800 text-emerald-100" : "bg-emerald-950/80 text-emerald-400"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
