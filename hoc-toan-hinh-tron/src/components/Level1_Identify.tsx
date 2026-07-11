import React, { useState } from "react";
import { Check, AlertCircle, HelpCircle, Star, ArrowRight, Play, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Level1IdentifyProps {
  onComplete: (score: number) => void;
  onNextLevel: () => void;
}

export default function Level1Identify({ onComplete, onNextLevel }: Level1IdentifyProps) {
  const [currentStep, setCurrentStep] = useState(0); // 0 to 7
  const [selectedCenterA, setSelectedCenterA] = useState<string | null>(null);
  const [selectedRadiiA, setSelectedRadiiA] = useState<string[]>([]);
  const [selectedDiameterA, setSelectedDiameterA] = useState<string | null>(null);

  const [selectedCenterB, setSelectedCenterB] = useState<string | null>(null);
  const [selectedRadiiB, setSelectedRadiiB] = useState<string[]>([]);
  const [selectedDiameterB, setSelectedDiameterB] = useState<string | null>(null);
  const [selectedCdQuestion, setSelectedCdQuestion] = useState<boolean | null>(null);

  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleNextStep = () => {
    setFeedback(null);
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    } else {
      // Completed!
      const finalScore = score + (feedback?.isCorrect ? 10 : 0);
      setScore(finalScore);
      setIsCompleted(true);
      onComplete(finalScore);
    }
  };

  const checkCenterA = (point: string) => {
    if (feedback) return;
    setSelectedCenterA(point);
    if (point === "O") {
      setFeedback({ isCorrect: true, text: "Chính xác! O là điểm chính giữa hình tròn, được gọi là Tâm!" });
      setScore(score + 15);
    } else {
      setFeedback({ isCorrect: false, text: "Chưa đúng rồi! Điểm chính giữa hình tròn mới là Tâm." });
    }
  };

  const toggleRadiiA = (radius: string) => {
    if (feedback) return;
    if (selectedRadiiA.includes(radius)) {
      setSelectedRadiiA(selectedRadiiA.filter((r) => r !== radius));
    } else {
      setSelectedRadiiA([...selectedRadiiA, radius]);
    }
  };

  const submitRadiiA = () => {
    const isCorrect = 
      selectedRadiiA.includes("OM") && 
      selectedRadiiA.includes("OP") && 
      selectedRadiiA.includes("ON") && 
      selectedRadiiA.length === 3;

    if (isCorrect) {
      setFeedback({ isCorrect: true, text: "Tuyệt vời! OM, OP, ON là 3 bán kính nối từ tâm O đến các điểm trên hình tròn!" });
      setScore(score + 15);
    } else {
      setFeedback({ isCorrect: false, text: "Thiếu rồi em ơi! Bán kính là các đoạn thẳng nối từ tâm O đến hình tròn (OM, OP, ON)." });
    }
  };

  const checkDiameterA = (diameter: string) => {
    if (feedback) return;
    setSelectedDiameterA(diameter);
    if (diameter === "MN") {
      setFeedback({ isCorrect: true, text: "Hoàn hảo! MN là đoạn thẳng đi qua tâm O và nối 2 điểm của hình tròn, gọi là Đường kính!" });
      setScore(score + 15);
    } else {
      setFeedback({ isCorrect: false, text: "Chưa đúng rồi! Đường kính là đoạn thẳng đi qua tâm O và nối hai điểm đối diện." });
    }
  };

  const checkCenterB = (point: string) => {
    if (feedback) return;
    setSelectedCenterB(point);
    if (point === "I") {
      setFeedback({ isCorrect: true, text: "Xuất sắc! I chính là Tâm của hình tròn màu xanh dương!" });
      setScore(score + 15);
    } else {
      setFeedback({ isCorrect: false, text: "Điểm chính giữa hình tròn màu xanh mới là Tâm I nhé!" });
    }
  };

  const toggleRadiiB = (radius: string) => {
    if (feedback) return;
    if (selectedRadiiB.includes(radius)) {
      setSelectedRadiiB(selectedRadiiB.filter((r) => r !== radius));
    } else {
      setSelectedRadiiB([...selectedRadiiB, radius]);
    }
  };

  const submitRadiiB = () => {
    const isCorrect = 
      selectedRadiiB.includes("IA") && 
      selectedRadiiB.includes("IB") && 
      selectedRadiiB.length === 2;

    if (isCorrect) {
      setFeedback({ isCorrect: true, text: "Cực kỳ chính xác! Chỉ có IA và IB là bán kính nối từ tâm I thôi!" });
      setScore(score + 15);
    } else {
      setFeedback({ isCorrect: false, text: "Hãy chọn các đoạn thẳng xuất phát từ tâm I và nối tới hình tròn (IA, IB) nhé!" });
    }
  };

  const checkDiameterB = (diameter: string) => {
    if (feedback) return;
    setSelectedDiameterB(diameter);
    if (diameter === "AB") {
      setFeedback({ isCorrect: true, text: "Quá giỏi! AB là đoạn thẳng đi qua tâm I, chính là Đường kính!" });
      setScore(score + 15);
    } else {
      setFeedback({ isCorrect: false, text: "Đoạn thẳng đi qua tâm I mới là Đường kính (AB) em nhé!" });
    }
  };

  const answerCdQuestion = (isCdDiameter: boolean) => {
    if (feedback) return;
    setSelectedCdQuestion(isCdDiameter);
    if (!isCdDiameter) {
      setFeedback({ isCorrect: true, text: "Kinh ngạc chưa! Rất chính xác! CD tuy nối hai điểm trên hình tròn nhưng KHÔNG ĐI QUA TÂM I, nên nó không phải là đường kính." });
      setScore(score + 20);
    } else {
      setFeedback({ isCorrect: false, text: "A, hãy nhìn kỹ xem! Đoạn thẳng CD có đi qua tâm I không nào? Không đi qua tâm thì không được gọi là đường kính đâu nha!" });
    }
  };

  return (
    <div className="bg-white border-2 border-amber-200 rounded-3xl p-6 shadow-md flex flex-col h-full justify-between">
      <div>
        {/* Progress bar */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Nhiệm vụ {currentStep}/7
          </span>
          <div className="flex items-center gap-1.5 text-amber-600 text-sm font-extrabold">
            <Star className="w-4 h-4 fill-current" />
            <span>{score} điểm</span>
          </div>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
          <div 
            className="bg-amber-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / 7) * 100}%` }}
          />
        </div>

        {/* Intro Step */}
        {currentStep === 0 && (
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-4xl animate-bounce">
              🎯
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-950">Cửa 1: Khám Phá Hình Tròn</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-semibold">
                Chào mừng em đến với hành trình tìm kiếm bí mật hình tròn từ sách giáo khoa! Chúng ta sẽ cùng nhau tìm kiếm 
                <span className="text-amber-600 font-bold"> Tâm</span>, 
                <span className="text-amber-600 font-bold"> Bán kính</span> và 
                <span className="text-amber-600 font-bold"> Đường kính</span> của hai hình tròn siêu đẹp nhé!
              </p>
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-6 py-3 rounded-xl shadow-md flex items-center gap-2 mx-auto transition-all"
            >
              <Play className="w-4 h-4 fill-current" /> Bắt đầu ngay!
            </button>
          </div>
        )}

        {/* Level 1 Gameplay Steps */}
        {currentStep > 0 && currentStep <= 7 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Interactive Circle Display */}
            <div className="flex flex-col items-center justify-center bg-amber-50/30 p-5 rounded-2xl border-2 border-dashed border-amber-200">
              <span className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-wider">
                {currentStep <= 3 ? "a) Hình Tròn Màu Vàng" : "b) Hình Tròn Màu Xanh"}
              </span>

              {/* Circle A (Steps 1, 2, 3) */}
              {currentStep <= 3 && (
                <svg width="240" height="240" className="drop-shadow-sm">
                  {/* Base circle background */}
                  <circle cx="120" cy="120" r="90" className="fill-amber-400/90 stroke-amber-500 stroke-[3]" />

                  {/* Lines for Radii/Diameter */}
                  {/* Line MN (diameter passing through O) */}
                  <line 
                    x1="40" y1="180" x2="200" y2="60" 
                    className={`stroke-slate-900 transition-all ${
                      currentStep === 3 ? "stroke-amber-900 stroke-[4] animate-pulse" : "stroke-[2.5]"
                    } ${selectedRadiiA.includes("OM") || selectedRadiiA.includes("ON") ? "stroke-amber-950 stroke-[3]" : ""}`} 
                  />
                  {/* Line OP */}
                  <line 
                    x1="120" y1="120" x2="183.6" y2="183.6" 
                    className={`stroke-slate-900 transition-all ${
                      selectedRadiiA.includes("OP") ? "stroke-amber-950 stroke-[3.5]" : "stroke-[2.5]"
                    }`} 
                  />

                  {/* Intersecting point center O */}
                  <circle 
                    cx="120" cy="120" r="8" 
                    onClick={() => currentStep === 1 && checkCenterA("O")}
                    className={`cursor-pointer transition-all ${
                      selectedCenterA === "O" ? "fill-green-500 stroke-white stroke-2 scale-125" : "fill-slate-950 hover:fill-amber-600"
                    }`}
                  />
                  <text x="120" y="142" className="text-sm font-black fill-slate-950 select-none text-center" textAnchor="middle">O</text>

                  {/* Point M */}
                  <circle 
                    cx="40" cy="180" r="5" 
                    onClick={() => currentStep === 1 && checkCenterA("M")}
                    className="fill-slate-950 cursor-pointer" 
                  />
                  <text x="25" y="185" className="text-xs font-black fill-slate-900 select-none">M</text>

                  {/* Point N */}
                  <circle 
                    cx="200" cy="60" r="5" 
                    onClick={() => currentStep === 1 && checkCenterA("N")}
                    className="fill-slate-950 cursor-pointer" 
                  />
                  <text x="210" y="65" className="text-xs font-black fill-slate-900 select-none">N</text>

                  {/* Point P */}
                  <circle 
                    cx="183.6" cy="183.6" r="5" 
                    onClick={() => currentStep === 1 && checkCenterA("P")}
                    className="fill-slate-950 cursor-pointer" 
                  />
                  <text x="195" y="195" className="text-xs font-black fill-slate-900 select-none">P</text>
                </svg>
              )}

              {/* Circle B (Steps 4, 5, 6, 7) */}
              {currentStep > 3 && (
                <svg width="240" height="240" className="drop-shadow-sm">
                  {/* Base circle background */}
                  <circle cx="120" cy="120" r="90" className="fill-sky-400/90 stroke-sky-500 stroke-[3]" />

                  {/* Lines for Diameter AB */}
                  <line 
                    x1="30" y1="120" x2="210" y2="120" 
                    className={`stroke-slate-900 transition-all ${
                      currentStep === 6 ? "stroke-sky-900 stroke-[4] animate-pulse" : "stroke-[2.5]"
                    } ${selectedRadiiB.includes("IA") || selectedRadiiB.includes("IB") ? "stroke-sky-950 stroke-[3.5]" : ""}`} 
                  />

                  {/* Chord CD (does not pass through I) */}
                  <line 
                    x1="180" y1="40" x2="120" y2="210" 
                    className={`stroke-slate-900 transition-all ${
                      currentStep === 7 ? "stroke-red-600 stroke-[3] stroke-dasharray" : "stroke-[2.5]"
                    }`} 
                    strokeDasharray={currentStep === 7 ? "4,4" : "none"}
                  />

                  {/* Intersecting point center I */}
                  <circle 
                    cx="120" cy="120" r="8" 
                    onClick={() => currentStep === 4 && checkCenterB("I")}
                    className={`cursor-pointer transition-all ${
                      selectedCenterB === "I" ? "fill-green-500 stroke-white stroke-2 scale-125" : "fill-slate-950 hover:fill-sky-600"
                    }`}
                  />
                  <text x="120" y="142" className="text-sm font-black fill-slate-950 select-none text-center" textAnchor="middle">I</text>

                  {/* Point A */}
                  <circle cx="30" cy="120" r="5" className="fill-slate-950" />
                  <text x="15" y="125" className="text-xs font-black fill-slate-900 select-none">A</text>

                  {/* Point B */}
                  <circle cx="210" cy="120" r="5" className="fill-slate-950" />
                  <text x="218" y="125" className="text-xs font-black fill-slate-900 select-none">B</text>

                  {/* Point D */}
                  <circle cx="180" cy="40" r="5" className="fill-slate-950" />
                  <text x="180" y="30" className="text-xs font-black fill-slate-900 select-none">D</text>

                  {/* Point C */}
                  <circle cx="120" cy="210" r="5" className="fill-slate-950" />
                  <text x="120" y="225" className="text-xs font-black fill-slate-900 select-none">C</text>
                </svg>
              )}
            </div>

            {/* Instruction & Controls Panel */}
            <div className="space-y-6">
              <div>
                <span className="text-[10px] text-amber-600 font-bold tracking-wider uppercase bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Câu hỏi thực hành
                </span>
                
                {/* Step Questions */}
                {currentStep === 1 && (
                  <h3 className="text-base font-extrabold text-slate-800 mt-2">
                    Em hãy nhấp chuột trực tiếp lên điểm là <span className="text-amber-600">Tâm</span> của hình tròn màu vàng!
                  </h3>
                )}
                {currentStep === 2 && (
                  <div className="space-y-1.5 mt-2">
                    <h3 className="text-base font-extrabold text-slate-800">
                      Hãy chọn tất cả các <span className="text-amber-600">Bán kính</span> của hình tròn màu vàng:
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Bán kính là đoạn thẳng có điểm bắt đầu từ tâm O và nối tới hình tròn.</p>
                  </div>
                )}
                {currentStep === 3 && (
                  <h3 className="text-base font-extrabold text-slate-800 mt-2">
                    Đâu là <span className="text-amber-600">Đường kính</span> của hình tròn màu vàng?
                  </h3>
                )}
                {currentStep === 4 && (
                  <h3 className="text-base font-extrabold text-slate-800 mt-2">
                    Em hãy nhấp chuột trực tiếp lên điểm là <span className="text-sky-600">Tâm</span> của hình tròn màu xanh dương!
                  </h3>
                )}
                {currentStep === 5 && (
                  <div className="space-y-1.5 mt-2">
                    <h3 className="text-base font-extrabold text-slate-800">
                      Hãy chọn tất cả các <span className="text-sky-600">Bán kính</span> của hình tròn màu xanh:
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Gợi ý: Đoạn thẳng nối từ tâm I đến một điểm trên đường tròn.</p>
                  </div>
                )}
                {currentStep === 6 && (
                  <h3 className="text-base font-extrabold text-slate-800 mt-2">
                    Đâu là <span className="text-sky-600">Đường kính</span> của hình tròn màu xanh?
                  </h3>
                )}
                {currentStep === 7 && (
                  <div className="space-y-2 mt-2">
                    <h3 className="text-base font-extrabold text-slate-800">
                      💡 Câu hỏi thông thái: Đoạn thẳng <span className="text-red-500 font-bold">CD</span> có phải là đường kính của hình tròn màu xanh không?
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Hãy quan sát xem CD có đi qua điểm Tâm I không nhé!</p>
                  </div>
                )}
              </div>

              {/* Answers Options */}
              <div className="space-y-3">
                {/* Step 1 & 4 Info */}
                {(currentStep === 1 || currentStep === 4) && !feedback && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
                    <Info className="w-5 h-5 text-amber-500 shrink-0" />
                    <span className="font-semibold">Em hãy nhấp vào chấm tròn tương ứng trực tiếp trên hình tròn bên trái nhé!</span>
                  </div>
                )}

                {/* Step 2 Options (Radii A) */}
                {currentStep === 2 && !feedback && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {["OM", "OP", "ON", "MN"].map((radius) => (
                        <button
                          key={radius}
                          onClick={() => toggleRadiiA(radius)}
                          className={`p-3 rounded-xl border-2 text-xs font-extrabold transition-all ${
                            selectedRadiiA.includes(radius)
                              ? "bg-amber-100 border-amber-500 text-amber-800"
                              : "bg-white border-slate-200 hover:border-amber-300 text-slate-700"
                          }`}
                        >
                          Đoạn {radius}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={submitRadiiA}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3 rounded-xl transition-all shadow-sm"
                    >
                      Xác nhận bán kính
                    </button>
                  </div>
                )}

                {/* Step 3 Options (Diameter A) */}
                {currentStep === 3 && !feedback && (
                  <div className="grid grid-cols-2 gap-2">
                    {["OM", "OP", "MN", "ON"].map((item) => (
                      <button
                        key={item}
                        onClick={() => checkDiameterA(item)}
                        className="p-3 bg-white hover:bg-amber-50 border-2 border-slate-200 hover:border-amber-400 rounded-xl text-xs font-bold text-slate-700 transition-all shadow-xs"
                      >
                        Đoạn thẳng {item}
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 5 Options (Radii B) */}
                {currentStep === 5 && !feedback && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {["IA", "IB", "CD", "AB"].map((radius) => (
                        <button
                          key={radius}
                          onClick={() => toggleRadiiB(radius)}
                          className={`p-3 rounded-xl border-2 text-xs font-extrabold transition-all ${
                            selectedRadiiB.includes(radius)
                              ? "bg-sky-100 border-sky-500 text-sky-800"
                              : "bg-white border-slate-200 hover:border-sky-300 text-slate-700"
                          }`}
                        >
                          Đoạn {radius}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={submitRadiiB}
                      className="w-full bg-sky-500 hover:bg-sky-600 text-slate-950 font-extrabold py-3 rounded-xl transition-all shadow-sm"
                    >
                      Xác nhận bán kính
                    </button>
                  </div>
                )}

                {/* Step 6 Options (Diameter B) */}
                {currentStep === 6 && !feedback && (
                  <div className="grid grid-cols-2 gap-2">
                    {["IA", "IB", "CD", "AB"].map((item) => (
                      <button
                        key={item}
                        onClick={() => checkDiameterB(item)}
                        className="p-3 bg-white hover:bg-sky-50 border-2 border-slate-200 hover:border-sky-400 rounded-xl text-xs font-bold text-slate-700 transition-all shadow-xs"
                      >
                        Đoạn thẳng {item}
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 7 Options (Chord CD) */}
                {currentStep === 7 && !feedback && (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => answerCdQuestion(true)}
                      className="p-4 bg-white hover:bg-red-50 border-2 border-slate-200 hover:border-red-400 rounded-2xl text-xs font-bold text-slate-800 transition-all text-center flex flex-col items-center justify-center gap-2 shadow-xs"
                    >
                      <span className="text-base">Có, đúng rồi! 👍</span>
                      <span className="text-[10px] text-slate-500 font-medium">Vì nối C và D trên đường tròn.</span>
                    </button>
                    <button
                      onClick={() => answerCdQuestion(false)}
                      className="p-4 bg-white hover:bg-green-50 border-2 border-slate-200 hover:border-green-400 rounded-2xl text-xs font-bold text-slate-800 transition-all text-center flex flex-col items-center justify-center gap-2 shadow-xs"
                    >
                      <span className="text-base">Không phải đâu! 🙅‍♂️</span>
                      <span className="text-[10px] text-slate-500 font-medium">Vì nó không đi qua Tâm I.</span>
                    </button>
                  </div>
                )}

                {/* Feedback Panel */}
                <AnimatePresence mode="wait">
                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`p-4 rounded-xl border-2 flex flex-col gap-3 ${
                        feedback.isCorrect
                          ? "bg-green-50 border-green-300 text-green-900"
                          : "bg-red-50 border-red-300 text-red-900"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 mt-0.5">
                          {feedback.isCorrect ? (
                            <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">✓</div>
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <p className="text-xs leading-relaxed font-bold">{feedback.text}</p>
                      </div>

                      <button
                        onClick={handleNextStep}
                        className="self-end bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all"
                      >
                        <span>{currentStep === 7 ? "Xem Kết Quả" : "Tiếp theo"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Completed Summary Panel */}
      {isCompleted && (
        <div className="text-center space-y-6 py-6 bg-amber-50/20 rounded-2xl border-2 border-dashed border-amber-200">
          <div className="relative inline-block">
            <div className="text-5xl animate-bounce">🏆</div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-[10px] text-slate-950 font-black">✓</div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Chiến Thắng Cửa 1!</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-bold">
              Em đã xuất sắc nhận diện chính xác các thành phần của hình tròn. Thầy Giáo Cú Vàng cực kỳ tự hào về em!
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border-2 border-amber-200 max-w-xs mx-auto flex items-center justify-between shadow-xs">
            <span className="text-xs text-slate-500 font-black uppercase tracking-wider">Điểm số nhận được:</span>
            <span className="text-lg font-black text-amber-600 font-mono">{score} điểm</span>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                setCurrentStep(0);
                setScore(0);
                setSelectedCenterA(null);
                setSelectedRadiiA([]);
                setSelectedDiameterA(null);
                setSelectedCenterB(null);
                setSelectedRadiiB([]);
                setSelectedDiameterB(null);
                setSelectedCdQuestion(null);
                setFeedback(null);
                setIsCompleted(false);
              }}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              Chơi lại
            </button>
            <button
              onClick={onNextLevel}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              Tiếp Tục Cửa 2 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
