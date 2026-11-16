import { useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import stage1SproutImg from '../assets/images/stage1_sprout_dew_1794711408763.jpg';
import type { SiteSettings } from '../types/mamxanh';

interface Stage1Props {
  settings: SiteSettings;
  onPrev: () => void;
  onNext: () => void;
}

export function Stage1FirstSprout({ settings, onPrev, onNext }: Stage1Props) {
  const [letterOpened, setLetterOpened] = useState(false);

  const paragraphs = settings.introContent
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section
      id="stage1"
      aria-label="Chặng 1 – Hạt mầm đầu tiên"
      className="scroll-mt-16 sm:scroll-mt-20 bg-gradient-to-b from-[#EAF9E6] via-[#FFFDF7] to-[#E5F7E8] px-4 sm:px-6 py-14 sm:py-20"
    >
      <div className="max-w-5xl mx-auto">
        {/* Stage Banner */}
        <div className="text-center mb-8">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#4E9F3D] mb-2">
            Chặng 1 · Lời ngỏ
          </p>
          <h2 className="sr-only">{settings.introTitle}</h2>
          <img
            src="/assets/aistudio/Cheerful_First_Sprout_Garden_Banner_9a14a516.png"
            alt={settings.introTitle}
            className="mx-auto w-full max-w-[460px] sm:max-w-[540px] h-auto object-contain drop-shadow-[0_10px_22px_rgba(44,108,35,0.16)]"
          />
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* 3D Sprout Scene Card */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-5 garden-card-3d rounded-[28px] p-4 border border-[#DCEFD6]"
          >
            <div className="rounded-[20px] overflow-hidden aspect-[4/3] bg-[#EAF8E6]">
              <img
                src={stage1SproutImg}
                alt="Hạt mầm đầu tiên nảy lộc trong khu vườn lớp 1/8"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="mt-3 text-center text-sm font-semibold text-[#476A45]">
              Hạt mầm nhỏ đón giọt sương lành và nắng ấm từ thầy cô
            </p>
          </motion.div>

          {/* Interactive Opening Letter */}
          <div className="lg:col-span-7">
            {!letterOpened ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="garden-card-3d rounded-[30px] border-2 border-[#D7ECD1] p-7 sm:p-9 text-center flex flex-col items-center justify-center min-h-[340px]"
              >
                <div className="w-48 sm:w-56 mb-4 rounded-2xl overflow-hidden shadow-md border border-[#F3E6CE] bg-white animate-gentle-sway">
                  <img
                    src="/assets/aistudio/Whimsical_Airmail_Envelope_with_Flowers_and_Books_41920d7f.png"
                    alt="Phong thư lời ngỏ gửi thầy cô lớp 1/8"
                    className="w-full h-auto object-contain"
                  />
                </div>
                <h3 className="font-display font-extrabold text-2xl text-[#235D1E] mb-2">
                  Lá thư mở đầu của lớp 1/8
                </h3>
                <p className="text-sm sm:text-base text-[#4D6450] max-w-md mb-6">
                  Bên trong phong thư là những dòng tâm tình đầu tiên mà 33 bạn nhỏ lớp 1/8 gửi tặng quý thầy cô nhân ngày 20/11.
                </p>
                <button
                  type="button"
                  onClick={() => setLetterOpened(true)}
                  className="garden-btn-sunny inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-[#4A2C00] font-display font-extrabold text-base cursor-pointer"
                >
                  <Sparkles className="w-5 h-5" aria-hidden="true" />
                  <span>Mở thư lời ngỏ</span>
                </button>
              </motion.div>
            ) : (
              <motion.article
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="relative rounded-[30px] bg-[#FFFDF8] border-2 border-[#E6DFC5] shadow-[0_20px_50px_-15px_rgba(78,120,52,0.2)] p-6 sm:p-10"
              >
                {/* Decorative top wax seal */}
                <div className="flex items-center justify-between border-b border-[#EFE8D1] pb-4 mb-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4E9F3D]">
                    Thư ngỏ · 20/11
                  </span>
                  <button
                    type="button"
                    onClick={() => setLetterOpened(false)}
                    className="text-xs font-semibold text-[#6D7D69] hover:text-[#235D1E] cursor-pointer"
                  >
                    Gấp lại phong thư
                  </button>
                </div>

                <div className="space-y-4 text-[#2F3E31] text-base sm:text-[17px] leading-[1.78]">
                  {paragraphs.map((para, idx) => (
                    <motion.p
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 * idx, duration: 0.35 }}
                    >
                      {para}
                    </motion.p>
                  ))}
                </div>

                <p className="mt-7 text-right font-display font-extrabold text-lg text-[#256D1B]">
                  {settings.introSignature}
                </p>
              </motion.article>
            )}
          </div>
        </div>

        {/* Stage Navigation Footer */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onPrev}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-[#CFE6CB] text-[#2F5D2A] font-bold text-sm sm:text-base hover:bg-[#F2FAF0] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Trang chủ</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            className="garden-btn-primary inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-white font-display font-extrabold text-sm sm:text-base cursor-pointer"
          >
            <span>Chặng tiếp theo: Vườn yêu thương</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
