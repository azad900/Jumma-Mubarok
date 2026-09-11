import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { SurahKahfReader } from "./components/SurahKahfReader";
import { DuroodCounter } from "./components/DuroodCounter";
import { SpecialDuaMoments } from "./components/SpecialDuaMoments";
import { SunnahChecklist } from "./components/SunnahChecklist";
import { TTSPlayerBar, CustomTTSModal } from "./components/TTSPlayerBar";
import { AskImamModal } from "./components/AskImamModal";
import { audioManager, AudioPlaybackEvent, VoiceName } from "./utils/audio";
import { Sparkles, HelpCircle, Heart, Moon, Volume2 } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("kahf");
  const [currentVoice, setCurrentVoice] = useState<VoiceName>(() => audioManager.getVoice());
  const [audioState, setAudioState] = useState<AudioPlaybackEvent>(() => audioManager.getState());
  const [isCustomTTSOpen, setIsCustomTTSOpen] = useState(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = audioManager.subscribe((state) => {
      setAudioState(state);
      setCurrentVoice(state.voice);
    });
    return () => unsubscribe();
  }, []);

  const handleVoiceChange = (voice: VoiceName) => {
    audioManager.setVoice(voice);
    setCurrentVoice(voice);
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] text-[#1a2e26] flex flex-col font-sans pb-24">
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentVoice={currentVoice}
        onVoiceChange={handleVoiceChange}
        onOpenCustomTTS={() => setIsCustomTTSOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Core Friday Reminder Alert Box */}
        <div className="mb-6 bg-emerald-900/5 border border-emerald-800/15 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-bangla text-emerald-950 flex items-center gap-2">
                জুমার দিনের বিশেষ আহ্বান
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  আমলনামা
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-emerald-900/90 font-bangla mt-0.5 max-w-2xl leading-relaxed">
                "আজ শুক্রবার। সবাই সূরা কাহাফ পড়ে নিবো ইন শা আল্লাহ। পাশাপাশি বেশি বেশি দরূদ পড়ব এবং জুমার দুই খুতবার মাঝে ও মাগরিবের আগে দোয়ার এহতেমাম করব।"
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCustomTTSOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-800 text-white hover:bg-emerald-700 transition-colors font-bangla cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-300" />
              <span>তিলাওয়াত শুনুন (TTS)</span>
            </button>
            <button
              onClick={() => setIsAskModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50 transition-colors font-bangla cursor-pointer shadow-xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>আমল ও জিজ্ঞাসা</span>
            </button>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === "kahf" && <SurahKahfReader audioState={audioState} />}
        {activeTab === "durood" && <DuroodCounter audioState={audioState} />}
        {activeTab === "dua" && <SpecialDuaMoments audioState={audioState} />}
        {activeTab === "sunnah" && <SunnahChecklist />}
      </main>

      {/* Floating Ask Imam / Knowledge Button */}
      <button
        id="btn-floating-ask"
        onClick={() => setIsAskModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-emerald-800 hover:bg-emerald-700 text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-lg border border-emerald-600 flex items-center gap-2 text-xs sm:text-sm font-medium font-bangla transition-all cursor-pointer hover:scale-105 active:scale-95"
        title="জুমার আমল ও সূরা কাহাফ সম্পর্কে প্রশ্ন করুন"
      >
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        <span className="hidden sm:inline">জুমার প্রশ্ন ও শিক্ষা</span>
      </button>

      {/* Floating Audio Player Bar */}
      <TTSPlayerBar
        audioState={audioState}
        onOpenCustomTTS={() => setIsCustomTTSOpen(true)}
      />

      {/* Modals */}
      <CustomTTSModal
        isOpen={isCustomTTSOpen}
        onClose={() => setIsCustomTTSOpen(false)}
        currentVoice={currentVoice}
        onVoiceChange={handleVoiceChange}
        audioState={audioState}
      />

      <AskImamModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200/80 bg-white py-6 text-center text-xs text-gray-500 font-bangla space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-medium">
          <span>জুম্মা মোবারক • পবিত্র জুমার দিন হোক রহমত, মাগফিরাত ও বরকতময়</span>
        </div>
        <p className="text-gray-400 text-[11px] font-sans">
          Powered by Gemini 3.1 Flash TTS & Gemini 3.8 Flash • Authentic references from Sahih Hadith
        </p>
      </footer>
    </div>
  );
}
