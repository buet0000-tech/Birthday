import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { Music, VolumeX, RotateCcw, BookOpen, Heart, Feather } from "lucide-react";
import { useBook } from "../../lib/book-store";
import { sfx } from "../../lib/audio";
import { musicCtl } from "../../lib/musicctl";
import { cn } from "../../utils/cn";

const wishesBurst = () => {
  confetti({ particleCount: 120, spread: 90, startVelocity: 42, origin: { y: 0.55 }, colors: ["#E6C594", "#FFD700", "#F8B195", "#F7B2AD"], disableForReducedMotion: true });
  setTimeout(() => confetti({ particleCount: 70, spread: 360, startVelocity: 26, origin: { x: 0.5, y: 0.3 }, colors: ["#FFD700", "#E6C594"], shapes: ["star"], scalar: 1, gravity: 0.6, disableForReducedMotion: true }), 1200);
};

export function WishPage({ onRestart }: { onRestart: () => void }) {
  const { state } = useBook();
  const lines = state.wish;
  const [musicOn, setMusicOn] = useState(musicCtl.playing);
  const totalDelay = 900 + lines.length * 750;

  const glow = useMemo(() => Array.from({ length: 10 }, (_, i) => ({
    id: i, left: `${8 + (i * 9.3) % 84}%`, top: `${6 + (i * 13.7) % 80}%`, delay: `${(i * 0.9) % 3.4}s`, size: 2 + (i % 3),
  })), []);

  useEffect(() => {
    const t = setTimeout(wishesBurst, 600);
    return () => clearTimeout(t);
  }, []);

  const toggleMusic = () => {
    musicCtl.toggle();
    setMusicOn(musicCtl.playing);
    sfx.tick();
  };

  return (
    <div className="relative mx-auto flex w-full max-w-xl flex-col items-center px-4 pb-10">
      {/* hushed golden dust */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {glow.map((g) => (
          <span key={g.id} className="twinkle absolute rounded-full bg-gold-300" style={{ left: g.left, top: g.top, width: g.size, height: g.size, animationDelay: g.delay, boxShadow: "0 0 10px 2px rgba(255,215,0,.4)" }} />
        ))}
      </div>

      {/* music toggle */}
      <button onClick={toggleMusic} className={cn("glass-deep mb-8 mt-1 flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-light transition-all active:scale-95", musicOn ? "border-gold-400/50 text-gold-300" : "text-cream/60")} aria-pressed={musicOn}>
        {musicOn ? <Music size={14} className="animate-pulse" /> : <VolumeX size={14} />}
        {musicOn ? "gaan ta cholche — tomar jonno" : "gaan ta chalu koro"}
      </button>

      <p className="letter-line flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.45em] text-gold-400/80" style={{ animationDelay: "200ms" }}>
        <Feather size={12} /> shesher panna · ashol kotha
      </p>

      <h2 className="letter-line mt-4 text-center font-display leading-tight" style={{ animationDelay: "450ms" }}>
        <span className="block font-script text-4xl font-normal text-blush-400 sm:text-5xl">shubho jonmodin</span>
        <span className="gold-text mt-1 block text-5xl font-bold sm:text-6xl">Tomake</span>
      </h2>

      {/* the letter */}
      <article className="glass-deep relative mt-8 w-full overflow-hidden rounded-[2.5rem] px-6 py-9 sm:px-10">
        <span className="pointer-events-none absolute -right-6 -top-8 select-none font-display text-[9rem] font-bold italic leading-none text-gold-400/[0.05]">1211</span>
        <div className="absolute right-6 top-6">
          <div className="float-slow relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blush-500 to-[#8a3d4a] shadow-[inset_0_2px_6px_rgba(255,255,255,.25),0_8px_24px_-6px_rgba(0,0,0,.7)]">
            <span className="absolute inset-1 rounded-full border border-white/20" />
            <Heart size={15} className="text-cream/90" fill="currentColor" />
          </div>
        </div>

        <div className="space-y-6">
          {lines.map((line: string, i: number) => (
            <p
              key={i}
              className={cn("letter-line", i === lines.length - 1 ? "text-right font-script text-3xl text-gold-300 sm:text-4xl" : "font-hand text-[1.6rem] leading-[1.5] text-cream/90")}
              style={{ animationDelay: `${900 + i * 750}ms` }}
            >
              {line}
            </p>
          ))}
        </div>
      </article>

      {/* actions — appear after the letter */}
      <div className="letter-line mt-8 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: `${totalDelay}ms` }}>
        <button onClick={() => { wishesBurst(); sfx.fanfare(); }} className="sheen flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 px-6 py-3 text-sm font-semibold text-velvet-900 shadow-[0_14px_44px_-12px_rgba(230,197,148,.6)] transition-transform hover:scale-[1.03] active:scale-95">
          <RotateCcw size={15} /> celebrate abar
        </button>
        <button onClick={onRestart} className="glass flex items-center gap-2 rounded-full px-6 py-3 text-sm font-light text-cream/75 transition-all hover:border-gold-400/50 hover:text-gold-300 active:scale-95">
          <BookOpen size={15} /> boi ta abar page 1 theke
        </button>
      </div>

      <p className="letter-line mt-8 text-center text-[10px] uppercase tracking-[0.35em] text-cream/30" style={{ animationDelay: `${totalDelay + 400}ms` }}>
        the birthday book · 1211 · sob potro tomar naam-e
      </p>
    </div>
  );
}
