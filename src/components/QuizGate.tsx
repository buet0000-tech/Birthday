import { useState } from "react";
import confetti from "canvas-confetti";
import { KeyRound, Heart, CheckCircle2, Lightbulb, ArrowRight } from "lucide-react";
import type { QuizQ } from "../data/pages";
import { sfx } from "../lib/audio";
import { cn } from "../utils/cn";

/** Shesh page-e dhukar age tinta prosno. */
export function QuizGate({ quiz, onPass }: { quiz: QuizQ[]; onPass: () => void }) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [wrongKey, setWrongKey] = useState(0);

  const q = quiz[step];
  if (!q) { onPass(); return null; }

  const answer = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) {
      sfx.correct();
      setFeedback({ ok: true, text: "Ekdom thik. Tumi je tumi, proman holo." });
      confetti({ particleCount: 40, spread: 60, startVelocity: 26, origin: { y: 0.7 }, colors: ["#E6C594", "#FFD700", "#F8B195"], scalar: 0.8, disableForReducedMotion: true });
      setTimeout(() => {
        setFeedback(null); setPicked(null); setShowHint(false);
        if (step < quiz.length - 1) setStep((s) => s + 1);
        else { sfx.fanfare(); onPass(); }
      }, 1400);
    } else {
      sfx.wrong();
      setWrongKey((k) => k + 1);
      setFeedback({ ok: false, text: "Uhu. Abar bhabo — boi ta to tumi porecho." });
      if (navigator.vibrate) navigator.vibrate(55);
      setTimeout(() => { setPicked(null); setFeedback(null); }, 1500);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-2 pb-6">
      <div className="mb-6 text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-gold-400/60">shesh panna-r age</p>
        <p className="mt-1 font-script text-3xl text-blush-400">tinta chhoto prosno</p>
        <p className="mx-auto mt-3 max-w-[30ch] text-xs font-light leading-relaxed text-cream/55">
          Shudhu ekbar mile dekhi — ei boi ta thik manush-tai porche kina.
        </p>
      </div>

      <div key={`${step}-${wrongKey}`} className={cn("glass-deep w-full rounded-[2rem] p-6", picked !== null && feedback && !feedback.ok && "shake")}>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex gap-2">
            {quiz.map((_, i) => (
              <Heart key={i} size={15} className={cn("transition-all duration-500", i < step ? "fill-gold-300 text-gold-300" : i === step ? "heart-beat fill-blush-400 text-blush-400" : "text-cream/20")} />
            ))}
          </div>
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-gold-400/60">
            <KeyRound size={11} /> {step + 1} / {quiz.length}
          </span>
        </div>

        <h3 className="font-display text-xl font-medium leading-snug text-cream sm:text-2xl">{q.q}</h3>

        <div className="mt-5 flex flex-col gap-3">
          {q.options.map((opt, i) => {
            const isPicked = picked === i;
            const right = isPicked && i === q.answer;
            const wrong = isPicked && i !== q.answer;
            return (
              <button
                key={`${q.id}-${i}`}
                onClick={() => answer(i)}
                disabled={picked !== null}
                className={cn(
                  "glass group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-light transition-all duration-300 active:scale-[0.97]",
                  picked === null && "hover:border-gold-400/45 hover:bg-white/[0.06]",
                  right && "border-gold-300 bg-gold-400/15 text-gold-300",
                  wrong && "border-blush-500/70 bg-blush-500/10 text-blush-400",
                  picked !== null && !isPicked && "opacity-40"
                )}
              >
                <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px]", right ? "border-gold-300 text-gold-300" : wrong ? "border-blush-500 text-blush-500" : "border-cream/25 text-cream/50")}>
                  {["A", "B", "C", "D", "E"][i]}
                </span>
                {opt}
                {right && <CheckCircle2 size={15} className="ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>

        <p className={cn("mt-4 min-h-[1.5rem] text-center text-xs font-light transition-opacity", feedback ? "opacity-100" : "opacity-0", feedback?.ok ? "text-gold-300" : "text-blush-400")}>
          {feedback?.text ?? "—"}
        </p>

        {q.hint && (
          <button
            onClick={() => { setShowHint((h) => !h); sfx.tick(); }}
            className="mx-auto mt-1 flex items-center gap-2 rounded-full border border-dashed border-gold-400/30 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-gold-400/75 transition-colors hover:border-gold-400/60"
          >
            <Lightbulb size={12} /> {showHint ? q.hint : "clue lagbe?"}
          </button>
        )}
      </div>

      <p className="mt-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-cream/35">
        shob thik hole shesh panna khulbe <ArrowRight size={11} />
      </p>
    </div>
  );
}
