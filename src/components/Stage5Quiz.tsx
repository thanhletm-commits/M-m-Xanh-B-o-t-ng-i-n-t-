import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Flower2,
  RotateCcw,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  computeQuizResult,
  evaluateQuizAnswer,
  QUIZ_QUESTIONS,
} from '../lib/mamxanh';
import type { QuizOptionKey } from '../types/mamxanh';

interface Stage5QuizProps {
  onPrev: () => void;
  onNext: () => void;
}

const OPTION_KEYS: QuizOptionKey[] = ['A', 'B', 'C'];

const OPTION_STYLES: Record<QuizOptionKey, { badgeBg: string; border: string }> = {
  A: { badgeBg: 'bg-[#4E9F3D]', border: 'border-[#BCE4B2]' },
  B: { badgeBg: 'bg-[#F59E0B]', border: 'border-[#FDE68A]' },
  C: { badgeBg: 'bg-[#EC4899]', border: 'border-[#FBCFE8]' },
};

export function Stage5Quiz({ onPrev, onNext }: Stage5QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<QuizOptionKey | null>(null);
  const [confirmedMap, setConfirmedMap] = useState<Partial<Record<string, QuizOptionKey>>>({});
  const [finished, setFinished] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[currentIndex];
  const submittedChoice = confirmedMap[currentQuestion.id];
  const isConfirmed = Boolean(submittedChoice);

  const evaluation = useMemo(() => {
    if (!submittedChoice) return null;
    return evaluateQuizAnswer(currentQuestion, submittedChoice);
  }, [currentQuestion, submittedChoice]);

  const summary = useMemo(() => computeQuizResult(confirmedMap), [confirmedMap]);

  const handleConfirm = () => {
    if (!selectedChoice || isConfirmed) return;
    setConfirmedMap((prev) => ({
      ...prev,
      [currentQuestion.id]: selectedChoice,
    }));
  };

  const handleNextQuestion = () => {
    if (currentIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedChoice(null);
    } else {
      setFinished(true);
    }
  };

  const handleReplay = () => {
    setCurrentIndex(0);
    setSelectedChoice(null);
    setConfirmedMap({});
    setFinished(false);
  };

  return (
    <section
      id="stage5"
      aria-label="Chặng 5 – Đố vui 20/11 – Cùng bé khám phá"
      className="scroll-mt-16 sm:scroll-mt-20 bg-gradient-to-b from-[#FFF7DF] via-[#F5FBE8] to-[#FFF6E5] px-4 sm:px-6 py-14 sm:py-20"
    >
      <div className="max-w-5xl mx-auto">
        {/* Stage Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#7C3AED] mb-2">
            Chặng 5 · Trò chơi khu vườn lớp 1/8
          </p>
          <h2 className="sr-only">ĐỐ VUI 20/11 – CÙNG BÉ KHÁM PHÁ</h2>
          <img
            src="/assets/aistudio/___vui_20_11_c_ng_b__kh_m_ph__db8a4275.png"
            alt="Đố vui 20/11 – Cùng bé khám phá"
            className="mx-auto w-full max-w-[460px] sm:max-w-[540px] h-auto object-contain drop-shadow-[0_10px_22px_rgba(44,108,35,0.16)]"
          />
          <p className="mt-3 text-sm sm:text-base text-[#4A654B] leading-relaxed">
            Cùng Bé Mầm Xanh trả lời 5 câu hỏi vui về Ngày Nhà giáo Việt Nam 20/11 để nhận huy hiệu nhé!
          </p>
        </div>

        {/* Quiz Arena Card */}
        <div className="garden-card-3d rounded-[34px] border-2 border-[#D4ECCF] p-5 sm:p-8 lg:p-10 relative overflow-hidden">
          {!finished ? (
            <div>
              {/* Progress Bar + Mascot Cheer Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#E5F2DF]">
                <div className="flex items-center gap-3">
                  <img
                    src="/assets/aistudio/ef58baab-f5f3-4419-8132-ede530e27a38_e9890800.png"
                    alt="Biểu tượng trò chơi Đố vui 20/11"
                    className="w-14 h-14 object-contain drop-shadow-sm shrink-0"
                  />
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-[#D97706]">
                      Câu hỏi {currentIndex + 1} / {QUIZ_QUESTIONS.length}
                    </p>
                    <p className="text-sm font-bold text-[#255F1F]">
                      Bé hãy chọn đáp án đúng rồi bấm nút Xác nhận nhé!
                    </p>
                  </div>
                </div>

                {/* Progress dots */}
                <div className="flex items-center gap-2 shrink-0">
                  {QUIZ_QUESTIONS.map((q, idx) => {
                    const answered = confirmedMap[q.id];
                    const right = answered && answered === q.correctOption;
                    return (
                      <span
                        key={q.id}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black tabular-nums border-2 transition-all ${
                          idx === currentIndex
                            ? 'bg-[#FBBF24] border-[#D97706] text-[#4A2C00] scale-110'
                            : right
                            ? 'bg-[#4E9F3D] border-[#2E6F2B] text-white'
                            : answered
                            ? 'bg-[#FB7185] border-[#E11D48] text-white'
                            : 'bg-white border-[#D4E8CE] text-[#5B745C]'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Big Question Board */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="rounded-[26px] bg-gradient-to-br from-[#F0FBE9] to-[#FFFBEB] border-2 border-[#CFE8C7] p-5 sm:p-7 mb-6">
                    <h3 className="font-display font-black text-xl sm:text-2xl text-[#1D5119] leading-snug">
                      Câu {currentIndex + 1}: {currentQuestion.question}
                    </h3>
                  </div>

                  {/* 3 Big Answer Choices (A, B, C) */}
                  <div className="grid gap-3.5">
                    {OPTION_KEYS.map((key) => {
                      const isPicked = (submittedChoice ?? selectedChoice) === key;
                      const isCorrectOption = currentQuestion.correctOption === key;

                      let cardClass =
                        'bg-white border-2 border-[#D7EAD2] text-[#264028] hover:border-[#65B741] hover:bg-[#F6FDF3]';
                      if (isConfirmed) {
                        if (isCorrectOption) {
                          cardClass =
                            'bg-[#ECFDF5] border-2 border-[#16A34A] text-[#14532D] shadow-md';
                        } else if (isPicked) {
                          cardClass =
                            'bg-[#FEF2F2] border-2 border-[#EF4444] text-[#991B1B]';
                        } else {
                          cardClass = 'bg-white/70 border border-[#E5EFE2] text-[#6E806E] opacity-75';
                        }
                      } else if (isPicked) {
                        cardClass =
                          'bg-[#FEF9C3] border-2 border-[#EAB308] text-[#4A2C00] shadow-md -translate-y-0.5';
                      }

                      return (
                        <button
                          key={key}
                          type="button"
                          disabled={isConfirmed}
                          onClick={() => setSelectedChoice(key)}
                          className={`w-full min-h-[60px] px-4 sm:px-6 py-3.5 rounded-2xl flex items-center justify-between gap-4 text-left transition-all cursor-pointer disabled:cursor-default ${cardClass}`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <span
                              className={`w-10 h-10 rounded-xl text-white font-display font-black text-base flex items-center justify-center shrink-0 shadow-xs ${OPTION_STYLES[key].badgeBg}`}
                            >
                              {key}
                            </span>
                            <span className="font-display font-bold text-base sm:text-lg leading-snug">
                              {currentQuestion.options[key]}
                            </span>
                          </div>

                          {isConfirmed && isCorrectOption && (
                            <CheckCircle2 className="w-6 h-6 text-[#16A34A] shrink-0" aria-hidden="true" />
                          )}
                          {isConfirmed && isPicked && !isCorrectOption && (
                            <XCircle className="w-6 h-6 text-[#DC2626] shrink-0" aria-hidden="true" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Feedback Banner on Confirm */}
              {evaluation && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  role="status"
                  className={`mt-6 rounded-2xl p-4 sm:p-5 border-2 flex items-start gap-3 ${
                    evaluation.isCorrect
                      ? 'bg-[#ECFDF5] border-[#86EFAC] text-[#14532D]'
                      : 'bg-[#FFF7ED] border-[#FDBA74] text-[#7C2D12]'
                  }`}
                >
                  {evaluation.isCorrect ? (
                    <Flower2
                      className="w-6 h-6 text-[#EC4899] shrink-0 mt-0.5 animate-bounce"
                      aria-hidden="true"
                    />
                  ) : (
                    <Sparkles className="w-6 h-6 text-[#EA580C] shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  <p className="text-sm sm:text-base font-bold leading-snug">
                    {evaluation.feedback}
                  </p>
                </motion.div>
              )}

              {/* Action Controls */}
              <div className="mt-7 flex flex-wrap items-center justify-end gap-3">
                {!isConfirmed ? (
                  <button
                    type="button"
                    disabled={!selectedChoice}
                    onClick={handleConfirm}
                    className="garden-btn-sunny inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-[#4A2C00] font-display font-black text-base cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                    <span>Xác nhận đáp án</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="garden-btn-primary inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white font-display font-black text-base cursor-pointer"
                  >
                    <span>
                      {currentIndex < QUIZ_QUESTIONS.length - 1
                        ? 'Câu tiếp theo'
                        : 'Xem kết quả & Nhận huy hiệu'}
                    </span>
                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Final Result & Virtual Badge Screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4 sm:py-6 max-w-2xl mx-auto"
            >
              <div className="relative inline-flex items-center justify-center mb-5">
                <img
                  src="/assets/be-mam-xanh.png"
                  alt="Bé Mầm Xanh chúc mừng"
                  className="w-28 h-28 object-contain drop-shadow-md"
                />
                <span className="absolute -top-2 -right-3 w-11 h-11 rounded-full bg-gradient-to-b from-[#FDE047] to-[#F59E0B] text-[#4A2C00] flex items-center justify-center shadow-lg border-2 border-white">
                  <Award className="w-6 h-6" aria-hidden="true" />
                </span>
              </div>

              <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#D97706]">
                Hoàn thành Đố vui 20/11
              </p>
              <h3 className="font-display font-black text-3xl sm:text-4xl text-[#1F581B] mt-1 tabular-nums">
                Bé trả lời đúng {summary.correctCount} / {summary.totalQuestions} câu!
              </h3>

              {/* Virtual Achievement Badge */}
              <div className="mt-6 rounded-[28px] bg-gradient-to-br from-[#FEF9C3] via-[#FFFBEB] to-[#FCE7F3] border-2 border-[#FCD34D] p-6 shadow-md">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#9A5B13]">
                  Huy hiệu danh dự dành tặng bé
                </p>
                <p className="font-display font-black text-xl sm:text-2xl text-[#1F581B] mt-1.5">
                  {summary.badgeTitle}
                </p>
                <p className="text-sm font-semibold text-[#5B4B2A] mt-2">
                  {summary.correctCount === summary.totalQuestions
                    ? 'Xuất sắc! Bé rất hiểu ý nghĩa Ngày Nhà giáo Việt Nam 20/11 và luôn ngoan ngoãn yêu thương thầy cô!'
                    : 'Bé làm rất tốt! Cảm ơn bé đã cùng Bé Mầm Xanh khám phá những điều thật đẹp về ngày 20/11!'}
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={handleReplay}
                  className="garden-btn-sunny inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[#4A2C00] font-display font-extrabold text-base cursor-pointer"
                >
                  <RotateCcw className="w-5 h-5" aria-hidden="true" />
                  <span>Chơi lại</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Stage Navigation Footer */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onPrev}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-[#CFE6CB] text-[#2F5D2A] font-bold text-sm sm:text-base hover:bg-[#F2FAF0] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Chặng trước: Người gieo mầm</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            className="garden-btn-primary inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-white font-display font-extrabold text-sm sm:text-base cursor-pointer"
          >
            <span>Chặng cuối: Vươn mình đón nắng</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
