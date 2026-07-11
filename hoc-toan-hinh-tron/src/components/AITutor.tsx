import React, { useState, useRef, useEffect } from "react";
import { Message } from "../types";
import { Send, Sparkles, RefreshCw, MessageSquare, AlertCircle, HelpCircle, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AITutorProps {
  onSuggestAction?: (actionType: string) => void;
}

export default function AITutor({ onSuggestAction }: AITutorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "🦉 Chào em! Thầy Giáo Cú Vàng thông thái đây. Thầy rất vui được cùng em học về hình tròn! \n\nEm có thắc mắc gì về Tâm, Bán kính, Đường kính hay hành trình của bạn Bọ Ngựa không? Hãy hỏi thầy nhé! ✨",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    { text: "Bán kính là gì hả Thầy?", action: "radius" },
    { text: "Đường kính khác gì bán kính?", action: "diameter" },
    { text: "Tại sao BC bằng 28 cm vậy ạ?", action: "mantis_math" },
    { text: "Thầy ơi, Com-pa dùng để làm gì?", action: "compass" }
  ];

  const scrollToBottom = () => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (e) {
      console.warn("scrollIntoView not fully supported in this iframe environment:", e);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: text })
      });

      if (!response.ok) {
        throw new Error("Không thể kết nối với Thầy Giáo Cú.");
      }

      const data = await response.json();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: data.text,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error(err);
      setError("Thầy đang suy nghĩ chút xíu... Em thử hỏi lại nhé!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-2 border-amber-200 rounded-2xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-2xl relative animate-bounce" style={{ animationDuration: "3s" }}>
            🦉
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h3 className="font-extrabold text-sm tracking-wide text-slate-900">Thầy Giáo Cú Vàng</h3>
            <p className="text-[10px] text-slate-800 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-white animate-pulse" /> Đang trực tuyến • Trợ lý AI
            </p>
          </div>
        </div>
        <GraduationCap className="w-5 h-5 text-slate-800" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                  msg.sender === "user"
                    ? "bg-amber-500 text-slate-950 font-bold rounded-tr-none"
                    : "bg-white text-slate-700 border border-amber-100/80 rounded-tl-none whitespace-pre-line"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start items-center gap-2 text-xs text-amber-600 font-bold"
          >
            <RefreshCw className="w-3 h-3 animate-spin" /> Thầy Giáo Cú đang viết...
          </motion.div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      <div className="p-3 bg-amber-50/40 border-t border-amber-100/50">
        <p className="text-[10px] text-slate-500 mb-1.5 px-1 font-bold flex items-center gap-1 uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5 text-amber-500" /> Gợi ý câu hỏi nhanh:
        </p>
        <div className="flex flex-wrap gap-1">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (onSuggestAction) {
                  onSuggestAction(q.action);
                }
                handleSendMessage(q.text);
              }}
              className="text-[10px] bg-white hover:bg-amber-500/10 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-400 rounded-lg px-2.5 py-1.5 transition-all text-left font-semibold shadow-xs"
            >
              {q.text}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputValue);
        }}
        className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Hỏi Thầy Giáo Cú về hình tròn..."
          className="flex-1 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white text-slate-800 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-100 disabled:text-slate-400 text-slate-950 p-2.5 rounded-xl transition-all font-bold flex items-center justify-center shrink-0 shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
