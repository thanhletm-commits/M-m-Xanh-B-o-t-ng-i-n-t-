import { adminPath, isStaticPages, publicAsset, siteHome } from './lib/site';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AdminPage } from './components/AdminPage';
import { FallingPetals } from './components/FallingPetals';
import { FloatingActions } from './components/FloatingActions';
import { MascotDialog } from './components/MascotDialog';
import { MusicPlayer } from './components/MusicPlayer';
import { Navbar } from './components/Navbar';
import { Stage1FirstSprout } from './components/Stage1FirstSprout';
import { Stage2LoveGarden } from './components/Stage2LoveGarden';
import { Stage3UnderCanopy } from './components/Stage3UnderCanopy';
import { Stage4SeedPlanters } from './components/Stage4SeedPlanters';
import { Stage5Quiz } from './components/Stage5Quiz';
import { Stage6Sunlight } from './components/Stage6Sunlight';
import { StageHome } from './components/StageHome';
import { WishModal } from './components/WishModal';
import { fetchPublicData } from './services/api';
import { isSupabaseConfigured } from './services/supabaseClient';
import type { PublicDataPayload, StageId } from './types/mamxanh';

const demoMode = isStaticPages && !isSupabaseConfigured();

const STAGE_ORDER: StageId[] = [
  'home',
  'stage1',
  'stage2',
  'stage3',
  'stage4',
  'stage5',
  'stage6',
];

function getInitialRoute(): { isAdmin: boolean; stage: StageId; hasDeepLink: boolean } {
  if (typeof window === 'undefined') {
    return { isAdmin: false, stage: 'home', hasDeepLink: false };
  }
  const path = window.location.pathname;
  const hash = window.location.hash;
  if (path === adminPath || path === adminPath + '/' || hash === '#admin') {
    return { isAdmin: true, stage: 'home', hasDeepLink: false };
  }
  const hashStage = hash.replace('#', '') as StageId;
  if (STAGE_ORDER.includes(hashStage)) {
    return { isAdmin: false, stage: hashStage, hasDeepLink: hashStage !== 'home' };
  }
  const params = new URLSearchParams(window.location.search);
  const stageParam = params.get('stage') as StageId | null;
  if (stageParam && STAGE_ORDER.includes(stageParam)) {
    return { isAdmin: false, stage: stageParam, hasDeepLink: stageParam !== 'home' };
  }
  return { isAdmin: false, stage: 'home', hasDeepLink: false };
}

export default function App() {
  const initial = getInitialRoute();
  const [isAdminRoute, setIsAdminRoute] = useState(initial.isAdmin);
  const [currentStage, setCurrentStage] = useState<StageId>(initial.stage);
  const [wishModalOpen, setWishModalOpen] = useState(false);
  const [data, setData] = useState<PublicDataPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialScrollPendingRef = useRef<StageId | null>(
    initial.hasDeepLink ? initial.stage : null
  );
  const manualScrollLockUntilRef = useRef<number>(0);

  const [musicEnabled, setMusicEnabled] = useState(() =>
    typeof window === 'undefined' || sessionStorage.getItem('mamxanh_music_enabled') !== '0'
  );
  const [isLetterPlaying, setIsLetterPlaying] = useState(false);
  const [volume, setVolume] = useState<number>(() => {
    if (typeof window === 'undefined') return 0.3;
    const saved = sessionStorage.getItem('mamxanh_music_volume');
    return saved ? Number(saved) : 0.3;
  });

  const loadPublic = useCallback(async () => {
    try {
      const payload = await fetchPublicData();
      setData(payload);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Không thể tải dữ liệu báo tường Mầm Xanh.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPublic();
  }, [loadPublic]);

  const scrollToStage = useCallback((stage: StageId, instant = false) => {
    setIsAdminRoute(false);
    setCurrentStage(stage);
    manualScrollLockUntilRef.current = Date.now() + (instant ? 150 : 800);

    if (getInitialRoute().isAdmin) {
      window.history.pushState({}, '', stage === 'home' ? siteHome : siteHome + '#' + stage);
    } else {
      const targetHash = stage === 'home' ? '' : `#${stage}`;
      if (window.location.hash !== targetHash) {
        window.history.replaceState(
          {},
          '',
          targetHash || window.location.pathname + window.location.search
        );
      }
    }

    const behavior: ScrollBehavior = instant ? 'auto' : 'smooth';
    if (stage === 'home') {
      window.scrollTo({ top: 0, behavior });
      return;
    }
    const targetEl = document.getElementById(stage);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior, block: 'start' });
    }
  }, []);

  // Handle initial deep link (?stage=stageN or #stageN) after data renders
  useEffect(() => {
    if (!loading && data && !isAdminRoute && initialScrollPendingRef.current) {
      const target = initialScrollPendingRef.current;
      initialScrollPendingRef.current = null;
      requestAnimationFrame(() => {
        scrollToStage(target, true);
      });
    }
  }, [loading, data, isAdminRoute, scrollToStage]);

  // Listen to browser back/forward navigation
  useEffect(() => {
    const onPopState = () => {
      const route = getInitialRoute();
      setIsAdminRoute(route.isAdmin);
      if (!route.isAdmin) {
        requestAnimationFrame(() => scrollToStage(route.stage, true));
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [scrollToStage]);

  // Scroll-spy: update active nav item and Bé Mầm Xanh dialogue while scrolling
  useEffect(() => {
    if (isAdminRoute || loading || !data) return;

    let rafId = 0;
    const updateActiveOnScroll = () => {
      rafId = 0;
      if (Date.now() < manualScrollLockUntilRef.current) return;

      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40;
      if (atBottom) {
        setCurrentStage((prev) => (prev === 'stage6' ? prev : 'stage6'));
        return;
      }

      const anchorThreshold = 150;
      let detected: StageId = 'home';
      for (const id of STAGE_ORDER) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= anchorThreshold) {
          detected = id;
        }
      }
      setCurrentStage((prev) => (prev === detected ? prev : detected));
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(updateActiveOnScroll);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateActiveOnScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [isAdminRoute, loading, data]);

  const handleToggleMusic = () => {
    const enabled = !musicEnabled;
    setMusicEnabled(enabled);
    sessionStorage.setItem('mamxanh_music_enabled', enabled ? '1' : '0');
  };

  const handleTeacherAudioStart = useCallback(() => setIsLetterPlaying(true), []);
  const handleTeacherAudioStop = useCallback(() => setIsLetterPlaying(false), []);

  const handleVolumeChange = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolume(clamped);
    sessionStorage.setItem('mamxanh_music_volume', String(clamped));
  };

  if (isAdminRoute) {
    return (
      <AdminPage
        onBackToSite={() => scrollToStage('home', true)}
        onDataUpdated={() => void loadPublic()}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex flex-col items-center justify-center p-6 text-center">
        <img
          src={publicAsset('/assets/be-mam-xanh.png')}
          alt="Bé Mầm Xanh"
          className="w-28 h-28 object-contain animate-bounce mb-4"
        />
        <p className="font-display font-extrabold text-lg text-[#256D1B]">
          Đang mở khu vườn Mầm Xanh lớp 1/8...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex flex-col items-center justify-center p-6 text-center">
        <p className="font-bold text-red-700 mb-3">{error || 'Không có dữ liệu.'}</p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void loadPublic();
          }}
          className="garden-btn-primary px-5 py-2.5 rounded-xl text-white font-bold cursor-pointer"
        >
          Tải lại trang
        </button>
      </div>
    );
  }

  const currentDialogue =
    data.settings.dialogues[currentStage] || data.settings.dialogues.home;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7] text-[#263827]">
      <FallingPetals enabled={data.settings.fallingPetalsEnabled !== false} />

      <MusicPlayer
        musicUrl={data.settings.musicUrl}
        musicTitle={data.settings.musicTitle}
        isPlaying={musicEnabled && !isLetterPlaying}
        volume={volume}
      />

      <Navbar
        currentStage={currentStage}
        onSelectStage={(stage) => scrollToStage(stage)}
      />

      <main className="flex-1">
        <StageHome
          coverImageUrl={data.settings.coverImageUrl}
          onExplore={() => scrollToStage('stage1')}
        />

        <Stage1FirstSprout
          settings={data.settings}
          onPrev={() => scrollToStage('home')}
          onNext={() => scrollToStage('stage2')}
        />

        <Stage2LoveGarden
          students={data.students}
          products={data.products}
          onPrev={() => scrollToStage('stage1')}
          onNext={() => scrollToStage('stage3')}
        />

        <Stage3UnderCanopy
          memories={data.memories}
          onPrev={() => scrollToStage('stage2')}
          onNext={() => scrollToStage('stage4')}
        />

        <Stage4SeedPlanters
          teachers={data.teachers}
          approvedMessages={data.approvedMessages}
          onOpenWishModal={demoMode ? undefined : () => setWishModalOpen(true)}
          onTeacherAudioStart={handleTeacherAudioStart}
          onTeacherAudioStop={handleTeacherAudioStop}
          onPrev={() => scrollToStage('stage3')}
          onNext={() => scrollToStage('stage5')}
        />

        <Stage5Quiz
          onPrev={() => scrollToStage('stage4')}
          onNext={() => scrollToStage('stage6')}
        />

        <Stage6Sunlight
          settings={data.settings}
          onPrev={() => scrollToStage('stage5')}
          onHome={() => scrollToStage('home')}
        />
      </main>

      <footer className="border-t border-[#E3EFE0] bg-[#FAFDF8] py-5 px-4 pl-20 sm:pl-24 pb-28 sm:pb-6 sm:pr-56 text-center text-xs text-[#59715A]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold">
            Báo tường điện tử Mầm Xanh · Tập thể lớp 1/8 – Trường Tiểu học Huỳnh Ngọc Huệ
          </p>
          {data.isPreview && <p>Nội dung minh họa</p>}
          <a
            href={isStaticPages ? adminPath + '/' : adminPath}
            className="text-xs font-semibold text-[#5C795D] underline-offset-4 hover:text-[#235F1E] hover:underline sm:ml-auto"
          >
            Dành cho giáo viên quản trị
          </a>
        </div>
      </footer>

      <MascotDialog dialogue={currentDialogue} stageKey={currentStage} />

      <FloatingActions
        onOpenWishModal={demoMode ? undefined : () => setWishModalOpen(true)}
        isPlaying={musicEnabled}
        volume={volume}
        musicTitle={data.settings.musicTitle}
        onToggleMusic={handleToggleMusic}
        onVolumeChange={handleVolumeChange}
      />

      <WishModal open={wishModalOpen} onClose={() => setWishModalOpen(false)} />
    </div>
  );
}
