import { useState } from "react";
import { cn } from "../utils/cn";

/* Local cinematic fallbacks, cycled when an Unsplash URL fails */
const FALLBACKS = ["images/memory-beach.jpg", "images/memory-kitchen.jpg", "images/memory-city.jpg"];

export function MemoryImg({
  src, alt, id, className, imgClassName,
}: {
  src: string;
  alt: string;
  id: number;
  className?: string;
  imgClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-velvet-800", className)}>
      {/* shimmer while loading */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-700",
          loaded ? "opacity-0" : "opacity-100"
        )}
        style={{ background: "linear-gradient(120deg, #2a101d 20%, #3a1729 40%, #2a101d 60%)", backgroundSize: "200% 100%", animation: "gold-sheen 1.6s linear infinite" }}
      />
      <img
        src={failed ? FALLBACKS[id % FALLBACKS.length] : src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={cn("h-full w-full object-cover transition-opacity duration-700", loaded ? "opacity-100" : "opacity-0", imgClassName)}
      />
    </div>
  );
}
