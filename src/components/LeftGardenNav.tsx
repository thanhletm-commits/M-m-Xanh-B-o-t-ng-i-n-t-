import { useState } from 'react';
import {
  Camera,
  Compass,
  Flower2,
  Mail,
  Sprout,
  Sun,
  X,
} from 'lucide-react';
import type { StageId } from '../types/mamxanh';

interface LeftGardenNavProps {
  currentStage: StageId;
  onSelectStage: (stage: StageId) => void;
}

interface SignItem {
  id: StageId;
  order: number;
  label: string;
  accentBg: string;
  accentFg: string;
  renderBadge: (active: boolean) => React.ReactNode;
}

const GARDEN_SIGNS: SignItem[] = [
  {
    id: 'stage1',
    order: 1,
    label: 'Hạt mầm đầu tiên',
    accentBg: '#DCFCE7',
    accentFg: '#16A34A',
    renderBadge: (active) => (
      <Sprout className={`w-4 h-4 ${active ? 'text-white' : 'text-[#16A34A]'}`} aria-hidden="true" />
    ),
  },
  {
    id: 'stage2',
    order: 2,
    label: 'Vườn yêu thương',
    accentBg: '#FCE7F3',
    accentFg: '#DB2777',
    renderBadge: (active) => (
      <Flower2 className={`w-4 h-4 ${active ? 'text-white' : 'text-[#DB2777]'}`} aria-hidden="true" />
    ),
  },
  {
    id: 'stage3',
    order: 3,
    label: 'Dưới tán xanh',
    accentBg: '#E0F2FE',
    accentFg: '#0284C7',
    renderBadge: (active) => (
      <Camera className={`w-4 h-4 ${active ? 'text-white' : 'text-[#0284C7]'}`} aria-hidden="true" />
    ),
  },
  {
    id: 'stage4',
    order: 4,
    label: 'Người gieo mầm',
    accentBg: '#FEF3C7',
    accentFg: '#D97706',
    renderBadge: (active) => (
      <Mail className={`w-4 h-4 ${active ? 'text-white' : 'text-[#D97706]'}`} aria-hidden="true" />
    ),
  },
  {
    id: 'stage5',
    order: 5,
    label: 'Đố vui 20/11',
    accentBg: '#EDE9FE',
    accentFg: '#7C3AED',
    renderBadge: () => (
      <img
        src="/assets/aistudio/ef58baab-f5f3-4419-8132-ede530e27a38_e9890800.png"
        alt=""
        aria-hidden="true"
        className="w-5 h-5 object-contain"
      />
    ),
  },
  {
    id: 'stage6',
    order: 6,
    label: 'Vươn mình đón nắng',
    accentBg: '#FFEDD5',
    accentFg: '#EA580C',
    renderBadge: (active) => (
      <Sun className={`w-4 h-4 ${active ? 'text-white' : 'text-[#EA580C]'}`} aria-hidden="true" />
    ),
  },
];

export function LeftGardenNav({ currentStage, onSelectStage }: LeftGardenNavProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (currentStage === 'home') {
    return null;
  }

  const handleClick = (stageId: StageId) => {
    onSelectStage(stageId);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Desktop Vertical Garden Wooden Signpost (non-overlapping in xl left margin) */}
      <aside
        aria-label="Bảng chỉ dẫn 6 chặng khu vườn Mầm Xanh"
        className="hidden xl:flex fixed left-2.5 top-20 z-25 w-[204px] flex-col items-stretch select-none"
      >
        <div className="relative rounded-[24px] bg-gradient-to-b from-[#FFFDF6] to-[#F7EED8] border-2 border-[#DFC69D] shadow-[0_14px_30px_-10px_rgba(107,74,34,0.25)] p-2">
          {/* Wooden post top sprout decoration */}
          <div className="flex items-center gap-1.5 px-1.5 pb-2 mb-2 border-b border-[#EAD9BC]">
            <span className="w-5 h-5 rounded-lg bg-[#4E9F3D] text-white flex items-center justify-center shadow-xs shrink-0">
              <Sprout className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
            <span className="font-display font-extrabold text-[11px] uppercase tracking-wider text-[#6D471B]">
              Lối vào khu vườn
            </span>
          </div>

          <nav className="relative flex flex-col gap-1.5 pl-2">
            {/* Vertical wooden spine */}
            <span
              className="absolute left-0 top-2 bottom-2 w-1.5 rounded-full bg-gradient-to-b from-[#B98650] to-[#8C5F32]"
              aria-hidden="true"
            />
            {GARDEN_SIGNS.map((item) => {
              const active = currentStage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleClick(item.id)}
                  aria-current={active ? 'location' : undefined}
                  className={`group relative flex items-center gap-2 px-2 py-1.5 rounded-xl text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-[#5AB144] to-[#4E9F3D] text-white shadow-md translate-x-0.5'
                      : 'bg-[#FFFBF0] hover:bg-[#EEF9E8] text-[#4C3419] border border-[#E7D3B0]'
                  }`}
                >
                  <span
                    className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: active ? 'rgba(255,255,255,0.22)' : item.accentBg,
                    }}
                  >
                    {item.renderBadge(active)}
                  </span>
                  <span className="min-w-0 leading-tight">
                    <span
                      className={`block text-[9.5px] font-bold uppercase tracking-wider ${
                        active ? 'text-[#DCFCE7]' : 'text-[#9A6B39]'
                      }`}
                    >
                      Chặng {item.order}
                    </span>
                    <span className="block text-[11px] font-extrabold whitespace-nowrap">
                      {item.label}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile / Tablet Expandable Garden Signpost Floating Button */}
      <div className="xl:hidden fixed bottom-3 right-3 z-30 flex flex-col items-end gap-2">
        {drawerOpen && (
          <nav
            aria-label="Menu chỉ dẫn 6 chặng"
            className="w-64 rounded-[24px] bg-[#FFFDF6] border-2 border-[#D9C096] shadow-2xl p-3 space-y-1.5"
          >
            <div className="flex items-center justify-between px-1.5 pb-1.5 border-b border-[#EDE0C6]">
              <span className="font-display font-extrabold text-xs uppercase tracking-wider text-[#6D471B]">
                Chỉ dẫn 6 chặng
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Đóng bảng chỉ dẫn"
                className="p-1 rounded-lg text-[#6D471B] hover:bg-[#F5EBD6] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {GARDEN_SIGNS.map((item) => {
              const active = currentStage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleClick(item.id)}
                  aria-current={active ? 'location' : undefined}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#4E9F3D] text-white'
                      : 'bg-white text-[#463118] border border-[#EADBC0] hover:bg-[#F1FAEE]'
                  }`}
                >
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: active ? 'rgba(255,255,255,0.22)' : item.accentBg,
                    }}
                  >
                    {item.renderBadge(active)}
                  </span>
                  <span className="text-xs font-extrabold truncate">
                    {item.order}. {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        )}

        <button
          type="button"
          onClick={() => setDrawerOpen((v) => !v)}
          aria-expanded={drawerOpen}
          aria-label="Mở bảng chỉ dẫn 6 chặng khu vườn"
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#FFFDF6] border-2 border-[#D4B788] text-[#5C3D1A] shadow-lg font-display font-extrabold text-xs cursor-pointer hover:bg-[#FEF8E8]"
        >
          <Compass className="w-4 h-4 text-[#4E9F3D]" aria-hidden="true" />
          <span>6 Chặng</span>
        </button>
      </div>
    </>
  );
}
