import { publicAsset } from '../lib/site';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { getProductTypeLabel, getStudentProducts } from '../lib/mamxanh';
import type { Product, Student } from '../types/mamxanh';
import { SproutCharacter } from './SproutCharacter';

interface Stage2Props {
  students: Student[];
  products: Product[];
  onPrev: () => void;
  onNext: () => void;
}

export function Stage2LoveGarden({
  students,
  products,
  onPrev,
  onNext,
}: Stage2Props) {
  const [query, setQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [productIndex, setProductIndex] = useState(0);
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  const activeProducts = selectedStudent
    ? getStudentProducts(products, selectedStudent.id)
    : [];
  const currentProduct = activeProducts[productIndex] || null;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomedImageUrl) {
          setZoomedImageUrl(null);
        } else {
          setSelectedStudent(null);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [zoomedImageUrl]);

  const openStudentModal = (student: Student) => {
    setSelectedStudent(student);
    setProductIndex(0);
    setZoomedImageUrl(null);
  };

  return (
    <section
      id="stage2"
      aria-label="Chặng 2 – Vườn yêu thương"
      className="scroll-mt-16 sm:scroll-mt-20 bg-gradient-to-b from-[#E5F7E8] via-[#FFFDF7] to-[#FAF3E3] px-4 sm:px-6 py-14 sm:py-20"
    >
      <div className="max-w-7xl mx-auto">
        {/* Stage Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#4E9F3D] mb-2">
            Chặng 2 · 33 học sinh – 33 món quà tri ân
          </p>
          <h2 className="sr-only">VƯỜN YÊU THƯƠNG</h2>
          <img
            src={publicAsset('/assets/aistudio/V__n_Y_u_Th__ng_Mascot_Banner_5e1d1bc9.png')}
            alt="Vườn yêu thương"
            className="mx-auto w-full max-w-[460px] sm:max-w-[540px] h-auto object-contain drop-shadow-[0_10px_22px_rgba(44,108,35,0.16)]"
          />
          <p className="mt-3 text-sm sm:text-base text-[#4A644B] leading-relaxed">
            Chạm vào từng bạn nhỏ Mầm Xanh lớp 1/8 để mở món quà tri ân gửi đến thầy cô.
          </p>
        </div>

        {/* Search Filter Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search
              className="w-4 h-4 text-[#5D7B5D] absolute left-4 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm tên bạn học sinh lớp 1/8..."
              aria-label="Tìm tên học sinh"
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-[#CEE6C9] text-sm text-[#243B26] placeholder:text-[#7D947E] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#65B741]"
            />
          </div>
        </div>

        {/* 33 Student Sprout Garden Grid */}
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 bg-white/80 rounded-3xl border border-[#DCEFD7]">
            <p className="text-base font-semibold text-[#4B684D]">
              Không tìm thấy học sinh phù hợp với từ khóa “{query}”.
            </p>
          </div>
        ) : (
          <div
            data-testid="student-garden-grid"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5"
          >
            {filteredStudents.map((student) => {
              const itemCount = getStudentProducts(products, student.id).length;
              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => openStudentModal(student)}
                  aria-label={`Xem sản phẩm của ${student.name}`}
                  className="group garden-card-3d rounded-[26px] p-3.5 border border-[#DCEFD6] hover:border-[#74C947] text-center flex flex-col items-center transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[0_18px_32px_-10px_rgba(78,159,61,0.28)] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#4E9F3D]"
                >
                  {/* Direct PNG render when teacher uploaded full student sprout PNG (zero crop/distortion/SVG overlay) */}
                  <div className="w-full flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                    {student.avatarUrl ? (
                      <img
                        src={student.avatarUrl}
                        alt={`Nhân vật mầm xanh của học sinh ${student.name}`}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-36 sm:h-40 object-contain drop-shadow-[0_8px_12px_rgba(45,96,35,0.16)]"
                      />
                    ) : (
                      <SproutCharacter
                        name={student.name}
                        variant={student.sproutVariant}
                        avatarUrl={null}
                        orderNumber={student.orderNumber}
                        isDemo={student.isDemo}
                      />
                    )}
                  </div>
                  <h3 className="mt-2 font-display font-extrabold text-sm sm:text-[15px] text-[#1E4F1B] leading-snug line-clamp-2">
                    {student.name}
                  </h3>
                  <p className="mt-1 text-xs text-[#546E55] line-clamp-2 leading-snug">
                    {student.shortIntro}
                  </p>
                  <span className="mt-2 text-[11px] font-bold text-[#3D8B2E] group-hover:underline">
                    Xem quà ({itemCount})
                  </span>
                </button>
              );
            })}
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
            <span>Chặng tiếp theo: Dưới tán xanh</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Student Product Viewer Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#193319]/45 backdrop-blur-xs overflow-y-auto"
            onClick={() => setSelectedStudent(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-modal-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-[32px] bg-[#FFFDF7] border-2 border-[#D4ECCF] shadow-2xl overflow-hidden my-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between gap-4 px-6 py-4 bg-gradient-to-r from-[#E6F8E2] to-[#FEF9C3]/70 border-b border-[#DCEFD6]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-white border-2 border-[#86D373] overflow-hidden flex items-center justify-center shrink-0 font-display font-extrabold text-sm text-[#24601E] p-0.5">
                    {selectedStudent.avatarUrl ? (
                      <img
                        src={selectedStudent.avatarUrl}
                        alt={selectedStudent.name}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      `#${selectedStudent.orderNumber}`
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2
                      id="student-modal-title"
                      className="font-display font-extrabold text-lg sm:text-xl text-[#1F561C] truncate"
                    >
                      {selectedStudent.name}
                    </h2>
                    <p className="text-xs font-semibold text-[#557154]">
                      Học sinh lớp 1/8 · {activeProducts.length} sản phẩm tri ân
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  aria-label="Đóng cửa sổ sản phẩm"
                  className="p-2 rounded-xl bg-white/90 border border-[#CFE6CB] text-[#355534] hover:bg-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8">
                {currentProduct ? (
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#D97706]">
                        {getProductTypeLabel(currentProduct.type)}
                      </span>
                      {currentProduct.isDemo && (
                        <span className="text-[11px] font-bold text-[#5E7A5B]">
                          Sản phẩm mẫu DEMO
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-extrabold text-xl sm:text-2xl text-[#243E25] mb-4">
                      {currentProduct.title}
                    </h3>

                    {currentProduct.mediaUrl ? (
                      currentProduct.type === 'video' ? (
                        <video
                          src={currentProduct.mediaUrl}
                          controls
                          preload="metadata"
                          className="w-full max-h-80 rounded-2xl bg-black mb-4"
                        />
                      ) : (
                        <div className="relative group rounded-2xl overflow-hidden border border-[#E2EFE0] bg-white mb-4">
                          <img
                            src={currentProduct.mediaUrl}
                            alt={currentProduct.title}
                            className="w-full max-h-80 object-contain mx-auto cursor-zoom-in"
                            onClick={() => setZoomedImageUrl(currentProduct.mediaUrl)}
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => setZoomedImageUrl(currentProduct.mediaUrl)}
                            aria-label="Phóng to ảnh sản phẩm"
                            className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/92 border border-[#CFE6CB] text-xs font-bold text-[#255F1F] shadow-sm hover:bg-white cursor-pointer"
                          >
                            <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Phóng to</span>
                          </button>
                        </div>
                      )
                    ) : (
                      <div className="rounded-2xl bg-gradient-to-br from-[#F4FBEF] to-[#FFFBEB] border border-[#DCEFD6] p-6 mb-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] flex items-center justify-center shrink-0">
                          <Sparkles className="w-6 h-6 text-[#D97706]" aria-hidden="true" />
                        </div>
                        <p className="text-sm text-[#4F6B50]">
                          Không gian trưng bày sản phẩm của bạn {selectedStudent.name}. Giáo viên có thể tải ảnh thiệp, tranh vẽ hoặc video thật trong trang Quản trị.
                        </p>
                      </div>
                    )}

                    <p className="text-base text-[#344A35] leading-relaxed bg-white rounded-2xl p-4 border border-[#E6F1E3]">
                      {currentProduct.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-center text-[#5A705B] py-8">
                    Học sinh này chưa có sản phẩm nào được thêm.
                  </p>
                )}

                {/* Product Prev/Next Controls */}
                <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-[#E6F1E3]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={activeProducts.length <= 1}
                      onClick={() =>
                        setProductIndex(
                          (idx) => (idx - 1 + activeProducts.length) % activeProducts.length
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#CFE6CB] text-xs sm:text-sm font-bold text-[#2E5B29] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Sản phẩm trước</span>
                    </button>
                    <button
                      type="button"
                      disabled={activeProducts.length <= 1}
                      onClick={() =>
                        setProductIndex((idx) => (idx + 1) % activeProducts.length)
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#CFE6CB] text-xs sm:text-sm font-bold text-[#2E5B29] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <span>Sản phẩm sau</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="text-xs font-bold text-[#5A735B] tabular-nums">
                    {activeProducts.length > 0
                      ? `${productIndex + 1} / ${activeProducts.length}`
                      : '0 / 0'}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Zoomed Product Image Lightbox */}
      <AnimatePresence>
        {zoomedImageUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
            onClick={() => setZoomedImageUrl(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Ảnh sản phẩm phóng to"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full rounded-3xl bg-white p-3 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setZoomedImageUrl(null)}
                aria-label="Đóng ảnh phóng to"
                className="absolute top-5 right-5 p-2 rounded-xl bg-white/95 border border-[#CFE6CB] text-[#234A22] shadow-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={zoomedImageUrl}
                alt="Sản phẩm phóng to"
                className="w-full max-h-[82svh] object-contain rounded-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
