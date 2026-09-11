import React, { useState } from "react";
import { Sparkles, MessageSquare, X, Send, Bot, User, BookOpen } from "lucide-react";

interface AskImamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AskImamModal: React.FC<AskImamModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([
    {
      role: "assistant",
      content:
        "আসসালামু আলাইকুম। জুমার দিনের সুন্নত, সূরা আল-কাহাফের শিক্ষা, দরূদ শরীফের ফজিলত এবং দুই খুতবার মাঝে ও মাগরিবের পূর্ববর্তী দোয়া কবুলের বিশেষ ক্ষণ সম্পর্কে আপনার যেকোনো জিজ্ঞাসা করতে পারেন।",
    },
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const quickQuestions = [
    "সূরা কাহাফ পাঠের শুরু ও শেষের সময়সীমা কোনটি?",
    "দুই খুতবার মাঝে ইমাম যখন বসেন তখন কী দোয়া করব?",
    "জুমার আসরের পর দোয়া কবুলের রহস্য ও আমল কী?",
    "দাজ্জালের ফিতনা থেকে বাঁচতে প্রথম দশ আয়াতের তাৎপর্য কী?",
  ];

  const handleSubmit = async (textToSend?: string) => {
    const text = textToSend || query;
    if (!text.trim() || loading) return;

    const newMessages = [...messages, { role: "user" as const, content: text.trim() }];
    setMessages(newMessages);
    if (!textToSend) setQuery("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text.trim() }),
      });

      if (!res.ok) {
        throw new Error("Failed to get answer");
      }

      const data = await res.json();
      setMessages([...newMessages, { role: "assistant" as const, content: data.answer }]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant" as const,
          content: "দুঃখিত, সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর পুনরায় চেষ্টা করুন।",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-emerald-200 overflow-hidden flex flex-col h-[85vh] max-h-[680px]">
        {/* Header */}
        <div className="bg-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-800 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-bangla text-base sm:text-lg text-amber-100">
                জুমার দিন ও আমল জিজ্ঞাসা
              </h3>
              <p className="text-xs text-emerald-300 font-bangla">
                কোরআন ও সহীহ হাদিসের আলোকে শুক্রবারের আদব ও ফিকাহ
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

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-sand-pattern">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-emerald-800 text-amber-300 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm font-bangla leading-relaxed ${
                  m.role === "user"
                    ? "bg-emerald-700 text-white shadow-xs rounded-br-xs"
                    : "bg-white text-gray-800 border border-gray-200 shadow-xs rounded-bl-xs"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>

              {m.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 items-center text-xs text-gray-500 font-bangla bg-white p-3 rounded-xl border border-gray-200 w-fit">
              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <span>সহীহ তথ্য অনুসন্ধান করা হচ্ছে...</span>
            </div>
          )}
        </div>

        {/* Quick prompt suggestions */}
        <div className="p-2.5 bg-gray-50 border-t border-gray-200 shrink-0 overflow-x-auto flex gap-1.5 scrollbar-none">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSubmit(q)}
              disabled={loading}
              className="text-[11px] font-bangla whitespace-nowrap px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-gray-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="জুমার আমল বা সূরা কাহাফ নিয়ে প্রশ্ন লিখুন..."
              disabled={loading}
              className="flex-1 px-3.5 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm font-bangla"
            />
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-medium font-bangla flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">জানুন</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
