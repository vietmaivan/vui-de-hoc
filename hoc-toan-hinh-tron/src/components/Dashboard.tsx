import React, { useState } from "react";
import { LevelProgress, Achievement } from "../types";
import { Play, Award, CheckCircle, HelpCircle, Star, Sparkles, BookOpen, X, GraduationCap, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DashboardProps {
  levels: LevelProgress[];
  achievements: Achievement[];
  totalScore: number;
  onSelectLevel: (levelId: 1 | 2 | 3) => void;
  studentName: string;
  setStudentName: (val: string) => void;
  studentClass: string;
  setStudentClass: (val: string) => void;
  onSendScore: () => void;
  isSending: boolean;
}

export default function Dashboard({
  levels,
  achievements,
  totalScore,
  onSelectLevel,
  studentName,
  setStudentName,
  studentClass,
  setStudentClass,
  onSendScore,
  isSending
}: DashboardProps) {
  const [showLesson, setShowLesson] = useState(false);
  const isGameCompleted = levels.every((level) => level.status === "completed");

  const getStatusBg = (status: "locked" | "unlocked" | "completed") => {
    switch (status) {
      case "completed":
        return "bg-green-50 border-green-200 text-green-800";
      case "unlocked":
        return "bg-amber-50 border-amber-200 text-amber-800";
      default:
        return "bg-slate-100 border-slate-200 text-slate-400 opacity-60";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Scorecard */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 border border-amber-400/30 rounded-3xl p-6 relative overflow-hidden shadow-md">
        {/* Decorative clouds / circles backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full filter blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/10 rounded-full filter blur-xl"></div>

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2.5 max-w-lg">
            <span className="bg-white/20 text-white border border-white/30 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
              Toán Học Lớp 3 Thú Vị 📐
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight leading-none">
              Vương Quốc Hình Tròn
            </h1>
            <p className="text-amber-950 text-xs font-medium leading-relaxed">
              Chào mừng em đến với thế giới hình học kỳ thú! Tại đây, chúng ta sẽ cùng học cách vẽ hình tròn bằng Com-pa và giải bài toán Đường Gấp Khúc ABCD siêu dễ cùng Thầy Giáo Cú nhé!
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur p-4 rounded-2xl border border-amber-200 flex items-center gap-4 shrink-0 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl animate-bounce" style={{ animationDuration: "2.5s" }}>
              👑
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Tổng Điểm Tích Lũy</span>
              <span className="text-2xl font-black text-amber-600 font-mono">{totalScore}</span>
              <span className="text-xs text-slate-500 font-bold"> điểm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Concept Block Button - Merged into a Single engaging call to action! */}
      <div className="bg-white border-2 border-amber-200 hover:border-amber-400 p-4.5 rounded-2xl shadow-sm transition-all flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center md:text-left flex-col md:flex-row">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl shrink-0">
            🦉
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center justify-center md:justify-start gap-1">
              Góc Học Tập: Em muốn xem bài giảng về Hình Tròn?
              <span className="bg-red-100 text-red-600 text-[9px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">Bài Học</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Nhấp nút bên cạnh để xem nhanh lý thuyết sách giáo khoa về <strong>Tâm, Bán Kính (R) và Đường Kính (D)</strong> cực kỳ trực quan!
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowLesson(true)}
          className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-md flex items-center gap-1 shrink-0"
        >
          <BookOpen className="w-4 h-4" />
          <span>Học Bài Ngay thôi!</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Student Information and Score Submit Block */}
      {isGameCompleted && (
        <div className="bg-white border-2 border-amber-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center text-xl text-green-700">
              🎓
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">
                Lưu Kết Quả Học Tập
              </h3>
              <p className="text-xs text-slate-500">
                Nhập họ tên và lớp của em để gửi kết quả học tập lên bảng điểm Google Sheet nhé!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Họ và tên học sinh <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">👤</span>
                <input
                  type="text"
                  disabled={isSending}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white text-slate-800 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none transition-all font-semibold disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Lớp <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🏫</span>
                <input
                  type="text"
                  disabled={isSending}
                  placeholder="Ví dụ: 3A1"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white text-slate-800 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none transition-all font-semibold disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2.5 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-600">
              Tổng điểm của em hiện tại: <span className="text-amber-600 font-extrabold font-mono text-sm">{totalScore}</span> điểm
            </div>
            <button
              onClick={onSendScore}
              disabled={isSending || !studentName.trim() || !studentClass.trim()}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                isSending
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                  : !studentName.trim() || !studentClass.trim()
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                  : "bg-green-600 hover:bg-green-700 text-white hover:shadow active:scale-98 cursor-pointer"
              }`}
            >
              {isSending ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Đang gửi điểm...</span>
                </>
              ) : (
                <>
                  <span>📤 Gửi kết quả lên Google Sheet</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Level Selection Grid */}
      <div>
        <h2 className="text-xs font-black text-slate-500 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
          <Play className="w-4 h-4 text-amber-500 fill-current" /> Các Cửa Thách Thức
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {levels.map((level) => {
            const isLocked = level.status === "locked";
            const isCompleted = level.status === "completed";
            const levelStyle = getStatusBg(level.status);

            return (
              <div
                key={level.id}
                className={`border-2 p-5 rounded-2xl flex flex-col justify-between space-y-6 transition-all bg-white ${
                  isLocked ? "opacity-60 cursor-not-allowed" : "hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5"
                } ${levelStyle}`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold tracking-wider opacity-80 uppercase text-slate-500">
                      Cửa {level.id}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                      {level.score}/{level.maxScore} điểm
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-sm leading-tight">
                    {level.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {level.subtitle}
                  </p>
                </div>

                <button
                  disabled={isLocked}
                  onClick={() => onSelectLevel(level.id)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                    isCompleted
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : isLocked
                      ? "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-amber-500 hover:bg-amber-600 text-slate-950"
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="w-4 h-4" /> Chơi Lại Cửa {level.id}
                    </>
                  ) : isLocked ? (
                    "🔒 Đang Khoá"
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" /> Bắt Đầu Chơi
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements / Badge collection */}
      <div>
        <h2 className="text-xs font-black text-slate-500 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
          <Award className="w-4 h-4 text-amber-500" /> Huy Hiệu Danh Dự
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 border-2 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-all bg-white ${
                ach.unlocked
                  ? "border-amber-300 text-slate-800 shadow-sm"
                  : "border-slate-100 text-slate-400 opacity-40"
              }`}
            >
              <div className="text-3.5xl relative">
                {ach.icon}
                {ach.unlocked && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                )}
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-[11px] leading-tight text-slate-800">{ach.title}</h4>
                <p className="text-[9px] text-slate-400 leading-tight font-medium">{ach.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* The Lessons Popup Modal */}
      <AnimatePresence>
        {showLesson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLesson(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
            ></motion.div>

            {/* Modal Body Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white border-2 border-amber-300 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 z-10 space-y-6"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-lg">🦉</div>
                  <div>
                    <h3 className="font-black text-slate-800 text-base">Góc Bài Học Thầy Giáo Cú Vàng</h3>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Toán Học Hình Tròn Lớp 3</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLesson(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lesson illustrative content */}
              <div className="space-y-4">
                
                {/* SVG Visual illustration of O, OM, AB */}
                <div className="flex flex-col items-center bg-amber-50/40 p-4 rounded-2xl border border-amber-100/50">
                  <svg width="220" height="220" className="drop-shadow-sm">
                    {/* Circle */}
                    <circle cx="110" cy="110" r="75" className="fill-yellow-100/60 stroke-amber-500 stroke-[3]" />
                    {/* Diameter line */}
                    <line x1="35" y1="110" x2="185" y2="110" className="stroke-slate-700 stroke-[2.5]" />
                    {/* Radius line */}
                    <line x1="110" y1="110" x2="163" y2="163" className="stroke-red-500 stroke-[2.5] stroke-dasharray" strokeDasharray="3,3" />

                    {/* Point O (center) */}
                    <circle cx="110" cy="110" r="6" className="fill-slate-900" />
                    <text x="110" y="128" className="text-xs font-black fill-slate-800 text-center" textAnchor="middle">Tâm O</text>

                    {/* Point A (diameter end) */}
                    <circle cx="35" cy="110" r="4.5" className="fill-slate-900" />
                    <text x="22" y="114" className="text-[10px] font-bold fill-slate-700">A</text>

                    {/* Point B (diameter end) */}
                    <circle cx="185" cy="110" r="4.5" className="fill-slate-900" />
                    <text x="194" y="114" className="text-[10px] font-bold fill-slate-700">B</text>

                    {/* Point M (radius end) */}
                    <circle cx="163" cy="163" r="4.5" className="fill-slate-900" />
                    <text x="172" y="172" className="text-[10px] font-bold fill-red-600">M</text>
                  </svg>
                  <span className="text-[10px] text-slate-500 font-bold mt-2">MÔ HÌNH HÌNH TRÒN CHUẨN SÁCH GIÁO KHOA</span>
                </div>

                {/* Structured Text Concepts */}
                <div className="space-y-4">
                  
                  {/* Concept 1 */}
                  <div className="bg-amber-50/40 p-3.5 border border-amber-200/50 rounded-xl space-y-1">
                    <h4 className="font-extrabold text-xs text-amber-900 flex items-center gap-1.5">
                      <span className="text-base">🎯</span> 1. Tâm Hình Tròn
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed pl-5">
                      Là điểm nằm <strong>chính giữa</strong> hình tròn. Ký hiệu thường gặp là chữ cái in hoa như <strong>O</strong>, <strong>I</strong>. Khoảng cách từ tâm đến mọi điểm trên đường tròn đều bằng nhau.
                    </p>
                  </div>

                  {/* Concept 2 */}
                  <div className="bg-sky-50/40 p-3.5 border border-sky-200/50 rounded-xl space-y-1">
                    <h4 className="font-extrabold text-xs text-sky-900 flex items-center gap-1.5">
                      <span className="text-base">📏</span> 2. Bán Kính (Kí hiệu: R)
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed pl-5">
                      Đoạn thẳng nối từ <strong>tâm</strong> đến một điểm nằm trên đường tròn. Ví dụ: Đoạn thẳng <strong className="text-red-500">OM</strong>. Tất cả các bán kính trong một hình tròn đều có độ dài bằng nhau!
                    </p>
                  </div>

                  {/* Concept 3 */}
                  <div className="bg-purple-50/40 p-3.5 border border-purple-200/50 rounded-xl space-y-1">
                    <h4 className="font-extrabold text-xs text-purple-900 flex items-center gap-1.5">
                      <span className="text-base">⚡</span> 3. Đường Kính (Kí hiệu: D)
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed pl-5">
                      Đoạn thẳng <strong>đi qua tâm</strong> và nối hai điểm của hình tròn lại với nhau. Ví dụ: Đoạn thẳng <strong>AB</strong>.
                      <br />
                      <span className="text-purple-700 font-bold">💡 Quy tắc ghi nhớ:</span> Đường kính luôn <strong>dài gấp 2 lần</strong> bán kính (<span className="font-mono text-purple-800">D = 2 x R</span>).
                    </p>
                  </div>

                </div>

              </div>

              {/* Close Button */}
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setShowLesson(false)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md"
                >
                  Em đã hiểu bài rồi!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
