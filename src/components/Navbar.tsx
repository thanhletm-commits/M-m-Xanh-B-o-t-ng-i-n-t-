import { useState } from 'react';
import {
  BookOpen,
  Flower2,
  HelpCircle,
  Home,
  Images,
  Mail,
  Menu,
  Sun,
  X,
} from 'lucide-react';
import type { StageId } from '../types/mamxanh';

interface NavbarProps {
  currentStage: StageId;
  onSelectStage: (stage: StageId) => void;
}

const NAV_ITEMS: { id: StageId; label: string; icon: typeof Home; color: string }[] = [
  { id: 'home', label: 'Trang chủ', icon: Home, color: '#4E9F3D' },
  { id: 'stage1', label: 'Hạt mầm đầu tiên', icon: BookOpen, color: '#65B741' },
  { id: 'stage2', label: 'Vườn yêu thương', icon: Flower2, color: '#EC4899' },
  { id: 'stage3', label: 'Dưới tán xanh', icon: Images, color: '#0EA5E9' },
  { id: 'stage4', label: 'Người gieo mầm', icon: Mail, color: '#F59E0B' },
  { id: 'stage5', label: 'Đố vui 20/11', icon: HelpCircle, color: '#7C3AED' },
  { id: 'stage6', label: 'Vươn mình đón nắng', icon: Sun, color: '#EA580C' },
];

export function Navbar({ currentStage, onSelectStage }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, stageId: StageId) => {
    e.preventDefault();
    onSelectStage(stageId);
    setMobileOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full bg-[#FFFDF7]/92 backdrop-blur-md border-b border-[#DCEFD8] shadow-[0_4px_20px_-6px_rgba(43,110,36,0.12)]">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Logo + Brand + Slogan */}
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, 'home')}
          className="flex items-center gap-2 sm:gap-2.5 text-left whitespace-nowrap shrink-0 rounded-xl px-1 py-0.5 focus-visible:outline-2 focus-visible:outline-[#4E9F3D]"
          aria-label="Về trang chủ Mầm Xanh – Ươm yêu thương, Gặt tương lai"
        >
          <img
            src="/assets/logo-mam-xanh.png"
            alt="Logo Mầm Xanh"
            className="h-8 sm:h-10 w-auto object-contain shrink-0 drop-shadow-xs"
          />
          <div className="leading-none">
            <span className="block font-display font-black text-sm sm:text-base lg:text-lg tracking-tight text-[#2B6E24]">
              MẦM XANH
            </span>
            <span className="block text-[9.5px] sm:text-[10.5px] font-bold text-[#9A5B13] mt-0.5">
              Ươm yêu thương, Gặt tương lai
            </span>
          </div>
        </a>

        {/* Desktop Single-Row Horizontal Navigation (Home + 6 Stages) */}
        <nav
          aria-label="Điều hướng báo tường"
          className="hidden lg:flex items-center justify-end gap-1 xl:gap-1.5 min-w-0"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = currentStage === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                aria-current={active ? 'location' : undefined}
                className={`flex items-center gap-1.5 px-2 xl:px-3 py-1.5 sm:py-2 rounded-2xl text-[11.5px] xl:text-[13px] font-display font-extrabold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  active
                    ? 'bg-gradient-to-b from-[#E8F9E2] to-[#D6F2CD] text-[#1E561B] shadow-[0_2px_0_#9EDB8C] ring-1 ring-[#8ED47A]'
                    : 'text-[#3B513E] hover:bg-[#F1FAEE] hover:text-[#225E1D]'
                }`}
              >
                <Icon
                  className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0"
                  style={{ color: item.color }}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Mobile / Tablet Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
          aria-expanded={mobileOpen}
          className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#E8F7E3] border border-[#BFE6B6] text-[#256020] font-display font-extrabold text-xs shadow-xs hover:bg-[#D8F2D0] transition-colors cursor-pointer shrink-0"
        >
          {mobileOpen ? (
            <X className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Menu className="w-4 h-4" aria-hidden="true" />
          )}
          <span>Mục lục</span>
        </button>
      </div>

      {/* Mobile / Tablet Slide-down Anchor Menu */}
      {mobileOpen && (
        <nav
          aria-label="Menu các chặng trên điện thoại"
          className="lg:hidden border-t border-[#E2F0DF] bg-[#FFFDF7]/98 backdrop-blur-md px-3 py-3 grid grid-cols-2 sm:grid-cols-3 gap-2 shadow-lg"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = currentStage === item.id;
            const isLast = item.id === 'stage6';
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                aria-current={active ? 'location' : undefined}
                className={`flex items-center gap-2 px-2.5 py-2.5 rounded-xl text-[11.5px] sm:text-sm font-bold text-left transition-colors cursor-pointer ${
                  isLast ? 'col-span-2 sm:col-span-3' : ''
                } ${
                  active
                    ? 'bg-[#E5F7DF] text-[#225E1D] ring-1 ring-[#9EDB8C]'
                    : 'bg-white text-[#3F5342] border border-[#E6F2E3]'
                }`}
              >
                <span
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: active ? item.color : '#EAF6E6',
                    color: active ? '#FFFFFF' : item.color,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
                <span className="leading-tight">{item.label}</span>
              </a>
            );
          })}
        </nav>
      )}
    </header>
  );
}
