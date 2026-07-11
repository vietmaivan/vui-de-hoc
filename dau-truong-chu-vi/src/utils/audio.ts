// Web Audio API helper for Đấu Trường Chu Vi
// Programmatically synthesizes sound effects and background music, requiring no external files.

let audioCtx: AudioContext | null = null;
let bgmInterval: any = null;
let isMuted = false;
let currentBpm = 110;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const setMutedState = (muted: boolean) => {
  isMuted = muted;
  if (muted) {
    stopBgm();
  } else {
    // If we're already playing, resume BGM
  }
};

export const getMutedState = () => {
  return isMuted;
};

// Play a single note
function playNote(freq: number, duration: number, type: OscillatorType = 'sine', gainVal: number = 0.1, delay: number = 0) {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

    gainNode.gain.setValueAtTime(gainVal, ctx.currentTime + delay);
    // Exponential decay
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  } catch (e) {
    console.warn("Audio playing error:", e);
  }
}

// Retro-style sound effect: Correct Answer
export const playCorrectSound = () => {
  const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
  notes.forEach((freq, index) => {
    playNote(freq, 0.25, 'triangle', 0.12, index * 0.08);
  });
};

// Retro-style sound effect: Incorrect Answer
export const playIncorrectSound = () => {
  const notes = [220.00, 196.00, 164.81]; // A3, G3, E3
  notes.forEach((freq, index) => {
    playNote(freq, 0.4, 'sawtooth', 0.15, index * 0.1);
  });
};

// Retro-style sound effect: Countdown tick
export const playCountdownTick = (isGo = false) => {
  if (isGo) {
    playNote(659.25, 0.4, 'sine', 0.15); // E5 (high)
    playNote(523.25, 0.4, 'triangle', 0.12, 0.05); // C5
  } else {
    playNote(329.63, 0.1, 'sine', 0.1); // E4 (short tick)
  }
};

// Retro-style sound effect: Crossing finish line (during gameplay)
export const playFinishSound = () => {
  const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 523.25, 659.25];
  notes.forEach((freq, index) => {
    playNote(freq, 0.3, 'sine', 0.15, index * 0.08);
  });
};

// Retro-style sound effect: Full game victory theme
export const playVictorySound = () => {
  const melody = [
    261.63, 261.63, 261.63, 261.63, 329.63, 293.66, 329.63, 392.00, 523.25, 659.25, 523.25
  ];
  const durations = [0.15, 0.15, 0.15, 0.3, 0.3, 0.15, 0.15, 0.15, 0.3, 0.3, 0.6];
  let timeOffset = 0;
  melody.forEach((freq, index) => {
    playNote(freq, durations[index], 'triangle', 0.12, timeOffset);
    timeOffset += durations[index] * 0.85;
  });
};

// Background Music Sequencer Loop
export const startBgm = () => {
  stopBgm();
  if (isMuted) return;

  // Let's create a cute, simple pentatonic bass and melody line running in background
  const scale = [196.00, 220.00, 261.63, 293.66, 329.63]; // G3, A3, C4, D4, E4
  const bassScale = [98.00, 110.00, 130.81, 146.83]; // G2, A2, C3, D3
  
  let beatCount = 0;

  bgmInterval = setInterval(() => {
    if (isMuted) return;
    try {
      // Beat structure (4/4 time)
      const isDownbeat = beatCount % 4 === 0;
      const isUpbeat = beatCount % 2 === 1;

      // Play bass note on downbeat
      if (isDownbeat) {
        const bassFreq = bassScale[(beatCount / 4) % bassScale.length];
        playNote(bassFreq, 0.4, 'triangle', 0.06);
      }

      // Play a light rhythmic melody note randomly or in pattern
      if (beatCount % 2 === 0) {
        const noteIndex = (beatCount * 3) % scale.length;
        playNote(scale[noteIndex], 0.2, 'sine', 0.02);
      } else if (Math.random() > 0.6) {
        // Occasional embellishment
        const noteIndex = Math.floor(Math.random() * scale.length);
        playNote(scale[noteIndex], 0.15, 'sine', 0.015);
      }

      beatCount++;
    } catch (e) {
      // Fail silently
    }
  }, 350); // roughly 170 BPM or 8th notes at 85 BPM
};

export const stopBgm = () => {
  if (bgmInterval) {
    clearInterval(bgmInterval);
    bgmInterval = null;
  }
};
