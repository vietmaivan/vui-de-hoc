import React from 'react';
import { Check, X, Flame, Sparkles } from 'lucide-react';
import { Question, AnswerStatus } from '../types';

interface TeamPanelProps {
  team: 'blue' | 'red';
  score: number;
  progress: number; // 0 to 100
  streak: number;
  question: Question;
  answeredStatus: AnswerStatus;
  selectedAnswerIndex: number | null;
  onAnswerSelect: (index: number) => void;
  revealCorrect: boolean;
}

export const TeamPanel: React.FC<TeamPanelProps> = ({
  team,
  score,
  progress,
  streak,
  question,
  answeredStatus,
  selectedAnswerIndex,
  onAnswerSelect,
  revealCorrect,
}) => {
  const isBlue = team === 'blue';
  
  // Natural Tones styling keys
  const teamTextClass = isBlue ? 'text-blue-600' : 'text-rose-600';
  const teamBorderClass = isBlue ? 'border-blue-600' : 'border-rose-500';
  const bgProgressClass = isBlue ? 'bg-blue-600' : 'bg-rose-500';
  const subtextClass = isBlue ? 'text-blue-500' : 'text-rose-400';
  const scoreTextClass = isBlue ? 'text-blue-800' : 'text-rose-800';

  const isLocked = answeredStatus !== 'idle';

  return (
    <div
      id={`${team}-team-panel`}
      className={`flex-1 p-2 md:p-3 flex flex-col rounded-2xl bg-white/95 border-b-4 ${teamBorderClass} shadow-md relative transition-all duration-300`}
    >
      {/* Team Header Section */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <h2 className={`font-black text-lg md:text-xl uppercase tracking-wider ${teamTextClass}`}>
            ĐỘI {isBlue ? 'XANH' : 'ĐỎ'}
          </h2>
          
          {/* Flame streak indicator for Fire Speed Up */}
          {streak >= 3 && (
            <div className="flex items-center gap-0.5 bg-amber-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-full shadow animate-bounce">
              <Flame className="w-3 h-3 text-yellow-300 animate-pulse fill-yellow-400" />
              <span>🔥 CỰC SUNG!</span>
            </div>
          )}
        </div>

        {/* Team Score */}
        <div className="text-right">
          <div className={`text-lg md:text-xl font-black font-sans ${scoreTextClass}`}>
            {score} <span className="text-[10px] opacity-60 font-medium">ĐIỂM</span>
          </div>
        </div>
      </div>

      {/* Progress Bar Container with markers */}
      <div className="mb-2 bg-slate-100 p-1 rounded-xl border border-slate-200/40 shadow-inner">
        <div className="relative h-4.5 bg-slate-200 rounded-full overflow-hidden">
          {/* Colored progression */}
          <div
            className={`h-full rounded-full transition-all duration-500 ${bgProgressClass} relative`}
            style={{ width: `${progress}%` }}
          >
            {/* Animated gleam effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-pulse" />
          </div>

          {/* Progress scale lines (0%, 20%, 40%, 60%, 80%, 100%) */}
          <div className="absolute inset-0 flex justify-between px-2 pointer-events-none items-center">
            {[0, 20, 40, 60, 80, 100].map((val) => (
              <div key={val} className="flex flex-col items-center">
                <div className={`w-0.5 h-1 ${progress >= val ? 'bg-white/60' : 'bg-slate-400/60'}`} />
                <span className={`text-[6.5px] font-extrabold ${progress >= val ? 'text-white' : 'text-slate-500'}`}>
                  {val}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Question Text */}
      <div className="bg-slate-50/80 p-2 md:p-3 rounded-xl shadow-sm border border-slate-200/50 flex-1 flex flex-col justify-center text-center min-h-[50px] mb-2">
        <span className={`text-[10px] font-bold mb-0.5 uppercase tracking-widest ${subtextClass}`}>
          THỬ THÁCH CHU VI
        </span>
        <h3 className="text-slate-700 font-extrabold text-sm md:text-base leading-snug">
          {question.question}
        </h3>
      </div>

      {/* 4 Large Answers */}
      <div className="grid grid-cols-2 gap-2 mt-auto">
        {question.answers.map((ans, idx) => {
          const isSelected = selectedAnswerIndex === idx;
          const isCorrectIdx = question.correct === idx;
          
          let btnStyle = 'bg-white text-slate-700 border-slate-200 shadow-sm';
          if (!isLocked) {
            btnStyle += isBlue 
              ? ' hover:border-blue-400 hover:bg-blue-50/50' 
              : ' hover:border-rose-400 hover:bg-rose-50/50';
          }
          let iconElement = null;

          if (isLocked) {
            if (isSelected) {
              if (answeredStatus === 'correct') {
                btnStyle = 'bg-emerald-600 text-white border-emerald-600 shadow-lg scale-95 ring-2 ring-emerald-300/50';
                iconElement = <Check className="w-4 h-4 font-bold absolute top-1 right-1 text-white" />;
              } else if (answeredStatus === 'incorrect') {
                btnStyle = 'bg-rose-600 text-white border-rose-600 shadow-inner scale-95 ring-2 ring-rose-300/50 animate-shake';
                iconElement = <X className="w-4 h-4 font-bold absolute top-1 right-1 text-white" />;
              }
            } else if (isCorrectIdx && (revealCorrect || answeredStatus === 'incorrect')) {
              // Highlight the correct answer if the team chose the wrong one
              btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-800 border shadow-inner font-black';
            } else {
              btnStyle = 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50';
            }
          }

          return (
            <button
              key={idx}
              id={`${team}-team-answer-${idx}`}
              disabled={isLocked}
              onClick={() => onAnswerSelect(idx)}
              className={`relative py-2 px-2 text-center rounded-xl border-2 font-bold text-xs md:text-sm lg:text-base transition-all duration-200 transform active:scale-95 flex flex-col items-center justify-center min-h-[44px] ${btnStyle}`}
            >
              {iconElement}
              <span className="relative z-10">{ans}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
