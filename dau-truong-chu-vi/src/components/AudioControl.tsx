import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { setMutedState, getMutedState, startBgm, stopBgm } from '../utils/audio';

interface AudioControlProps {
  isPlaying: boolean;
}

export const AudioControl: React.FC<AudioControlProps> = ({ isPlaying }) => {
  const [muted, setMuted] = useState(getMutedState());

  const handleToggle = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    setMutedState(newMuted);
    
    if (!newMuted && isPlaying) {
      startBgm();
    } else {
      stopBgm();
    }
  };

  useEffect(() => {
    if (isPlaying && !muted) {
      startBgm();
    } else {
      stopBgm();
    }
    return () => {
      stopBgm();
    };
  }, [isPlaying, muted]);

  return (
    <button
      id="audio-toggle-btn"
      onClick={handleToggle}
      className={`fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95 duration-200 ${
        muted
          ? 'bg-[#2D5A27]/80 hover:bg-[#2D5A27] text-white ring-2 ring-[#388E3C]'
          : 'bg-amber-500 hover:bg-amber-600 text-amber-950 ring-2 ring-amber-200 animate-gentle-bounce'
      }`}
      title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
    >
      {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
    </button>
  );
};
