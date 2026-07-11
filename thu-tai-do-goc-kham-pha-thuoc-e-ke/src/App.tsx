/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Award, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Check,
  X,
  FileSpreadsheet,
  RefreshCw,
  CloudUpload,
  Trophy
} from 'lucide-react';
import EkeGame from './components/EkeGame';
import Playground from './components/Playground';
import { sound } from './components/SoundManager';
import { HistoryItem } from './types';
import { submitLeaderboardScore } from './lib/firestore';
import { safeLocalStorage, safeSessionStorage } from './lib/storage';

const API_URL =
  "https://script.google.com/macros/s/AKfycbzMCAektx3Z9xB0wll4_At1POZGPTTBqaojSa1YKxdMK8l8lLcad6dIr7K2LTlclpJD/exec";
  
export default function App() {
  const [activeTab, setActiveTab] = useState<'practice' | 'playground'>('practice');
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);
  
  // Thông tin học sinh dể cá nhân hóa báo cáo Google Sheets (ẩn khỏi UI)
  const [studentName, setStudentName] = useState<string>(() => {
    return safeLocalStorage.getItem('eke_student_name') || 'Bé ngoan';
  });
  const [studentClass, setStudentClass] = useState<string>(() => {
    return safeLocalStorage.getItem('eke_student_class') || 'Lớp 3';
  });

  // ID định danh duy nhất cho phiên chơi này để cập nhật đúng 1 dòng trên BXH
  const [sessionDocId] = useState<string>(() => {
    return `entry_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  });

  // Trạng thái đồng bộ Google Sheets
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [sheetsError, setSheetsError] = useState<string | null>(null);

  // Đồng bộ thông tin học sinh vào localStorage khi thay đổi
  useEffect(() => {
    safeLocalStorage.setItem('eke_student_name', studentName);
  }, [studentName]);

  useEffect(() => {
    safeLocalStorage.setItem('eke_student_class', studentClass);
  }, [studentClass]);

  // Thời gian bắt đầu buổi học thực tế (Sử dụng sessionStorage để tránh quá hạn lịch sử từ hôm qua)
  const [sessionStartTime, setSessionStartTime] = useState<number>(() => {
    const saved = safeSessionStorage.getItem('eke_session_start_time');
    if (saved) return parseInt(saved, 10);
    const now = Date.now();
    safeSessionStorage.setItem('eke_session_start_time', now.toString());
    return now;
  });

  // Số giây trôi qua trong buổi học thực tế
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  // Số giây khi nhấn nút Hoàn thành (để khóa thời gian lại không bị chạy tiếp khi đang xem báo cáo)
  const [sessionDurationSecs, setSessionDurationSecs] = useState<number | null>(null);

  // Điểm số của học sinh (Điểm thực)
  const [score, setScore] = useState<number>(() => {
    const saved = safeLocalStorage.getItem('eke_game_score');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Lịch sử làm bài
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = safeLocalStorage.getItem('eke_game_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Tự động đồng bộ điểm số và thời gian thực lên Bảng xếp hạng Firestore
  useEffect(() => {
    if (score > 0) {
      submitLeaderboardScore(studentName, studentClass, score, elapsedSeconds, sessionDocId)
        .catch(err => console.error("Lỗi đồng bộ bảng xếp hạng thực tế:", err));
    }
  }, [score, studentName, studentClass, elapsedSeconds, sessionDocId]);

  // Tắt/bật âm thanh
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Cập nhật bộ đếm thời gian thực tế mỗi giây
  useEffect(() => {
    const updateTimer = () => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - sessionStartTime) / 1000)));
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [sessionStartTime]);

  useEffect(() => {
    safeLocalStorage.setItem('eke_game_score', score.toString());
  }, [score]);

  useEffect(() => {
    safeLocalStorage.setItem('eke_game_history', JSON.stringify(history));
  }, [history]);

  const handleTabChange = (tab: 'practice' | 'playground') => {
    sound.playClick();
    setActiveTab(tab);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleExportToSheets = async () => {
    sound.playClick();
    setIsSyncing(true);
    setSheetsError(null);

    try {
      const result = await sendToGoogleSheet();
      if (result.result === "success") {
        alert("Đã lưu kết quả lên Google Sheet thành công!");
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      console.error(err);
      setSheetsError(err.message || "Không thể gửi dữ liệu.");
      alert("Không thể gửi dữ liệu lên Google Sheet.");
    } finally {
      setIsSyncing(false);
    }
  };

  const sendToGoogleSheet = async () => {
    const total = history.length;
    const correct = history.filter(h => h.isCorrect).length;

    const percent =
      total === 0
        ? "0%"
        : `${Math.round((correct / total) * 100)}%`;

    const details = history.map((h, index) =>
      `${index + 1}. ${h.questionTitle}
  Kết quả: ${h.isCorrect ? "Đúng" : "Sai"}
  Đáp án: ${h.correctType}
  Bé chọn: ${h.userAnswer}`
    ).join("\n----------------------\n");

    const body = new URLSearchParams();

    body.append("hoTen", studentName);
    body.append("lop", studentClass);
    body.append("diem", score.toString());
    body.append("percent", percent);
    body.append("soCauHoi", total.toString());
    body.append("chiTiet", details);

    // Tương thích luôn với backend cũ
    body.append("name", studentName);
    body.append("class", studentClass);
    body.append("score", score.toString());
    body.append("total", total.toString());
    body.append("details", details);

    const response = await fetch(API_URL, {
      method: "POST",
      body
    });

    return await response.json();
  };

  // Hàm thêm lịch sử làm bài
  const addHistoryItem = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const newItem: HistoryItem = {
      ...item,
      id: `hist_${Date.now()}`,
      timestamp: timeStr
    };
    setHistory(prev => [newItem, ...prev].slice(0, 20)); // lưu tối đa 20 dòng gần nhất
  };

  // Hàm định dạng thời gian thành chuỗi bấm giờ MM:SS
  const formatStopwatch = (totalSecs: number): string => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Hàm định dạng thời gian làm bài thành chuỗi dễ đọc
  const formatDurationFromSeconds = (totalSecs: number): string => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins > 0) {
      return `${mins} phút ${secs} giây`;
    }
    return `${secs} giây`;
  };

  // Tính danh hiệu của học sinh dựa trên điểm số thực tế
  const getBadgeTitle = (pts: number): { name: string; color: string; emoji: string } => {
    if (pts >= 120) return { name: 'Thần đồng Hình học 👑', color: 'bg-yellow-500 text-white', emoji: '👑' };
    if (pts >= 80) return { name: 'Bậc thầy Ê-ke 📐', color: 'bg-purple-500 text-white', emoji: '🎓' };
    if (pts >= 50) return { name: 'Dũng sĩ đo góc 💪', color: 'bg-indigo-500 text-white', emoji: '🌟' };
    if (pts >= 20) return { name: 'Nhà toán học nhí ✏️', color: 'bg-emerald-500 text-white', emoji: '🎒' };
    return { name: 'Tập sự đo góc 🌱', color: 'bg-slate-100 text-slate-700', emoji: '🌱' };
  };

  const badge = getBadgeTitle(score);

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-b from-blue-50 via-indigo-50 to-emerald-50 text-slate-800 font-sans overflow-hidden" id="app-root-container">
      {/* GIAO DIỆN CHÍNH KHÔNG CUỘN TRANG */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 1. THANH ĐẦU TRANG SIÊU NHỎ GỌN (HEADER) */}
        <header className="bg-white border-b-2 border-slate-200 h-14 sm:h-16 flex-shrink-0 flex items-center justify-between px-4 shadow-sm z-30" id="main-app-header">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow border-2 border-white transform rotate-3">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block text-left">
              <h1 className="text-sm font-black text-indigo-900 leading-none">
                BÉ ĐO GÓC LỚP 3
              </h1>
              <span className="text-[10px] font-bold text-indigo-500 block mt-0.5 uppercase tracking-wider">
                Thực hành ê-ke trực quan
              </span>
            </div>
          </div>

          {/* SWITCHER CHẾ ĐỘ CHƠI (TABS) */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex gap-1" id="header-tab-switcher">
            <button
              onClick={() => handleTabChange('practice')}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'practice'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              id="header-tab-practice"
            >
              <span>Học đo góc</span>
            </button>
            <button
              onClick={() => handleTabChange('playground')}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'playground'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              id="header-tab-playground"
            >
              <span>Tự vẽ góc</span>
            </button>
          </div>

          {/* Công cụ góc phải */}
          <div className="flex items-center gap-2">
            {/* Thời gian học thực tế */}
            <div className="bg-sky-50 border border-sky-200 rounded-xl py-1 px-2 md:px-2.5 flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs shadow-xs" id="header-timer" title="Thời gian học thực tế của bé">
              <span className="text-sky-500 animate-pulse">⏱️</span>
              <span className="font-black text-sky-700 font-mono">{formatStopwatch(elapsedSeconds)}</span>
            </div>

            {/* Điểm số tích lũy */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl py-1 px-2.5 flex items-center gap-1 text-xs" id="header-score" title="Tổng điểm số thực tế">
              <Award className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="font-black text-amber-700 font-mono">{score}đ</span>
            </div>

            {/* Danh hiệu thực tế của bé */}
            <div className={`hidden md:flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-xl shadow-xs border border-slate-200/40 ${badge.color}`} title="Danh hiệu thực tế dựa trên điểm số">
              <span>{badge.emoji}</span>
              <span>{badge.name}</span>
            </div>

            {/* Nút Cẩm nang hướng dẫn đo nhanh */}
            <button
              onClick={() => {
                sound.playClick();
                setShowGuideModal(true);
              }}
              className="p-2 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-indigo-600 border border-indigo-200 transition-all cursor-pointer"
              title="Xem cẩm nang đo góc"
            >
              <BookOpen className="w-4 h-4 " />
            </button>

            {/* Nút Hoàn thành buổi học */}
            <button
              onClick={() => {
                sound.playClick();
                if (history.length === 0) {
                  alert('Bé chưa có lịch sử làm bài nào cả. Hãy thử sức trả lời vài câu hỏi trước nhé! 🥰');
                  return;
                }
                setSessionDurationSecs(elapsedSeconds);
                setShowCompleteModal(true);
              }}
              className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
              title="Hoàn thành buổi học"
              id="complete-session-btn"
            >
              <Check className="w-4 h-4 stroke-[3px]" />
              <span>Hoàn thành</span>
            </button>

            {/* Nút Âm thanh */}
            <button
              onClick={toggleMute}
              className="p-2 bg-slate-50 hover:bg-slate-150 rounded-xl text-slate-500 border border-slate-200 transition-all cursor-pointer"
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

        </header>

        {/* THANH THÔNG TIN HỌC SINH (STUDENT PROFILE BAR) */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs" id="student-profile-bar">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-500">🎓 Học sinh đang học:</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                id="studentName"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Nhập tên của bé..."
                className="px-3 py-1 bg-white border border-slate-300 rounded-lg font-black text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 min-w-[140px] text-xs transition-all shadow-xs"
                title="Nhập họ tên của bé tại đây"
              />
              <input
                type="text"
                id="studentClass"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                placeholder="Nhập lớp..."
                className="px-3 py-1 bg-white border border-slate-300 rounded-lg font-black text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 max-w-[100px] text-xs transition-all shadow-xs"
                title="Nhập lớp của bé tại đây"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-bold hidden md:block">
            ✨ Kết quả làm bài và danh hiệu sẽ được đồng bộ tự động lên Bảng xếp hạng và Google Sheets!
          </p>
        </div>

        {/* 2. KHU VỰC KHUNG GIAO DIỆN CHÍNH TRONG 1 MÀN HÌNH (MAIN CONTENT) */}
        <main className="flex-1 overflow-hidden p-3 md:p-4 flex flex-col justify-center max-w-7xl w-full mx-auto" id="main-content-section">
          <div className="flex-1 overflow-hidden">
            {activeTab === 'practice' ? (
              <EkeGame 
                score={score} 
                setScore={setScore} 
                onPlaygroundClick={() => setActiveTab('playground')}
                history={history}
                addHistoryItem={addHistoryItem}
                studentName={studentName}
                studentClass={studentClass}
                elapsedSeconds={elapsedSeconds}
                onCompleteSession={() => {
                  setSessionDurationSecs(elapsedSeconds);
                  setShowCompleteModal(true);
                }}
              />
            ) : (
              <Playground />
            )}
          </div>
        </main>
      </div>

      {/* CẨM NẠNG HƯỚNG DẪN ĐO GÓC (MODAL POPUP) */}
      <AnimatePresence>
        {showGuideModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border-4 border-indigo-500 p-6 shadow-2xl max-w-xl w-full relative"
              id="guide-modal"
            >
              <button
                onClick={() => {
                  sound.playClick();
                  setShowGuideModal(false);
                }}
                className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-6 h-6 text-indigo-600" />
                <h3 className="text-lg font-black text-indigo-950">Cẩm nang đo góc bằng thước Ê-ke</h3>
              </div>

              <p className="text-xs text-slate-500 font-semibold mb-5 leading-relaxed">
                Ê-ke là một chiếc thước thần kỳ có một góc vuông ở đỉnh. Để kiểm tra xem một góc có vuông hay không, bé hãy thực hiện đúng 3 bước siêu dễ dàng sau nhé:
              </p>

              {/* Ba bước đo trực quan */}
              <div className="flex flex-col gap-3.5 mb-6">
                
                <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100 flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-rose-500 text-white font-black flex items-center justify-center flex-shrink-0 text-sm">1</div>
                  <div>
                    <h4 className="font-extrabold text-xs text-rose-800 mb-0.5">Bước 1: Khớp Đỉnh Góc Vuông</h4>
                    <p className="text-[11px] text-rose-700/90 leading-relaxed font-semibold">
                      Bé kéo thước Ê-ke lại gần đỉnh góc cần đo, sao cho <span className="font-black text-rose-800">Đỉnh Góc Vuông</span> của thước trùng khít vào đỉnh góc cần đo.
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-black flex items-center justify-center flex-shrink-0 text-sm">2</div>
                  <div>
                    <h4 className="font-extrabold text-xs text-amber-800 mb-0.5">Bước 2: Xoay Khớp Cạnh Thứ Nhất</h4>
                    <p className="text-[11px] text-amber-700/90 leading-relaxed font-semibold">
                      Nhấn giữ vào <span className="font-black text-amber-800">tay cầm xoay màu xanh lá</span> để xoay thước Ê-ke sao cho một cạnh góc vuông của thước trùng khít với một cạnh của góc vẽ.
                    </p>
                  </div>
                </div>

                <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center flex-shrink-0 text-sm">3</div>
                  <div>
                    <h4 className="font-extrabold text-xs text-emerald-800 mb-0.5">Bước 3: Quan sát Cạnh Thứ Hai để đoán kết quả</h4>
                    <p className="text-[11px] text-emerald-700/90 leading-relaxed font-semibold">
                      Nhìn cạnh còn lại của góc vẽ: <br />
                      ➔ Nếu cạnh góc trùng khít với cạnh đứng của Ê-ke: Đó là <span className="font-black text-emerald-800">GÓC VUÔNG</span>! <br />
                      ➔ Nếu cạnh góc loe rộng ra ngoài hoặc khép hẹp vào trong: Đó là <span className="font-black text-emerald-800">GÓC KHÔNG VUÔNG</span>!
                    </p>
                  </div>
                </div>

              </div>

              <div className="text-center">
                <button
                  onClick={() => {
                    sound.playClick();
                    setShowGuideModal(false);
                  }}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold text-xs cursor-pointer shadow"
                >
                  Bé đã hiểu rồi! Bắt đầu đo góc thôi 📐
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BÁO CÁO HOÀN THÀNH BUỔI HỌC */}
      <AnimatePresence>
        {showCompleteModal && (
          <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border-4 border-indigo-500 p-6 shadow-2xl max-w-xl w-full relative max-h-[92vh] overflow-y-auto"
              id="complete-session-modal"
            >
              <button
                onClick={() => {
                  sound.playClick();
                  setShowCompleteModal(false);
                }}
                className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-5">
                <span className="text-4xl">👑🏆🎉</span>
                <h3 className="text-xl font-black text-indigo-950 mt-2">Báo Cáo Hoàn Thành Buổi Học</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                  Tổng hợp thành tích xuất sắc của bé
                </p>
              </div>

              {/* Bảng bento thông tin siêu dễ thương */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                
                {/* Điểm */}
                <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl text-center flex flex-col justify-center">
                  <span className="text-xl">⭐</span>
                  <span className="text-[10px] uppercase font-black text-amber-500 tracking-wider block mt-1">Tổng điểm</span>
                  <span className="text-2xl font-black text-amber-700 font-mono mt-0.5">{score} điểm</span>
                </div>

                {/* Thời gian */}
                <div className="bg-sky-50 border border-sky-100 p-3 rounded-2xl text-center flex flex-col justify-center">
                  <span className="text-xl">⏱️</span>
                  <span className="text-[10px] uppercase font-black text-sky-500 tracking-wider block mt-1">Thời gian thực</span>
                  <span className="text-sm font-black text-sky-700 mt-1">
                    {formatDurationFromSeconds(sessionDurationSecs ?? elapsedSeconds)}
                  </span>
                </div>

                {/* Đúng */}
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl text-center">
                  <span className="text-xl">✅</span>
                  <span className="text-[10px] uppercase font-black text-emerald-600 tracking-wider block mt-1">Số câu đúng</span>
                  <span className="text-xl font-black text-emerald-700 font-mono mt-0.5">
                    {history.filter(h => h.isCorrect).length} câu
                  </span>
                </div>

                {/* Sai */}
                <div className="bg-rose-50 border border-rose-100 p-3 rounded-2xl text-center">
                  <span className="text-xl">❌</span>
                  <span className="text-[10px] uppercase font-black text-rose-500 tracking-wider block mt-1">Số câu sai</span>
                  <span className="text-xl font-black text-rose-700 font-mono mt-0.5">
                    {history.filter(h => !h.isCorrect).length} câu
                  </span>
                </div>

              </div>

              {/* Thống kê Bảng xếp hạng thực tế */}
              <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl mb-5 text-left">
                <h4 className="font-black text-xs text-indigo-950 mb-1.5 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>Bảng xếp hạng thực tế:</span>
                </h4>
                <p className="text-[10.5px] text-slate-500 font-bold leading-relaxed">
                  Kết quả học tập thực tế của bé được tự động lưu trữ và đồng bộ liên tục.
                </p>
                <div className="mt-2 text-[10px] text-indigo-800 font-bold bg-white px-3 py-1.5 rounded-xl border border-indigo-100 flex items-center justify-between">
                  <span>🏆 Điểm thực: {score}đ</span>
                  <span>⏱️ Thời gian: {formatDurationFromSeconds(sessionDurationSecs ?? elapsedSeconds)}</span>
                  <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-black">✓ Đã đồng bộ live</span>
                </div>
              </div>

              {/* Danh sách câu sai cần ôn tập */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-5 text-left">
                <h4 className="font-black text-xs text-slate-800 mb-2 flex items-center gap-1.5">
                  <span>📋</span> Chi tiết các câu cần ôn luyện:
                </h4>
                {history.filter(h => !h.isCorrect).length === 0 ? (
                  <div className="text-emerald-700 font-bold text-xs bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-2">
                    <span>🦁</span>
                    <span>Tuyệt vời quá! Bé đã trả lời đúng tất cả các câu thử thách! 10 điểm cho bé!</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                    {history.filter(h => !h.isCorrect).map((h, i) => (
                      <div key={`err-${i}`} className="bg-white p-2 rounded-xl border border-slate-150 text-[11px] flex justify-between items-center">
                        <div className="text-left">
                          <span className="font-extrabold text-slate-800 block">{h.questionTitle}</span>
                          <span className="text-[9px] text-slate-400 font-bold">
                            Mức độ: {h.difficulty} • Đáp án đúng: {h.correctType}
                          </span>
                        </div>
                        <span className="text-rose-500 font-black text-[10px] bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">
                          Bé chọn: {h.userAnswer}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PHẦN XUẤT GOOGLE SHEETS BÁO CÁO THỰC TẾ TRONG MODAL HOÀN THÀNH */}
              <div className="bg-emerald-50/50 border-2 border-dashed border-emerald-300 p-4 rounded-2xl mb-5 text-left">
                <h4 className="font-black text-xs text-emerald-900 mb-1.5 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Đồng bộ báo cáo học tập lên Google Sheets:</span>
                </h4>
                
                <p className="text-[10.5px] text-slate-500 font-bold leading-relaxed mb-3">
                  Hệ thống sẽ gửi trực tiếp <b>điểm số thực tế ({score}đ)</b> và <b>thời gian học thực tế ({formatDurationFromSeconds(sessionDurationSecs ?? elapsedSeconds)})</b> vào hệ thống bảng tính lưu trữ chung.
                </p>

                {/* Họ tên và Lớp học cho bé */}
                <div className="grid grid-cols-2 gap-2 mb-3 bg-white p-2.5 rounded-xl border border-emerald-100">
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wide mb-1">
                      📛 Họ tên của bé:
                    </label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Nhập tên của bé..."
                      className="w-full px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-extrabold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wide mb-1">
                      🏫 Lớp học:
                    </label>
                    <input
                      type="text"
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      placeholder="Nhập lớp học..."
                      className="w-full px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-extrabold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={handleExportToSheets}
                    disabled={isSyncing}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-black text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang xuất dữ liệu...</span>
                      </>
                    ) : (
                      <>
                        <CloudUpload className="w-3.5 h-3.5" />
                        <span>Xuất báo cáo sang Sheets ngay 📐</span>
                      </>
                    )}
                  </button>
                </div>

                {sheetsError && (
                  <p className="text-[9.5px] text-rose-500 font-bold mt-2 text-center">
                    ⚠️ {sheetsError}
                  </p>
                )}
              </div>

              {/* Nút đóng / Tiếp tục luyện tập */}
              <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
                <div className="bg-gradient-to-r from-indigo-50 to-pink-50 border border-indigo-100 p-3.5 rounded-2xl text-center">
                  <p className="text-[11px] font-bold text-indigo-800 leading-relaxed">
                    🌟 Chúc mừng bé đã hoàn thành xuất sắc bài học hôm nay! Bé hãy tiếp tục ôn luyện để nâng cao điểm số và rèn luyện kỹ năng đo góc thật giỏi nhé!
                  </p>
                </div>

                 <button
                  onClick={() => {
                    sound.playClick();
                    setShowCompleteModal(false);
                  }}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm cursor-pointer transition-all active:scale-95 shadow-md text-center"
                >
                  Tiếp tục luyện tập thêm 📐
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Bé có chắc chắn muốn làm mới toàn bộ điểm số thực, lịch sử làm bài và hòn đảo đã mở khóa để thử thách lại từ đầu không? 🥰')) {
                      sound.playClick();
                      // Reset states
                      setScore(0);
                      setHistory([]);
                      safeLocalStorage.removeItem('eke_game_score');
                      safeLocalStorage.removeItem('eke_game_history');
                      safeLocalStorage.removeItem('eke_adv_unlocked');
                      safeLocalStorage.removeItem('eke_adv_stars');
                      
                      const now = Date.now();
                      safeSessionStorage.setItem('eke_session_start_time', now.toString());
                      setSessionStartTime(now);
                      setElapsedSeconds(0);
                      setSessionDurationSecs(null);
                      setShowCompleteModal(false);
                      alert('Đã làm mới thành tích thành công! Chúng mình cùng rèn luyện từ đầu nhé! 📐🚀');
                    }
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl font-bold text-xs cursor-pointer transition-all active:scale-95 text-center mt-1 border border-slate-200"
                >
                  🔄 Làm mới thành tích & chơi lại từ đầu
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}