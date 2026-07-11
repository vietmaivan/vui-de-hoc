import React, { useEffect, useState } from 'react';
import { Flag, Flame, Zap } from 'lucide-react';

interface TrackViewProps {
  blueProgress: number; // 0 to 100
  redProgress: number;  // 0 to 100
  blueStreak: number;
  redStreak: number;
  blueStatus: 'idle' | 'correct' | 'incorrect' | 'timeout';
  redStatus: 'idle' | 'correct' | 'incorrect' | 'timeout';
}

interface DustParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export const TrackView: React.FC<TrackViewProps> = ({
  blueProgress,
  redProgress,
  blueStreak,
  redStreak,
  blueStatus,
  redStatus,
}) => {
  const [dustParticles, setDustParticles] = useState<DustParticle[]>([]);

  // Periodically generate dust particles for running characters, especially when accelerating
  useEffect(() => {
    const interval = setInterval(() => {
      const newDust: DustParticle[] = [];
      const timestamp = Date.now();

      // Check if Blue is running or in streak
      if (blueProgress > 0 && blueProgress < 100) {
        const isAccelerating = blueStreak >= 3;
        const spawnChance = isAccelerating ? 0.8 : 0.3;
        if (Math.random() < spawnChance) {
          newDust.push({
            id: timestamp + Math.random(),
            x: blueProgress, // X coordinate in percentage
            y: 32, // y-coord on lane (percentage)
            size: Math.random() * 8 + 4,
            opacity: 0.8,
          });
        }
      }

      // Check if Red is running or in streak
      if (redProgress > 0 && redProgress < 100) {
        const isAccelerating = redStreak >= 3;
        const spawnChance = isAccelerating ? 0.8 : 0.3;
        if (Math.random() < spawnChance) {
          newDust.push({
            id: timestamp + Math.random(),
            x: redProgress, // X coordinate in percentage
            y: 68, // y-coord on lane (percentage)
            size: Math.random() * 8 + 4,
            opacity: 0.8,
          });
        }
      }

      if (newDust.length > 0) {
        setDustParticles((prev) => [
          ...prev.map((d) => ({
            ...d,
            x: d.x - 0.4, // float backward slightly
            opacity: d.opacity - 0.15,
            size: d.size + 1, // expand
          })).filter((d) => d.opacity > 0),
          ...newDust,
        ]);
      } else {
        setDustParticles((prev) =>
          prev
            .map((d) => ({
              ...d,
              x: d.x - 0.4,
              opacity: d.opacity - 0.15,
              size: d.size + 1,
            }))
            .filter((d) => d.opacity > 0)
        );
      }
    }, 120);

    return () => clearInterval(interval);
  }, [blueProgress, redProgress, blueStreak, redStreak]);

  const markers = [0, 20, 40, 60, 80, 100];

  return (
    <div
      id="running-track-container"
      className="bg-[#388E3C] border-y-4 border-[#2D5A27] p-1 relative select-none shadow-inner overflow-hidden"
    >
      {/* Decorative grass background with dot pattern from Design HTML */}
      <div 
        className="absolute inset-0 bg-[#4CAF50] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', 
          backgroundSize: '24px 24px',
          opacity: 0.25
        }} 
      />

      {/* Track Area wrapper */}
      <div className="relative py-2 min-h-[140px]">
        {/* Lanes Divider */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/40 border-b border-dashed border-white/60 transform -translate-y-1/2 z-10" />

        {/* White Grid Markers along the track */}
        <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none flex justify-between px-16 z-0">
          {markers.map((m) => (
            <div
              key={m}
              className="h-full border-r-2 border-white/10 relative flex flex-col justify-between items-center"
              style={{ left: `calc(${m}% - ${m === 0 ? '0px' : m === 100 ? '4px' : '2px'})` }}
            >
              <span className="text-[9px] font-black text-white/50 bg-[#2D5A27]/40 px-1 py-0.5 rounded -translate-y-1">
                {m}%
              </span>
              <span className="text-[9px] font-black text-white/50 bg-[#2D5A27]/40 px-1 py-0.5 rounded translate-y-1">
                {m}%
              </span>
            </div>
          ))}
        </div>

        {/* Start Line */}
        <div className="absolute left-16 top-0 bottom-0 w-2 bg-white/60 shadow-sm z-10">
          <div className="absolute top-1 font-bold text-[8px] text-white/80 tracking-widest bg-[#2D5A27] px-1 rounded transform rotate-90 origin-left">
            START
          </div>
        </div>

        {/* Finish Line */}
        <div className="absolute right-16 top-0 bottom-0 w-6 bg-slate-100 z-10 flex flex-col justify-between overflow-hidden shadow-md">
          {/* Checkered pattern */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`w-full h-2.5 ${i % 2 === 0 ? 'bg-black' : 'bg-white'}`}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="bg-amber-500 text-amber-950 font-extrabold text-[8px] px-1 py-0.5 rounded animate-pulse shadow-sm">
              ĐÍCH
            </span>
          </div>
        </div>

        {/* Dust Particles Renderer */}
        {dustParticles.map((dust) => (
          <div
            key={dust.id}
            className="absolute rounded-full bg-white/70 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 blur-[1px] transition-all duration-100"
            style={{
              left: `calc(16px + ${dust.x}% * 0.72 + (${dust.x}% * 0.12))`, // matches character scale path
              top: `${dust.y}%`,
              width: `${dust.size}px`,
              height: `${dust.size}px`,
              opacity: dust.opacity * 0.6,
            }}
          />
        ))}

        {/* Lane 1: Blue Team Track Lane */}
        <div className="h-14 relative flex items-center">
          {/* Character - Blue Rabbit */}
          <div
            id="blue-runner"
            className="absolute z-20 transition-all duration-700 ease-out flex flex-col items-center"
            style={{
              left: `calc(16px + ${blueProgress}% * 0.72 + (${blueProgress}% * 0.12) - 24px)`,
            }}
          >
            {/* Speed streak effects */}
            {blueStreak >= 3 && (
              <div className="absolute -top-6 bg-blue-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shadow-lg flex items-center gap-0.5 animate-bounce z-30 ring-2 ring-white">
                <Flame className="w-3 h-3 text-yellow-300 animate-pulse fill-yellow-400" />
                <span>🔥 TĂNG TỐC!</span>
              </div>
            )}

            {/* Bunny SVG Character */}
            <div
              className={`w-12 h-12 relative flex items-center justify-center ${
                blueStreak >= 3 ? 'animate-gentle-bounce scale-110' : 'animate-pulse'
              }`}
            >
              {/* Bunny Body & ears */}
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                {/* Ears */}
                <path
                  d="M35,15 C30,0 20,5 25,25"
                  fill="#93C5FD"
                  stroke="#1D4ED8"
                  strokeWidth="3"
                  className={blueStreak >= 1 ? 'animate-bounce' : ''}
                />
                <path
                  d="M65,15 C70,0 80,5 75,25"
                  fill="#93C5FD"
                  stroke="#1D4ED8"
                  strokeWidth="3"
                  className={blueStreak >= 1 ? 'animate-bounce' : ''}
                />
                {/* Inner Ears */}
                <path d="M33,16 C30,5 24,8 27,22" fill="#F472B6" />
                <path d="M67,16 C70,5 76,8 73,22" fill="#F472B6" />

                {/* Head */}
                <circle cx="50" cy="40" r="22" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="4" />
                
                {/* Eyes */}
                <circle cx="42" cy="35" r="3" fill="#FFFFFF" />
                <circle cx="42" cy="35" r="1.5" fill="#000000" />
                <circle cx="58" cy="35" r="3" fill="#FFFFFF" />
                <circle cx="58" cy="35" r="1.5" fill="#000000" />

                {/* Cheeks */}
                <circle cx="36" cy="42" r="3" fill="#F472B6" opacity="0.6" />
                <circle cx="64" cy="42" r="3" fill="#F472B6" opacity="0.6" />

                {/* Nose / Mouth */}
                <path d="M48,42 L52,42 L50,45 Z" fill="#F472B6" />
                <path d="M50,45 Q48,49 46,47 M50,45 Q52,49 54,47" stroke="#1D4ED8" strokeWidth="2" fill="none" />

                {/* Body / Clothes */}
                <path
                  d="M32,60 C32,55 40,52 50,52 C60,52 68,55 68,60 L62,80 L38,80 Z"
                  fill="#1D4ED8"
                  stroke="#1E40AF"
                  strokeWidth="3"
                />

                {/* Cute Badge with 'X' */}
                <circle cx="50" cy="65" r="5" fill="#FBBF24" />
                <text x="50" y="68" fill="#1E40AF" fontSize="8" fontWeight="bold" textAnchor="middle">
                  B
                </text>

                {/* Legs running animation (SVG path rotation/animation via CSS class) */}
                <g className={blueStreak >= 1 ? 'origin-center animate-spin' : 'origin-bottom animate-bounce'}>
                  {/* Left Leg */}
                  <ellipse cx="40" cy="83" rx="4" ry="7" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2.5" />
                  {/* Right Leg */}
                  <ellipse cx="60" cy="83" rx="4" ry="7" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2.5" />
                </g>

                {/* Left Arm waving */}
                <path
                  d="M28,58 Q15,50 12,58"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                {/* Right Arm waving */}
                <path
                  d="M72,58 Q85,50 88,58"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Mascot label */}
            <span className="bg-blue-600 border border-white text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded shadow-sm mt-0.5">
              ĐỘI XANH
            </span>
          </div>
        </div>

        {/* Lane 2: Red Team Track Lane */}
        <div className="h-14 relative flex items-center">
          {/* Character - Red Fox / Cat */}
          <div
            id="red-runner"
            className="absolute z-20 transition-all duration-700 ease-out flex flex-col items-center"
            style={{
              left: `calc(16px + ${redProgress}% * 0.72 + (${redProgress}% * 0.12) - 24px)`,
            }}
          >
            {/* Speed streak effects */}
            {redStreak >= 3 && (
              <div className="absolute -top-6 bg-red-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shadow-lg flex items-center gap-0.5 animate-bounce z-30 ring-2 ring-white">
                <Flame className="w-3 h-3 text-yellow-300 animate-pulse fill-yellow-400" />
                <span>🔥 TĂNG TỐC!</span>
              </div>
            )}

            {/* Fox/Cat Character */}
            <div
              className={`w-12 h-12 relative flex items-center justify-center ${
                redStreak >= 3 ? 'animate-gentle-bounce scale-110' : 'animate-pulse'
              }`}
            >
              {/* Cute Cat/Fox SVG */}
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                {/* Triangular Ears */}
                <polygon
                  points="25,20 40,30 20,40"
                  fill="#EF4444"
                  stroke="#991B1B"
                  strokeWidth="3"
                  className={redStreak >= 1 ? 'animate-pulse' : ''}
                />
                <polygon
                  points="75,20 60,30 80,40"
                  fill="#EF4444"
                  stroke="#991B1B"
                  strokeWidth="3"
                  className={redStreak >= 1 ? 'animate-pulse' : ''}
                />
                {/* Inner Ears */}
                <polygon points="27,24 37,31 24,37" fill="#FEE2E2" />
                <polygon points="73,24 63,31 76,37" fill="#FEE2E2" />

                {/* Head */}
                <circle cx="50" cy="45" r="21" fill="#F87171" stroke="#991B1B" strokeWidth="4" />

                {/* Face markings (Fox style) */}
                <path d="M29,45 Q40,55 50,45 Q60,55 71,45 Q70,62 50,65 Q30,62 29,45 Z" fill="#FFFFFF" opacity="0.3" />

                {/* Eyes */}
                <circle cx="41" cy="42" r="3" fill="#FFFFFF" />
                <circle cx="41" cy="42" r="1.5" fill="#000000" />
                <circle cx="59" cy="42" r="3" fill="#FFFFFF" />
                <circle cx="59" cy="42" r="1.5" fill="#000000" />

                {/* Cheek Blush */}
                <circle cx="35" cy="48" r="2.5" fill="#F43F5E" opacity="0.7" />
                <circle cx="65" cy="48" r="2.5" fill="#F43F5E" opacity="0.7" />

                {/* Nose / Mouth */}
                <polygon points="48,49 52,49 50,52" fill="#000000" />
                <path d="M50,52 Q48,55 46,54 M50,52 Q52,55 54,54" stroke="#991B1B" strokeWidth="2" fill="none" />

                {/* Body / Clothes */}
                <path
                  d="M32,64 C32,58 40,55 50,55 C60,55 68,58 68,64 L62,82 L38,82 Z"
                  fill="#EF4444"
                  stroke="#991B1B"
                  strokeWidth="3"
                />

                {/* Cute Badge with 'R' */}
                <circle cx="50" cy="69" r="5" fill="#FBBF24" />
                <text x="50" y="72" fill="#991B1B" fontSize="8" fontWeight="bold" textAnchor="middle">
                  R
                </text>

                {/* Legs running animation */}
                <g className={redStreak >= 1 ? 'origin-center animate-spin' : 'origin-bottom animate-bounce'}>
                  {/* Left Leg */}
                  <ellipse cx="40" cy="85" rx="4" ry="7" fill="#F87171" stroke="#991B1B" strokeWidth="2.5" />
                  {/* Right Leg */}
                  <ellipse cx="60" cy="85" rx="4" ry="7" fill="#F87171" stroke="#991B1B" strokeWidth="2.5" />
                </g>

                {/* Arms waving */}
                <path
                  d="M28,62 Q15,55 12,62"
                  fill="none"
                  stroke="#F87171"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M72,62 Q85,55 88,62"
                  fill="none"
                  stroke="#F87171"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Mascot label */}
            <span className="bg-red-600 border border-white text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded shadow-sm mt-0.5">
              ĐỘI ĐỎ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
