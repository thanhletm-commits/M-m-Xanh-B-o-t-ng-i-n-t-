import { publicAsset } from '../lib/site';
import { ArrowLeft, Home, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import stage5SunriseImg from '../assets/images/stage5_sunrise_garden_1794711408824.jpg';
import type { SiteSettings } from '../types/mamxanh';

interface Stage6Props {
  settings: SiteSettings;
  onPrev: () => void;
  onHome: () => void;
}

export function Stage6Sunlight({ settings, onPrev, onHome }: Stage6Props) {
  const quoteParagraphs = settings.outroQuote
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const closingLines = settings.outroClosing
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section
      id="stage6"
      aria-label="Chặng 6 – Vươn mình đón nắng"
      className="scroll-mt-16 sm:scroll-mt-20 bg-gradient-to-b from-[#FFF6E5] via-[#FFFDF7] to-[#E6F7E2] px-4 sm:px-6 py-14 sm:py-20 pb-36 sm:pb-40"
    >
      <div className="max-w-5xl mx-auto">
        {/* Stage Header */}
        <div className="text-center mb-8">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#D97706] mb-2">
            Chặng 6 · Lời cảm ơn và khúc kết yêu thương
          </p>
          <h2 className="sr-only">VƯƠN MÌNH ĐÓN NẮNG</h2>
          <img
            src={publicAsset('/assets/aistudio/e8c3c696-e7bf-4718-b110-8ed8f8602ed6_10ba1ded.png')}
            alt="Vươn mình đón nắng"
            className="mx-auto w-full max-w-[460px] sm:max-w-[540px] h-auto object-contain drop-shadow-[0_10px_22px_rgba(44,108,35,0.16)]"
          />
        </div>

        {/* Sunrise Panorama Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative max-w-4xl mx-auto rounded-[34px] overflow-hidden border-4 border-white shadow-[0_24px_60px_-15px_rgba(217,119,6,0.22)] mb-8 bg-[#FFFDF7]"
        >
          <img
            src={stage5SunriseImg}
            alt="Khu vườn bình minh với mặt trời vàng, cầu vồng nhẹ và những mầm xanh vươn lên"
            className="w-full h-56 sm:h-72 md:h-80 object-cover block"
          />
          <div className="bg-gradient-to-r from-[#FFFDF7] via-[#FEF9C3]/65 to-[#EAF8E6] px-5 py-4 text-center border-t border-[#F0E7CE]">
            <p className="font-display font-black text-xl sm:text-2xl text-[#215A1C]">
              MẦM XANH · Ươm yêu thương – Gặt tương lai
            </p>
            <span className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/90 border border-[#FDE047] text-xs font-extrabold text-[#713F12]">
              <Sun className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
              <span>Lớp 1/8 · Trường Tiểu học Huỳnh Ngọc Huệ</span>
            </span>
          </div>
        </motion.div>

        {/* Emotional Closing Prose Card */}
        <motion.article
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="garden-card-3d rounded-[32px] border-2 border-[#E3ECD8] p-6 sm:p-10 text-center"
        >
          <div className="max-w-2xl mx-auto space-y-5 text-base sm:text-lg leading-[1.82] text-[#2F4131]">
            {quoteParagraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          <div className="my-8 h-px bg-gradient-to-r from-transparent via-[#CFE3C8] to-transparent" />

          <div className="max-w-xl mx-auto space-y-3">
            {closingLines.map((line, idx) => (
              <p
                key={idx}
                className={
                  idx === 0
                    ? 'font-display font-black text-xl sm:text-2xl text-[#256D1B]'
                    : idx === closingLines.length - 1
                    ? 'font-display font-extrabold text-lg text-[#D97706]'
                    : 'text-base sm:text-lg font-semibold text-[#355136]'
                }
              >
                {line}
              </p>
            ))}
          </div>
        </motion.article>

        {/* Navigation Footer */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onPrev}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-[#CFE6CB] text-[#2F5D2A] font-bold text-sm sm:text-base hover:bg-[#F2FAF0] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Chặng trước: Đố vui 20/11</span>
          </button>

          <button
            type="button"
            onClick={onHome}
            className="garden-btn-primary inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-white font-display font-extrabold text-sm sm:text-base cursor-pointer"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Quay lại trang chủ</span>
          </button>
        </div>
      </div>
    </section>
  );
}
