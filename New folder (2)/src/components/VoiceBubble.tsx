import { useEffect, useRef, useState } from "react";
import { Play, Pause, AudioLines } from "lucide-react";
import { useMediaUrl } from "../lib/media";
import { cn } from "../utils/cn";

/** Upload/record kora voice note — kono page-e attach kora jay. */
export function VoiceBubble({ mediaKey, label, seed = 3 }: { mediaKey?: string; label?: string; seed?: number }) {
  const url = useMediaUrl(mediaKey);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const bars = useRef(Array.from({ length: 26 }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 2.6 + seed)))).current;

  useEffect(() => {
    setPlaying(false);
    setProgress(0);
  }, [url]);

  if (!mediaKey) return null;

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { void a.play(); setPlaying(true); }
    else { a.pause(); setPlaying(false); }
  };

  return (
    <div className="glass mt-5 w-full rounded-3xl p-4">
      <div className="flex items-center gap-3.5">
        <button
          onClick={toggle}
          disabled={!url}
          className="ring-glow flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blush-400 to-blush-500 text-velvet-900 transition-transform active:scale-90 disabled:opacity-40"
          aria-label={playing ? "pause voice" : "play voice"}
        >
          {playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" className="ml-0.5" />}
        </button>

        <div className={cn("flex h-9 flex-1 items-center gap-[3px]", playing && "wave-playing")}>
          {bars.map((h, i) => (
            <span
              key={i}
              className={cn("wave-bar w-[3px] rounded-full transition-colors", i / bars.length <= progress ? "bg-gold-300" : "bg-blush-400/35")}
              style={{ height: `${h * 100}%`, animationDelay: `${(i % 7) * 0.09}s`, animationDuration: `${0.7 + (i % 5) * 0.11}s` }}
            />
          ))}
        </div>
      </div>

      <p className="mt-2 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.25em] text-gold-400/60">
        <AudioLines size={11} /> {label || "voice note · tomar jonno"}
      </p>

      {url && (
        <audio
          ref={audioRef}
          src={url}
          onTimeUpdate={(e) => {
            const a = e.currentTarget;
            if (a.duration) setProgress(a.currentTime / a.duration);
          }}
          onEnded={() => { setPlaying(false); setProgress(0); }}
          className="hidden"
        />
      )}
    </div>
  );
}
