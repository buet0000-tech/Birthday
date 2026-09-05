import { useEffect, useState } from "react";
import { Lock, Heart, Delete, Lightbulb, X, Eye, BookHeart } from "lucide-react";
import { sfx } from "../lib/audio";
import { cn } from "../utils/cn";

const PASSCODES = ["1211"];
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "del"];

const CLUES = [
  "Char ta digit. Amader taarikh tai — slash chhara, ek shathe.",
  "Je dine shob shuru hoyechilo, shei date ta. Cake-er box-eo eta lekha thake.",
  "Baro ar ek. Pashapashi boshao — hoye gelo.",
];

export function VaultLock({ onUnlock }: { onUnlock: () => void }) {
  const [entry, setEntry] = useState("");
  const [error, setError] = useState(false);
  const [dissolving, setDissolving] = useState(false);
  const [clueOpen, setClueOpen] = useState(false);
  const [clueStep, setClueStep] = useState(0);
  const [answerShown, setAnswerShown] = useState(false);

  const press = (k: string) => {
    if (dissolving) return;
    if (k === "del") { setEntry((p) => p.slice(0, -1)); sfx.tick(); return; }
    if (k === "clear") { setEntry(""); sfx.tick(); return; }
    if (entry.length >= 4) return;
    const next = entry + k;
    setEntry(next);
    if (navigator.vibrate) navigator.vibrate(8);
    if (next.length === 4) {
      if (PASSCODES.includes(next)) {
        sfx.unlock();
        setDissolving(true);
        setTimeout(onUnlock, 1300);
      } else {
        sfx.wrong();
        setError(true);
        if (navigator.vibrate) navigator.vibrate([45, 55, 45]);
        setTimeout(() => { setEntry(""); setError(false); }, 620);
      }
    } else sfx.tick();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) press(e.key);
      if (e.key === "Backspace") press("del");
      if (e.key === "Escape") setClueOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div
      className={cn(
        "fixed inset-0 z-[80] flex flex-col items-center justify-between overflow-hidden px-6 py-7 sm:py-10",
        dissolving && "vault-dissolve pointer-events-none"
      )}
      style={{ background: "radial-gradient(900px 620px at 50% 0%, #3a1729 0%, #1f0b16 62%)" }}
      role="dialog"
      aria-label="Birthday book lock screen"
    >
      {dissolving && (
        <>
          <div className="halo-burst absolute left-1/2 top-[42%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(255,215,0,.55), rgba(248,177,149,.25) 45%, transparent 70%)" }} />
          <div className="halo-burst absolute left-1/2 top-[42%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(255,240,214,.8), transparent 55%)", animationDelay: ".18s" }} />
        </>
      )}

      <p className="fade-in flex items-center gap-2 pt-1 text-[10px] font-medium uppercase tracking-[0.4em] text-gold-400/70">
        <BookHeart size={13} /> ekta boi — shudhu tor jonno <BookHeart size={13} />
      </p>

      <div className="flex w-full max-w-xs flex-col items-center">
        <div className={cn("glass ring-glow mb-6 flex h-20 w-20 items-center justify-center rounded-full", dissolving ? "" : "breathe")}>
          {dissolving
            ? <Heart size={30} className="heart-beat text-gold-300" fill="currentColor" />
            : <Lock size={28} className="text-gold-400" strokeWidth={1.5} />}
        </div>

        <h1 className="text-center font-display text-4xl font-semibold italic leading-tight text-cream sm:text-5xl">
          The Birthday <span className="gold-text font-bold not-italic">Book</span>
        </h1>
        <p className="mt-2 font-script text-3xl text-blush-400">chobbish-ta-panna rahasya</p>
        <p className="mt-4 max-w-[28ch] text-center text-[13px] font-extralight leading-relaxed text-cream/55">
          Vitore hasi, kichu chobi, ektu nautanki — ar ekta panna jekhane shob serious. Code ta cha.
        </p>

        {/* PIN dots */}
        <div className={cn("mt-7 flex items-center gap-4", error && "shake")} aria-live="polite">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={`${i}-${entry.length}`}
              className={cn(
                "h-3.5 w-3.5 rounded-full border transition-colors duration-200",
                error
                  ? "border-blush-500 bg-blush-500/80"
                  : i < entry.length
                    ? "dot-fill border-gold-300 bg-gold-300 shadow-[0_0_14px_2px_rgba(255,215,0,.5)]"
                    : "border-gold-400/40 bg-transparent"
              )}
            />
          ))}
        </div>
        <p className={cn("mt-3 h-5 text-xs tracking-wide transition-opacity", error ? "text-blush-500 opacity-100" : "text-cream/35 opacity-90")}>
          {error ? "Boi khullo na. Arektu bhabo, hero." : "4-digit code"}
        </p>

        {/* keypad with slash */}
        <div className="mt-3 grid w-full max-w-[268px] grid-cols-3 gap-3">
          {KEYS.map((k) => (
            <button
              key={k}
              onClick={() => press(k)}
              aria-label={k === "del" ? "delete" : k === "clear" ? "clear" : `digit ${k}`}
              className={cn(
                "glass sheen flex h-14 items-center justify-center rounded-2xl text-lg font-light text-cream transition-all duration-150 active:scale-90 active:bg-white/10",
                k === "del" || k === "clear" ? "text-gold-400/80" : "hover:border-gold-400/40"
              )}
            >
              {k === "del" ? <Delete size={19} strokeWidth={1.6} /> : k === "clear" ? <span className="text-[11px] uppercase tracking-widest">clear</span> : k}
            </button>
          ))}
        </div>

        <button
          onClick={() => { setClueOpen(true); sfx.flip(); }}
          className="mt-6 flex items-center gap-2 rounded-full border border-dashed border-gold-400/35 px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-gold-400/80 transition-all hover:border-gold-400/70 hover:text-gold-300 active:scale-95"
        >
          <Lightbulb size={13} /> secret clue lagbe?
        </button>
      </div>

      <p className="fade-in text-center font-script text-2xl text-gold-400/60">bhalobasha diye lekha, obviously</p>

      {/* ——— clue drawer ——— */}
      {clueOpen && (
        <div className="fixed inset-0 z-[85] flex items-end justify-center" role="dialog" aria-label="secret clue drawer">
          <div className="fade-in absolute inset-0 bg-velvet-950/70 backdrop-blur-sm" onClick={() => setClueOpen(false)} />
          <div className="drawer-up glass-deep relative w-full max-w-md rounded-t-[2rem] px-6 pb-10 pt-5">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-gold-400/30" />
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.3em] text-gold-400/80">
                <Lightbulb size={13} /> gupto clue gulo
              </p>
              <button onClick={() => setClueOpen(false)} className="glass flex h-8 w-8 items-center justify-center rounded-full text-cream/70 transition-transform hover:scale-105 active:scale-95" aria-label="close clue drawer">
                <X size={15} />
              </button>
            </div>

            <p className="mt-5 min-h-[4.5rem] font-hand text-2xl leading-snug text-cream/90" key={clueStep}>
              {CLUES[clueStep]}
            </p>

            <div className="mt-2 flex items-center justify-between">
              <div className="flex gap-1.5">
                {CLUES.map((_, i) => (
                  <span key={i} className={cn("h-1.5 rounded-full transition-all duration-300", i === clueStep ? "w-6 bg-gold-300" : "w-1.5 bg-gold-400/30")} />
                ))}
              </div>
              <button
                onClick={() => { setClueStep((s) => (s + 1) % CLUES.length); sfx.tick(); }}
                className="glass rounded-full px-4 py-2 text-xs font-light text-gold-300 transition-all hover:border-gold-400/50 active:scale-95"
              >
                {clueStep < CLUES.length - 1 ? "porer clue →" : "abar prothom ta ↺"}
              </button>
            </div>

            <button
              onClick={() => { setAnswerShown((s) => !s); sfx.flip(); }}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-blush-400/35 bg-blush-400/5 px-4 py-3.5 transition-colors hover:border-blush-400/60"
            >
              <Eye size={14} className="text-blush-400" />
              <span className={cn("font-display text-lg italic tracking-[0.35em]", answerShown ? "gold-text" : "punchline-hidden text-gold-300")}>
                1211
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-cream/40">{answerShown ? "hide" : "reveal"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
