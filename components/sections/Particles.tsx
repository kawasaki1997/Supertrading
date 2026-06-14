"use client";

import { useEffect, useState } from "react";

type Dot = {
  id: number;
  left: number;
  bottom: number;
  size: number;
  delay: number;
  duration: number;
  dx: string;
  gold: boolean;
};

/** Lightweight CSS gold-dust particle field — no canvas, respects reduced-motion.
 *  Particles are generated only after mount to avoid SSR/client hydration mismatch. */
export function Particles({ count = 36 }: { count?: number }) {
  const [dots, setDots] = useState<Dot[]>([]);

  useEffect(() => {
    setDots(
      Array.from({ length: count }, (_, i) => {
        const size = 1 + Math.random() * 2.5;
        return {
          id: i,
          left: Math.random() * 100,
          bottom: Math.random() * 30,
          size,
          delay: Math.random() * 8,
          duration: 7 + Math.random() * 9,
          dx: `${(Math.random() - 0.5) * 80}px`,
          gold: Math.random() > 0.4,
        };
      }),
    );
  }, [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {dots.map((d) => (
        <span
          key={d.id}
          className="absolute rounded-full"
          style={{
            left: `${d.left}%`,
            bottom: `${d.bottom}%`,
            width: d.size,
            height: d.size,
            background: d.gold
              ? "var(--color-gold-300)"
              : "var(--color-royal-300)",
            boxShadow: d.gold
              ? "0 0 6px 1px var(--color-gold-400)"
              : "0 0 6px 1px var(--color-royal-400)",
            // @ts-expect-error custom prop consumed by the `drift` keyframes
            "--dx": d.dx,
            animation: `drift ${d.duration}s linear ${d.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
