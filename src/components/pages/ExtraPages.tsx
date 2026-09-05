import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import {
  Drama, Medal, MoonStar, BadgeCheck, Heart, Ticket, Gavel, Dices, AudioLines,
  Play, Pause, Eye, UtensilsCrossed, Cherry, HeartHandshake, CarFront, CloudRain, Cake, type LucideIcon,
} from "lucide-react";
import {
  AWARDS, COUPONS, COMPLAINTS, ROULETTE_REASONS, TIMELINE, VOICE_TRANSCRIPT,
  type BookPage,
} from "../../data/pages";
import { useMediaUrl } from "../../lib/media";
import { sfx, MelodyPlayer } from "../../lib/audio";
import { cn } from "../../utils/cn";

const AWARD_ICONS: Record<string, LucideIcon> = { Drama, Medal, Moon: MoonStar, BadgeCheck };
const TIME_ICONS: Record<string, LucideIcon> = { Eye, UtensilsCrossed, Cherry, HeartHandshake, Car: CarFront, CloudRain, Cake };

const miniPop = (x = 0.5, y = 0.6) =>
  confetti({ particleCount: 26, spread: 55, startVelocity: 20, origin: { x, y }, colors: ["#E6C594", "#FFD700", "#F8B195"], scalar: 0.75, disableForReducedMotion: true });

function PageIntro({ bangla, en }: { bangla: string; en: string }) {
  return (
    <div className="mb-6 text-center">
      <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-gold-400/60">{en}</p>
      <p className="mt-1 font-script text-3xl text-blush-400">{bangla}</p>
    </div>
  );
}

/* ═══════ 19 — AWARD NIGHT ═══════ */
function AwardsPage({ page }: { page: BookPage }) {
  const [stamped, setStamped] = useState<Set<number>>(new Set());
  const tap = (i: number) => {
    if (stamped.has(i)) return;
    setStamped((s) => new Set(s).add(i));
    sfx.pop(); miniPop();
  };
  return (
    <div className="mx-auto w-full max-w-md px-2 pb-6">
      <PageIntro bangla={page.title} en="annual award night · jury: ami" />
      <div className="flex flex-col gap-3">
        {AWARDS.map((a, i) => {
          const Icon = AWARD_ICONS[a.icon];
          const done = stamped.has(i);
          return (
            <button key={a.title} onClick={() => tap(i)} className="pop-in sheen glass group relative w-full rounded-3xl p-1 text-left transition-all hover:-translate-y-1 active:scale-[0.97]" style={{ animationDelay: `${i * 90}ms` }}>
              <span className="flex items-center gap-4 rounded-[1.3rem] border border-dashed border-gold-400/25 px-4 py-3.5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-velvet-900">
                  <Icon size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-base font-semibold italic text-cream">{a.title}</span>
                  <span className="hint-line mt-0.5 block text-xs font-light text-cream/55">{a.desc}</span>
                </span>
                <span className={cn("relative shrink-0 transition-all duration-300", done ? "scale-100 opacity-100" : "scale-150 opacity-0")}>
                  <span className="-rotate-12 rounded-md border-2 border-blush-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-blush-400">certified</span>
                </span>
                {!done && <span className="shrink-0 text-[9px] uppercase tracking-[0.2em] text-gold-400/50">tap to<br />certify</span>}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-5 text-center text-[10px] uppercase tracking-[0.3em] text-cream/35">jury: ami · chairman: ami · result: tumi</p>
    </div>
  );
}

/* ═══════ 20 — COUPON BOOK ═══════ */
function CouponsPage({ page }: { page: BookPage }) {
  const [used, setUsed] = useState<Set<number>>(new Set());
  const redeem = (i: number) => {
    if (used.has(i)) return;
    setUsed((s) => new Set(s).add(i));
    sfx.pop(); miniPop(0.5, 0.55);
  };
  return (
    <div className="mx-auto w-full max-w-md px-2 pb-6">
      <PageIntro bangla={page.title} en="redeemable · non-refundable · fully romantic" />
      <div className="flex flex-col gap-4">
        {COUPONS.map((c, i) => {
          const done = used.has(i);
          return (
            <button key={c.code} onClick={() => redeem(i)} className="pop-in relative w-full text-left transition-transform active:scale-[0.98]" style={{ animationDelay: `${i * 90}ms` }}>
              <span className={cn("glass flex items-stretch overflow-hidden rounded-2xl transition-all", done ? "opacity-80" : "hover:-translate-y-1 hover:border-gold-400/45")}>
                {/* stub */}
                <span className="flex w-16 shrink-0 flex-col items-center justify-center gap-1 border-r border-dashed border-gold-400/40 bg-gold-400/10 py-4">
                  <Ticket size={16} className="text-gold-300 -rotate-45" />
                  <span className="font-display text-[10px] italic text-gold-300">{c.code}</span>
                </span>
                <span className="relative flex-1 px-4 py-3.5">
                  <span className="block font-display text-base font-semibold italic text-cream">{c.title}</span>
                  <span className="mt-1 block text-xs font-light leading-relaxed text-cream/60">{c.desc}</span>
                  {done && (
                    <span className="stamp absolute right-3 top-1/2 -translate-y-1/2 -rotate-12 rounded-md border-2 border-blush-500 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blush-400">
                      redeemed
                    </span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-5 text-center text-[10px] uppercase tracking-[0.3em] text-cream/35">cashback: hug · tap korle redeem hobe</p>
    </div>
  );
}

/* ═══════ 21 — COMPLAINT BOX ═══════ */
function ComplaintsPage({ page }: { page: BookPage }) {
  const [hearts, setHearts] = useState<number[]>(COMPLAINTS.map(() => 0));
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="mx-auto w-full max-w-md px-2 pb-6">
      <PageIntro bangla={page.title} en="complaint box · bichar: ami" />
      <div className="flex flex-col gap-3">
        {COMPLAINTS.map((c, i) => {
          const isOpen = open === i;
          return (
            <div key={c.title} className={cn("glass pop-in flex items-stretch gap-4 rounded-3xl p-1 transition-all", isOpen && "ring-glow")} style={{ animationDelay: `${i * 90}ms` }}>
              <button onClick={() => { setOpen(isOpen ? null : i); sfx.flip(); }} className="flex flex-1 items-start gap-3.5 rounded-[1.3rem] border border-transparent px-4 py-3.5 text-left">
                <span className={cn("mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border", isOpen ? "border-blush-400/60 bg-blush-400/10 text-blush-300" : "border-gold-400/30 bg-gold-400/5 text-gold-400")}>
                  <Gavel size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-sm font-semibold italic leading-snug text-cream">{c.title}</span>
                  <span className={cn("mt-1 block text-xs font-light leading-relaxed text-cream/55 transition-all", isOpen ? "opacity-100" : "hint-line opacity-80")}>
                    {c.desc}
                  </span>
                </span>
              </button>
              <button
                onClick={() => { setHearts((h) => h.map((v, j) => (j === i ? v + 1 : v))); sfx.tick(); }}
                className="flex w-12 flex-col items-center justify-center gap-1 rounded-r-3xl border-l border-white/8 text-blush-400 transition-colors hover:bg-blush-400/5"
                aria-label="support this complaint"
              >
                <Heart size={16} className={hearts[i] > 0 ? "heart-beat fill-blush-500 text-blush-500" : ""} key={hearts[i]} />
                <span className="text-[10px] tabular-nums text-cream/45">{hearts[i]}</span>
              </button>
            </div>
          );
        })}
      </div>
      <p className="mt-5 text-center text-[10px] uppercase tracking-[0.3em] text-cream/35">bichar komiti: ami · appeal: nei · date: 1211</p>
    </div>
  );
}

/* ═══════ 22 — REASON ROULETTE ═══════ */
function RoulettePage({ page }: { page: BookPage }) {
  const [current, setCurrent] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const draw = () => {
    sfx.flip();
    let next = Math.floor(Math.random() * ROULETTE_REASONS.length);
    if (next === current) next = (next + 1) % ROULETTE_REASONS.length;
    setCurrent(next);
    setRound((r) => r + 1);
  };
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-2 pb-6">
      <PageIntro bangla={page.title} en="keno bhalobashi — random" />
      <div className="glass-deep ring-glow flex min-h-[15rem] w-full items-center justify-center rounded-[2rem] p-7 text-center">
        {current === null ? (
          <p className="font-hand text-3xl leading-snug text-cream/60">Ghurao — ekta random reason ashbe. Kichu logical, kichu ekdom bokami.</p>
        ) : (
          <p key={`${current}-${round}`} className="pop-in font-hand text-3xl leading-snug text-gold-300">
            “{ROULETTE_REASONS[current]}”
          </p>
        )}
      </div>
      <button onClick={draw} className="sheen mt-6 flex items-center gap-2 rounded-full bg-gradient-to-r from-blush-400 to-gold-400 px-7 py-3.5 text-sm font-semibold text-velvet-900 shadow-[0_14px_44px_-12px_rgba(248,177,149,.6)] transition-transform hover:scale-105 active:scale-95">
        <Dices size={17} /> {current === null ? "ghurao" : "arekta dao"}
      </button>
      {round > 0 && <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-cream/40">{round} ta reason ber holo · aro ache</p>}
    </div>
  );
}

/* ═══════ 23 — TIMELINE ═══════ */
function TimelinePage({ page }: { page: BookPage }) {
  return (
    <div className="mx-auto w-full max-w-md px-2 pb-6">
      <PageIntro bangla={page.title} en="shuru theke aj porjonto" />
      <div className="relative ml-5 border-l border-dashed border-gold-400/35 pl-8">
        {TIMELINE.map((t, i) => {
          const Icon = TIME_ICONS[t.icon];
          return (
            <div key={t.title} className="pop-in relative pb-6 last:pb-0" style={{ animationDelay: `${i * 120}ms` }}>
              <span className="glass absolute -left-[3.35rem] flex h-11 w-11 items-center justify-center rounded-full text-gold-300">
                <Icon size={17} />
              </span>
              <div className="glass rounded-2xl px-4 py-3">
                <p className="font-display text-sm font-semibold italic text-cream">{t.title}</p>
                <p className="mt-0.5 text-xs font-light leading-relaxed text-cream/55">{t.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════ VOICE CORNER ═══════ */
function VoicePage({ page }: { page: BookPage }) {
  const uploadedUrl = useMediaUrl(page.voiceKey);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const playerRef = useRef<MelodyPlayer | null>(null);
  const rafRef = useRef(0);
  const bars = useRef(Array.from({ length: 30 }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 2.4)))).current;

  useEffect(() => { setPlaying(false); setProgress(0); }, [uploadedUrl]);

  const getPlayer = () => {
    if (!playerRef.current) {
      const p = new MelodyPlayer("lullaby");
      p.onEnded = () => { setPlaying(false); setProgress(1); setTimeout(() => setProgress(0), 800); };
      playerRef.current = p;
    }
    return playerRef.current;
  };
  const tick = () => { const p = playerRef.current; if (p?.isPlaying) { setProgress(Math.min(1, p.elapsed / p.duration)); rafRef.current = requestAnimationFrame(tick); } };

  const toggle = () => {
    if (uploadedUrl) {
      const a = audioRef.current;
      if (!a) return;
      if (a.paused) { void a.play(); setPlaying(true); } else { a.pause(); setPlaying(false); }
      return;
    }
    const p = getPlayer();
    if (p.isPlaying) { p.pause(); setPlaying(false); cancelAnimationFrame(rafRef.current); }
    else { if (progress >= 1) setProgress(0); p.play(); setPlaying(true); sfx.flip(); rafRef.current = requestAnimationFrame(tick); }
  };

  useEffect(() => () => { cancelAnimationFrame(rafRef.current); playerRef.current?.destroy(); }, []);

  return (
    <div className="mx-auto w-full max-w-md px-2 pb-6">
      <PageIntro bangla="voice corner" en="kaner kache ektu bolo" />
      <div className="glass-deep ring-glow rounded-[2rem] p-5">
        <div className="flex items-center gap-4">
          <button onClick={toggle} className="ring-glow flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blush-400 to-blush-500 text-velvet-900 transition-transform active:scale-90" aria-label={playing ? "pause" : "play"}>
            {playing ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" className="ml-0.5" />}
          </button>
          <div className={cn("flex h-11 flex-1 items-center gap-[3px]", playing && "wave-playing")}>
            {bars.map((h, i) => (
              <span key={i} className={cn("wave-bar w-[3px] rounded-full transition-colors", i / bars.length <= progress ? "bg-gold-300" : "bg-blush-400/35")}
                style={{ height: `${h * 100}%`, animationDelay: `${(i % 7) * 0.09}s`, animationDuration: `${0.7 + (i % 5) * 0.11}s` }} />
            ))}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-[9px] uppercase tracking-[0.25em] text-cream/40">
          <span className="flex items-center gap-1.5"><AudioLines size={11} className="text-gold-400/70" /> {uploadedUrl ? (page.voiceLabel || "tomar record kora voice") : "demo sur · edit mode theke nijer voice dao"}</span>
          <span className="tabular-nums">{Math.round(progress * 100)}%</span>
        </div>
        <div className="mt-4 rounded-2xl border border-dashed border-gold-400/25 bg-velvet-900/50 p-4">
          <p className="font-hand text-2xl leading-snug text-cream/85">{page.caption || VOICE_TRANSCRIPT}</p>
        </div>
        {uploadedUrl && (
          <audio ref={audioRef} src={uploadedUrl} className="hidden"
            onTimeUpdate={(e) => { const a = e.currentTarget; if (a.duration) setProgress(a.currentTime / a.duration); }}
            onEnded={() => { setPlaying(false); setProgress(0); }} />
        )}
      </div>
    </div>
  );
}

/* ═══════ 25 — THE BRIDGE (mood shift) ═══════ */
function BridgePage({ page, onContinue }: { page: BookPage; onContinue: () => void }) {
  const lines = (page.caption ?? [
    "Etokkhon onek moja holo — momo jitlam, brishtite bhijlam, coupon-o pele.",
    "Kintu ekta boi jodi puro tai hashir hoy, tahole sheta golpo hoy, diary hoy na.",
    "Porer panna ta ektu alada. Alo ta komao, volume ta komao, ar ektu shomoy nao.",
  ].join("\n")).split("\n").filter(Boolean);
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-2 pb-6 pt-6 text-center">
      {/* candle */}
      <div className="relative mb-8 flex h-28 w-16 items-end justify-center">
        <div className="flame absolute -top-1 h-7 w-4 rounded-[50%_50%_45%_45%]" style={{ background: "linear-gradient(#fff7d6, #ffd700 55%, #ff9d5c)", boxShadow: "0 0 28px 6px rgba(255,215,0,.55)" }} />
        <div className="h-20 w-2.5 rounded-full bg-gradient-to-b from-blush-400 to-blush-500" />
        <div className="absolute -bottom-1 h-1.5 w-14 rounded-full bg-white/10" />
      </div>
      <div className="space-y-6">
        {lines.map((l, i) => (
          <p key={i} className="letter-line font-hand text-[1.55rem] leading-[1.5] text-cream/85" style={{ animationDelay: `${500 + i * 900}ms` }}>
            {l}
          </p>
        ))}
      </div>
      <button
        onClick={() => { sfx.unlock(); onContinue(); }}
        className="letter-line sheen mt-10 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 px-8 py-3.5 text-sm font-semibold text-velvet-900 shadow-[0_16px_50px_-10px_rgba(230,197,148,.6)] transition-transform hover:scale-105 active:scale-95"
        style={{ animationDelay: `${500 + lines.length * 900}ms` }}
      >
        haan… ami ready
      </button>
    </div>
  );
}

/* ═══════ dispatcher ═══════ */
export function ExtraPage({ page, onContinue }: { page: BookPage; onContinue: () => void }) {
  switch (page.extra) {
    case "awards": return <AwardsPage page={page} />;
    case "coupons": return <CouponsPage page={page} />;
    case "complaints": return <ComplaintsPage page={page} />;
    case "roulette": return <RoulettePage page={page} />;
    case "timeline": return <TimelinePage page={page} />;
    case "voice": return <VoicePage page={page} />;
    case "bridge": return <BridgePage page={page} onContinue={onContinue} />;
    default: return null;
  }
}
