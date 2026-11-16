import { useState } from 'react';
import { Volume2, X } from 'lucide-react';
import { MusicLeafIcon } from './MusicPlayer';

interface FloatingActionsProps {
  onOpenWishModal: () => void;
  isPlaying: boolean;
  volume: number;
  musicTitle: string;
  onToggleMusic: () => void;
  onVolumeChange: (val: number) => void;
}

function Heart3DIcon() {
  return (
    <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0 drop-shadow-xs" aria-hidden="true">
      <defs>
        <linearGradient id="fabHeartGrad" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#FFF5F7" />
          <stop offset="45%" stopColor="#FFE4EC" />
          <stop offset="100%" stopColor="#FBCFE8" />
        </linearGradient>
      </defs>
      <path
        d="M16 28.2 C16 28.2 4 20.6 4 11.4 C4 7.3 7.1 4.2 10.9 4.2 C13.2 4.2 15.1 5.4 16 7.1 C16.9 5.4 18.8 4.2 21.1 4.2 C24.9 4.2 28 7.3 28 11.4 C28 20.6 16 28.2 16 28.2 Z"
        fill="url(#fabHeartGrad)"
        stroke="#FFFFFF"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <ellipse
        cx="11.2"
        cy="10"
        rx="2.3"
        ry="1.25"
        transform="rotate(-28 11.2 10)"
        fill="rgba(255,255,255,0.85)"
      />
    </svg>
  );
}

export function FloatingActions({
  onOpenWishModal,
  isPlaying,
  volume,
  musicTitle,
  onToggleMusic,
  onVolumeChange,
}: FloatingActionsProps) {
  const [volumeOpen, setVolumeOpen] = useState(false);

  return (
    <div
      aria-label="Công cụ nhanh góc dưới bên phải"
      className="fixed right-3.5 sm:right-6 bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:bottom-6 z-40 flex flex-col items-end gap-2.5 sm:gap-3 pointer-events-none"
    >
      {volumeOpen && (
        <div
          role="dialog"
          aria-label="Điều chỉnh âm lượng nhạc nền"
          className="pointer-events-auto absolute bottom-full right-0 mb-2.5 sm:bottom-0 sm:right-full sm:mb-0 sm:mr-3 w-64 p-4 rounded-2xl bg-[#FFFDF8]/98 backdrop-blur-md border-2 border-[#D2ECCB] shadow-2xl z-50"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-extrabold text-[#2B6E24] truncate">
              {musicTitle}
            </span>
            <button
              type="button"
              onClick={() => setVolumeOpen(false)}
              aria-label="Đóng bảng âm lượng"
              className="text-[#5F7462] hover:text-[#1F3A22] p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <label className="block text-xs font-semibold text-[#546A57] mb-1.5">
            Âm lượng:{' '}
            <span className="font-extrabold text-[#215A1C] tabular-nums">
              {Math.round(volume * 100)}%
            </span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
            aria-label="Thanh điều chỉnh âm lượng"
            className="w-full accent-[#4E9F3D] cursor-pointer"
          />
        </div>
      )}

      {/* Top Button: GỬI LỜI TRI ÂN (Peach-Pink 3D) */}
      <button
        type="button"
        onClick={onOpenWishModal}
        title="Gửi lời tri ân đến thầy cô"
        aria-label="Gửi lời tri ân"
        className="pointer-events-auto inline-flex items-center justify-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-b from-[#FF7A9E] via-[#F45B84] to-[#E11D48] text-white border border-white/45 shadow-[0_4px_0_#9F1239,0_12px_24px_-6px_rgba(225,29,72,0.42)] hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0.5 transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#9F1239]"
      >
        <Heart3DIcon />
        <span className="hidden sm:inline font-display font-extrabold text-xs md:text-sm tracking-wide whitespace-nowrap">
          GỬI LỜI TRI ÂN
        </span>
      </button>

      {/* Bottom Button: NHẠC NỀN + Expandable Volume Control */}
      <div className="pointer-events-auto relative flex flex-col items-end">

        <div
          className={`flex items-center rounded-2xl border-2 overflow-hidden transition-all duration-150 ${
            isPlaying
              ? 'bg-[#FEF9C3] border-[#FACC15] shadow-[0_4px_0_#CA8A04,0_10px_22px_-6px_rgba(202,138,4,0.32)]'
              : 'bg-[#FFFDF8]/95 backdrop-blur-md border-[#BEE3B5] shadow-[0_4px_0_#76B865,0_10px_22px_-6px_rgba(34,94,29,0.22)]'
          }`}
        >
          <button
            type="button"
            onClick={onToggleMusic}
            title={isPlaying ? 'Nhạc nền đang bật — Nhấn để tắt' : 'Nhạc nền đang tắt — Nhấn để bật'}
            aria-label={isPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
            aria-pressed={isPlaying}
            className={`flex items-center gap-2 px-3 py-2.5 sm:px-3.5 sm:py-2.5 font-display font-extrabold text-xs md:text-sm whitespace-nowrap transition-colors cursor-pointer ${
              isPlaying
                ? 'text-[#713F12] hover:bg-[#FEF08A]/70'
                : 'text-[#255F1F] hover:bg-[#EEF9EA]'
            }`}
          >
            <MusicLeafIcon active={isPlaying} />
            <span className="hidden sm:inline">
              {isPlaying ? 'NHẠC: BẬT' : 'NHẠC NỀN'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setVolumeOpen((v) => !v)}
            title="Điều chỉnh âm lượng nhạc nền"
            aria-label="Điều chỉnh âm lượng nhạc nền"
            aria-expanded={volumeOpen}
            className={`px-2.5 py-2.5 sm:px-3 sm:py-3 border-l transition-colors cursor-pointer ${
              isPlaying
                ? 'border-[#FDE047] text-[#713F12] hover:bg-[#FEF08A]/70'
                : 'border-[#DCEFD7] text-[#356330] hover:bg-[#EEF9EA]'
            }`}
          >
            <Volume2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
