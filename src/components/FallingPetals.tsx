import { useEffect, useMemo, useState } from 'react';
import { getFallingPetalCount } from '../lib/mamxanh';

interface FallingPetalsProps {
  enabled?: boolean;
}

interface PetalSpec {
  id: number;
  leftPercent: number;
  durationSec: number;
  delaySec: number;
  swayPx: number;
  sizePx: number;
  kind: 'pink_petal' | 'cream_petal' | 'yellow_petal' | 'sprout_leaf';
}

const KINDS: PetalSpec['kind'][] = [
  'pink_petal',
  'sprout_leaf',
  'cream_petal',
  'yellow_petal',
  'pink_petal',
  'sprout_leaf',
];

export function FallingPetals({ enabled = true }: FallingPetalsProps) {
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, []);

  const count = getFallingPetalCount(isMobile);

  const petals = useMemo<PetalSpec[]>(() => {
    return Array.from({ length: count }, (_, idx) => {
      // Deterministic pseudo-random spread across screen width and cycle timing
      const leftPercent = ((idx * 37 + 11) % 94) + 3;
      const durationSec = 10 + ((idx * 13) % 8);
      const delaySec = -((idx * 2.7) % 14);
      const swayPx = (idx % 2 === 0 ? 1 : -1) * (18 + ((idx * 7) % 26));
      const sizePx = isMobile ? 14 + (idx % 3) * 2 : 16 + (idx % 4) * 3;
      return {
        id: idx,
        leftPercent,
        durationSec,
        delaySec,
        swayPx,
        sizePx,
        kind: KINDS[idx % KINDS.length],
      };
    });
  }, [count, isMobile]);

  if (!enabled) return null;

  return (
    <div
      data-testid="falling-petals-layer"
      aria-hidden="true"
      className="falling-petals-layer fixed inset-0 pointer-events-none overflow-hidden z-20"
    >
      {petals.map((p) => (
        <span
          key={p.id}
          className="animate-petal-fall absolute -top-10"
          style={
            {
              left: `${p.leftPercent}%`,
              width: `${p.sizePx}px`,
              height: `${p.sizePx}px`,
              animationDuration: `${p.durationSec}s`,
              animationDelay: `${p.delaySec}s`,
              '--petal-sway': `${p.swayPx}px`,
            } as React.CSSProperties
          }
        >
          {p.kind === 'sprout_leaf' ? (
            <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-xs">
              <path
                d="M19 4C11 4 5 9 5 17C13 17 19 12 19 4Z"
                fill="#86EFAC"
                stroke="#4E9F3D"
                strokeWidth="1.2"
              />
              <path d="M6 16L17 6" stroke="#388E3C" strokeWidth="1" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-xs">
              <path
                d="M12 2C16.5 6 19 11 16.5 16.5C14.5 20.5 9.5 20.5 7.5 16.5C5 11 7.5 6 12 2Z"
                fill={
                  p.kind === 'pink_petal'
                    ? '#FBCFE8'
                    : p.kind === 'yellow_petal'
                    ? '#FEF08A'
                    : '#FFFBEB'
                }
                stroke={
                  p.kind === 'pink_petal'
                    ? '#F472B6'
                    : p.kind === 'yellow_petal'
                    ? '#FACC15'
                    : '#FDE68A'
                }
                strokeWidth="0.9"
              />
            </svg>
          )}
        </span>
      ))}
    </div>
  );
}
