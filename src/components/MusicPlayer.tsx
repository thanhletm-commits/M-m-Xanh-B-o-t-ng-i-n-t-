import { useEffect, useRef } from 'react';

interface MusicPlayerProps {
  musicUrl: string | null;
  musicTitle: string;
  isPlaying: boolean;
  volume: number; // 0 to 1
  onPlaybackBlocked?: () => void;
}

/**
 * Warm lyrical piano ballad synthesizer ("Người gieo mầm xanh" instrumental).
 * Plays gentle left-hand broken-chord arpeggios and a singing right-hand piano
 * melody with soft acoustic-style harmonics and sustain decay, looping seamlessly.
 * Automatically yields to a custom <audio> MP3 whenever musicUrl is provided.
 */
class WarmPianoSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private lowpass: BiquadFilterNode | null = null;
  private timer: number | null = null;
  private step = 0;
  private currentVolume = 0.3;

  // 8-bar lyrical C-major / F-major / Am / G progression (16 eighth-note beats per 2 bars)
  // Each step = 360ms (~83 BPM gentle eighth-note flow)
  private readonly sequence: { bass?: number; melody?: number; harmony?: number }[] = [
    // Bar 1: C major (C3 - G3 - E4 - G3 | melody E5 -> G5)
    { bass: 130.81, melody: 659.25 },
    { bass: 196.0 },
    { bass: 329.63, melody: 783.99 },
    { bass: 196.0 },
    { bass: 261.63, melody: 659.25 },
    { bass: 196.0, melody: 587.33 },
    { bass: 329.63, melody: 523.25 },
    { bass: 196.0 },

    // Bar 2: G/B (B2 - G3 - D4 - G3 | melody D5 -> E5 -> G5)
    { bass: 123.47, melody: 587.33 },
    { bass: 196.0 },
    { bass: 293.66, melody: 659.25 },
    { bass: 196.0 },
    { bass: 246.94, melody: 783.99 },
    { bass: 196.0 },
    { bass: 293.66, melody: 659.25 },
    { bass: 196.0 },

    // Bar 3: Am7 (A2 - E3 - C4 - E3 | melody A5 -> G5 -> E5)
    { bass: 110.0, melody: 880.0 },
    { bass: 164.81 },
    { bass: 261.63, melody: 783.99 },
    { bass: 164.81 },
    { bass: 220.0, melody: 659.25 },
    { bass: 164.81, melody: 587.33 },
    { bass: 261.63, melody: 523.25 },
    { bass: 164.81 },

    // Bar 4: Em7 (E2 - B2 - G3 - B2 | melody E5 -> D5)
    { bass: 164.81, melody: 659.25 },
    { bass: 246.94 },
    { bass: 392.0, melody: 587.33 },
    { bass: 246.94 },
    { bass: 329.63, melody: 523.25 },
    { bass: 246.94 },
    { bass: 392.0 },
    { bass: 246.94 },

    // Bar 5: Fmaj7 (F2 - C3 - A3 - C3 | melody F5 -> E5 -> C5)
    { bass: 174.61, melody: 698.46, harmony: 523.25 },
    { bass: 261.63 },
    { bass: 440.0, melody: 659.25 },
    { bass: 261.63 },
    { bass: 349.23, melody: 523.25 },
    { bass: 261.63, melody: 587.33 },
    { bass: 440.0, melody: 659.25 },
    { bass: 261.63 },

    // Bar 6: C/E (E2 - C3 - G3 - C3 | melody G5 -> E5 -> C5)
    { bass: 164.81, melody: 783.99 },
    { bass: 261.63 },
    { bass: 392.0, melody: 659.25 },
    { bass: 261.63 },
    { bass: 329.63, melody: 523.25 },
    { bass: 261.63 },
    { bass: 392.0, melody: 587.33 },
    { bass: 261.63 },

    // Bar 7: Dm7 (D2 - A2 - F3 - A2 | melody D5 -> E5 -> F5 -> A5)
    { bass: 146.83, melody: 587.33 },
    { bass: 220.0 },
    { bass: 349.23, melody: 659.25 },
    { bass: 220.0 },
    { bass: 293.66, melody: 698.46 },
    { bass: 220.0 },
    { bass: 349.23, melody: 880.0 },
    { bass: 220.0 },

    // Bar 8: G7sus4 -> G7 (G2 - D3 - B3 - D3 | melody G5 -> D5 -> C5)
    { bass: 196.0, melody: 783.99, harmony: 587.33 },
    { bass: 293.66 },
    { bass: 493.88, melody: 659.25 },
    { bass: 293.66 },
    { bass: 392.0, melody: 587.33 },
    { bass: 293.66 },
    { bass: 493.88, melody: 523.25 },
    { bass: 293.66 },
  ];

  private playPianoTone(freq: number, gainAmount: number, durationSec: number, isMelody: boolean) {
    if (!this.ctx || !this.lowpass) return;
    const now = this.ctx.currentTime;

    const oscFundamental = this.ctx.createOscillator();
    const oscOverTone = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();
    const overtoneGain = this.ctx.createGain();

    oscFundamental.type = 'sine';
    oscFundamental.frequency.setValueAtTime(freq, now);

    // Subtle warm 2nd harmonic gives acoustic piano body without harshness
    oscOverTone.type = 'triangle';
    oscOverTone.frequency.setValueAtTime(freq * 2, now);
    overtoneGain.gain.setValueAtTime(isMelody ? 0.22 : 0.12, now);

    const peak = Math.max(0.0005, gainAmount);
    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.linearRampToValueAtTime(peak, now + 0.018);
    noteGain.gain.exponentialRampToValueAtTime(peak * 0.42, now + 0.22);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    oscFundamental.connect(noteGain);
    oscOverTone.connect(overtoneGain);
    overtoneGain.connect(noteGain);
    noteGain.connect(this.lowpass);

    oscFundamental.start(now);
    oscOverTone.start(now);
    oscFundamental.stop(now + durationSec + 0.05);
    oscOverTone.stop(now + durationSec + 0.05);
  }

  start(volume: number) {
    if (typeof window === 'undefined') return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.lowpass = this.ctx.createBiquadFilter();
      this.lowpass.type = 'lowpass';
      this.lowpass.frequency.value = 2400;
      this.lowpass.Q.value = 0.6;
      this.masterGain.gain.value = volume;
      this.lowpass.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    this.setVolume(volume);
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    if (this.timer !== null) return;

    const tick = () => {
      if (!this.ctx || this.ctx.state !== 'running') return;
      const event = this.sequence[this.step % this.sequence.length];
      this.step += 1;

      if (event.bass) {
        this.playPianoTone(event.bass, 0.26, 1.35, false);
      }
      if (event.harmony) {
        this.playPianoTone(event.harmony, 0.22, 1.25, false);
      }
      if (event.melody) {
        this.playPianoTone(event.melody, 0.42, 1.6, true);
      }
    };

    tick();
    this.timer = window.setInterval(tick, 360);
  }

  setVolume(volume: number) {
    this.currentVolume = volume;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.05);
    }
  }

  stop() {
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    if (this.ctx && this.ctx.state === 'running') {
      void this.ctx.suspend();
    }
  }

  dispose() {
    this.stop();
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
      this.masterGain = null;
      this.lowpass = null;
    }
  }
}

export function MusicLeafIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 36 36" className="w-6 h-6 shrink-0" aria-hidden="true">
      <defs>
        <linearGradient id="goldNoteGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="leafAccentGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#86EFAC" />
          <stop offset="100%" stopColor="#388E3C" />
        </linearGradient>
      </defs>
      <path
        d="M20 7 C26 4, 32 7, 30 14 C27 17, 22 15, 20 11 Z"
        fill="url(#leafAccentGrad)"
        stroke="#2E6F2B"
        strokeWidth="1.2"
      />
      <path
        d="M15 24 V9 L26 6 V20"
        fill="none"
        stroke="url(#goldNoteGrad)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse
        cx="12"
        cy="25.5"
        rx="4.8"
        ry="3.6"
        fill="url(#goldNoteGrad)"
        stroke="#B45309"
        strokeWidth="1"
      />
      <ellipse
        cx="23"
        cy="22"
        rx="4.4"
        ry="3.3"
        fill="url(#goldNoteGrad)"
        stroke="#B45309"
        strokeWidth="1"
      />
      {!active && (
        <line
          x1="6"
          y1="30"
          x2="30"
          y2="6"
          stroke="#DC2626"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function MusicPlayer({
  musicUrl,
  isPlaying,
  volume,
  onPlaybackBlocked,
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<WarmPianoSynth | null>(null);

  useEffect(() => {
    if (!synthRef.current) {
      synthRef.current = new WarmPianoSynth();
    }
    return () => {
      synthRef.current?.dispose();
      synthRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audioEl = audioRef.current;
    const synth = synthRef.current;

    if (musicUrl && audioEl) {
      synth?.stop();
      audioEl.volume = volume;
      if (isPlaying) {
        audioEl.play().catch(() => {
          onPlaybackBlocked?.();
        });
      } else {
        audioEl.pause();
      }
      return;
    }

    if (audioEl) {
      audioEl.pause();
    }
    if (isPlaying) {
      synth?.start(volume);
    } else {
      synth?.stop();
    }
  }, [musicUrl, isPlaying, volume, onPlaybackBlocked]);

  return (
    <audio
      ref={audioRef}
      src={musicUrl || undefined}
      loop
      preload="auto"
      className="hidden"
    />
  );
}
