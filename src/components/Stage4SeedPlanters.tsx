import { publicAsset } from '../lib/site';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Pause,
  Volume2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { computeTreeLeaves, getWishesByTeacher } from '../lib/mamxanh';
import type { Teacher, WishMessage } from '../types/mamxanh';
import { WishFormFields } from './WishModal';

interface Stage4Props {
  teachers: Teacher[];
  approvedMessages: WishMessage[];
  onOpenWishModal?: () => void;
  onTeacherAudioStart?: () => void;
  onTeacherAudioStop?: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function Stage4SeedPlanters({
  teachers,
  approvedMessages,
  onOpenWishModal,
  onTeacherAudioStart,
  onTeacherAudioStop,
  onPrev,
  onNext,
}: Stage4Props) {
  const [openTeacher, setOpenTeacher] = useState<Teacher | null>(null);
  const activeEnvelope = useRef<HTMLButtonElement | null>(null);
  const [selectedHeartWish, setSelectedHeartWish] = useState<WishMessage | null>(null);
  const [treeTeacherFilter, setTreeTeacherFilter] = useState<string>('all');
  const [wishFormExpanded, setWishFormExpanded] = useState(true);
  const wishSectionRef = useRef<HTMLDivElement | null>(null);

  // Per-teacher envelope audio state (never auto-plays, stops on close or switch)
  const teacherAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isLetterAudioPlaying, setIsLetterAudioPlaying] = useState(false);
  const [letterAudioTime, setLetterAudioTime] = useState(0);
  const [letterAudioDuration, setLetterAudioDuration] = useState(0);
  const [letterAudioError, setLetterAudioError] = useState<string | null>(null);

  const stopTeacherAudio = () => {
    const audioEl = teacherAudioRef.current;
    if (audioEl) {
      audioEl.pause();
      try {
        audioEl.currentTime = 0;
      } catch {
        // Ignore seek errors if audio metadata hasn't loaded yet
      }
    }
    setIsLetterAudioPlaying(false);
    setLetterAudioTime(0);
    onTeacherAudioStop?.();
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseTeacherModal();
        setSelectedHeartWish(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ensure any playing letter audio stops whenever modal closes or switches teacher
  useEffect(() => {
    const audioEl = teacherAudioRef.current;
    if (audioEl) {
      audioEl.pause();
      try {
        audioEl.currentTime = 0;
      } catch {
        // Ignore seek reset before load
      }
    }
    setIsLetterAudioPlaying(false);
    setLetterAudioTime(0);
    setLetterAudioDuration(0);
    setLetterAudioError(null);
    if (!openTeacher) {
      onTeacherAudioStop?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openTeacher?.id, openTeacher?.audioUrl]);

  useEffect(() => {
    return () => {
      const audioEl = teacherAudioRef.current;
      if (audioEl) audioEl.pause();
    };
  }, []);

  const filteredTreeWishes = useMemo(
    () => getWishesByTeacher(approvedMessages, treeTeacherFilter, true),
    [approvedMessages, treeTeacherFilter]
  );

  const heartNodes = useMemo(
    () => computeTreeLeaves(filteredTreeWishes, teachers),
    [filteredTreeWishes, teachers]
  );

  const handleCloseTeacherModal = () => {
    stopTeacherAudio();
    setOpenTeacher(null);
    activeEnvelope.current?.focus({ preventScroll: true });
    activeEnvelope.current = null;
  };

  const handleToggleTeacherAudio = async () => {
    const audioEl = teacherAudioRef.current;
    if (!audioEl || !openTeacher?.audioUrl) return;
    setLetterAudioError(null);

    if (isLetterAudioPlaying) {
      audioEl.pause();
      setIsLetterAudioPlaying(false);
      onTeacherAudioStop?.();
      return;
    }

    onTeacherAudioStart?.();
    try {
      await audioEl.play();
      setIsLetterAudioPlaying(true);
    } catch {
      setIsLetterAudioPlaying(false);
      onTeacherAudioStop?.();
      setLetterAudioError('Không thể phát tệp âm thanh của phong thư này.');
    }
  };

  return (
    <section
      id="stage4"
      aria-label="Chặng 4 – Người gieo mầm"
      className="scroll-mt-16 sm:scroll-mt-20 bg-gradient-to-b from-[#EAF8EA] via-[#FFFDF7] to-[#FFF7DF] px-4 sm:px-6 py-14 sm:py-20"
    >
      <div className="max-w-7xl mx-auto">
        {/* Stage Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#D97706] mb-2">
            Chặng 4 · Những lá thư tri ân gửi thầy cô
          </p>
          <h2 className="sr-only">NGƯỜI GIEO MẦM</h2>
          <img
            src={publicAsset('/assets/aistudio/Ng__i_Gieo_M_m__Nurturing_Joy_3a5c6dbf.png')}
            alt="Người gieo mầm"
            className="mx-auto w-full max-w-[460px] sm:max-w-[540px] h-auto object-contain drop-shadow-[0_10px_22px_rgba(44,108,35,0.16)]"
          />
          <p className="mt-3 text-sm sm:text-base text-[#4A654B] leading-relaxed">
            Chạm vào từng phong thư để đọc và nghe lời tri ân của lớp 1/8, ngắm Cây tri ân và gửi lời chúc yêu thương đến thầy cô nhé!
          </p>
        </div>

        <div className="teacher-envelope-grid mb-14">
          {teachers.map((teacher) => (
            <button
              key={teacher.id}
              type="button"
              className="teacher-envelope"
              aria-label={"Mở phong thư gửi " + teacher.name}
              onClick={(event) => {
                activeEnvelope.current = event.currentTarget;
                stopTeacherAudio();
                setOpenTeacher(teacher);
              }}
            >
              <img
                src={publicAsset('/assets/phong-thu-goc.webp')}
                alt=""
                width={420}
                height={280}
                loading="lazy"
              />
              <b>{teacher.name}</b>
              <small>{teacher.role}</small>
            </button>
          ))}
        </div>

        {/* Cây Tri Ân (Interactive Tree of Gratitude with 3D Pastel/Peach Hearts) */}
        <div className="garden-card-3d rounded-[34px] border-2 border-[#D4ECCF] p-5 sm:p-8 mb-14">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-[#1F581B]">
                CÂY TRI ÂN LỚP 1/8
              </h3>
              <p className="text-sm text-[#4D694D] mt-1">
                Mỗi lời tri ân đã được giáo viên duyệt sẽ nở thành một trái tim yêu thương trên cây ({approvedMessages.length} trái tim tri ân).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="tree-teacher-filter"
                className="text-xs font-bold text-[#3D5B3E] whitespace-nowrap"
              >
                Nhánh thầy/cô:
              </label>
              <select
                id="tree-teacher-filter"
                value={treeTeacherFilter}
                onChange={(e) => setTreeTeacherFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-[#CFE6CB] text-xs sm:text-sm font-semibold text-[#234824] focus:outline-none focus:ring-2 focus:ring-[#65B741]"
              >
                <option value="all">Tất cả thầy cô ({approvedMessages.length})</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            data-testid="cay-tri-an-canopy"
            className="relative w-full max-w-4xl mx-auto aspect-[3/2] rounded-[28px] bg-gradient-to-b from-[#E0F4FF] via-[#F2FBE9] to-[#DCF2D1] border border-[#CFE6CB] overflow-hidden p-2 sm:p-4"
          >
            <div
              className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#FDE047]/45 blur-2xl pointer-events-none"
              aria-hidden="true"
            />

            <img
              src={publicAsset('/assets/aistudio/C_y_Tri__n_Blossoming_in_Sunshine_2d203873.png')}
              alt="Cây Tri Ân lớp 1/8 tỏa bóng mát và hoa thơm"
              className="w-full h-full object-contain select-none pointer-events-none drop-shadow-[0_12px_24px_rgba(52,110,41,0.18)]"
            />

            {heartNodes.map((node, idx) => (
              <button
                key={node.message.id}
                type="button"
                data-testid="tree-heart-node"
                onClick={() => setSelectedHeartWish(node.message)}
                aria-label={`Đọc lời chúc của ${node.message.studentName} gửi ${node.message.teacherName}`}
                title={`${node.message.studentName} → ${node.message.teacherName}`}
                style={{
                  left: `${node.xPercent}%`,
                  top: `${node.yPercent}%`,
                  transform: `translate(-50%, -50%) rotate(${Math.round(node.rotationDeg * 0.5)}deg)`,
                }}
                className="absolute group cursor-pointer focus-visible:outline-2 focus-visible:outline-[#E11D48] rounded-full p-0.5"
              >
                <span className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 transition-transform duration-150 group-hover:scale-125 drop-shadow-[0_4px_6px_rgba(190,24,93,0.38)]">
                  <svg
                    viewBox="0 0 32 32"
                    className="w-full h-full overflow-visible"
                    aria-hidden="true"
                  >
                    <path
                      d="M16 28.2 C16 28.2 4 20.6 4 11.4 C4 7.3 7.1 4.2 10.9 4.2 C13.2 4.2 15.1 5.4 16 7.1 C16.9 5.4 18.8 4.2 21.1 4.2 C24.9 4.2 28 7.3 28 11.4 C28 20.6 16 28.2 16 28.2 Z"
                      fill={node.color}
                      stroke="#FFFDF9"
                      strokeWidth="2.2"
                      strokeLinejoin="round"
                    />
                    <ellipse
                      cx="11.2"
                      cy="10.2"
                      rx="2.3"
                      ry="1.3"
                      transform="rotate(-28 11.2 10.2)"
                      fill="rgba(255,255,255,0.62)"
                    />
                  </svg>
                </span>
                <span className="sr-only">Trái tim lời chúc {idx + 1}</span>
              </button>
            ))}

            {heartNodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                <p className="bg-white/90 px-5 py-3 rounded-2xl text-sm font-bold text-[#3C5C3D] shadow-sm">
                  Chưa có trái tim lời chúc nào ở nhánh này.{onOpenWishModal && ' Hãy gửi lời tri ân ở phía dưới nhé!'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Compliant Free-Text Student-to-Teacher Wish Form (Text + Optional Card Image only) */}
        {onOpenWishModal && (
          <div
            id="gui-loi-chuc"
            ref={wishSectionRef}
            className="max-w-3xl mx-auto rounded-[32px] bg-[#FFFDF8] border-2 border-[#D2ECCB] shadow-[0_20px_50px_-15px_rgba(48,105,39,0.18)] overflow-hidden"
          >
            <div className="px-6 py-5 bg-gradient-to-r from-[#E5F7E1] to-[#FEF3C7]/75 border-b border-[#DCEFD6] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={publicAsset('/assets/aistudio/Whimsical_Airmail_Envelope_with_Flowers_and_Books_41920d7f.png')}
                  alt="Phong thư gửi thầy cô"
                  className="w-24 h-16 rounded-xl object-cover border border-[#EADBC0] shadow-xs shrink-0"
                />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#D97706]">
                    Góc gửi yêu thương
                  </p>
                  <h3 className="font-display font-black text-2xl sm:text-3xl text-[#1F581B] mt-0.5">
                    HỌC SINH GỬI LỜI TRI ÂN ĐẾN THẦY/CÔ
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4A654B] mt-1">
                    Em hãy tự nhập tên mình và tên thầy cô mà em muốn tri ân nhé. Lời chúc sẽ ở trạng thái chờ duyệt trước khi nở trái tim trên Cây tri ân.
                  </p>
                </div>
              </div>
            </div>

            {wishFormExpanded ? (
              <WishFormFields
                idPrefix="stage4-wish"
                showCloseButton
                onClose={() => setWishFormExpanded(false)}
              />
            ) : (
              <div className="p-6 text-center">
                <button
                  type="button"
                  onClick={() => setWishFormExpanded(true)}
                  className="garden-btn-sunny inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-[#4A2C00] font-display font-extrabold text-sm cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-current text-[#E11D48]" aria-hidden="true" />
                  <span>Mở biểu mẫu gửi lời tri ân</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Stage Navigation Footer */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onPrev}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-[#CFE6CB] text-[#2F5D2A] font-bold text-sm sm:text-base hover:bg-[#F2FAF0] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Chặng trước</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            className="garden-btn-primary inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-white font-display font-extrabold text-sm sm:text-base cursor-pointer"
          >
            <span>Chặng tiếp theo: Đố vui 20/11</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Modal 1: Teacher Appreciation Letter + Optional Per-Letter NGHE Audio Player */}
      <AnimatePresence>
        {openTeacher && (
          <div
            className="fixed inset-0 z-[60] grid place-items-center bg-[#2b1a3699] p-3"
            onClick={handleCloseTeacherModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="teacher-letter-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="teacher-letter-dialog"
            >
              <button
                type="button"
                onClick={handleCloseTeacherModal}
                className="teacher-letter-close"
                autoFocus
              >
                ✕ Đóng
              </button>
              <div className="clear-both space-y-2">
                <h3 id="teacher-letter-title" className="text-lg font-extrabold">
                  💌 {openTeacher.name}
                </h3>
                <p className="text-sm">{openTeacher.role}</p>
                {openTeacher.avatarUrl && (
                  <img
                    src={publicAsset(openTeacher.avatarUrl)}
                    alt={"Ảnh " + openTeacher.name}
                    className="mx-auto block max-h-[36vh] w-auto max-w-full rounded-2xl object-contain"
                  />
                )}
                {openTeacher.letterTitle && <h4 className="font-bold">{openTeacher.letterTitle}</h4>}
                <div className="teacher-letter-text">{openTeacher.letterContent}</div>

                {/* Per-Letter NGHE Audio Player (Never Auto-Plays) */}
                {openTeacher.audioUrl ? (
                  <div className="rounded-2xl bg-[#F2FBEF] border border-[#CBE6C4] p-4 space-y-2.5">
                    <audio
                      ref={teacherAudioRef}
                      src={openTeacher.audioUrl}
                      preload="metadata"
                      onLoadedMetadata={(e) =>
                        setLetterAudioDuration(e.currentTarget.duration || 0)
                      }
                      onTimeUpdate={(e) =>
                        setLetterAudioTime(e.currentTarget.currentTime || 0)
                      }
                      onEnded={() => {
                        setIsLetterAudioPlaying(false);
                        setLetterAudioTime(0);
                        onTeacherAudioStop?.();
                      }}
                      className="hidden"
                    />

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => void handleToggleTeacherAudio()}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-display font-extrabold text-sm shadow-sm cursor-pointer transition-all ${
                          isLetterAudioPlaying
                            ? 'bg-[#D97706] text-white'
                            : 'garden-btn-primary text-white'
                        }`}
                      >
                        {isLetterAudioPlaying ? (
                          <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
                        ) : (
                          <Volume2 className="w-4 h-4" aria-hidden="true" />
                        )}
                        <span>{isLetterAudioPlaying ? 'TẠM DỪNG' : 'NGHE'}</span>
                      </button>

                      <div className="flex-1 min-w-[160px] space-y-1">
                        <input
                          type="range"
                          min={0}
                          max={letterAudioDuration > 0 ? letterAudioDuration : 100}
                          step={0.1}
                          value={letterAudioDuration > 0 ? letterAudioTime : 0}
                          disabled={letterAudioDuration <= 0}
                          aria-label="Tiến trình âm thanh phong thư"
                          onChange={(e) => {
                            const nextTime = Number(e.target.value);
                            if (teacherAudioRef.current) {
                              teacherAudioRef.current.currentTime = nextTime;
                            }
                            setLetterAudioTime(nextTime);
                          }}
                          className="w-full accent-[#4E9F3D] cursor-pointer"
                        />
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#446345] tabular-nums">
                          <span>Nghe lời chúc phong thư</span>
                          <span>
                            {formatAudioTime(letterAudioTime)} /{' '}
                            {formatAudioTime(letterAudioDuration)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {letterAudioError && (
                      <p className="text-xs font-semibold text-red-700">{letterAudioError}</p>
                    )}
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Tree Heart Wish Detail (Text + Optional Card Image only, NO Audio) */}
      <AnimatePresence>
        {selectedHeartWish && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#193319]/50 backdrop-blur-xs"
            onClick={() => setSelectedHeartWish(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Lời chúc trên Cây tri ân"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-[28px] bg-[#FFFDF7] border-2 border-[#FBCFE8] shadow-2xl p-6"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#E11D48] flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                    <span>Trái tim yêu thương</span>
                  </p>
                  <h3 className="font-display font-extrabold text-lg text-[#1F561C] mt-0.5">
                    Từ bạn {selectedHeartWish.studentName}
                  </h3>
                  <p className="text-xs font-semibold text-[#5C725D]">
                    Gửi tới: {selectedHeartWish.teacherName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedHeartWish(null)}
                  aria-label="Đóng lời chúc"
                  className="p-2 rounded-xl bg-white border border-[#FBCFE8] text-[#9D174D] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-base text-[#293D2A] leading-relaxed bg-white rounded-2xl p-4 border border-[#FCE7F3]">
                “{selectedHeartWish.content}”
              </p>

              {selectedHeartWish.cardImageUrl && (
                <div className="mt-4 rounded-2xl overflow-hidden border border-[#FBCFE8]">
                  <img
                    src={selectedHeartWish.cardImageUrl}
                    alt="Ảnh thiệp đính kèm"
                    className="w-full max-h-60 object-contain bg-white"
                  />
                </div>
              )}

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedHeartWish(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-[#9F1239] font-bold text-xs sm:text-sm cursor-pointer hover:bg-[#FFE4E6]"
                >
                  ĐÓNG
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
