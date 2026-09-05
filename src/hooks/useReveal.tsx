import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "../utils/cn";

/** Adds .is-visible to .reveal elements when they enter the viewport. */
export function useRevealRoot<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    root.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  style?: CSSProperties;
  as?: "div" | "section" | "span" | "figure";
}

export function Reveal({ children, className, delay = 0, style, as = "div" }: RevealProps) {
  const Tag = as as "div";
  return (
    <Tag
      className={cn("reveal", className)}
      style={{ ...style, animationDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
