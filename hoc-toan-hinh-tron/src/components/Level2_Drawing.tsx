import React, { useState, useRef, useEffect } from "react";
import { Check, AlertCircle, Play, Star, RotateCcw, ArrowRight, Paintbrush, Compass as CompassIcon, Sliders } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Level2DrawingProps {
  onComplete: (score: number) => void;
  onNextLevel: () => void;
}

export default function Level2Drawing({ onComplete, onNextLevel }: Level2DrawingProps) {
  const [step, setStep] = useState(0); // 0: Intro, 1: Place Center O, 2: Draw Circle, 3: Draw Radius OA, 4: Draw Diameter CD, 5: Done
  const [center, setCenter] = useState<{ x: number; y: number } | null>(null);
  const [radiusLength, setRadiusLength] = useState(70); // px
  const [isDrawingCircle, setIsDrawingCircle] = useState(false);
  const [circleProgress, setCircleProgress] = useState(0); // 0 to 360 degrees
  const [hasRadius, setHasRadius] = useState(false);
  const [radiusPoint, setRadiusPoint] = useState<{ x: number; y: number } | null>(null);
  const [hasDiameter, setHasDiameter] = useState(false);
  const [diameterPoints, setDiameterPoints] = useState<{ c: { x: number; y: number }; d: { x: number; y: number } } | null>(null);

  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"success" | "info" | "warning">("info");

  const boardRef = useRef<SVGSVGElement>(null);

  // Compass rotation tracking
  const [compassAngle, setCompassAngle] = useState(0);

  useEffect(() => {
    if (step === 1) {
      setFeedback("Em hãy nhấp chuột lên bảng để đánh dấu vị trí làm Tâm O nhé!");
      setFeedbackType("info");
    } else if (step === 2) {
      setFeedback("Bây giờ, em hãy ấn nút 'Quay Com-pa' hoặc kéo thanh trượt để vẽ một đường tròn hoàn chỉnh!");
      setFeedbackType("info");
    } else if (step === 3) {
      setFeedback("Hãy chọn một góc dưới đây để dùng thước kẻ nối từ Tâm O đến đường tròn, tạo nên bán kính OA.");
      setFeedbackType("info");
    } else if (step === 4) {
      setFeedback("Hãy nhấn nút vẽ Đường kính CD đi qua tâm O nối hai điểm của đường tròn.");
      setFeedbackType("info");
    }
  }, [step]);

  const handleBoardClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (step === 1) {
      setCenter({ x, y });
      setScore((prev) => prev + 20);
      setStep(2);
    }
  };

  const handleSpinCompass = () => {
    if (step !== 2 || isDrawingCircle) return;
    setIsDrawingCircle(true);
    let currentAngle = 0;
    const interval = setInterval(() => {
      currentAngle += 5;
      setCircleProgress(currentAngle);
      setCompassAngle(currentAngle);
      if (currentAngle >= 360) {
        clearInterval(interval);
        setIsDrawingCircle(false);
        setScore((prev) => prev + 30);
        setStep(3);
      }
    }, 20);
  };

  const handleDrawRadius = (angle: number) => {
    if (step !== 3 || !center) return;
    const rad = (angle * Math.PI) / 180;
    const px = center.x + radiusLength * Math.cos(rad);
    const py = center.y + radiusLength * Math.sin(rad);
    setRadiusPoint({ x: px, y: py });
    setHasRadius(true);
    setScore((prev) => prev + 25);
    setStep(4);
  };

  const handleDrawDiameter = () => {
    if (step !== 4 || !center) return;
    // We draw CD passing through center. Let's make C at left side, D at right side, passing through O.
    const angleCD = 15; // degrees offset
    const radCD = (angleCD * Math.PI) / 180;

    const cx = center.x - radiusLength * Math.cos(radCD);
    const cy = center.y - radiusLength * Math.sin(radCD);
    const dx = center.x + radiusLength * Math.cos(radCD);
    const dy = center.y + radiusLength * Math.sin(radCD);

    setDiameterPoints({
      c: { x: cx, y: cy },
      d: { x: dx, y: dy }
    });
    setHasDiameter(true);
    setScore((prev) => prev + 25);
    setStep(5);
  };

  const handleComplete = () => {
    setIsCompleted(true);
    onComplete(score);
  };

  const handleReset = () => {
    setStep(0);
    setCenter(null);
    setCircleProgress(0);
    setCompassAngle(0);
    setHasRadius(false);
    setRadiusPoint(null);
    setHasDiameter(false);
    setDiameterPoints(null);
    setScore(0);
    setIsCompleted(false);
    setFeedback(null);
  };

  return (
    <div className="bg-white border-2 border-amber-200 rounded-3xl p-6 shadow-md flex flex-col h-full justify-between">
      <div>
        {/* Level stats */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Nhiệm vụ {step > 4 ? 4 : step}/4
          </span>
          <div className="flex items-center gap-1.5 text-amber-600 text-sm font-extrabold">
            <Star className="w-4 h-4 fill-current" />
            <span>{score} điểm</span>
          </div>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
          <div 
            className="bg-amber-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(Math.min(step, 4) / 4) * 100}%` }}
          />
        </div>

        {/* Intro step */}
        {step === 0 && (
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-4xl animate-bounce">
              📏
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-950">Cửa 2: Hộp Dụng Cụ Hình Tròn</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-bold">
                Học sinh lớp 3 cần thực hành vẽ hình tròn bằng dụng cụ thực tế! Ở nhiệm vụ này, em sẽ điều khiển chiếc 
                <span className="text-amber-600 font-bold"> Com-pa bạc</span> và chiếc <span className="text-amber-600 font-bold"> Thước gỗ</span> để tự vẽ một hình tròn hoàn hảo, có đủ tâm O, bán kính OA và đường kính CD nhé!
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-6 py-3 rounded-xl shadow-md flex items-center gap-2 mx-auto transition-all"
            >
              <Paintbrush className="w-4 h-4" /> Mở hộp dụng cụ!
            </button>
          </div>
        )}

        {step > 0 && step <= 5 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* The Blackboard Visualizer */}
            <div className="lg:col-span-2 space-y-4">
              <div className="relative aspect-square md:aspect-video w-full bg-emerald-900 border-8 border-amber-800 rounded-2xl shadow-inner overflow-hidden flex flex-col justify-between">
                {/* Chalk Dust Overlay texture */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-800/40 via-emerald-900 to-emerald-950 opacity-90 pointer-events-none"></div>

                {/* SVG Canvas for actual geometry interaction */}
                <svg
                  ref={boardRef}
                  onClick={handleBoardClick}
                  className="absolute inset-0 w-full h-full cursor-crosshair z-10"
                >
                  {/* Grid lines for chalkboard style */}
                  <g className="opacity-[0.05] stroke-white stroke-[0.5]">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <line key={`v-${i}`} x1={i * 30} y1={0} x2={i * 30} y2="100%" />
                    ))}
                    {Array.from({ length: 20 }).map((_, i) => (
                      <line key={`h-${i}`} x1={0} y1={i * 30} x2="100%" y2={i * 30} />
                    ))}
                  </g>

                  {/* Draw components based on current states */}
                  {center && (
                    <>
                      {/* Center Point O */}
                      <circle cx={center.x} cy={center.y} r="5" className="fill-amber-400 stroke-white stroke-2" />
                      <text x={center.x - 12} y={center.y - 12} className="text-sm font-extrabold fill-amber-300 font-mono">O</text>
                    </>
                  )}

                  {/* Circle Trace Line (Drawn dynamically or fully) */}
                  {center && circleProgress > 0 && (
                    <circle
                      cx={center.x}
                      cy={center.y}
                      r={radiusLength}
                      className="fill-none stroke-white stroke-[3] transition-all"
                      strokeDasharray={`${(circleProgress / 360) * (2 * Math.PI * radiusLength)} 1000`}
                    />
                  )}

                  {/* Radius OA */}
                  {center && hasRadius && radiusPoint && (
                    <>
                      <line x1={center.x} y1={center.y} x2={radiusPoint.x} y2={radiusPoint.y} className="stroke-amber-400 stroke-[3.5] stroke-dasharray" strokeDasharray="3 3" />
                      <circle cx={radiusPoint.x} cy={radiusPoint.y} r="5" className="fill-amber-400 stroke-white" />
                      <text x={radiusPoint.x + 8} y={radiusPoint.y + 8} className="text-sm font-extrabold fill-amber-300 font-mono">A</text>
                    </>
                  )}

                  {/* Diameter CD */}
                  {center && hasDiameter && diameterPoints && (
                    <>
                      <line x1={diameterPoints.c.x} y1={diameterPoints.c.y} x2={diameterPoints.d.x} y2={diameterPoints.d.y} className="stroke-sky-400 stroke-[4.5]" />
                      <circle cx={diameterPoints.c.x} cy={diameterPoints.c.y} r="5" className="fill-sky-400 stroke-white" />
                      <circle cx={diameterPoints.d.x} cy={diameterPoints.d.y} r="5" className="fill-sky-400 stroke-white" />
                      <text x={diameterPoints.c.x - 14} y={diameterPoints.c.y - 6} className="text-sm font-extrabold fill-sky-300 font-mono">C</text>
                      <text x={diameterPoints.d.x + 10} y={diameterPoints.d.y + 12} className="text-sm font-extrabold fill-sky-300 font-mono">D</text>
                    </>
                  )}

                  {/* Compass Overlay Animation in step 2 */}
                  {center && step === 2 && (
                    <g 
                      transform={`translate(${center.x}, ${center.y}) rotate(${compassAngle})`}
                      className="transition-transform duration-100 pointer-events-none opacity-90"
                    >
                      {/* Compass body */}
                      <line x1="0" y1="0" x2="-20" y2="-90" className="stroke-slate-300 stroke-[4]" />
                      <line x1="0" y1="0" x2={radiusLength} y2="0" className="stroke-slate-300 stroke-[3]" />
                      {/* Needle point */}
                      <polygon points="0,0 -3,-10 3,-10" className="fill-slate-100" />
                      {/* Pencil point */}
                      <circle cx={radiusLength} cy="0" r="3" className="fill-white" />
                      <line x1={radiusLength} y1="0" x2={radiusLength - 5} y2="-30" className="stroke-orange-400 stroke-[3]" />
                      {/* Top hinge */}
                      <circle cx="-20" cy="-90" r="8" className="fill-amber-600 stroke-slate-200 stroke-2" />
                    </g>
                  )}
                </svg>

                {/* Chalkboard Title Label */}
                <div className="p-3 bg-slate-900/40 backdrop-blur-xs border-b border-white/5 z-20 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-emerald-300 tracking-wider flex items-center gap-1">
                    <Paintbrush className="w-3.5 h-3.5" /> BẢNG HỌC HÌNH HỌC LỚP 3
                  </span>
                  {center && (
                    <span className="text-[9px] font-mono font-bold text-emerald-300">
                      Tâm O: ({Math.round(center.x)}, {Math.round(center.y)}) • Bán kính: {radiusLength} px
                    </span>
                  )}
                </div>

                <div className="p-3 bg-slate-900/20 backdrop-blur-xs text-center text-xs text-white/90 font-bold select-none z-20">
                  {step === 1 && "Nhấp bất kỳ đâu trên mặt bảng để đặt Tâm O"}
                  {step === 2 && "Sử dụng bảng điều khiển bên phải để quay com-pa"}
                  {step === 3 && "Chọn góc vẽ bán kính OA"}
                  {step === 4 && "Nhấn phím vẽ CD đi qua tâm O"}
                  {step === 5 && "Hình vẽ tròn đã hoàn tất xuất sắc!"}
                </div>
              </div>
            </div>

            {/* Geometry Tools Control Panel */}
            <div className="bg-amber-50/40 p-4 rounded-2xl border-2 border-amber-200 space-y-6">
              <div>
                <h3 className="font-black text-slate-800 flex items-center gap-2 text-xs uppercase tracking-wide text-amber-600">
                  <Sliders className="w-4 h-4" /> Bảng Công Cụ Vẽ
                </h3>
                <p className="text-[11px] text-slate-500 font-bold mt-1">Hoàn thành từng bước vẽ theo yêu cầu sách giáo khoa:</p>
              </div>

              {/* Status checklist */}
              <div className="space-y-2.5">
                {[
                  { label: "1. Đặt tâm điểm O", active: step === 1, done: step > 1 },
                  { label: "2. Quay Com-pa vẽ hình tròn", active: step === 2, done: step > 2 },
                  { label: "3. Vẽ bán kính OA", active: step === 3, done: step > 3 },
                  { label: "4. Vẽ đường kính CD qua O", active: step === 4, done: step > 4 }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border-2 text-xs flex items-center justify-between ${
                      item.done
                        ? "bg-green-50 border-green-200 text-green-800 font-bold"
                        : item.active
                        ? "bg-amber-100 border-amber-400 text-amber-900 font-black animate-pulse"
                        : "bg-white border-slate-100 text-slate-400 opacity-60"
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.done ? (
                      <div className="w-4.5 h-4.5 bg-green-600 rounded-full flex items-center justify-center text-white font-black text-[10px]">✓</div>
                    ) : item.active ? (
                      <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded-md">Vẽ ngay</span>
                    ) : (
                      <span className="text-[9px] text-slate-400 font-bold">Chờ</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Dynamic Guidance and Tool actions */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs leading-relaxed text-slate-600 font-bold">
                <p className="font-black text-amber-600 mb-1">🦉 Thầy Giáo Cú hướng dẫn:</p>
                <p>{feedback}</p>
              </div>

              {/* Interactive buttons based on step */}
              <div className="space-y-3">
                {step === 2 && (
                  <div className="space-y-3">
                    <label className="text-xs text-slate-600 font-bold flex justify-between">
                      <span>Độ rộng Com-pa (Bán kính r):</span>
                      <span className="font-extrabold text-amber-600">{radiusLength} px</span>
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="110"
                      value={radiusLength}
                      onChange={(e) => setRadiusLength(Number(e.target.value))}
                      disabled={isDrawingCircle}
                      className="w-full accent-amber-500 bg-slate-200 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />

                    <button
                      onClick={handleSpinCompass}
                      disabled={isDrawingCircle}
                      className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-100 disabled:text-slate-400 text-slate-950 font-black py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all text-xs"
                    >
                      <CompassIcon className={`w-4 h-4 ${isDrawingCircle ? "animate-spin" : ""}`} />
                      <span>{isDrawingCircle ? "Đang quay com-pa..." : "Bấm để quay Com-pa 360°"}</span>
                    </button>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-500 font-bold mb-1">Chọn góc để kéo thước kẻ và vẽ bán kính OA:</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { label: "Góc 0°", angle: 0 },
                        { label: "Góc 45°", angle: 45 },
                        { label: "Góc 135°", angle: 135 },
                        { label: "Góc 180°", angle: 180 },
                        { label: "Góc 225°", angle: 225 },
                        { label: "Góc 315°", angle: 315 }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleDrawRadius(item.angle)}
                          className="bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-400 text-slate-700 font-bold py-1.5 rounded-lg text-[10px] transition-all shadow-xs"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <button
                    onClick={handleDrawDiameter}
                    className="w-full bg-sky-500 hover:bg-sky-600 text-slate-950 font-black py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all text-xs"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Dùng Thước Kẻ vẽ đường CD</span>
                  </button>
                )}

                {step === 5 && (
                  <div className="space-y-2">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-[11px] text-green-800 font-bold leading-relaxed">
                      🎉 Hoàn hảo! Em đã vẽ được hình tròn đẹp không tì vết. Đường kính CD luôn dài gấp đôi bán kính OA (<span className="font-mono">d = 2 x r</span>).
                    </div>
                    <button
                      onClick={handleComplete}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all text-xs"
                    >
                      <span>Xem Thành Tích Của Em</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {step > 0 && (
                  <button
                    onClick={handleReset}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold py-2 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Vẽ lại hình mới</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Completed summary panel */}
      {isCompleted && (
        <div className="text-center space-y-6 py-6 bg-amber-50/20 border-2 border-dashed border-amber-200 rounded-3xl">
          <div className="relative inline-block">
            <div className="text-5xl animate-bounce">🎨</div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-[10px] text-slate-950 font-black">✓</div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Cửa 2 Hoàn Thành Xuất Sắc!</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-bold">
              Kỹ năng sử dụng Com-pa và Thước kẻ gỗ của em đã đạt cấp độ "Kỹ Sư Hình Học Tí Hon" rồi đó! Thầy rất tự hào!
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
              onClick={onNextLevel}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              Tiếp Tục Cửa 3 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
