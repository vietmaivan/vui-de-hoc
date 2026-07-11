import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, RotateCcw, Play, Gamepad2, Flame, BookOpen } from 'lucide-react';

import { Question, TeamState, GameState, GameSummary } from './types';
import { AudioControl } from './components/AudioControl';
import { TrackView } from './components/TrackView';
import { TeamPanel } from './components/TeamPanel';
import { FormulaGuide } from './components/FormulaGuide';
import { ParticlesEffect } from './components/ParticlesEffect';
import { ScoreboardPopup } from './components/ScoreboardPopup';
import { CountdownScreen } from './components/CountdownScreen';
import { playCorrectSound, playIncorrectSound, playFinishSound, playVictorySound } from './utils/audio';

const API_URL =
  "https://script.google.com/macros/s/AKfycbzMCAektx3Z9xB0wll4_At1POZGPTTBqaojSa1YKxdMK8l8lLcad6dIr7K2LTlclpJD/exec";

const INITIAL_QUESTIONS: Question[] = [
  {
    question: "Chu vi hình vuông có cạnh 8 m là:",
    answers: ["16 m", "24 m", "32 m", "64 m"],
    correct: 2,
    shapeType: 'square',
    side: 8,
    unit: 'm'
  },
  {
    question: "Chu vi hình vuông có cạnh 7 cm là:",
    answers: ["14 cm", "21 cm", "28 cm", "49 cm"],
    correct: 2,
    shapeType: 'square',
    side: 7,
    unit: 'cm'
  },
  {
    question: "Muốn tính chu vi hình chữ nhật, ta làm thế nào?",
    answers: [
      "Chiều dài × chiều rộng",
      "Chiều dài + chiều rộng",
      "(Chiều dài + chiều rộng) × 2",
      "Chiều dài × 2"
    ],
    correct: 2,
    shapeType: 'unknown'
  },
  {
    question: "Hình chữ nhật có chiều dài 8 m, chiều rộng 2 m. Chu vi là:",
    answers: ["10 m", "16 m", "18 m", "20 m"],
    correct: 3,
    shapeType: 'rectangle',
    width: 8,
    height: 2,
    unit: 'm'
  },
  {
    question: "Hình chữ nhật có chiều dài 15 dm, chiều rộng 10 dm. Chu vi là:",
    answers: ["25 dm", "40 dm", "50 dm", "60 dm"],
    correct: 2,
    shapeType: 'rectangle',
    width: 15,
    height: 10,
    unit: 'dm'
  },
  {
    question: "Một hình vuông có chu vi 24 cm. Độ dài cạnh hình vuông là:",
    answers: ["4 cm", "5 cm", "6 cm", "8 cm"],
    correct: 2,
    shapeType: 'square',
    side: 6,
    unit: 'cm'
  }
];

const DEFAULT_TEAM_STATE = (): TeamState => ({
  score: 0,
  currentStreak: 0,
  answeredStatus: 'idle',
  selectedAnswerIndex: null,
  progress: 0,
  isSparkling: false
});

export default function App() {
  // Game Configuration State
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [gameState, setGameState] = useState<GameState>('menu');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [sending, setSending] = useState(false);
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const timerRef = useRef<any>(null);
  const totalTimerRef = useRef<any>(null);

  // Teams States
  const [blueTeam, setBlueTeam] = useState<TeamState>(DEFAULT_TEAM_STATE());
  const [redTeam, setRedTeam] = useState<TeamState>(DEFAULT_TEAM_STATE());

  // Interactive Helper States
  const [revealCorrectBlue, setRevealCorrectBlue] = useState<boolean>(false);
  const [revealCorrectRed, setRevealCorrectRed] = useState<boolean>(false);
  const [particles, setParticles] = useState<'none' | 'confetti' | 'fireworks' | 'both'>('none');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  
  // Scoring Summary for Ending Screen
  const [summary, setSummary] = useState<GameSummary | null>(null);

  // Stats trackers
  const statsRef = useRef({
    blueCorrect: 0,
    blueIncorrect: 0,
    redCorrect: 0,
    redIncorrect: 0
  });

  // Track the elapsed game time
  useEffect(() => {
    if (gameState === 'playing') {
      totalTimerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (totalTimerRef.current) {
        clearInterval(totalTimerRef.current);
      }
    }
    return () => {
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
    };
  }, [gameState]);

  // Main countdown timer for each question
  useEffect(() => {
    if (gameState === 'playing' && !isTransitioning) {
      setTimeLeft(20);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState, currentQuestionIndex, isTransitioning]);

  // Handle countdown timer timeout (when 20s expires)
  const handleTimeout = () => {
    // Both teams get timed out if they haven't answered
    setBlueTeam((prev) => {
      if (prev.answeredStatus === 'idle') {
        statsRef.current.blueIncorrect++;
        return {
          ...prev,
          answeredStatus: 'timeout',
          currentStreak: 0
        };
      }
      return prev;
    });

    setRedTeam((prev) => {
      if (prev.answeredStatus === 'idle') {
        statsRef.current.redIncorrect++;
        return {
          ...prev,
          answeredStatus: 'timeout',
          currentStreak: 0
        };
      }
      return prev;
    });

    playIncorrectSound();
    setRevealCorrectBlue(true);
    setRevealCorrectRed(true);
    triggerNextQuestionTransition();
  };

  // Helper to check if both teams have submitted an answer
  useEffect(() => {
    if (gameState === 'playing' && !isTransitioning) {
      if (blueTeam.answeredStatus !== 'idle' && redTeam.answeredStatus !== 'idle') {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        triggerNextQuestionTransition();
      }
    }
  }, [blueTeam.answeredStatus, redTeam.answeredStatus, gameState, isTransitioning]);

  // Transition to the next question or trigger ending sequence
  const triggerNextQuestionTransition = () => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      // Check if any team has reached 100% progress
      const blueWon = blueTeam.progress >= 100;
      const redWon = redTeam.progress >= 100;
      const isLastQuestion = currentQuestionIndex >= questions.length - 1;

      if (blueWon || redWon || isLastQuestion) {
        endGame();
      } else {
        // Prepare next question
        setCurrentQuestionIndex((prev) => prev + 1);
        setBlueTeam((prev) => ({ ...prev, answeredStatus: 'idle', selectedAnswerIndex: null }));
        setRedTeam((prev) => ({ ...prev, answeredStatus: 'idle', selectedAnswerIndex: null }));
        setRevealCorrectBlue(false);
        setRevealCorrectRed(false);
        setParticles('none');
        setIsTransitioning(false);
      }
    }, 2500); // 2.5 seconds to read/reveal answer feedback
  };

  // Handle choice selection for either Team Blue or Team Red
  const handleAnswerSelect = (team: 'blue' | 'red', answerIndex: number) => {
    if (isTransitioning) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = currentQuestion.correct === answerIndex;

    if (team === 'blue') {
      if (blueTeam.answeredStatus !== 'idle') return; // locked

      if (isCorrect) {
        playCorrectSound();
        statsRef.current.blueCorrect++;
        const newStreak = blueTeam.currentStreak + 1;
        // Formula: 10 base points + streak bonus (double if streak >= 3)
        const pointGain = newStreak >= 3 ? 20 : 10;
        
        // Progress gains 20% for each correct answer
        const newProgress = Math.min(100, blueTeam.progress + 20);

        if (newProgress >= 100) {
          playFinishSound();
          setParticles('fireworks');
        } else {
          setParticles('fireworks');
          setTimeout(() => setParticles('none'), 1200);
        }

        setBlueTeam((prev) => ({
          ...prev,
          score: prev.score + pointGain,
          currentStreak: newStreak,
          answeredStatus: 'correct',
          selectedAnswerIndex: answerIndex,
          progress: newProgress,
          isSparkling: newStreak >= 3
        }));
      } else {
        playIncorrectSound();
        statsRef.current.blueIncorrect++;
        setBlueTeam((prev) => ({
          ...prev,
          currentStreak: 0,
          answeredStatus: 'incorrect',
          selectedAnswerIndex: answerIndex,
          isSparkling: false
        }));
        
        // Brief timeout before revealing correct answer
        setTimeout(() => {
          setRevealCorrectBlue(true);
        }, 1000);
      }
    } else {
      if (redTeam.answeredStatus !== 'idle') return; // locked

      if (isCorrect) {
        playCorrectSound();
        statsRef.current.redCorrect++;
        const newStreak = redTeam.currentStreak + 1;
        const pointGain = newStreak >= 3 ? 20 : 10;
        const newProgress = Math.min(100, redTeam.progress + 20);

        if (newProgress >= 100) {
          playFinishSound();
          setParticles('fireworks');
        } else {
          setParticles('fireworks');
          setTimeout(() => setParticles('none'), 1200);
        }

        setRedTeam((prev) => ({
          ...prev,
          score: prev.score + pointGain,
          currentStreak: newStreak,
          answeredStatus: 'correct',
          selectedAnswerIndex: answerIndex,
          progress: newProgress,
          isSparkling: newStreak >= 3
        }));
      } else {
        playIncorrectSound();
        statsRef.current.redIncorrect++;
        setRedTeam((prev) => ({
          ...prev,
          currentStreak: 0,
          answeredStatus: 'incorrect',
          selectedAnswerIndex: answerIndex,
          isSparkling: false
        }));

        setTimeout(() => {
          setRevealCorrectRed(true);
        }, 1000);
      }
    }
  };

  // Complete match and calculate winner
  const endGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (totalTimerRef.current) clearInterval(totalTimerRef.current);

    let winner: 'blue' | 'red' | 'draw' = 'draw';
    
    // Priority 1: Finish line progress crossing
    if (blueTeam.progress >= 100 && redTeam.progress < 100) {
      winner = 'blue';
    } else if (redTeam.progress >= 100 && blueTeam.progress < 100) {
      winner = 'red';
    } else {
      // Priority 2: Score matching
      if (blueTeam.score > redTeam.score) {
        winner = 'blue';
      } else if (redTeam.score > blueTeam.score) {
        winner = 'red';
      } else {
        // Priority 3: Correct accuracy
        if (statsRef.current.blueCorrect > statsRef.current.redCorrect) {
          winner = 'blue';
        } else if (statsRef.current.redCorrect > statsRef.current.blueCorrect) {
          winner = 'red';
        }
      }
    }

    setSummary({
      blueScore: blueTeam.score,
      redScore: redTeam.score,
      blueCorrect: statsRef.current.blueCorrect,
      blueIncorrect: statsRef.current.blueIncorrect,
      redCorrect: statsRef.current.redCorrect,
      redIncorrect: statsRef.current.redIncorrect,
      durationSeconds: timeElapsed,
      winner
    });

    playVictorySound();
    setParticles('both');
    setGameState('ended');
  };

  // Trigger game start countdown sequence
  const startGame = () => {
    setGameState('countdown');
  };

  // Initialize and clean replay values
  const handleReplay = (shouldShuffle: boolean) => {
    if (shouldShuffle) {
      // Shuffle the list of questions dynamically
      const shuffled = [...INITIAL_QUESTIONS].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
    } else {
      setQuestions(INITIAL_QUESTIONS);
    }

    setCurrentQuestionIndex(0);
    setTimeLeft(20);
    setTimeElapsed(0);
    setBlueTeam(DEFAULT_TEAM_STATE());
    setRedTeam(DEFAULT_TEAM_STATE());
    setRevealCorrectBlue(false);
    setRevealCorrectRed(false);
    setParticles('none');
    setIsTransitioning(false);
    statsRef.current = {
      blueCorrect: 0,
      blueIncorrect: 0,
      redCorrect: 0,
      redIncorrect: 0
    };

    setGameState('countdown');
  };

  const sendScore = async () => {

    if (!summary) return;

    if (!studentName.trim()) {
      alert("Nhập họ tên.");
      return;
    }

    setSending(true);

    try {

      const percent =
        Math.round(
          ((summary.blueCorrect + summary.redCorrect) /
            (questions.length * 2)) *
            100
        ) + "%";

      const details = `
  Đội Xanh
  Điểm: ${summary.blueScore}
  Đúng: ${summary.blueCorrect}
  Sai: ${summary.blueIncorrect}

  Đội Đỏ
  Điểm: ${summary.redScore}
  Đúng: ${summary.redCorrect}
  Sai: ${summary.redIncorrect}

  Thời gian: ${summary.durationSeconds} giây

  Kết quả: ${
        summary.winner == "blue"
          ? "Đội Xanh"
          : summary.winner == "red"
          ? "Đội Đỏ"
          : "Hòa"
      }
  `;

      const body = new URLSearchParams();

      body.append("hoTen", studentName);
      body.append("lop", studentClass);
      body.append(
        "diem",
        Math.max(summary.blueScore, summary.redScore).toString()
      );
      body.append("percent", percent);
      body.append("soCauHoi", questions.length.toString());
      body.append("chiTiet", details);

      await fetch(API_URL, {
        method: "POST",
        body
      });

      alert("Đã gửi điểm lên Google Sheet.");

    } catch (e) {

      console.error(e);

      alert("Không thể gửi dữ liệu.");

    }

    setSending(false);
  };

  return (
    <div className="h-screen max-h-screen bg-[#E0F2F1] font-sans text-slate-800 flex flex-col justify-between overflow-hidden relative">
      
      {/* Primary Header Bar */}
      <header className="bg-[#2D5A27] text-white py-2.5 px-6 shadow-md flex justify-between items-center z-30 select-none shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl md:text-2xl animate-bounce">🏆</span>
          <div className="text-left">
            <h1 className="text-sm md:text-base font-black tracking-wide uppercase leading-tight">ĐẤU TRƯỜNG CHU VI</h1>
            <p className="text-[8px] text-emerald-200 uppercase tracking-widest font-bold leading-none mt-0.5">Hình vuông & hình chữ nhật</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {gameState === 'playing' ? (
            <span className="bg-emerald-800/80 border border-emerald-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-emerald-100">
              Lượt chơi {currentQuestionIndex + 1}/6
            </span>
          ) : (
            <span className="bg-emerald-800/80 border border-emerald-600 text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest text-emerald-100">
              TRƯỜCO TRƯỜNG TIỂU HỌC TOÁN HỌC VUI VẺ
            </span>
          )}
        </div>
      </header>

      {/* Absolute Header with Toggle Audio */}
      <AudioControl isPlaying={gameState === 'playing'} />

      {/* Full-screen Particle overlays */}
      <ParticlesEffect type={particles} />

      {/* Main Game views based on state */}
      <AnimatePresence mode="wait">
        
        {/* State 1: MENU SCREEN */}
        {gameState === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full text-center my-2"
          >
            {/* Student Name & Class Inputs - Moved to Top */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3 w-full max-w-md bg-white/95 p-3 rounded-xl border border-emerald-200 shadow-sm z-10">
              <input
                className="flex-grow border-2 border-emerald-200 focus:border-emerald-500 outline-none rounded-lg px-3 py-2 text-sm transition-all"
                placeholder="Họ và tên học sinh"
                value={studentName}
                onChange={(e)=>setStudentName(e.target.value)}
              />
              <input
                className="w-full sm:w-32 border-2 border-emerald-200 focus:border-emerald-500 outline-none rounded-lg px-3 py-2 text-sm transition-all"
                placeholder="Lớp"
                value={studentClass}
                onChange={(e)=>setStudentClass(e.target.value)}
              />
            </div>

            {/* Playful animated crown/badge */}
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [0, -1, 1, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="bg-amber-400 p-3 rounded-full shadow-[0_4px_0_#b45309] border-2 border-amber-200 mb-4"
            >
              <Gamepad2 className="w-10 h-10 text-amber-950" />
            </motion.div>

            {/* Giant Game Title */}
            <h1 className="text-3xl md:text-4xl font-black text-[#2D5A27] drop-shadow-sm tracking-tight uppercase leading-none">
              ĐẤU TRƯỜNG CHU VI
            </h1>
            <p className="text-emerald-800 font-black text-xs md:text-sm mt-1.5 uppercase tracking-wider">
              Trò chơi tính nhanh chu vi dành cho Học sinh Lớp 3
            </p>

            {/* Introduction Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 w-full max-w-2xl bg-white/80 p-3 rounded-2xl border-2 border-slate-200/60 shadow-md">
              {/* Blue Team Intro */}
              <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-200/50 flex flex-col items-center">
                <span className="text-2xl mb-1">🐰</span>
                <span className="text-blue-600 font-black text-xs uppercase tracking-wider">Đội Xanh</span>
                <p className="text-slate-600 text-[10px] mt-0.5 font-semibold leading-normal">Nhấn các đáp án xanh dương bên trái màn hình.</p>
              </div>

              {/* Red Team Intro */}
              <div className="bg-rose-50/60 p-2.5 rounded-xl border border-rose-200/50 flex flex-col items-center">
                <span className="text-2xl mb-1">🐱</span>
                <span className="text-rose-600 font-black text-xs uppercase tracking-wider">Đội Đỏ</span>
                <p className="text-slate-600 text-[10px] mt-0.5 font-semibold leading-normal">Nhấn các đáp án màu đỏ bên phải màn hình.</p>
              </div>
            </div>

            {/* Formulas Showcase */}
            <div className="mt-4">
              <FormulaGuide />
            </div>

            {/* Start Button */}
            <button
              id="start-match-btn"
              onClick={startGame}
              className="mt-5 px-10 py-3 bg-gradient-to-r from-[#388E3C] to-[#2D5A27] hover:from-[#2D5A27] hover:to-[#1E3D1A] text-white font-black text-lg rounded-xl shadow-[0_6px_0_#1E3D1A] hover:shadow-[0_4px_0_#1E3D1A] active:shadow-none hover:translate-y-[2px] active:translate-y-[6px] transition-all flex items-center justify-center gap-2 w-full sm:w-72 group cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
              <span>BẮT ĐẦU CHƠI</span>
            </button>
          </motion.div>
        )}

        {/* State 2: COUNTDOWN SCREEN */}
        {gameState === 'countdown' && (
          <CountdownScreen key="countdown" onComplete={() => setGameState('playing')} />
        )}

        {/* State 3: PLAYING GAMEPLAY */}
        {gameState === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col justify-between w-full h-full min-h-0 overflow-hidden"
          >
            {/* Top Running Track Area */}
            <TrackView
              blueProgress={blueTeam.progress}
              redProgress={redTeam.progress}
              blueStreak={blueTeam.currentStreak}
              redStreak={redTeam.currentStreak}
              blueStatus={blueTeam.answeredStatus}
              redStatus={redTeam.answeredStatus}
            />

            {/* Middle Arena Area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-3 p-2.5 max-w-[1400px] w-full mx-auto items-stretch min-h-0 overflow-hidden">
              
              {/* Left Column: Blue Team Controls */}
              <TeamPanel
                team="blue"
                score={blueTeam.score}
                progress={blueTeam.progress}
                streak={blueTeam.currentStreak}
                question={questions[currentQuestionIndex]}
                answeredStatus={blueTeam.answeredStatus}
                selectedAnswerIndex={blueTeam.selectedAnswerIndex}
                onAnswerSelect={(idx) => handleAnswerSelect('blue', idx)}
                revealCorrect={revealCorrectBlue}
              />

              {/* Centered VS divider & Timer */}
              <div className="flex lg:flex-col items-center justify-center gap-2 py-1 lg:py-0 px-3 min-w-[120px] select-none">
                
                {/* VS Badge */}
                <div className="bg-gradient-to-br from-yellow-400 to-amber-500 text-yellow-950 font-black text-sm px-3.5 py-1 rounded-full shadow-md border-2 border-yellow-200 animate-pulse">
                  VS
                </div>

                {/* Clock Countdown Dial (Circular SVG Countdown from design ideas) */}
                <div className="relative w-14 h-14 flex items-center justify-center bg-white rounded-full shadow-md border border-slate-200/60">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke={timeLeft <= 5 ? '#ef4444' : '#F59E0B'}
                      strokeWidth="6"
                      strokeDasharray="264"
                      strokeDashoffset={264 - (264 * timeLeft) / 20}
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <div className="flex flex-col items-center justify-center z-10">
                    <span className={`text-lg md:text-xl font-black font-sans leading-none ${timeLeft <= 5 ? 'text-rose-600 animate-pulse scale-110' : 'text-slate-700'}`}>
                      {timeLeft}
                    </span>
                    <span className="text-[6px] uppercase font-extrabold text-slate-400 tracking-wider mt-0.5">GIÂY</span>
                  </div>
                </div>

                {/* Always-on Help Cheat-sheet */}
                <div className="hidden lg:block mt-auto pb-2">
                  <FormulaGuide />
                </div>
              </div>

              {/* Right Column: Red Team Controls */}
              <TeamPanel
                team="red"
                score={redTeam.score}
                progress={redTeam.progress}
                streak={redTeam.currentStreak}
                question={questions[currentQuestionIndex]}
                answeredStatus={redTeam.answeredStatus}
                selectedAnswerIndex={redTeam.selectedAnswerIndex}
                onAnswerSelect={(idx) => handleAnswerSelect('red', idx)}
                revealCorrect={revealCorrectRed}
              />
            </div>

            {/* Bottom floating helper on small screens */}
            <div className="lg:hidden p-1.5 bg-white/70 border-t border-slate-200/50 flex justify-center">
              <div className="scale-90 flex flex-wrap gap-2 justify-center">
                <span className="bg-[#2D5A27]/10 border border-[#2D5A27]/20 px-2 py-1 rounded-lg text-[10px] font-bold text-[#2D5A27]">
                  🔲 Chu vi hình vuông: Cạnh × 4
                </span>
                <span className="bg-[#2D5A27]/10 border border-[#2D5A27]/20 px-2 py-1 rounded-lg text-[10px] font-bold text-[#2D5A27]">
                  ▭ Chu vi chữ nhật: (Dài + Rộng) × 2
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* State 4: ENDED SCREEN (SCOREBOARD POPUP) */}
        {gameState === 'ended' && summary && (
          <>
            <ScoreboardPopup
                summary={summary}
                onReplay={handleReplay}
            />

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
              <button
                onClick={sendScore}
                disabled={sending}
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-xl shadow-xl transition-all cursor-pointer"
              >
                {sending ? "Đang gửi..." : "📤 Gửi điểm lên Google Sheet"}
              </button>
            </div>
          </>
        )}

      </AnimatePresence>

      {/* Primary Footer Bar */}
      <footer className="bg-white/50 h-10 px-4 md:px-6 flex justify-between items-center text-[10px] font-bold text-[#2D5A27] uppercase tracking-widest border-t border-emerald-800/10 select-none z-20">
        <span>TRƯỜNG TIỂU HỌC TOÁN HỌC VUI VẺ</span>
        <span className="hidden sm:inline">LUẬT CHƠI: TRẢ LỜI ĐÚNG ĐỂ TIẾN VỀ ĐÍCH TRƯỚC</span>
      </footer>
    </div>
  );
}
