import { ImagePlus } from "lucide-react";
import type { BookPage } from "../../data/pages";
import { useMediaUrl } from "../../lib/media";
import { VoiceBubble } from "../VoiceBubble";
import { cn } from "../../utils/cn";

export function CartoonPage({ page, pageNo }: { page: BookPage; pageNo: number }) {
  const uploaded = useMediaUrl(page.imgKey);
  const src = uploaded ?? page.img;
  const tilt = pageNo % 2 === 0 ? "-rotate-1" : "rotate-1";

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-2 pb-6">
      {/* sketchbook card with tape */}
      <div className={cn("glass relative w-full rounded-[1.8rem] p-4 pt-6 shadow-[0_24px_70px_-24px_rgba(0,0,0,.8)] sm:p-5 sm:pt-7", tilt)}>
        <span className="absolute -top-2.5 left-8 h-6 w-20 -rotate-6 rounded-sm bg-gold-400/35 backdrop-blur-sm" style={{ clipPath: "polygon(4% 0, 96% 8%, 100% 92%, 0 100%)" }} />
        <span className="absolute -top-2.5 right-8 h-6 w-20 rotate-6 rounded-sm bg-blush-400/30 backdrop-blur-sm" style={{ clipPath: "polygon(0 8%, 100% 0, 96% 100%, 4% 92%)" }} />

        <div className="overflow-hidden rounded-2xl border-2 border-dashed border-gold-400/25 bg-velvet-800">
          {src ? (
            <img src={src} alt={page.title} className="aspect-square w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 text-center" style={{ background: "radial-gradient(400px 400px at 50% 35%, #3a1729, #26101c)" }}>
              <ImagePlus size={40} className="text-gold-400/60" strokeWidth={1.3} />
              <p className="px-8 font-hand text-2xl leading-snug text-cream/55">
                Chobi slot khali — edit mode (2525) theke chobi boshao.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 px-1">
          <p className="-rotate-2 font-hand text-3xl leading-none text-gold-300">{page.title}</p>
          <span className="glass flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-xs italic text-blush-400">{pageNo}</span>
        </div>
      </div>

      {/* caption bubble */}
      {page.caption && (
        <div className="relative mt-6 w-full">
          <div className={cn("glass-deep relative rounded-[1.5rem] rounded-tl-none border-blush-400/25 p-5", pageNo % 2 === 0 ? "rotate-[0.6deg]" : "-rotate-[0.6deg]")}>
            <span className="absolute -top-3 left-5 rounded-full bg-blush-500 px-3 py-0.5 text-[9px] font-semibold uppercase tracking-[0.25em] text-velvet-900">
              caption
            </span>
            <p className="mt-1 font-hand text-[1.45rem] leading-[1.42] text-cream/90">{page.caption}</p>
          </div>
          <svg viewBox="0 0 24 24" className="twinkle absolute -right-1 -top-4 h-8 w-8 -rotate-12 text-blush-400/70" aria-hidden>
            <path fill="currentColor" d="M12 2 l2.2 6.6 L21 11 l-6.8 2.4 L12 20 l-2.2-6.6 L3 11 l6.8-2.4 z" />
          </svg>
        </div>
      )}

      <VoiceBubble mediaKey={page.voiceKey} label={page.voiceLabel} seed={pageNo} />
    </div>
  );
}
