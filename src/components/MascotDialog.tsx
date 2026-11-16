import { useState } from 'react';
import {
  Camera,
  ChevronDown,
  Heart,
  Megaphone,
  MessageCircle,
  Sparkles,
  Sun,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { StageId } from '../types/mamxanh';

interface MascotDialogProps {
  dialogue: string;
  stageKey: StageId;
}

function getStagePoseBadge(stageKey: StageId) {
  switch (stageKey) {
    case 'stage2':
    case 'stage4':
      return {
        icon: Heart,
        bg: 'bg-[#FB7185]',
        label: 'Cầm trái tim tri ân',
      };
    case 'stage3':
      return {
        icon: Camera,
        bg: 'bg-[#0EA5E9]',
        label: 'Ngắm kỷ niệm',
      };
    case 'stage5':
      return {
        icon: Megaphone,
        bg: 'bg-[#F59E0B]',
        label: 'Cầm loa cổ vũ đố vui',
      };
    case 'stage6':
      return {
        icon: Sun,
        bg: 'bg-[#EA580C]',
        label: 'Vẫy tay đón nắng',
      };
    default:
      return {
        icon: Sparkles,
        bg: 'bg-[#4E9F3D]',
        label: 'Vẫy tay chào bạn',
      };
  }
}

export function MascotDialog({ dialogue, stageKey }: MascotDialogProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (stageKey === 'home') {
    return null;
  }

  const pose = getStagePoseBadge(stageKey);
  const PoseIcon = pose.icon;

  return (
    <div
      className="fixed bottom-3 left-3 sm:bottom-4 sm:left-3 z-30 flex items-end gap-2 max-w-[calc(100vw-88px)] sm:max-w-md pointer-events-none"
      aria-live="polite"
    >
      {/* Bé Mầm Xanh Mascot with stage-responsive action badge */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? 'Mở lời thoại Bé Mầm Xanh' : 'Thu gọn lời thoại Bé Mầm Xanh'}
        title={pose.label}
        className="pointer-events-auto relative shrink-0 group cursor-pointer focus-visible:outline-2 focus-visible:outline-[#4E9F3D] rounded-full"
      >
        <img
          src="/assets/be-mam-xanh.png"
          alt="Bé Mầm Xanh"
          className="w-14 h-18 sm:w-20 sm:h-24 object-contain drop-shadow-[0_10px_14px_rgba(46,98,37,0.22)] transition-transform duration-200 group-hover:scale-105"
        />
        <span
          className={`absolute -bottom-0.5 right-0 w-6 h-6 rounded-full ${pose.bg} text-white border-2 border-white flex items-center justify-center shadow-sm`}
          aria-hidden="true"
        >
          <PoseIcon className="w-3 h-3" />
        </span>
        {collapsed && (
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#FBBF24] text-[#4A2C00] flex items-center justify-center shadow-md">
            <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        )}
      </button>

      {/* Rounded White Speech Bubble */}
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.div
            key={stageKey + dialogue}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto relative mb-4 sm:mb-7 bg-white/96 backdrop-blur-sm rounded-[20px] px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-[0_12px_30px_-6px_rgba(52,85,43,0.22)] border border-[#E5F2E0] max-w-[205px] sm:max-w-[260px]"
          >
            <div
              className="absolute -left-2 bottom-4 w-3.5 h-3.5 bg-white border-l border-b border-[#E5F2E0] rotate-45"
              aria-hidden="true"
            />
            <div className="relative flex items-start justify-between gap-1.5">
              <p className="text-[11.5px] sm:text-[13px] leading-snug font-semibold text-[#3B264B]">
                {dialogue}
              </p>
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                aria-label="Thu gọn hộp thoại Bé Mầm Xanh"
                className="shrink-0 p-1 -mr-1 -mt-1 rounded-lg text-[#7A6B86] hover:text-[#3B264B] hover:bg-[#F4F8F2] transition-colors cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
