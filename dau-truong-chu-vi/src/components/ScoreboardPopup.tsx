import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Award, Zap, Timer, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { GameSummary } from '../types';

interface ScoreboardPopupProps {
  summary: GameSummary;
  onReplay: (shouldShuffle: boolean) => void;
}

export const ScoreboardPopup: React.FC<ScoreboardPopupProps> = ({ summary, onReplay }) => {
  const [shouldShuffle, setShouldShuffle] = useState<boolean>(true);

  const isBlueWinner = summary.winner === 'blue';
  const isRedWinner = summary.winner === 'red';
  const isDraw = summary.winner === 'draw';

  // Format time (m:ss)
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m > 0 ? `${m} phút ` : ''}${s} giây`;
  };

  return (
    <div className="fixed inset-0 bg-[#2D5A27]/85 z-50 flex items-center justify-center p-4 backdrop-blur-md select-none overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 100 }}
        className="bg-white border-8 border-[#388E3C] rounded-3xl max-w-2xl w-full p-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden"
      >
        {/* Colorful top bar flag */}
        <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-blue-500 via-amber-400 to-rose-500" />

        {/* Mascot decoration absolute backgrounds */}
        <div className="absolute -left-10 -bottom-10 text-slate-100 font-extrabold text-9xl pointer-events-none transform -rotate-12 select-none">
          X
        </div>
        <div className="absolute -right-10 -bottom-10 text-slate-100 font-extrabold text-9xl pointer-events-none transform rotate-12 select-none">
          O
        </div>

        {/* Header - Winner Declaration */}
        <div className="text-center mt-3">
          {isDraw ? (
            <div className="flex flex-col items-center">
              <div className="bg-amber-100 text-amber-600 p-4 rounded-full shadow-md animate-bounce mb-3 border-4 border-amber-300">
                <Award className="w-12 h-12" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-amber-600 uppercase tracking-tight">
                HÒA NHAU SÒNG PHẲNG!
              </h2>
              <p className="text-slate-500 font-medium text-sm mt-1">Cả hai đội đều thi đấu vô cùng xuất sắc!</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className={`p-4 rounded-full shadow-lg animate-bounce mb-3 border-4 ${
                isBlueWinner 
                  ? 'bg-blue-100 text-blue-600 border-blue-400' 
                  : 'bg-red-100 text-red-600 border-red-400'
              }`}>
                <Trophy className="w-14 h-14" />
              </div>
              <h2 className={`text-3xl md:text-4xl font-black uppercase tracking-tight ${
                isBlueWinner ? 'text-blue-600' : 'text-red-600'
              }`}>
                {isBlueWinner ? 'ĐỘI XANH CHIẾN THẮNG!' : 'ĐỘI ĐỎ CHIẾN THẮNG!'}
              </h2>
              <p className="text-slate-600 font-semibold text-sm mt-1">
                Chúc mừng nhà vô địch tính nhanh chu vi! 👑
              </p>
            </div>
          )}
        </div>

        {/* Content Box */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {/* Blue Stats Column */}
          <div className="bg-blue-50 border-4 border-blue-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
            <div className="text-center">
              <span className="bg-blue-600 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                Đội Xanh
              </span>
              <div className="text-4xl font-black text-blue-700 mt-3 font-mono">
                {summary.blueScore} <span className="text-lg">điểm</span>
              </div>
            </div>

            <div className="border-t border-blue-200/50 my-3" />

            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex justify-between items-center bg-white/60 p-1.5 rounded-lg">
                <span className="flex items-center gap-1 font-medium text-xs text-emerald-600">
                  <ThumbsUp className="w-3.5 h-3.5" /> Trả lời ĐÚNG
                </span>
                <span className="font-extrabold text-emerald-600">{summary.blueCorrect}</span>
              </div>
              <div className="flex justify-between items-center bg-white/60 p-1.5 rounded-lg">
                <span className="flex items-center gap-1 font-medium text-xs text-rose-500">
                  <ThumbsDown className="w-3.5 h-3.5" /> Trả lời SAI
                </span>
                <span className="font-extrabold text-rose-500">{summary.blueIncorrect}</span>
              </div>
            </div>
          </div>

          {/* Red Stats Column */}
          <div className="bg-red-50 border-4 border-red-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
            <div className="text-center">
              <span className="bg-red-600 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                Đội Đỏ
              </span>
              <div className="text-4xl font-black text-red-700 mt-3 font-mono">
                {summary.redScore} <span className="text-lg">điểm</span>
              </div>
            </div>

            <div className="border-t border-red-200/50 my-3" />

            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex justify-between items-center bg-white/60 p-1.5 rounded-lg">
                <span className="flex items-center gap-1 font-medium text-xs text-emerald-600">
                  <ThumbsUp className="w-3.5 h-3.5" /> Trả lời ĐÚNG
                </span>
                <span className="font-extrabold text-emerald-600">{summary.redCorrect}</span>
              </div>
              <div className="flex justify-between items-center bg-white/60 p-1.5 rounded-lg">
                <span className="flex items-center gap-1 font-medium text-xs text-rose-500">
                  <ThumbsDown className="w-3.5 h-3.5" /> Trả lời SAI
                </span>
                <span className="font-extrabold text-rose-500">{summary.redIncorrect}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Match Time summary */}
        <div className="mt-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3 flex justify-between items-center">
          <span className="text-slate-700 font-bold flex items-center gap-1.5 text-sm">
            <Timer className="w-4 h-4 text-amber-500" /> Thời gian hoàn thành:
          </span>
          <span className="text-slate-900 font-extrabold text-sm bg-yellow-200/60 px-3 py-1 rounded-full">
            {formatDuration(summary.durationSeconds)}
          </span>
        </div>

        {/* Action Controls */}
        <div className="mt-6 flex flex-col items-center gap-4">
          {/* Shuffle Option Checkbox */}
          <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-100 px-4 py-2 rounded-full border border-slate-200 transition-all hover:bg-slate-200">
            <input
              type="checkbox"
              checked={shouldShuffle}
              onChange={(e) => setShouldShuffle(e.target.checked)}
              className="w-4.5 h-4.5 text-yellow-500 rounded border-slate-300 focus:ring-yellow-400"
            />
            <span className="text-slate-700 font-bold text-xs select-none">
              🔀 Xáo trộn câu hỏi khi chơi lại
            </span>
          </label>

          {/* Replay Button */}
          <button
            id="replay-btn"
            onClick={() => onReplay(shouldShuffle)}
            className="w-full sm:w-2/3 bg-gradient-to-r from-[#388E3C] to-[#2D5A27] hover:from-[#2D5A27] hover:to-[#1E3D1A] text-white font-black text-lg py-4 rounded-2xl shadow-[0_6px_0_#1E3D1A] hover:shadow-[0_4px_0_#1E3D1A] active:shadow-none hover:translate-y-[2px] active:translate-y-[6px] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>CHƠI LẠI NGAY</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
