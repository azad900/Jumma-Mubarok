import React, { useState } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Sparkles,
  X,
  Languages,
  Mic,
  Settings,
  Share2,
} from "lucide-react";
import { audioManager, AudioPlaybackEvent, VoiceName } from "../utils/audio";

interface TTSPlayerBarProps {
  audioState: AudioPlaybackEvent;
  onOpenCustomTTS: () => void;
}

export const TTSPlayerBar: React.FC<TTSPlayerBarProps> = ({ audioState, onOpenCustomTTS }) => {
  // If nothing is playing or loaded, return null
  if (!audioState.activeId && !audioState.isLoading) {
    return null;
  }

  const handleTogglePlayPause = () => {
    if (audioState.activeText && audioState.activeId && audioState.activeTitle) {
      audioManager.playText({
        id: audioState.activeId,
        title: audioState.activeTitle,
        text: audioState.activeText,
      });
    }
  };

  const handleStop = () => {
    audioManager.stop();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = Math.floor(secs % 60);
    return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  return (
    <div
      id="floating-audio-bar"
      className="fixed bottom-0 left-0 right-0 z-50 bg-emerald-950/95 backdrop-blur-md text-white border-t border-emerald-700/60 shadow-2xl px-4 py-3 sm:px-6 transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Info about what's playing */}
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
          <div className="relative w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center text-amber-300 shrink-0 border border-emerald-600">
            {audioState.isLoading ? (
              <div className="w-5 h-5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Volume2 className={`w-5 h-5 ${audioState.isPlaying ? "animate-pulse" : ""}`} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-900 text-amber-300 border border-emerald-700 font-sans">
                Gemini 3.1 Flash TTS
              </span>
              <span className="text-xs text-emerald-300 truncate font-sans">
                কণ্ঠ: {audioState.voice}
              </span>
            </div>
            <h5 className="text-sm font-bold font-bangla text-white truncate mt-0.5">
              {audioState.activeTitle || "অডিও তিলাওয়াত"}
            </h5>
          </div>
        </div>

        {/* Center: Controls (Play/Pause, Stop, Time) */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-center">
          <button
            onClick={handleTogglePlayPause}
            disabled={audioState.isLoading}
            className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-emerald-950 flex items-center justify-center transition-all cursor-pointer shadow-md"
            title={audioState.isPlaying ? "বিরতি (Pause)" : "চালান (Play)"}
          >
            {audioState.isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            onClick={handleStop}
            className="p-2 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 transition-colors cursor-pointer"
            title="বন্ধ করুন (Stop)"
          >
            <Square className="w-4 h-4" />
          </button>

          <div className="text-xs font-sans text-emerald-300 min-w-16">
            {formatTime(audioState.currentTime)} / {formatTime(audioState.duration)}
          </div>

          {/* Audio Wave Visualizer Animation */}
          {audioState.isPlaying && (
            <div className="hidden md:flex items-center gap-1 h-5">
              {[0.4, 0.8, 0.5, 0.9, 0.3, 0.7].map((height, i) => (
                <span
                  key={i}
                  className="w-1 bg-amber-400 rounded-full animate-pulse"
                  style={{
                    height: `${height * 100}%`,
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: "0.8s",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Custom TTS Trigger */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={onOpenCustomTTS}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-xs font-medium text-amber-300 transition-colors cursor-pointer border border-emerald-700 font-bangla"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>নতুন টেক্সট পাঠ করান</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface CustomTTSModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVoice: VoiceName;
  onVoiceChange: (voice: VoiceName) => void;
  audioState: AudioPlaybackEvent;
}

export const CustomTTSModal: React.FC<CustomTTSModalProps> = ({
  isOpen,
  onClose,
  currentVoice,
  onVoiceChange,
  audioState,
}) => {
  const [inputText, setInputText] = useState("");
  const [lang, setLang] = useState<"arabic" | "bangla" | "english">("arabic");

  if (!isOpen) return null;

  const handleSpeak = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    audioManager.playText({
      id: `custom_tts_${Date.now()}`,
      title: "কাস্টম টেক্সট তিলাওয়াত",
      text: inputText.trim(),
      lang,
      voice: currentVoice,
    });
  };

  const presetTexts = [
    {
      label: "সূরা ফাতিহা",
      lang: "arabic" as const,
      text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾ الرَّحْمَٰنِ الرَّحِيمِ ﴿٣﴾ مَالِكِ يَوْمِ الدِّينِ ﴿٤﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾",
    },
    {
      label: "আয়াতুল কুরসী",
      lang: "arabic" as const,
      text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    },
    {
      label: "জুমার শুভেচ্ছা (বাংলা)",
      lang: "bangla" as const,
      text: "আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ। আজ পবিত্র জুমার দিন। আল্লাহ তাআলা আমাদের সকলের সূরা কাহাফ তিলাওয়াত, বেশি বেশি দরূদ পাঠ এবং আন্তরিক দোয়াসমূহ কবুল করে নিন। আমীন।",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-emerald-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold font-bangla text-base sm:text-lg text-amber-100">
                টেক্সট-টু-স্পিচ (Gemini 3.1 Flash TTS)
              </h3>
              <p className="text-xs text-emerald-300 font-bangla">
                যেকোনো আরবি আয়াত, হাদিস বা বাংলা দোয়া স্পষ্ট ও সুললিত কণ্ঠে শুনুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Voice & Lang selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 font-bangla">
                কণ্ঠস্বর (Gemini Voice):
              </label>
              <select
                value={currentVoice}
                onChange={(e) => onVoiceChange(e.target.value as VoiceName)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-sans focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Kore">Kore (কোমল, ভাবগাম্ভীর্যপূর্ণ)</option>
                <option value="Zephyr">Zephyr (ধীরলয়, উষ্ণ ও স্পষ্ট)</option>
                <option value="Puck">Puck (প্রাণবন্ত ও বিশুদ্ধ তাজবীদ)</option>
                <option value="Charon">Charon (গভীর ও ভক্তিময়)</option>
                <option value="Fenrir">Fenrir (ভারী ও প্রাজ্ঞ)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 font-bangla">
                উচ্চারণ শৈলী ও ভাষা:
              </label>
              <div className="flex gap-1.5">
                {(["arabic", "bangla", "english"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer capitalize font-sans ${
                      lang === l
                        ? "bg-emerald-800 text-white border-emerald-800 shadow-xs"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {l === "arabic" ? "আরবি" : l === "bangla" ? "বাংলা" : "English"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Presets */}
          <div>
            <span className="text-xs font-semibold text-gray-500 font-bangla block mb-1.5">
              দ্রুত পাঠের উদাহরণ (ক্লিক করে নির্বাচন করুন):
            </span>
            <div className="flex flex-wrap gap-2">
              {presetTexts.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setInputText(p.text);
                    setLang(p.lang);
                  }}
                  className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-bangla transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form Textarea */}
          <form onSubmit={handleSpeak} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 font-bangla">
                পড়ার জন্য টেক্সট লিখুন বা পেস্ট করুন:
              </label>
              <textarea
                rows={5}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="এখানে যেকোনো আরবি বা বাংলা টেক্সট লিখুন..."
                className={`w-full p-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm leading-relaxed ${
                  lang === "arabic" ? "font-arabic text-right text-lg" : "font-bangla"
                }`}
                dir={lang === "arabic" ? "rtl" : "ltr"}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer font-bangla"
              >
                বন্ধ করুন
              </button>
              <button
                type="submit"
                disabled={!inputText.trim() || audioState.isLoading}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs sm:text-sm font-medium font-bangla rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                {audioState.isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>কণ্ঠ তৈরি হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-amber-300" />
                    <span>কণ্ঠ শুনুন (Convert to Speech)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
