import { publicAsset } from '../lib/site';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { getMemoriesByCategory, MEMORY_CATEGORIES } from '../lib/mamxanh';
import type { MemoryCategory, MemoryPhoto } from '../types/mamxanh';

interface Stage3Props {
  memories: MemoryPhoto[];
  onPrev: () => void;
  onNext: () => void;
}

export function Stage3UnderCanopy({ memories, onPrev, onNext }: Stage3Props) {
  const [selectedCategory, setSelectedCategory] = useState<MemoryCategory | 'Tất cả'>('Tất cả');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const visibleMemories = getMemoriesByCategory(memories, selectedCategory);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((idx) =>
          idx === null ? null : (idx + 1) % visibleMemories.length
        );
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((idx) =>
          idx === null
            ? null
            : (idx - 1 + visibleMemories.length) % visibleMemories.length
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, visibleMemories.length]);

  const activePhoto =
    lightboxIndex !== null && visibleMemories[lightboxIndex]
      ? visibleMemories[lightboxIndex]
      : null;

  return (
    <section
      id="stage3"
      aria-label="Chặng 3 – Dưới tán xanh"
      className="scroll-mt-16 sm:scroll-mt-20 bg-gradient-to-b from-[#FAF3E3] via-[#FFFDF7] to-[#EAF8EA] px-4 sm:px-6 py-14 sm:py-20"
    >
      <div className="max-w-7xl mx-auto">
        {/* Stage Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#8B5E34] mb-2">
            Chặng 3 · Những miền ký ức tuổi thơ
          </p>
          <h2 className="sr-only">DƯỚI TÁN XANH</h2>
          <img
            src={publicAsset('/assets/aistudio/D__i_T_n_Xanh_Banner_7fbba9df.png')}
            alt="Dưới tán xanh"
            className="mx-auto w-full max-w-[460px] sm:max-w-[540px] h-auto object-contain drop-shadow-[0_10px_22px_rgba(44,108,35,0.16)]"
          />
          <p className="mt-3 text-sm sm:text-base text-[#566957] leading-relaxed">
            Phòng trưng bày những khoảnh khắc dịu dàng dưới mái trường Tiểu học Huỳnh Ngọc Huệ.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div
          role="tablist"
          aria-label="Nhóm ảnh kỷ niệm"
          className="flex flex-wrap items-center justify-center gap-2 mb-9"
        >
          {(['Tất cả', ...MEMORY_CATEGORIES] as const).map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setSelectedCategory(cat);
                  setLightboxIndex(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#4E9F3D] text-white shadow-md'
                    : 'bg-white text-[#415C42] border border-[#D9E7D4] hover:bg-[#F2FAF0]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Hanging Wooden & Cream Photo Frames Exhibition */}
        {visibleMemories.length === 0 ? (
          <div className="text-center py-12 bg-white/85 rounded-3xl border border-[#E5DEC9]">
            <p className="text-base font-semibold text-[#5E6D5A]">
              Chưa có ảnh nào trong nhóm này. Giáo viên có thể tải ảnh thật tại trang Quản trị.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Decorative twine line across desktop exhibition */}
            <div
              className="hidden md:block absolute left-4 right-4 top-3 h-1 bg-gradient-to-r from-[#C8A27A]/40 via-[#A47548]/60 to-[#C8A27A]/40 rounded-full"
              aria-hidden="true"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 pt-2">
              {visibleMemories.map((photo, index) => (
                <motion.button
                  key={photo.id}
                  type="button"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.24) }}
                  onClick={() => setLightboxIndex(index)}
                  aria-label={`Phóng to ảnh: ${photo.caption}`}
                  className="group relative text-left rounded-[24px] p-3.5 bg-[#FFFDF8] border-[6px] border-[#DFC7A7] shadow-[0_16px_32px_-12px_rgba(92,64,36,0.22)] hover:-translate-y-1.5 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#4E9F3D]"
                >
                  {/* Wooden clothespin detail */}
                  <span
                    className="hidden md:block absolute -top-5 left-1/2 -translate-x-1/2 w-4 h-7 rounded-sm bg-[#C69B6D] border border-[#9C734B] shadow-xs"
                    aria-hidden="true"
                  />

                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-[#F4EFE3] to-[#EAF5E6] border border-[#E7DEC9]">
                    {photo.imageUrl ? (
                      <img
                        src={photo.imageUrl}
                        alt={photo.caption}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-5 text-center text-[#5A6D57]">
                        <div className="w-14 h-14 rounded-2xl bg-white/90 border border-[#D8E5D3] flex items-center justify-center mb-3 shadow-xs">
                          <Camera className="w-7 h-7 text-[#65B741]" aria-hidden="true" />
                        </div>
                        <p className="text-xs font-extrabold uppercase tracking-wider text-[#8B5E34] mb-1">
                          Ảnh mẫu DEMO
                        </p>
                        <p className="text-xs text-[#647864]">
                          Khung trưng bày sẵn sàng cho ảnh kỷ niệm thật của lớp 1/8
                        </p>
                      </div>
                    )}

                    <span className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-xl bg-white/90 text-[#2E5D29] flex items-center justify-center shadow-sm opacity-90 group-hover:opacity-100">
                      <Maximize2 className="w-4 h-4" aria-hidden="true" />
                    </span>
                  </div>

                  <div className="mt-3 px-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8B5E34]">
                      {photo.category}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#2E4030] leading-snug line-clamp-2">
                      {photo.caption}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
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
            <span>Chặng tiếp theo: Người gieo mầm</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Photo Lightbox Modal */}
      <AnimatePresence>
        {activePhoto && lightboxIndex !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#182918]/75 backdrop-blur-sm"
            onClick={() => setLightboxIndex(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Phóng to ảnh kỷ niệm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl rounded-[28px] bg-[#FFFDF7] border-4 border-[#DFC7A7] shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#EFE6D2] bg-[#FAF3E3]">
                <span className="text-xs sm:text-sm font-bold text-[#7A5029]">
                  {activePhoto.category} · Ảnh {lightboxIndex + 1}/{visibleMemories.length}
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxIndex(null)}
                  aria-label="Đóng cửa sổ ảnh"
                  className="p-1.5 rounded-xl bg-white border border-[#DFC7A7] text-[#4E3822] hover:bg-[#FFF9ED] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 sm:p-6">
                <div className="rounded-2xl overflow-hidden bg-[#F5EFE2] aspect-[16/10] flex items-center justify-center">
                  {activePhoto.imageUrl ? (
                    <img
                      src={activePhoto.imageUrl}
                      alt={activePhoto.caption}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-center p-8 text-[#566A56]">
                      <Camera className="w-12 h-12 text-[#65B741] mx-auto mb-3" />
                      <p className="font-bold text-base text-[#8B5E34]">Ảnh mẫu DEMO</p>
                      <p className="text-sm mt-1">
                        Khung ảnh đang chờ giáo viên tải ảnh kỷ niệm thật của lớp 1/8.
                      </p>
                    </div>
                  )}
                </div>

                <p className="mt-4 text-center text-base font-semibold text-[#2A3F2B]">
                  {activePhoto.caption}
                </p>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={visibleMemories.length <= 1}
                    onClick={() =>
                      setLightboxIndex(
                        (lightboxIndex - 1 + visibleMemories.length) % visibleMemories.length
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#D8C5A8] text-sm font-bold text-[#4A3520] disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Ảnh trước</span>
                  </button>

                  <button
                    type="button"
                    disabled={visibleMemories.length <= 1}
                    onClick={() =>
                      setLightboxIndex((lightboxIndex + 1) % visibleMemories.length)
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#D8C5A8] text-sm font-bold text-[#4A3520] disabled:opacity-40 cursor-pointer"
                  >
                    <span>Ảnh sau</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
