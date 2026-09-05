import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Smile, Image, Puzzle, Heart, Pencil, Music, VolumeX, type LucideIcon } from "lucide-react";
import { ACTS, type Act } from "../data/pages";
import { useBook } from "../lib/book-store";
import { musicCtl } from "../lib/musicctl";
import { CartoonPage } from "./pages/CartoonPage";
import { MemoryPage } from "./pages/MemoryPage";
import { ExtraPage } from "./pages/ExtraPages";
import { WishPage } from "./pages/WishPage";
import { QuizGate } from "./QuizGate";
import { EditPanel } from "./EditPanel";
import { sfx } from "../lib/audio";
import { cn } from "../utils/cn";

const ACT_ICON: Record<Act, LucideIcon> = { cartoons: Smile, memories: Image, extras: Puzzle, wish: Heart };
const LS_PAGE = "c25p4-page";
const LS_QUIZ = "c25p4-quizpass";

export function PageBook() {
  const { state, editUnlocked } = useBook();
  const pages = state.pages;
  const total = pages.length;

  const [idx, setIdx] = useState<number>(() => {
    try {
      const saved = parseInt(localStorage.getItem(LS_PAGE) ?? "0", 10);
      return isNaN(saved) ? 0 : saved;
    } catch { return 0; }
  });
  const [quizPassed, setQuizPassed] = useState<boolean>(() => {
    try { return localStorage.getItem(LS_QUIZ) === "1"; } catch { return false; }
  });
  const [editOpen, setEditOpen] = useState(false);
  const [musicOn, setMusicOn] = useState(musicCtl.playing);
  const dirRef = useRef<1 | -1>(1);
  const touchX = useRef<number | null>(null);

  /* index safe rakha */
  const safeIdx = Math.min(Math.max(0, idx), total - 1);
  useEffect(() => { if (safeIdx !== idx) setIdx(safeIdx); }, [safeIdx, idx]);

  useEffect(() => musicCtl.subscribe(setMusicOn), []);

  const go = useCallback((n: number) => {
    setIdx((cur) => {
      const target = Math.min(total - 1, Math.max(0, n));
      if (target === cur) return cur;
      dirRef.current = target > cur ? 1 : -1;
      sfx.flip();
      try { localStorage.setItem(LS_PAGE, String(target)); } catch { /* ignore */ }
      window.scrollTo({ top: 0, behavior: "smooth" });
      return target;
    });
  }, [total]);

  const next = useCallback(() => go(safeIdx + 1), [go, safeIdx]);
  const prev = useCallback(() => go(safeIdx - 1), [go, safeIdx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (editOpen) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, editOpen]);

  useEffect(() => {
    if (editOpen) return;
    const start = (e: TouchEvent) => { touchX.current = e.touches[0].clientX; };
    const end = (e: TouchEvent) => {
      if (touchX.current === null) return;
      const dx = e.changedTouches[0].clientX - touchX.current;
      if (Math.abs(dx) > 56) (dx < 0 ? next() : prev());
      touchX.current = null;
    };
    window.addEventListener("touchstart", start, { passive: true });
    window.addEventListener("touchend", end, { passive: true });
    return () => { window.removeEventListener("touchstart", start); window.removeEventListener("touchend", end); };
  }, [next, prev, editOpen]);

  const page = pages[safeIdx];
  if (!page) return null;

  const act = ACTS.find((a) => a.key === page.act) ?? ACTS[0];
  const ActIcon = ACT_ICON[page.act];
  const slideClass = dirRef.current === 1 ? "slide-l" : "slide-r";

  /* quiz gate: wish page-e dhukar age */
  const needsQuiz = page.act === "wish" && state.settings.quizEnabled && state.quiz.length > 0 && !quizPassed;
  const passQuiz = () => {
    setQuizPassed(true);
    try { localStorage.setItem(LS_QUIZ, "1"); } catch { /* ignore */ }
  };

  /* act onujayi progress segment */
  const segments = ACTS.map((a) => ({
    key: a.key,
    count: pages.filter((p) => p.act === a.key).length,
    done: pages.slice(0, safeIdx + 1).filter((p) => p.act === a.key).length,
  })).filter((s) => s.count > 0);

  return (
    <div className="fade-in relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-3 pb-28 pt-6 sm:px-6">
      {/* ——— header ——— */}
      <header className="mb-7 flex flex-col items-center">
        <p className="font-script text-3xl text-gold-400/80">the birthday book</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <span className="glass flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.25em] text-gold-300">
            <ActIcon size={11} /> {act.label}
          </span>
          <span className="rounded-full border border-white/10 px-3.5 py-1.5 text-[10px] font-light tracking-[0.2em] text-cream/50">
            {act.labelBn}
          </span>
        </div>
      </header>

      {/* ——— page body ——— */}
      <main key={`${page.id}-${safeIdx}`} className={cn("flex-1", slideClass)} aria-live="polite">
        {needsQuiz ? (
          <QuizGate quiz={state.quiz} onPass={passQuiz} />
        ) : (
          <>
            {page.act === "cartoons" && <CartoonPage page={page} pageNo={safeIdx + 1} />}
            {page.act === "memories" && <MemoryPage page={page} pageNo={safeIdx + 1} />}
            {page.act === "extras" && <ExtraPage page={page} onContinue={() => go(total - 1)} />}
            {page.act === "wish" && <WishPage onRestart={() => go(0)} />}
          </>
        )}
      </main>

      {/* ——— floating: music + edit ——— */}
      <div className="fixed right-3 top-3 z-40 flex flex-col gap-2 sm:right-5 sm:top-5">
        <button
          onClick={() => musicCtl.toggle()}
          className={cn("glass-deep flex h-11 w-11 items-center justify-center rounded-full transition-all active:scale-95",
            musicOn ? "border-gold-400/50 text-gold-300" : "text-cream/60")}
          aria-label="music toggle"
        >
          {musicOn ? <Music size={16} className="animate-pulse" /> : <VolumeX size={16} />}
        </button>
        <button
          onClick={() => { setEditOpen(true); sfx.tick(); }}
          className={cn("glass-deep flex h-11 w-11 items-center justify-center rounded-full transition-all active:scale-95",
            editUnlocked ? "border-blush-400/60 text-blush-300 wish-glow" : "text-cream/55 hover:text-gold-300")}
          aria-label="edit page"
          title="Edit (code 2525)"
        >
          <Pencil size={15} />
        </button>
      </div>

      {/* ——— footer nav ——— */}
      <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-6 sm:pb-5" aria-label="page navigation">
        <div className="glass-deep mx-auto flex max-w-3xl items-center gap-3 rounded-full px-3 py-2.5 shadow-[0_18px_60px_-20px_rgba(0,0,0,.9)]">
          <button onClick={prev} disabled={safeIdx === 0}
            className="glass flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-cream/80 transition-all enabled:hover:scale-105 enabled:hover:text-gold-300 disabled:opacity-25"
            aria-label="previous page">
            <ChevronLeft size={18} />
          </button>

          <div className="flex flex-1 flex-col gap-1">
            <div className="flex justify-between text-[9px] uppercase tracking-[0.2em] text-cream/40">
              <span>page <span className="font-semibold text-gold-300">{safeIdx + 1}</span> / {total}</span>
              <span className="hidden sm:block">swipe · arrow key · edit: 2525</span>
            </div>
            <div className="flex h-1.5 gap-1 overflow-hidden rounded-full">
              {segments.map((s) => (
                <div key={s.key} className="overflow-hidden rounded-full bg-white/8" style={{ flex: s.count }}>
                  <div
                    className={cn("h-full rounded-full transition-all duration-500",
                      s.key === "wish" ? "bg-gradient-to-r from-blush-500 to-gold-300" : "bg-gradient-to-r from-blush-400/80 to-gold-400/80")}
                    style={{ width: `${(s.done / s.count) * 100}%` }}
                  />
                </div>
              ))}
            </div>
          </div>

          <button onClick={next} disabled={safeIdx === total - 1}
            className="flex h-10 shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-blush-400 to-gold-400 px-4 text-xs font-medium text-velvet-900 transition-all enabled:hover:scale-105 active:scale-95 disabled:opacity-25"
            aria-label="next page">
            {safeIdx === total - 2 ? "wish" : "porer"} <ChevronRight size={16} />
          </button>
        </div>
      </nav>

      {editOpen && <EditPanel pageIndex={safeIdx} onClose={() => setEditOpen(false)} onGoto={(i) => setIdx(Math.max(0, i))} />}
    </div>
  );
}
