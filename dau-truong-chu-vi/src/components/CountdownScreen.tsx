import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playCountdownTick } from '../utils/audio';

interface CountdownScreenProps {
  onComplete: () => void;
}

export const CountdownScreen: React.FC<CountdownScreenProps> = ({ onComplete }) => {
  const [count, setCount] = useState<number>(3);
  const [isGo, setIsGo] = useState<boolean>(false);

  useEffect(() => {
    // Start countdown
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          setIsGo(true);
          playCountdownTick(true); // "BẮT ĐẦU!" (high sound)
          
          // Complete and dismiss after 1 second
          setTimeout(() => {
            onComplete();
          }, 1000);
          return 0;
        }
        playCountdownTick(false); // standard tick sound
        return prev - 1;
      });
    }, 1000);

    // Play first tick on mount
    playCountdownTick(false);

    return () => {
      clearInterval(timer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#2D5A27]/95 z-50 flex flex-col items-center justify-center select-none overflow-hidden">
      {/* Dynamic colorful rays behind countdown */}
      <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent animate-pulse" />
      
      <AnimatePresence mode="wait">
        {!isGo ? (
          <motion.div
            key={count}
            initial={{ scale: 0.2, rotate: -45, opacity: 0 }}
            animate={{ scale: 1.1, rotate: 0, opacity: 1 }}
            exit={{ scale: 2.2, opacity: 0, filter: 'blur(10px)' }}
            transition={{ type: 'spring', stiffness: 120, damping: 10 }}
            className="flex flex-col items-center"
          >
            <div className="text-8xl md:text-9xl font-black font-sans text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-400 drop-shadow-[0_8px_8px_rgba(0,0,0,0.5)]">
              {count}
            </div>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-amber-200 font-extrabold text-xl md:text-2xl mt-6 tracking-widest uppercase"
            >
              Chuẩn bị bước vào Đấu trường!
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="go"
            initial={{ scale: 0.1, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            className="flex flex-col items-center"
          >
            <div className="text-7xl md:text-8xl font-black text-center uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-yellow-300 to-emerald-400 drop-shadow-[0_8px_8px_rgba(0,0,0,0.5)]">
              BẮT ĐẦU!
            </div>
            <p className="text-white/80 font-bold text-lg md:text-xl mt-4 italic">
              Ai sẽ là Vua Chu Vi? 👑
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Retro background elements */}
      <div className="absolute bottom-10 left-10 text-blue-400/10 font-black text-8xl pointer-events-none uppercase">XANH</div>
      <div className="absolute top-10 right-10 text-rose-400/10 font-black text-8xl pointer-events-none uppercase">ĐỎ</div>
    </div>
  );
};
