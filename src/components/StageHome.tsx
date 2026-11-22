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
      className="flex w-full flex-col bg-[#E9F6DB] pt-14 select-none sm:pt-16"
    >
      <h1 className="sr-only">
        Mầm Xanh – Ươm yêu thương, Gặt tương lai – Báo tường điện tử chào mừng Ngày Nhà giáo Việt Nam 20/11 – Lớp 1/8 Trường Tiểu học Huỳnh Ngọc Huệ
      </h1>

      <img
        alt=""
        src={coverSrc}
        fetchPriority="high"
        width={coverImageUrl ? undefined : 1672}
        height={coverImageUrl ? undefined : 941}
        className="block h-auto w-full"
      />

      {/* Single Interactive Primary CTA Button at Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex w-full justify-center px-4 py-4"
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
