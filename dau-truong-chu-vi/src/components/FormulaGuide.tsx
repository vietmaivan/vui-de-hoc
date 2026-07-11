import React from 'react';
import { BookOpen, Ruler, HelpCircle } from 'lucide-react';

export const FormulaGuide: React.FC = () => {
  return (
    <div
      id="formula-guide-box"
      className="bg-amber-50/90 border-2 border-[#388E3C]/40 rounded-xl p-2.5 shadow-sm max-w-[280px] flex flex-col gap-1 relative transition-all hover:scale-[1.01] duration-200"
    >
      {/* Decorative cartoon tab */}
      <div className="absolute -top-3 left-4 bg-[#2D5A27] text-white font-black text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow flex items-center gap-1">
        <BookOpen className="w-2.5 h-2.5 text-emerald-300" />
        <span>GHI NHỚ LỚP 3</span>
      </div>

      <div className="mt-1 flex flex-col gap-1.5 text-slate-800">
        <div className="flex items-center gap-2">
          <div className="bg-amber-100 p-0.5 rounded text-[#2D5A27] font-bold shrink-0 text-[10px]">
            🔲
          </div>
          <div>
            <h4 className="font-extrabold text-[11px] text-[#2D5A27] leading-none">Chu vi hình vuông</h4>
            <p className="text-[11px] font-black text-slate-700 font-mono leading-none mt-0.5">Cạnh × 4</p>
          </div>
        </div>

        <div className="border-t border-[#388E3C]/10 my-0.5" />

        <div className="flex items-center gap-2">
          <div className="bg-amber-100 p-0.5 rounded text-[#2D5A27] font-bold shrink-0 text-[10px]">
            ▭
          </div>
          <div>
            <h4 className="font-extrabold text-[11px] text-[#2D5A27] leading-none">Chu vi hình chữ nhật</h4>
            <p className="text-[11px] font-black text-slate-700 font-mono leading-none mt-0.5">
              (Dài + Rộng) × 2
            </p>
          </div>
        </div>
      </div>
      
      {/* Cute mascot watermark in background */}
      <Ruler className="absolute right-2 bottom-1 w-6 h-6 text-[#388E3C]/5 transform rotate-12 pointer-events-none" />
    </div>
  );
};
