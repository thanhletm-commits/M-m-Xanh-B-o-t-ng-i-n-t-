import type { SproutVariantId } from '../types/mamxanh';

interface SproutCharacterProps {
  name: string;
  variant: SproutVariantId;
  avatarUrl: string | null;
  orderNumber: number;
  isDemo?: boolean;
}

const BODY_PALETTES: Record<
  SproutVariantId,
  { leaf: string; leafDark: string; accent: string; pot: string }
> = {
  flower_sunny: { leaf: '#74C947', leafDark: '#4E9F3D', accent: '#FBBF24', pot: '#FDE68A' },
  book_buddy: { leaf: '#65B741', leafDark: '#3E8E2F', accent: '#38BDF8', pot: '#E0F2FE' },
  artist_brush: { leaf: '#82D153', leafDark: '#52A32F', accent: '#FB7185', pot: '#FFE4E6' },
  music_note: { leaf: '#6BCF7F', leafDark: '#349B52', accent: '#A855F7', pot: '#F3E8FF' },
  sport_ball: { leaf: '#5BB318', leafDark: '#3D7E0F', accent: '#F97316', pot: '#FFEDD5' },
  star_origami: { leaf: '#7ED957', leafDark: '#4B9E2D', accent: '#EAB308', pot: '#FEF9C3' },
  watering_can: { leaf: '#4ADE80', leafDark: '#16A34A', accent: '#0EA5E9', pot: '#DCFCE7' },
  peach_ribbon: { leaf: '#84CC16', leafDark: '#4D7C0F', accent: '#F472B6', pot: '#FCE7F3' },
  backpack_explorer: { leaf: '#72C43E', leafDark: '#428A1C', accent: '#F59E0B', pot: '#FEF3C7' },
  dew_leaf: { leaf: '#34D399', leafDark: '#059669', accent: '#7DD3FC', pot: '#ECFDF5' },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function SproutCharacter({
  name,
  variant,
  avatarUrl,
  orderNumber,
  isDemo,
}: SproutCharacterProps) {
  const colors = BODY_PALETTES[variant] || BODY_PALETTES.flower_sunny;

  return (
    <div className="relative w-32 h-40 mx-auto select-none">
      {/* 3D Glossy Cartoon Sprout Body + Unique Accessory SVG */}
      <svg viewBox="0 0 140 175" className="w-full h-full drop-shadow-[0_8px_12px_rgba(45,96,35,0.16)]" aria-hidden="true">
        <defs>
          <radialGradient id={`leafGrad-${variant}-${orderNumber}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#B9F68E" />
            <stop offset="55%" stopColor={colors.leaf} />
            <stop offset="100%" stopColor={colors.leafDark} />
          </radialGradient>
          <linearGradient id={`tunicGrad-${variant}-${orderNumber}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.leaf} />
            <stop offset="100%" stopColor={colors.leafDark} />
          </linearGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="70" cy="164" rx="34" ry="7" fill="rgba(45,96,35,0.16)" />

        {/* Two top sprout leaves */}
        <path
          d="M70 30 C64 10, 32 4, 24 22 C35 34, 58 36, 70 30 Z"
          fill={`url(#leafGrad-${variant}-${orderNumber})`}
          stroke={colors.leafDark}
          strokeWidth="1.5"
        />
        <path
          d="M70 30 C76 10, 108 4, 116 22 C105 34, 82 36, 70 30 Z"
          fill={`url(#leafGrad-${variant}-${orderNumber})`}
          stroke={colors.leafDark}
          strokeWidth="1.5"
        />
        {/* Leaf stem */}
        <path d="M70 28 V42" stroke={colors.leafDark} strokeWidth="5" strokeLinecap="round" />

        {/* Variant-specific head/side accessories */}
        {variant === 'flower_sunny' && (
          <g transform="translate(32, 34)">
            <circle cx="0" cy="-7" r="5" fill="#FDE047" />
            <circle cx="7" cy="-2" r="5" fill="#FDE047" />
            <circle cx="4" cy="6" r="5" fill="#FDE047" />
            <circle cx="-4" cy="6" r="5" fill="#FDE047" />
            <circle cx="-7" cy="-2" r="5" fill="#FDE047" />
            <circle cx="0" cy="0" r="4" fill="#FFFBEB" />
          </g>
        )}
        {variant === 'peach_ribbon' && (
          <g transform="translate(102, 38) rotate(12)">
            <path d="M0 0 L-12 -7 L-10 7 Z" fill="#FB7185" />
            <path d="M0 0 L12 -7 L10 7 Z" fill="#F43F5E" />
            <circle cx="0" cy="0" r="3.8" fill="#FFE4E6" />
          </g>
        )}
        {variant === 'star_origami' && (
          <polygon
            points="106,24 109,32 118,32 111,37 113,45 106,40 99,45 101,37 94,32 103,32"
            fill="#FACC15"
            stroke="#CA8A04"
            strokeWidth="1.2"
          />
        )}
        {variant === 'dew_leaf' && (
          <ellipse cx="97" cy="18" rx="5" ry="3.5" fill="#E0F2FE" stroke="#7DD3FC" strokeWidth="1" />
        )}

        {/* Green Hood Frame around real portrait */}
        <circle
          cx="70"
          cy="74"
          r="38"
          fill={`url(#leafGrad-${variant}-${orderNumber})`}
          stroke={colors.leafDark}
          strokeWidth="2"
        />

        {/* Cute Legs & Shoes */}
        <rect x="52" y="138" width="11" height="18" rx="5" fill={colors.leaf} />
        <rect x="77" y="138" width="11" height="18" rx="5" fill={colors.leaf} />
        <ellipse cx="56" cy="158" rx="11" ry="6.5" fill={colors.leafDark} />
        <ellipse cx="84" cy="158" rx="11" ry="6.5" fill={colors.leafDark} />
        <circle cx="56" cy="155" r="3" fill="#FFFFFF" />
        <circle cx="84" cy="155" r="3" fill="#FFFFFF" />

        {/* Sprout Leaf Tunic Body */}
        <path
          d="M42 105 C40 138, 52 146, 70 146 C88 146, 100 138, 98 105 Z"
          fill={`url(#tunicGrad-${variant}-${orderNumber})`}
          stroke={colors.leafDark}
          strokeWidth="1.6"
        />

        {/* Little Waving Arms */}
        <path d="M43 114 C30 110, 24 122, 34 129" stroke={colors.leaf} strokeWidth="9" strokeLinecap="round" fill="none" />
        <path d="M97 114 C112 102, 118 112, 110 123" stroke={colors.leaf} strokeWidth="9" strokeLinecap="round" fill="none" />

        {/* Chest Heart Emblem */}
        <path
          d="M70 131 C60 125, 60 116, 66 116 C69 116, 70 118, 70 118 C70 118, 71 116, 74 116 C80 116, 80 125, 70 131 Z"
          fill="#FFFDF2"
        />

        {/* Hand-held props for distinct variants */}
        {variant === 'book_buddy' && (
          <g transform="translate(96, 115) rotate(-10)">
            <rect x="0" y="0" width="22" height="17" rx="3" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.4" />
            <line x1="11" y1="2" x2="11" y2="15" stroke="#E0F2FE" strokeWidth="1.5" />
          </g>
        )}
        {variant === 'artist_brush' && (
          <g transform="translate(103, 100) rotate(25)">
            <rect x="0" y="10" width="5" height="24" rx="2" fill="#F59E0B" />
            <path d="M0 10 C0 2, 5 2, 5 10 Z" fill="#FB7185" />
          </g>
        )}
        {variant === 'music_note' && (
          <g transform="translate(106, 94)">
            <path d="M4 18 V3 L15 0 V14" fill="none" stroke="#A855F7" strokeWidth="3" strokeLinecap="round" />
            <circle cx="2" cy="19" r="4" fill="#A855F7" />
            <circle cx="13" cy="15" r="3.5" fill="#A855F7" />
          </g>
        )}
        {variant === 'sport_ball' && (
          <g transform="translate(108, 134)">
            <circle cx="0" cy="0" r="11" fill="#FFFFFF" stroke="#EA580C" strokeWidth="2" />
            <polygon points="0,-5 5,-1 3,5 -3,5 -5,-1" fill="#F97316" />
          </g>
        )}
        {variant === 'watering_can' && (
          <g transform="translate(98, 118)">
            <rect x="0" y="4" width="18" height="14" rx="4" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.3" />
            <path d="M18 11 L26 5" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}
        {variant === 'backpack_explorer' && (
          <g transform="translate(22, 108)">
            <rect x="0" y="0" width="16" height="24" rx="6" fill="#F59E0B" stroke="#B45309" strokeWidth="1.4" />
            <rect x="4" y="6" width="8" height="5" rx="2" fill="#FEF3C7" />
          </g>
        )}
      </svg>

      {/* Circular Real Student Portrait Frame centered inside the hood */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-[29px] w-[62px] h-[62px] rounded-full overflow-hidden border-[3px] border-[#FFFDF7] shadow-inner flex items-center justify-center"
        style={{ backgroundColor: colors.pot }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`Ảnh chân dung học sinh ${name}`}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#2B5924]">
            <span className="font-display font-extrabold text-base leading-none">
              {getInitials(name)}
            </span>
            <span className="text-[9px] font-bold opacity-75 mt-0.5 tabular-nums">
              #{orderNumber}
            </span>
          </div>
        )}
      </div>

      {isDemo && !avatarUrl && (
        <span
          className="absolute top-0.5 right-1 text-[9px] font-bold tracking-wider text-[#557B50]"
          title="Chưa tải ảnh thật - đang hiển thị mẫu DEMO"
        >
          DEMO
        </span>
      )}
    </div>
  );
}
