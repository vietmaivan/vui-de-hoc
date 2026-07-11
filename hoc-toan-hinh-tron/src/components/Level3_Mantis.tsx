import React, { useState, useEffect } from "react";
import { Check, AlertCircle, Play, Star, RotateCcw, ArrowRight, Award, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Level3MantisProps {
  onComplete: (score: number) => void;
  onBackToDashboard: () => void;
}

export default function Level3Mantis({ onComplete, onBackToDashboard }: Level3MantisProps) {
  const radius = 7; // Fixed at 7cm as requested in the textbook question
  const [currentStep, setCurrentStep] = useState(0); // 0: Intro/Question, 1: Calculate AB, 2: Calculate BC, 3: Calculate CD, 4: Calculate Total, 5: Done
  const [inputVal, setInputVal] = useState("");
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  // Mantis coordinates along the path ABCD
  const [mantisPosition, setMantisPosition] = useState({ x: 90, y: 30 }); // Start at A
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);

  // Target answers based on the current radius (7cm)
  const abAnswer = radius;
  const bcAnswer = radius * 4;
  const cdAnswer = radius;
  const totalAnswer = radius * 6;

  const positions = {
    A: { x: 90, y: 30 },
    B: { x: 90, y: 100 },
    O: { x: 190, y: 100 },
    C: { x: 290, y: 100 },
    D: { x: 290, y: 30 }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setMantisPosition(positions.A);
    setInputVal("");
    setFeedback(null);
    setScore(0);
    setIsCompleted(false);
    setIsCrawling(false);
  };

  const crawlMantis = async () => {
    if (isCrawling) return;
    setIsCrawling(true);
    
    // Step 1: Start at A
    setMantisPosition(positions.A);
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    // Step 2: Crawl to B
    setMantisPosition(positions.B);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    
    // Step 3: Crawl to C (passing O)
    setMantisPosition(positions.C);
    await new Promise((resolve) => setTimeout(resolve, 1800));
    
    // Step 4: Crawl to D
    setMantisPosition(positions.D);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    
    setIsCrawling(false);
  };

  const checkAnswer = () => {
    const numericAns = parseInt(inputVal.trim(), 10);
    if (isNaN(numericAns)) {
      setFeedback({ isCorrect: false, text: "Em hãy nhập một số thích hợp nhé!" });
      return;
    }

    if (currentStep === 1) {
      if (numericAns === abAnswer) {
        setFeedback({ 
          isCorrect: true, 
          text: `Chính xác! AB là bán kính của đường tròn thứ nhất, nên AB = R = ${radius} cm!` 
        });
        setScore((prev) => prev + 25);
        setMantisPosition(positions.B);
      } else {
        setFeedback({ 
          isCorrect: false, 
          text: `Chưa đúng rồi! Điểm A nằm trên hình tròn và B là tâm, vậy đoạn AB chính là bán kính R = ${radius} cm đó em!` 
        });
      }
    } else if (currentStep === 2) {
      if (numericAns === bcAnswer) {
        setFeedback({ 
          isCorrect: true, 
          text: `Tuyệt vời! Đoạn BC = bán kính hình tròn B (${radius}cm) + đường kính hình tròn O (${radius * 2}cm) + bán kính hình tròn C (${radius}cm) = ${bcAnswer} cm!` 
        });
        setScore((prev) => prev + 25);
        setMantisPosition(positions.C);
      } else {
        setFeedback({ 
          isCorrect: false, 
          text: `Hãy suy nghĩ xem: Đoạn BC đi qua tâm O của hình tròn giữa, nên BC = Bán kính B (${radius}cm) + Đường kính O (${radius * 2}cm) + Bán kính C (${radius}cm) nhé!` 
        });
      }
    } else if (currentStep === 3) {
      if (numericAns === cdAnswer) {
        setFeedback({ 
          isCorrect: true, 
          text: `Cực kỳ chính xác! CD là bán kính của hình tròn thứ ba, nên CD = R = ${radius} cm!` 
        });
        setScore((prev) => prev + 25);
        setMantisPosition(positions.D);
      } else {
        setFeedback({ 
          isCorrect: false, 
          text: `CD là bán kính nối từ tâm C đến điểm D trên hình tròn, CD chính bằng bán kính R = ${radius} cm nhé!` 
        });
      }
    } else if (currentStep === 4) {
      if (numericAns === totalAnswer) {
        setFeedback({ 
          isCorrect: true, 
          text: `XUẤT SẮC! Tổng quãng đường ABCD = AB + BC + CD = ${radius} + ${radius * 4} + ${radius} = ${totalAnswer} cm!` 
        });
        setScore((prev) => prev + 25);
        setCurrentStep(5);
      } else {
        setFeedback({ 
          isCorrect: false, 
          text: `Hãy cộng tất cả các đoạn thẳng đã tính lại với nhau: AB + BC + CD (${radius} + ${bcAnswer} + ${radius}) nhé!` 
        });
      }
    }
  };

  const handleNextStep = () => {
    setFeedback(null);
    setInputVal("");
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFinishLevel = () => {
    setIsCompleted(true);
    onComplete(score);
  };

  return (
    <div className="bg-white border-2 border-amber-200 rounded-3xl p-6 shadow-md flex flex-col h-full justify-between">
      <div>
        {/* Header level progress */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Cửa 3: Hành Trình Bọ Ngựa • R = {radius} cm
          </span>
          <div className="flex items-center gap-1.5 text-amber-600 text-sm font-extrabold">
            <Star className="w-4 h-4 fill-current" />
            <span>{score} điểm</span>
          </div>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
          <div 
            className="bg-amber-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(Math.min(currentStep, 5) / 5) * 100}%` }}
          />
        </div>

        {/* Interactive diagram area for step >= 0 */}
        {currentStep >= 0 && currentStep <= 5 && !isCompleted && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
            {/* Textbook graphic redraw with SVG */}
            <div className="lg:col-span-3 flex flex-col items-center justify-center bg-amber-50/20 p-5 rounded-2xl border-2 border-dashed border-amber-200">
              <span className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">BẢN ĐỒ HOA HÌNH TRÒN (SGK TOÁN LỚP 3)</span>
              
              <div className="relative w-full overflow-x-auto custom-scrollbar flex justify-center py-2">
                <svg width="380" height="180" className="drop-shadow-sm shrink-0">
                  {/* Flower 1 - Orange Petals */}
                  <g transform="translate(90, 100)">
                    <circle cx="0" cy="0" r="50" className="fill-emerald-100/30 stroke-emerald-500/20 stroke-2" />
                    {Array.from({ length: 12 }).map((_, i) => (
                      <ellipse 
                        key={i} 
                        cx="0" 
                        cy="0" 
                        rx="14" 
                        ry="48" 
                        className="fill-orange-400/90 stroke-orange-500 stroke-[1]" 
                        transform={`rotate(${i * 30})`} 
                      />
                    ))}
                    <circle cx="0" cy="0" r="26" className="fill-amber-300 stroke-amber-400 stroke-2" />
                    <line x1="0" y1="0" x2="0" y2="-50" className="stroke-slate-950 stroke-[2]" />
                    <text x="8" y="-20" className="text-[11px] font-black fill-slate-950 font-mono">R = {radius}cm</text>
                  </g>

                  {/* Flower 2 - Pink Petals */}
                  <g transform="translate(190, 100)">
                    <circle cx="0" cy="0" r="50" className="fill-pink-100/30 stroke-pink-500/20 stroke-2" />
                    {Array.from({ length: 12 }).map((_, i) => (
                      <ellipse 
                        key={i} 
                        cx="0" 
                        cy="0" 
                        rx="14" 
                        ry="48" 
                        className="fill-pink-400/90 stroke-pink-500 stroke-[1]" 
                        transform={`rotate(${i * 30})`} 
                      />
                    ))}
                    <circle cx="0" cy="0" r="26" className="fill-amber-100 stroke-amber-300 stroke-2" />
                    <text x="-15" y="6" className="text-[10px] font-bold fill-slate-700 font-mono">O</text>
                  </g>

                  {/* Flower 3 - Purple Petals */}
                  <g transform="translate(290, 100)">
                    <circle cx="0" cy="0" r="50" className="fill-purple-100/30 stroke-purple-500/20 stroke-2" />
                    {Array.from({ length: 12 }).map((_, i) => (
                      <ellipse 
                        key={i} 
                        cx="0" 
                        cy="0" 
                        rx="14" 
                        ry="48" 
                        className="fill-purple-400/90 stroke-purple-500 stroke-[1]" 
                        transform={`rotate(${i * 30})`} 
                      />
                    ))}
                    <circle cx="0" cy="0" r="26" className="fill-amber-100 stroke-amber-300 stroke-2" />
                    <line x1="0" y1="0" x2="0" y2="-50" className="stroke-slate-950 stroke-[2]" />
                    <text x="8" y="-20" className="text-[11px] font-black fill-slate-950 font-mono">R = {radius}cm</text>
                  </g>

                  {/* Broken Line Path ABCD representation */}
                  {/* Path AB */}
                  <line 
                    x1="90" y1="30" x2="90" y2="100" 
                    className={`stroke-slate-950 transition-all duration-300 ${
                      currentStep > 1 || (isCrawling && mantisPosition.y > 30) 
                        ? "stroke-emerald-500 stroke-[5.5]" 
                        : "stroke-[3.5]"
                    }`} 
                  />
                  {/* Path BC */}
                  <line 
                    x1="90" y1="100" x2="290" y2="100" 
                    className={`stroke-slate-950 transition-all duration-300 ${
                      currentStep > 2 || (isCrawling && mantisPosition.x > 90) 
                        ? "stroke-emerald-500 stroke-[5.5]" 
                        : "stroke-[3.5]"
                    }`} 
                  />
                  {/* Path CD */}
                  <line 
                    x1="290" y1="100" x2="290" y2="30" 
                    className={`stroke-slate-950 transition-all duration-300 ${
                      currentStep > 3 || (isCrawling && mantisPosition.y < 100 && mantisPosition.x === 290) 
                        ? "stroke-emerald-500 stroke-[5.5]" 
                        : "stroke-[3.5]"
                    }`} 
                  />

                  {/* Points labels */}
                  {/* A */}
                  <circle cx="90" cy="30" r="5" className="fill-slate-950 stroke-white stroke-2" />
                  <text x="82" y="22" className="text-xs font-black fill-slate-900 font-mono">A</text>
                  {/* B */}
                  <circle cx="90" cy="100" r="5" className="fill-slate-950 stroke-white stroke-2" />
                  <text x="98" y="114" className="text-xs font-black fill-slate-900 font-mono">B</text>
                  {/* O */}
                  <circle cx="190" cy="100" r="5" className="fill-slate-950 stroke-white stroke-2" />
                  <text x="185" y="116" className="text-xs font-black fill-slate-900 font-mono">O</text>
                  {/* C */}
                  <circle cx="290" cy="100" r="5" className="fill-slate-950 stroke-white stroke-2" />
                  <text x="298" y="114" className="text-xs font-black fill-slate-900 font-mono">C</text>
                  {/* D */}
                  <circle cx="290" cy="30" r="5" className="fill-slate-950 stroke-white stroke-2" />
                  <text x="298" y="22" className="text-xs font-black fill-slate-900 font-mono">D</text>

                  {/* Butterfly Friend at Point D */}
                  <g transform="translate(315, 20)" className="animate-pulse">
                    <text className="text-2xl select-none" style={{ transform: "scaleX(-1)" }}>🦋</text>
                  </g>

                  {/* Animated Mantis */}
                  <motion.g 
                    animate={{ 
                      x: mantisPosition.x - 20, 
                      y: mantisPosition.y - 20,
                      rotate: isCrawling ? [0, -12, 12, -12, 12, -12, 12, -12, 12, 0] : 0
                    }}
                    transition={{ 
                      type: "tween", 
                      ease: "easeInOut", 
                      duration: isCrawling ? 1.0 : 0.4 
                    }}
                    className="cursor-pointer"
                  >
                    <text className="text-2xl select-none">🦗</text>
                  </motion.g>
                </svg>
              </div>

              {/* Crawl Simulation Button below SVG */}
              <button
                onClick={crawlMantis}
                disabled={isCrawling}
                className="mt-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-black text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all"
              >
                <span className={isCrawling ? "animate-bounce" : ""}>🦗</span>
                <span>{isCrawling ? "Đang bò minh hoạ..." : "Cho bọ ngựa bò theo để minh hoạ"}</span>
              </button>
            </div>

            {/* Calculations & Inputs panel */}
            <div className="lg:col-span-2 space-y-4">
              {currentStep === 0 ? (
                /* Step 0: Textbook question & Intro */
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">Thử thách cao cấp</span>
                    <h3 className="text-base font-extrabold text-slate-800 mt-2">
                      Cửa 3: Đường Gấp Khúc ABCD
                    </h3>
                  </div>
                  
                  <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl text-xs text-slate-700 font-bold leading-relaxed space-y-2 shadow-xs">
                    <p className="text-amber-800 font-black text-xs uppercase tracking-wide">
                      Đề bài yêu cầu:
                    </p>
                    <p className="text-slate-900 text-[13px] leading-relaxed font-extrabold">
                      "Trong bức tranh sau, mỗi hình tròn đều có bán kính 7cm. Bọ ngựa đang ở điểm A, bò theo đường gấp khúc ABCD để đến điểm D. Hỏi bọ ngựa phải bò bao nhiêu xăng-ti-mét?"
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all text-xs"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Bắt đầu giải toán!</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Active gameplay calculations */
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">Nhiệm vụ toán học</span>
                    <h3 className="text-base font-extrabold text-slate-800 mt-2">
                      {currentStep === 1 && "Bước 1: Tính chiều dài đoạn AB"}
                      {currentStep === 2 && "Bước 2: Tính chiều dài đoạn BC"}
                      {currentStep === 3 && "Bước 3: Tính chiều dài đoạn CD"}
                      {currentStep === 4 && "Bước 4: Tính tổng quãng đường ABCD"}
                      {currentStep === 5 && "Hành trình hoàn tất!"}
                    </h3>
                  </div>

                  {/* Step instructions */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-600 font-bold">
                    {currentStep === 1 && (
                      <p>
                        Đoạn thẳng <strong>AB</strong> chính là <span className="text-amber-600">bán kính R</span> của bông hoa thứ nhất (nối từ tâm B đến điểm A nằm trên đường tròn). Hãy điền chiều dài của nó:
                      </p>
                    )}
                    {currentStep === 2 && (
                      <div className="space-y-1">
                        <p>
                          Đoạn thẳng <strong>BC</strong> nối tâm B của hình tròn 1 với tâm C của hình tròn 3 và đi qua tâm O của hình tròn 2:
                        </p>
                        <ul className="list-disc pl-4 space-y-1 text-[10px] text-slate-500">
                          <li>Khoảng cách từ B đến mép hoa thứ nhất = {radius} cm (bán kính B)</li>
                          <li>Khoảng cách nối hai mép hoa qua tâm O = {radius * 2} cm (đường kính O)</li>
                          <li>Khoảng cách từ mép hoa thứ ba đến tâm C = {radius} cm (bán kính C)</li>
                          <li className="text-amber-600 font-bold">Tổng đoạn BC = Bán kính B + Đường kính O + Bán kính C</li>
                        </ul>
                      </div>
                    )}
                    {currentStep === 3 && (
                      <p>
                        Đoạn thẳng <strong>CD</strong> nối từ tâm C tới điểm D trên rìa hoa thứ ba, đó là một <span className="text-amber-600 font-bold">bán kính R</span> của bông hoa thứ ba:
                      </p>
                    )}
                    {currentStep === 4 && (
                      <p>
                        Tính tổng toàn bộ quãng đường đi của bọ ngựa theo đường gấp khúc ABCD: 
                        <br />
                        <span className="font-mono text-amber-600 block mt-2 bg-amber-50 p-2 rounded-lg border border-amber-200/50 text-center">S = AB + BC + CD</span>
                      </p>
                    )}
                    {currentStep === 5 && (
                      <p className="text-green-700">
                        🎉 Tuyệt hảo! Bọ Ngựa đã bò đến điểm D và gặp gỡ được bạn bướm xinh đẹp dạo chơi rồi. Em thật thông minh khi đã áp dụng xuất sắc kiến thức hình tròn để giải cứu bọ ngựa!
                      </p>
                    )}
                  </div>

                  {/* Input section */}
                  {currentStep < 5 && !feedback && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={inputVal}
                          onChange={(e) => setInputVal(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                          placeholder="Nhập số xăng-ti-mét..."
                          className="flex-1 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none transition-all text-xs font-mono font-bold"
                        />
                        <span className="self-center font-bold text-slate-500 text-sm">cm</span>
                      </div>
                      <button
                        onClick={checkAnswer}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 rounded-xl transition-all shadow-sm text-xs"
                      >
                        Nộp đáp án
                      </button>
                    </div>
                  )}

                  {/* Feedback and next control */}
                  <AnimatePresence mode="wait">
                    {feedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-4 rounded-xl border-2 flex flex-col gap-3 ${
                          feedback.isCorrect
                            ? "bg-green-50 border-green-200 text-green-900"
                            : "bg-red-50 border-red-200 text-red-900"
                        }`}
                      >
                        <div className="flex items-start gap-2 text-xs font-bold">
                          {feedback.isCorrect ? (
                            <div className="w-4.5 h-4.5 rounded-full bg-green-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">✓</div>
                          ) : (
                            <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
                          )}
                          <p className="leading-relaxed font-bold">{feedback.text}</p>
                        </div>

                        {feedback.isCorrect ? (
                          <button
                            onClick={handleNextStep}
                            className="self-end bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all"
                          >
                            <span>Tiếp tục</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setFeedback(null);
                              setInputVal("");
                            }}
                            className="self-end bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all"
                          >
                            <span>Thử lại</span>
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {currentStep === 5 && (
                    <button
                      onClick={handleFinishLevel}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all text-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Hoàn thành & Nhận Cúp!</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Completed level victory view */}
      {isCompleted && (
        <div className="text-center space-y-6 py-6 bg-amber-50/20 border-2 border-dashed border-amber-200 rounded-3xl">
          <div className="relative inline-block">
            <div className="text-5xl animate-bounce">🌻</div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-[10px] text-slate-950 font-black">✓</div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Cửa 3 Hoàn Thành Mỹ Mãn!</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-bold">
              Thật tuyệt vời! Đoạn đường gấp khúc ABCD qua các bông hoa hình tròn đã được em giải mã chuẩn xác tuyệt đối!
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border-2 border-amber-200 max-w-xs mx-auto flex items-center justify-between shadow-xs">
            <span className="text-xs text-slate-500 font-black uppercase tracking-wider">Điểm số nhận được:</span>
            <span className="text-lg font-black text-amber-600 font-mono">{score} điểm</span>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              Chơi lại
            </button>
            <button
              onClick={onBackToDashboard}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              Về Trang Chủ <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
