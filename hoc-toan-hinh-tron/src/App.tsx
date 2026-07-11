import React, { useState, useEffect } from "react";
import { LevelProgress, Achievement, LevelId } from "./types";
import Dashboard from "./components/Dashboard";
import Level1Identify from "./components/Level1_Identify";
import Level2Drawing from "./components/Level2_Drawing";
import Level3Mantis from "./components/Level3_Mantis";
import AITutor from "./components/AITutor";
import { Compass, GraduationCap, Trophy, ArrowLeft, MessageSquareCode, Sparkles, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const API_URL =
  "https://script.google.com/macros/s/AKfycbzMCAektx3Z9xB0wll4_At1POZGPTTBqaojSa1YKxdMK8l8lLcad6dIr7K2LTlclpJD/exec";

export default function App() {
  const [activeLevel, setActiveLevel] = useState<0 | LevelId>(0); // 0 is dashboard, 1, 2, 3 are levels
  const [showTutor, setShowTutor] = useState(true);
  const [totalScore, setTotalScore] = useState(0);
  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Initializing level progress state
  const [levels, setLevels] = useState<LevelProgress[]>([
    {
      id: 1,
      title: "Cửa 1: Thám Hiểm Tâm - Bán Kính",
      subtitle: "Nhận diện tâm, bán kính, đường kính của hai hình tròn từ bài học sách giáo khoa.",
      status: "unlocked",
      score: 0,
      maxScore: 100
    },
    {
      id: 2,
      title: "Cửa 2: Hộp Dụng Cụ Hình Tròn",
      subtitle: "Sử dụng Com-pa quay hình tròn và Thước gỗ vẽ bán kính OA, đường kính CD.",
      status: "locked",
      score: 0,
      maxScore: 100
    },
    {
      id: 3,
      title: "Cửa 3: Hành Trình Bọ Ngựa",
      subtitle: "Giải cứu chú bọ ngựa tinh nghịch bò trên quãng đường gấp khúc ABCD nối qua 3 hình tròn.",
      status: "locked",
      score: 0,
      maxScore: 100
    }
  ]);

  // Initializing Achievements state
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "explorer",
      title: "Thám Hiểm Học Đường",
      description: "Đánh bại Cửa 1, hiểu rõ tâm O, I.",
      unlocked: false,
      icon: "🧭"
    },
    {
      id: "artist",
      title: "Kỹ Sư Com-pa",
      description: "Thành thạo kỹ thuật vẽ hình tròn.",
      unlocked: false,
      icon: "📐"
    },
    {
      id: "savior",
      title: "Cứu Tinh Bọ Ngựa",
      description: "Tính quãng đường ABCD chính xác.",
      unlocked: false,
      icon: "🦗"
    },
    {
      id: "scholar",
      title: "Trò Ngoan Của Thầy",
      description: "Trò chuyện học hỏi cùng Thầy Giáo Cú.",
      unlocked: false,
      icon: "🦉"
    }
  ]);

  // Re-calculate total score whenever level score updates
  useEffect(() => {
    const sum = levels.reduce((acc, lvl) => acc + lvl.score, 0);
    setTotalScore(sum);
  }, [levels]);

  const handleLevelComplete = (levelId: LevelId, scoreEarned: number) => {
    // Update score of the completed level
    setLevels((prev) =>
      prev.map((lvl) => {
        if (lvl.id === levelId) {
          return { ...lvl, score: scoreEarned, status: "completed" };
        }
        // Unlock next level
        if (lvl.id === levelId + 1 && lvl.status === "locked") {
          return { ...lvl, status: "unlocked" };
        }
        return lvl;
      })
    );

    // Unlock corresponding achievements
    setAchievements((prev) =>
      prev.map((ach) => {
        if (levelId === 1 && ach.id === "explorer") {
          return { ...ach, unlocked: true };
        }
        if (levelId === 2 && ach.id === "artist") {
          return { ...ach, unlocked: true };
        }
        if (levelId === 3 && ach.id === "savior") {
          return { ...ach, unlocked: true };
        }
        return ach;
      })
    );
  };

  const handleTutorInteraction = () => {
    // Unlock scholar achievement upon talking with Owl
    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.id === "scholar" && !ach.unlocked) {
          return { ...ach, unlocked: true };
        }
        return ach;
      })
    );
  };

  const sendScoreToGoogleSheet = async () => {
    if (!studentName.trim() || !studentClass.trim()) {
      alert("Vui lòng nhập đầy đủ Họ tên và Lớp trước khi gửi điểm.");
      return;
    }

    setIsSending(true);
    try {
      const totalQuestion = levels.length;
      const percent = Math.round((totalScore / 300) * 100) + "%";
      const details = levels
        .map((l) => `${l.title}: ${l.score}/${l.maxScore}`)
        .join("\n");

      const body = new URLSearchParams();
      body.append("hoTen", studentName.trim());
      body.append("lop", studentClass.trim());
      body.append("diem", totalScore.toString());
      body.append("percent", percent);
      body.append("soCauHoi", totalQuestion.toString());
      body.append("chiTiet", details);

      const res = await fetch(API_URL, {
        method: "POST",
        body
      });

      if (!res.ok) {
        throw new Error(`Yêu cầu thất bại với mã trạng thái ${res.status}`);
      }

      const json = await res.json();

      if (json.result === "success") {
        alert("Đã gửi điểm lên Google Sheet thành công!");
      } else {
        alert(json.message || "Gửi điểm thất bại. Vui lòng thử lại!");
      }
    } catch (e: any) {
      console.error(e);
      alert("Không thể gửi điểm: " + (e.message || "Lỗi kết nối hoặc CORS. Vui lòng kiểm tra lại cấu hình Google Sheets."));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/40 text-slate-800 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* Dynamic Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#f1f5f9_1.5px,transparent_1.5px),linear-gradient(to_bottom,#f1f5f9_1.5px,transparent_1.5px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_90%,transparent_100%)] pointer-events-none z-0"></div>

      {/* Main Header navigation bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-amber-100 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {activeLevel > 0 && (
            <button
              onClick={() => setActiveLevel(0)}
              className="p-2 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 rounded-xl transition-all mr-1.5 flex items-center justify-center shadow-sm"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-2xl filter drop-shadow">📐</span>
            <div>
              <h2 className="font-extrabold text-sm md:text-base tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                Toán Hình Tròn Lớp 3
              </h2>
              <p className="text-[9px] text-slate-500 font-mono font-bold tracking-wider">TÂM • BÁN KÍNH • ĐƯỜNG KÍNH</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Header score block */}
          <div className="bg-amber-100/80 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold text-amber-800 shadow-sm">
            <Trophy className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>{totalScore} điểm</span>
          </div>

          {/* AI Owl tutor toggle button */}
          <button
            onClick={() => setShowTutor(!showTutor)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
              showTutor
                ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-600"
                : "bg-white border-slate-200 text-slate-700 hover:text-slate-900"
            }`}
          >
            <MessageSquareCode className="w-4 h-4" />
            <span className="hidden sm:inline">Thầy Giáo Cú🦉</span>
          </button>
        </div>
      </header>

      {/* Main Game and Tutor Layout split */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-6 z-10 relative">
        
        {/* Game Stage Panel (takes 3 cols on wide, full on mobile) */}
        <div className={`lg:col-span-3 h-full flex flex-col justify-between ${showTutor ? "" : "lg:col-span-4"}`}>
          <AnimatePresence mode="wait">
            {activeLevel === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <Dashboard
                  levels={levels}
                  achievements={achievements}
                  totalScore={totalScore}
                  onSelectLevel={(id) => setActiveLevel(id)}
                  studentName={studentName}
                  setStudentName={setStudentName}
                  studentClass={studentClass}
                  setStudentClass={setStudentClass}
                  onSendScore={sendScoreToGoogleSheet}
                  isSending={isSending}
                />
              </motion.div>
            )}

            {activeLevel === 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <Level1Identify
                  onComplete={(score) => handleLevelComplete(1, score)}
                  onNextLevel={() => setActiveLevel(2)}
                />
              </motion.div>
            )}

            {activeLevel === 2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <Level2Drawing
                  onComplete={(score) => handleLevelComplete(2, score)}
                  onNextLevel={() => setActiveLevel(3)}
                />
              </motion.div>
            )}

            {activeLevel === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <Level3Mantis
                  onComplete={(score) => handleLevelComplete(3, score)}
                  onBackToDashboard={() => setActiveLevel(0)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Owl Sidebar Panel (collapsible) */}
        <AnimatePresence>
          {showTutor && (
            <motion.div
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "auto" }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-1 h-[650px] lg:h-[calc(100vh-140px)] sticky top-[88px] z-20"
            >
              <AITutor onSuggestAction={handleTutorInteraction} />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Footer credits bar */}
      <footer className="mt-auto border-t border-amber-100 bg-white/60 backdrop-blur-sm p-4 text-center text-[11px] text-slate-500 z-10 relative">
        <p className="flex items-center justify-center gap-1.5 font-medium">
          <BookOpen className="w-3.5 h-3.5 text-amber-600" /> <span>Trò chơi được xây dựng mô phỏng trực quan theo sách giáo khoa Toán lớp 3 Kết nối tri thức cuộc sống.</span>
        </p>
      </footer>
    </div>
  );
}
