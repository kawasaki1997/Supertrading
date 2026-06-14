/** SUPER TRADING — dragon emblem + wordmark. Pure SVG, gold gradient. */

export function DragonMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden role="img">
      <defs>
        <linearGradient id="dragonGrad" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#fbf1d3" />
          <stop offset="45%" stopColor="#e0c074" />
          <stop offset="100%" stopColor="#a8884e" />
        </linearGradient>
      </defs>
      <g
        fill="url(#dragonGrad)"
        stroke="#6e5830"
        strokeWidth="0.9"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {/* mane / frill spikes along the back of the neck */}
        <path d="M36 24 L 48 18 L 40 28 Z" />
        <path d="M39 29 L 52 27 L 41 33 Z" />
        <path d="M39 34 L 51 36 L 38 38 Z" />
        {/* two horns swept BACK over the neck (dragon faces left) */}
        <path d="M30 20 C 38 13 47 10 57 8 C 48 13 41 18 35 25 Z" />
        <path d="M27 22 C 33 17 40 14 48 13 C 41 17 35 21 32 26 Z" />
        {/* upper jaw / head — long angular reptilian snout, mouth open */}
        <path
          d="M3 29
             C 7 26 12 24 17 23
             C 23 22 29 22 34 25
             C 38 27 40 31 40 35
             C 38 35 35 34 33 33
             C 27 32 19 32 12 33
             C 9 33 6 32 3 31 Z"
        />
        {/* upper fang */}
        <path d="M11 33 L 12 37 L 14 33 Z" />
        <path d="M16 33 L 17 36 L 19 33 Z" />
        {/* lower jaw, slightly open */}
        <path
          d="M33 37
             C 28 38 20 39 13 39
             C 9 39 6 40 4 42
             C 8 40 14 40 19 40
             C 25 40 30 39 34 38 Z"
        />
        {/* lower chin barbel */}
        <path d="M13 39 C 11 43 12 47 15 49 C 16 44 16 41 17 39 Z" />
        {/* long whiskers trailing from the snout */}
        <path d="M4 30 C -2 31 -4 37 -1 42" fill="none" strokeWidth="1.2" />
        <path d="M5 33 C 0 36 -1 41 2 45" fill="none" strokeWidth="1" />
      </g>
      {/* brow ridge */}
      <path d="M19 26 C 22 24 26 24 29 26" fill="none" stroke="#6e5830" strokeWidth="1.4" strokeLinecap="round" />
      {/* eye */}
      <circle cx="22" cy="28.5" r="1.9" fill="#13131d" />
      <circle cx="22.7" cy="27.8" r="0.6" fill="#fbf1d3" />
      {/* nostril */}
      <circle cx="6" cy="29.5" r="0.9" fill="#6e5830" />
    </svg>
  );
}

export function Brand({
  size = "md",
  className = "",
  href = "#",
}: {
  size?: "sm" | "md";
  className?: string;
  href?: string;
}) {
  const badge = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const big = size === "sm" ? "text-base" : "text-xl";
  const small = size === "sm" ? "text-[8px]" : "text-[10px]";

  return (
    <a href={href} className={`group flex items-center gap-3 ${className}`}>
      <span
        className={`relative grid ${badge} shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-royal-700 via-ink-700 to-ink-800 ring-gold`}
      >
        <DragonMark className="h-[72%] w-[72%] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-110" />
        <span className="absolute -inset-px rounded-xl opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100 group-hover:[box-shadow:0_0_22px_4px_var(--color-gold-500)]" />
      </span>
      <span className="leading-none">
        <span
          className={`block font-display ${big} font-extrabold tracking-[0.18em] text-gold-grad`}
        >
          SUPER
        </span>
        <span
          className={`mt-1 block ${small} font-semibold tracking-[0.42em] text-parchment-dim`}
        >
          TRADING
        </span>
      </span>
    </a>
  );
}
