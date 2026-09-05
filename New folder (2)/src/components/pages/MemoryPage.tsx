import { UtensilsCrossed, CarFront, CloudRain, Clapperboard, Sunrise, MessagesSquare, MapPin, CalendarDays, Heart } from "lucide-react";
import type { BookPage, SceneKey } from "../../data/pages";
import { MemoryImg } from "../MemoryImg";
import { VoiceBubble } from "../VoiceBubble";
import { useMediaUrl } from "../../lib/media";
import { cn } from "../../utils/cn";

const SCENES: Record<SceneKey, { Icon: typeof CarFront; bg: string; tint: string }> = {
  noodles: { Icon: UtensilsCrossed, bg: "radial-gradient(420px 320px at 50% 30%, #4a2138, #26101c)", tint: "text-gold-300" },
  road: { Icon: CarFront, bg: "radial-gradient(420px 320px at 50% 30%, #2d2033, #1c1420)", tint: "text-blush-300" },
  rain: { Icon: CloudRain, bg: "radial-gradient(420px 320px at 50% 30%, #262b3a, #16161f)", tint: "text-blush-400" },
  movie: { Icon: Clapperboard, bg: "radial-gradient(420px 320px at 50% 30%, #3a1428, #22101a)", tint: "text-gold-400" },
  sunrise: { Icon: Sunrise, bg: "radial-gradient(420px 320px at 50% 25%, #59351c, #2a1a14)", tint: "text-gold-300" },
  chat: { Icon: MessagesSquare, bg: "radial-gradient(420px 320px at 50% 30%, #31142a, #1c0e18)", tint: "text-blush-500" },
};

export function MemoryPage({ page, pageNo }: { page: BookPage; pageNo: number }) {
  const uploaded = useMediaUrl(page.imgKey);
  const src = uploaded ?? page.img;
  const tilt = pageNo % 2 === 0 ? "rotate-1" : "-rotate-1";
  const scene = SCENES[page.scene ?? "noodles"];
  const SceneIcon = scene.Icon;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-2 pb-6">
      <div className={cn("w-full rounded-lg bg-cream p-3 pb-4 shadow-[0_28px_80px_-20px_rgba(0,0,0,.85)] transition-transform duration-500 hover:rotate-0 sm:p-4 sm:pb-5", tilt)}>
        <div className="relative overflow-hidden rounded-sm">
          {src ? (
            <MemoryImg src={src} alt={page.title} id={pageNo} className="aspect-[4/5] w-full" />
          ) : (
            <div className="relative flex aspect-[4/5] w-full flex-col items-center justify-center gap-4" style={{ background: scene.bg }}>
              {[...Array(8)].map((_, i) => (
                <span key={i} className="twinkle absolute h-1 w-1 rounded-full bg-gold-300" style={{ left: `${12 + i * 11}%`, top: `${10 + ((i * 17) % 70)}%`, animationDelay: `${i * 0.4}s` }} />
              ))}
              <span className={cn("glass flex h-24 w-24 items-center justify-center rounded-full", scene.tint)}>
                <SceneIcon size={44} strokeWidth={1.3} />
              </span>
              <p className="px-8 text-center font-hand text-2xl leading-snug text-cream/80">{page.title}</p>
              <span className="absolute bottom-3 px-6 text-center text-[8px] uppercase tracking-[0.28em] text-cream/35">
                photo slot — edit mode (2525) theke chobi boshao
              </span>
            </div>
          )}
          <span className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 40px rgba(31,11,22,.25)" }} />
        </div>

        <div className="mt-3 px-1">
          {page.caption && <p className="text-center font-hand text-[1.5rem] leading-[1.35] text-velvet-800">{page.caption}</p>}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] font-medium uppercase tracking-[0.2em] text-velvet-700/70">
            {page.date && <span className="flex items-center gap-1"><CalendarDays size={11} /> {page.date}</span>}
            {page.date && page.place && <span className="h-1 w-1 rounded-full bg-velvet-700/50" />}
            {page.place && <span className="flex items-center gap-1"><MapPin size={11} /> {page.place}</span>}
          </div>
        </div>
      </div>

      <VoiceBubble mediaKey={page.voiceKey} label={page.voiceLabel} seed={pageNo} />

      <p className="mt-6 flex items-center gap-2 text-center text-[10px] uppercase tracking-[0.3em] text-gold-400/50">
        <Heart size={10} className="fill-blush-500 text-blush-500" /> moner odhyay
      </p>
    </div>
  );
}
