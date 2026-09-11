import React, { useState } from "react";
import {
  BookOpen,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Compass,
  Bookmark,
  ChevronRight,
  Info,
} from "lucide-react";
import { SURAH_KAHF_KEY_AYAT, KAHF_STORIES, KAHF_VIRTUES } from "../data/kahfData";
import { audioManager, AudioPlaybackEvent } from "../utils/audio";
import { SurahAyah, KahfStory } from "../types";

interface SurahKahfReaderProps {
  audioState: AudioPlaybackEvent;
}

export const SurahKahfReader: React.FC<SurahKahfReaderProps> = ({ audioState }) => {
  const [activeSubTab, setActiveSubTab] = useState<"key_ayat" | "stories" | "virtues">("key_ayat");
  const [showEnglish, setShowEnglish] = useState<boolean>(false);
  const [readAyat, setReadAyat] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("kahf_read_ayat");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<KahfStory>(KAHF_STORIES[0]);

  const toggleRead = (ayahNumber: number) => {
    const updated = readAyat.includes(ayahNumber)
      ? readAyat.filter((n) => n !== ayahNumber)
      : [...readAyat, ayahNumber];
    setReadAyat(updated);
    localStorage.setItem("kahf_read_ayat", JSON.stringify(updated));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePlayAyah = (ayah: SurahAyah) => {
    audioManager.playText({
      id: `kahf_ayah_${ayah.ayahNumber}`,
      title: `সূরা কাহাফ • আয়াত ${ayah.ayahNumber}`,
      text: ayah.arabic,
      lang: "arabic",
    });
  };

  const handlePlayStoryAyah = (story: KahfStory) => {
    audioManager.playText({
      id: `story_ayah_${story.id}`,
      title: `${story.titleBangla} • মূল আয়াত`,
      text: story.keyAyahArabic,
      lang: "arabic",
    });
  };

  return (
    <div id="surah-kahf-container" className="space-y-6">
      {/* Top Banner & Virtues Notice */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-emerald-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              জুমার অন্যতম প্রধান আমল
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-bangla text-white">
              সূরা আল-কাহাফ (سورة الكهف)
            </h2>
            <p className="text-emerald-200/90 text-sm sm:text-base font-bangla max-w-2xl">
              রাসূলুল্লাহ (ﷺ) বলেছেন: যে ব্যক্তি জুমার দিন সূরা কাহাফ তিলাওয়াত করবে, তার জন্য এক জুমা থেকে অপর জুমা পর্যন্ত একটি বিশেষ নূর চমকাতে থাকবে।
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="bg-emerald-950/80 px-4 py-3 rounded-xl border border-emerald-600/40 text-center">
              <span className="text-xs text-emerald-300 font-bangla block">পঠিত আয়াত</span>
              <span className="text-xl font-bold text-amber-300">{readAyat.length} / {SURAH_KAHF_KEY_AYAT.length}</span>
            </div>
          </div>
        </div>

        {/* Hadith cards carousel / grid */}
        <div className="mt-4 pt-4 border-t border-emerald-800/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-emerald-100 font-bangla">
          {KAHF_VIRTUES.map((v, i) => (
            <div key={i} className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/60">
              <p className="line-clamp-3 italic">"{v.hadithBangla}"</p>
              <span className="text-[11px] text-amber-300/80 mt-1.5 block font-sans font-medium">— {v.source}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sub navigation & settings */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-1 bg-emerald-50/80 p-1 rounded-xl border border-emerald-100">
          <button
            id="subtab-key-ayat"
            onClick={() => setActiveSubTab("key_ayat")}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium font-bangla transition-all cursor-pointer ${
              activeSubTab === "key_ayat"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-emerald-900 hover:bg-emerald-100/60"
            }`}
          >
            প্রথম ১০ আয়াত ও সমাপ্তি ({SURAH_KAHF_KEY_AYAT.length})
          </button>
          <button
            id="subtab-stories"
            onClick={() => setActiveSubTab("stories")}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium font-bangla transition-all cursor-pointer ${
              activeSubTab === "stories"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-emerald-900 hover:bg-emerald-100/60"
            }`}
          >
            ৪টি প্রধান ঘটনা ও শিক্ষা
          </button>
          <button
            id="subtab-virtues"
            onClick={() => setActiveSubTab("virtues")}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium font-bangla transition-all cursor-pointer ${
              activeSubTab === "virtues"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-emerald-900 hover:bg-emerald-100/60"
            }`}
          >
            ফজিলত ও আমল
          </button>
        </div>

        {activeSubTab === "key_ayat" && (
          <label className="flex items-center gap-2 text-xs text-emerald-900 font-medium font-bangla cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showEnglish}
              onChange={(e) => setShowEnglish(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            ইংরেজি অনুবাদ প্রদর্শন করুন
          </label>
        )}
      </div>

      {/* VIEW 1: Key Ayat with Gemini 3.1 Flash TTS */}
      {activeSubTab === "key_ayat" && (
        <div className="space-y-4">
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3 text-amber-900 text-xs sm:text-sm font-bangla">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">দাজ্জালের ফিতনা থেকে মুক্তির রক্ষাকবচ:</span>
              সহীহ হাদিসের ভাষ্যমতে, যে ব্যক্তি সূরা কাহাফের প্রথম দশটি আয়াত হিফজ করবে বা নিয়মিত তিলাওয়াত করবে, সে কিয়ামতের পূর্বমুহূর্তের ভয়ঙ্কর দাজ্জালী ফিতনা ও ঈমান বিধ্বংসী সংকট থেকে সম্পূর্ণ নিরাপদ থাকবে।
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {SURAH_KAHF_KEY_AYAT.map((ayah) => {
              const isPlayingThis = audioState.isPlaying && audioState.activeId === `kahf_ayah_${ayah.ayahNumber}`;
              const isLoadingThis = audioState.isLoading && audioState.activeId === `kahf_ayah_${ayah.ayahNumber}`;
              const isRead = readAyat.includes(ayah.ayahNumber);

              return (
                <div
                  key={ayah.ayahNumber}
                  id={`ayah-card-${ayah.ayahNumber}`}
                  className={`relative rounded-2xl border transition-all p-5 sm:p-6 ${
                    isPlayingThis
                      ? "bg-emerald-50/90 border-emerald-500 shadow-md ring-1 ring-emerald-500"
                      : isRead
                      ? "bg-white/95 border-emerald-200/80 shadow-xs"
                      : "bg-white border-gray-200 hover:border-emerald-300 shadow-xs"
                  }`}
                >
                  {/* Top Bar: Section tag, Ayah number, Read status */}
                  <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-sans">
                        {ayah.ayahNumber}
                      </span>
                      {ayah.sectionName && (
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md font-bangla">
                          {ayah.sectionName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(`${ayah.arabic}\n\n${ayah.banglaPronunciation}\n${ayah.banglaMeaning}`, `ayah_${ayah.ayahNumber}`)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                        title="আয়াত ও অর্থ কপি করুন"
                      >
                        {copiedId === `ayah_${ayah.ayahNumber}` ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => toggleRead(ayah.ayahNumber)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium font-bangla transition-colors cursor-pointer ${
                          isRead
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                        }`}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${isRead ? "text-emerald-600" : "text-gray-400"}`} />
                        <span>{isRead ? "পড়া সম্পন্ন" : "পড়িনি"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Arabic Text */}
                  <div className="py-2 text-right">
                    <p
                      dir="rtl"
                      className="font-arabic text-2xl sm:text-3xl lg:text-4xl text-emerald-950 font-normal leading-loose sm:leading-[2.4] tracking-wide"
                    >
                      {ayah.arabic}
                      <span className="inline-flex items-center justify-center mx-2 text-emerald-600 text-lg font-arabic align-middle">
                        ﴿{ayah.ayahNumber}﴾
                      </span>
                    </p>
                  </div>

                  {/* Bengali Pronunciation */}
                  <div className="mt-3 bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/60">
                    <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block mb-0.5 font-bangla">
                      উচ্চারণ:
                    </span>
                    <p className="text-emerald-950 text-sm sm:text-base font-bangla leading-relaxed">
                      {ayah.banglaPronunciation}
                    </p>
                  </div>

                  {/* Bengali Meaning */}
                  <div className="mt-2.5 text-gray-800 text-sm sm:text-base font-bangla leading-relaxed">
                    <span className="font-semibold text-emerald-900 mr-1.5">অর্থ:</span>
                    {ayah.banglaMeaning}
                  </div>

                  {/* Optional English Meaning */}
                  {showEnglish && (
                    <div className="mt-2 text-gray-600 text-xs sm:text-sm font-sans italic border-l-2 border-emerald-300 pl-3 py-1">
                      {ayah.englishMeaning}
                    </div>
                  )}

                  {/* Virtue Note */}
                  {ayah.virtueNote && (
                    <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-amber-900 bg-amber-50/90 px-3 py-1 rounded-lg border border-amber-200/60 font-bangla">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{ayah.virtueNote}</span>
                    </div>
                  )}

                  {/* TTS Recitation Action Button */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <button
                      id={`btn-play-ayah-${ayah.ayahNumber}`}
                      onClick={() => handlePlayAyah(ayah)}
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
                          <span>তিলাওয়াত থামান</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 text-emerald-700" />
                          <span>কণ্ঠ শুনুন (Gemini TTS)</span>
                        </>
                      )}
                    </button>

                    <span className="text-[11px] text-gray-400 font-sans">
                      আয়াত #{ayah.ayahNumber} • সুরত আল-কাহাফ
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: The 4 Pivotal Stories & Lessons */}
      {activeSubTab === "stories" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {KAHF_STORIES.map((story) => {
              const isSelected = selectedStory.id === story.id;
              return (
                <button
                  key={story.id}
                  onClick={() => setSelectedStory(story)}
                  className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-800 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400"
                      : "bg-white text-gray-800 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                  }`}
                >
                  <span className={`text-[11px] font-semibold block mb-1 ${isSelected ? "text-emerald-200" : "text-emerald-700"}`}>
                    {story.ayatRange}
                  </span>
                  <h3 className="font-bold text-sm sm:text-base font-bangla mb-1">
                    {story.titleBangla}
                  </h3>
                  <span className={`text-xs block font-medium ${isSelected ? "text-amber-300" : "text-amber-700"}`}>
                    {story.theme}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Story Details Card */}
          <div className="bg-white rounded-2xl border border-emerald-200/80 p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  {selectedStory.ayatRange} • {selectedStory.titleEnglish}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-bangla text-emerald-950 mt-1">
                  {selectedStory.titleBangla}
                </h3>
                <span className="text-xs text-amber-700 font-semibold font-bangla">
                  মূল প্রতিপাদ্য: {selectedStory.theme}
                </span>
              </div>
            </div>

            {/* Story Summary */}
            <div className="text-gray-800 text-sm sm:text-base font-bangla leading-relaxed bg-sand-pattern p-4 rounded-xl border border-gray-100">
              <span className="font-bold text-emerald-900 block mb-1">ঘটনার সংক্ষিপ্ত বিবরণ:</span>
              {selectedStory.summaryBangla}
            </div>

            {/* Key Ayah with TTS */}
            <div className="bg-emerald-950 text-white p-5 rounded-xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-300 font-bangla flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> এ ঘটনার কেন্দ্রীয় নির্দেশনামূলক আয়াত:
                </span>
                <button
                  onClick={() => handlePlayStoryAyah(selectedStory)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-xs font-medium text-emerald-100 transition-colors cursor-pointer border border-emerald-600/40"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>তিলাওয়াত শুনুন</span>
                </button>
              </div>

              <p dir="rtl" className="font-arabic text-xl sm:text-2xl text-right text-emerald-100 leading-relaxed pt-1">
                {selectedStory.keyAyahArabic}
              </p>
              <p className="text-xs sm:text-sm text-emerald-200/90 font-bangla border-t border-emerald-800/80 pt-2.5">
                {selectedStory.keyAyahMeaning}
              </p>
            </div>

            {/* Core Lessons (শিক্ষা ও বাস্তব প্রয়োগ) */}
            <div>
              <h4 className="text-sm font-bold font-bangla text-emerald-950 mb-2.5 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-700" />
                আমাদের জীবনের জন্য ৪টি প্রধান শিক্ষা:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {selectedStory.lessons.map((lesson, idx) => (
                  <div key={idx} className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-100 text-xs sm:text-sm text-emerald-950 font-bangla flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] shrink-0 font-sans mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{lesson}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Detailed Virtues & Guidelines */}
      {activeSubTab === "virtues" && (
        <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-xl font-bold font-bangla text-emerald-950">
              জুমার দিনে সূরা কাহাফের অতুলনীয় ফজিলত ও নিয়মাবলি
            </h3>
            <p className="text-sm text-gray-600 font-bangla mt-1">
              কখন থেকে কখন পর্যন্ত পাঠ করা যায় এবং কীভাবে তিলাওয়াত করলে পূর্ণাঙ্গ সওয়াব অর্জিত হয়।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 font-bangla space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <Info className="w-4 h-4 text-emerald-600" />
                পাঠ করার সময়সীমা:
              </div>
              <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
                বৃহস্পতিবার সূর্যাস্ত (মাগরিব) হতে শুরু করে শুক্রবারের সূর্যাস্ত (মাগরিব) পর্যন্ত যেকোনো সময়ে সূরা কাহাফ পাঠ করা যায়। তবে জুমার নামাজের পূর্বে বা জুমার খুতবার পূর্বে পাঠ করা অধিক উত্তম।
              </p>
            </div>

            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 font-bangla space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                পূর্ণাঙ্গ পাঠ নাকি প্রথম ১০ আয়াত?
              </div>
              <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
                পূর্ণ সূরা কাহাফ (১১০ আয়াত) তিলাওয়াত করা সুন্নাতে মুয়াক্কাদা পর্যায়ের অতি মর্যাদাপূর্ণ আমল। কোনো কারণে সম্পূর্ণ পড়তে না পারলে অন্তত প্রথম ও শেষ ১০ আয়াত অর্থসহ পাঠ ও মুখস্থ রাখার তাগিদ রয়েছে।
              </p>
            </div>
          </div>

          <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200/80 font-bangla space-y-2">
            <h4 className="font-bold text-amber-950 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-700" />
              যে কারণে সূরা কাহাফ দাজ্জাল থেকে রক্ষা করে:
            </h4>
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              দাজ্জাল পৃথিবীতে চারটি মারাত্মক ফিতনা নিয়ে আসবে: ১) ঈমানের ফিতনা, ২) ধন-সম্পদের ফিতনা, ৩) জ্ঞান ও অলৌকিকতার ফিতনা, এবং ৪) ক্ষমতার ফিতনা। সূরা কাহাফের ৪টি ঘটনা এই ৪টি ফিতনা কীভাবে পরাস্ত করতে হয় তার নিখুঁত ঐশী প্রতিষেধক নির্দেশ করে।
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
