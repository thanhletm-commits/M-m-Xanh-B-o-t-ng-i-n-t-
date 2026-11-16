import { publicAsset } from '../lib/site';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface StageHomeProps {
  coverImageUrl?: string | null;
  onExplore: () => void;
}

export function StageHome({ coverImageUrl, onExplore }: StageHomeProps) {
  const coverSrc = coverImageUrl || publicAsset('/assets/cover-mam-xanh-20-11.png');

  return (
    <section
      id="home"
      aria-label="Trang chủ – Bìa báo Mầm Xanh"
      className={
        coverImageUrl
          ? "relative flex min-h-[100svh] w-full items-end justify-center overflow-hidden select-none"
          : "relative flex w-full flex-col overflow-hidden bg-[#E9F6DB] select-none md:min-h-[100svh] md:justify-end"
      }
    >
      <h1 className="sr-only">
        Mầm Xanh – Ươm yêu thương, Gặt tương lai – Báo tường điện tử chào mừng Ngày Nhà giáo Việt Nam 20/11 – Lớp 1/8 Trường Tiểu học Huỳnh Ngọc Huệ
      </h1>

      <img
        alt=""
        src={coverSrc}
        fetchPriority="high"
        className={coverImageUrl
          ? "absolute inset-0 h-full w-full object-cover"
          : "aspect-[1672/941] h-auto w-full object-contain md:absolute md:inset-0 md:h-full md:object-cover"}
      />

      {/* Single Interactive Primary CTA Button at Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={
          coverImageUrl
            ? "relative z-10 flex w-full justify-start pr-28 pb-4 pl-4 sm:justify-center sm:px-4 sm:pb-7 md:pb-8"
            : "relative z-10 flex w-full justify-center px-4 py-4 md:pt-0 md:pb-8"
        }
      >
        <button
          type="button"
          onClick={onExplore}
          className="garden-btn-primary inline-flex items-center justify-center gap-2 sm:gap-2.5 px-5 sm:px-9 py-3 sm:py-4 rounded-2xl text-white font-display font-extrabold text-[13px] sm:text-base md:text-lg tracking-wide cursor-pointer whitespace-nowrap"
        >
          <span>KHÁM PHÁ BÁO TƯỜNG</span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" aria-hidden="true" />
        </button>
      </motion.div>
    </section>
  );
}
