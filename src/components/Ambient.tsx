import { useEffect, useMemo, useRef } from "react";

/** Fixed ambient layer: velvet gradient, drifting orbs, twinkling dust, cursor aura. */
export function Ambient() {
  const glowRef = useRef<HTMLDivElement>(null);

  const stars = useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) => ({
        id: i,
        left: `${(i * 37.7) % 100}%`,
        top: `${(i * 53.3) % 100}%`,
        size: 1 + ((i * 7) % 3),
        delay: `${(i * 0.37) % 4}s`,
        gold: i % 3 === 0,
      })),
    []
  );

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, raf = 0;
    const move = (e: PointerEvent) => { tx = e.clientX; ty = e.clientY; };
    const loop = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      glow.style.transform = `translate(${x - 220}px, ${y - 220}px)`;
      raf = requestAnimationFrame(loop);
    };
    addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => { removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* base velvet wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 800px at 15% -10%, #3a1729 0%, transparent 55%), radial-gradient(1000px 700px at 95% 15%, #2a101d 0%, transparent 50%), radial-gradient(900px 900px at 50% 110%, #31142a 0%, transparent 55%), #1f0b16",
        }}
      />
      {/* drifting color orbs */}
      <div
        className="orb absolute -left-40 top-[12%] h-[34rem] w-[34rem] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(242,147,143,.24), transparent 65%)" }}
      />
      <div
        className="orb absolute right-[-12rem] top-[45%] h-[38rem] w-[38rem] rounded-full opacity-35 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(230,197,148,.18), transparent 65%)", animationDelay: "-6s" }}
      />
      <div
        className="orb absolute bottom-[-14rem] left-[20%] h-[30rem] w-[30rem] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(168,127,61,.2), transparent 65%)", animationDelay: "-11s" }}
      />
      {/* gold dust */}
      {stars.map((s) => (
        <span
          key={s.id}
          className="twinkle absolute rounded-full"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
            background: s.gold ? "#e6c594" : "#f7b2ad",
            boxShadow: s.gold ? "0 0 8px 1px rgba(230,197,148,.7)" : "0 0 6px 1px rgba(247,178,173,.55)",
          }}
        />
      ))}
      {/* cursor aura (desktop) */}
      <div
        ref={glowRef}
        className="hidden md:block absolute h-[440px] w-[440px] rounded-full mix-blend-screen"
        style={{ background: "radial-gradient(circle, rgba(255,215,0,.07), rgba(248,177,149,.05) 40%, transparent 70%)" }}
      />
      {/* vignette */}
      <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 220px 40px rgba(20,7,16,.85)" }} />
    </div>
  );
}
