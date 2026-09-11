import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle, Sparkles, Trophy, RotateCcw, BookOpen } from "lucide-react";
import { FRIDAY_SUNNAHS } from "../data/sunnahData";

export const SunnahChecklist: React.FC = () => {
  const [completedList, setCompletedList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("friday_sunnah_completed");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleSunnah = (id: string) => {
    const updated = completedList.includes(id)
      ? completedList.filter((item) => item !== id)
      : [...completedList, id];
    setCompletedList(updated);
    localStorage.setItem("friday_sunnah_completed", JSON.stringify(updated));
  };

  const handleReset = () => {
    setCompletedList([]);
    localStorage.removeItem("friday_sunnah_completed");
  };

  const total = FRIDAY_SUNNAHS.length;
  const count = completedList.length;
  const percent = Math.round((count / total) * 100);

  return (
    <div id="sunnah-checklist-container" className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-emerald-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              জুমার পুণ্যময় সুন্নাতসমূহ
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-bangla text-white">
              জুমার দিনের ৮টি গুরুত্বপূর্ণ সুন্নত আমল
            </h2>
            <p className="text-emerald-200/90 text-sm font-bangla max-w-2xl">
              জুমার দিনটি সপ্তাহের শ্রেষ্ঠ ঈদ। রাসূলুল্লাহ (ﷺ)-এর অনুসরণে এই সুন্নতগুলো পালনে রয়েছে অপরিসীম বরকত ও অসংখ্য নেকির ভাণ্ডার।
            </p>
          </div>

          <div className="bg-emerald-950/80 px-4 py-3 rounded-xl border border-emerald-600/40 text-center self-start sm:self-auto">
            <span className="text-xs text-emerald-300 font-bangla block">অর্জিত সুন্নত</span>
            <span className="text-2xl font-bold text-amber-300 font-sans">{count} / {total}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-4 border-t border-emerald-800/80">
          <div className="flex items-center justify-between text-xs font-bangla text-emerald-200 mb-1.5">
            <span>অগ্রগতি: {percent}% সম্পন্ন</span>
            {percent === 100 && (
              <span className="text-amber-300 font-bold flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" /> মা শা আল্লাহ! সকল সুন্নত সম্পন্ন হয়েছে
              </span>
            )}
          </div>
          <div className="w-full bg-emerald-950 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-amber-400 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Checklist Header Controls */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold font-bangla text-emerald-950">
          সুন্নতের তালিকা (চিহ্নিত করে সংরক্ষণ করুন):
        </span>
        {count > 0 && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-bangla"
          >
            <RotateCcw className="w-3 h-3" />
            <span>নতুন করে শুরু করুন</span>
          </button>
        )}
      </div>

      {/* Sunnahs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {FRIDAY_SUNNAHS.map((sunnah) => {
          const isDone = completedList.includes(sunnah.id);

          return (
            <div
              key={sunnah.id}
              onClick={() => toggleSunnah(sunnah.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3.5 ${
                isDone
                  ? "bg-emerald-50/90 border-emerald-400 shadow-xs"
                  : "bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 shadow-xs"
              }`}
            >
              <button
                type="button"
                className="mt-0.5 shrink-0 text-emerald-600 focus:outline-none cursor-pointer"
                aria-label={isDone ? "সম্পন্ন হিসেবে চিহ্নিত" : "অসম্পন্ন"}
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
              </button>

              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`text-base font-bold font-bangla ${
                      isDone ? "text-emerald-900 line-through decoration-emerald-500/50" : "text-gray-900"
                    }`}
                  >
                    {sunnah.titleBangla}
                  </h4>
                  <span className="text-[11px] text-gray-400 font-sans hidden sm:inline">
                    {sunnah.titleEnglish}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 font-bangla leading-relaxed">
                  {sunnah.description}
                </p>

                <div className="pt-1 text-[11px] text-emerald-700 font-medium font-bangla">
                  দলিল: {sunnah.hadithReference}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
