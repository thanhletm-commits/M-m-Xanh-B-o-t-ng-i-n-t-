import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface StageHomeProps {
  coverImageUrl?: string | null;
  onExplore: () => void;
}

export function StageHome({ coverImageUrl, onExplore }: StageHomeProps) {
  const desktopCoverSrc = coverImageUrl || '/assets/cover-mam-xanh.jpg';
  const mobileCoverSrc = coverImageUrl || '/assets/cover-mam-xanh-mobile.jpg';

  return (
    <section
      id="home"
      aria-label="Trang chủ – Bìa báo Mầm Xanh"
      className="relative w-full min-h-[100svh] flex items-end justify-center overflow-hidden select-none"
    >
      <h1 className="sr-only">
        Mầm Xanh – Ươm yêu thương, Gặt tương lai – Báo tường điện tử chào mừng Ngày Nhà giáo Việt Nam 20/11 – Lớp 1/8 Trường Tiểu học Huỳnh Ngọc Huệ
      </h1>

      {/* Desktop / Tablet Full-Screen Cover Background */}
      <div
        aria-hidden="true"
        className="hidden md:block absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${desktopCoverSrc}")` }}
      />

      {/* Mobile Full-Screen Cover Background */}
      <div
        aria-hidden="true"
        className="md:hidden absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${mobileCoverSrc}")` }}
      />

      {/* Single Interactive Primary CTA Button at Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 pb-4 sm:pb-7 md:pb-8 pl-4 pr-28 sm:px-4 flex justify-start sm:justify-center w-full"
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
