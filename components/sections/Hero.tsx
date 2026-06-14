"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  Coins,
  Swords,
  Cherry,
  Shield,
  Boxes,
  ShieldCheck,
  Zap,
  BadgeDollarSign,
  Headphones,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Particles } from "./Particles";
import { useT } from "@/components/i18n/LangProvider";

const tags: { icon: LucideIcon; title: string; sub: string; side: "l" | "r"; y: string }[] = [
  { icon: Coins, title: "ROBUX", sub: "Cheap & Safe", side: "l", y: "12%" },
  { icon: Swords, title: "MM2 ITEM", sub: "Cheap & Fast", side: "l", y: "42%" },
  { icon: Cherry, title: "BLOX FRUITS", sub: "Accounts", side: "l", y: "72%" },
  { icon: Shield, title: "RAID SERVICE", sub: "Pro Team", side: "r", y: "16%" },
  { icon: Boxes, title: "ITEMS", sub: "Cheapest", side: "r", y: "46%" },
  { icon: ShieldCheck, title: "TRUSTED", sub: "Seller", side: "r", y: "76%" },
];

const trust = [
  { icon: BadgeDollarSign, key: "trust.bestPrice" },
  { icon: Zap, key: "trust.instant" },
  { icon: ShieldCheck, key: "trust.safe" },
  { icon: Headphones, key: "trust.support" },
];

function Layer({
  depth,
  mx,
  my,
  children,
  className,
}: {
  depth: number;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  children: React.ReactNode;
  className?: string;
}) {
  const x = useTransform(mx, (v) => v * depth);
  const y = useTransform(my, (v) => v * depth);
  return (
    <motion.div style={{ x, y }} className={className}>
      {children}
    </motion.div>
  );
}

export function Hero() {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 80, damping: 18 });
  const my = useSpring(rawY, { stiffness: 80, damping: 18 });

  function handleMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    rawX.set(((e.clientX - r.left) / r.width - 0.5) * 40);
    rawY.set(((e.clientY - r.top) / r.height - 0.5) * 40);
  }

  return (
    <section
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => {
        rawX.set(0);
        rawY.set(0);
      }}
      className="relative isolate overflow-hidden rounded-3xl ring-1 ring-gold-500/15 glow-royal"
    >
      {/* ---- Dark base (fallback if video fails) ---- */}
      <div className="absolute inset-0 -z-30 bg-gradient-to-br from-ink-900 via-ink-850 to-ink-950" />

      {/* ---- Background video: flying dragon (LoL-style full-bleed loop) ---- */}
      <video
        className="absolute inset-0 -z-20 h-full w-full object-cover [object-position:50%_42%]"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/hero/hero-poster.jpg"
      >
        <source src="/hero/hero.mp4" type="video/mp4" />
      </video>

      {/* ---- Readability overlays (keep text legible over the footage) ---- */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/45 to-ink-950/25" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(115%_85%_at_50%_46%,transparent_38%,rgba(6,6,10,0.72))]" />
      {/* subtle colour tint to marry footage with the palette */}
      <div className="animate-aurora absolute -right-16 top-6 -z-10 h-80 w-80 rounded-full bg-royal-700/20 blur-[110px] [animation-delay:-6s]" />
      <div className="animate-aurora absolute -left-20 bottom-0 -z-10 h-72 w-80 rounded-full bg-gold-800/20 blur-[110px] [animation-delay:-10s]" />

      <Particles count={40} />

      {/* ---- Floating service chips (parallax) ---- */}
      {tags.map((tag, i) => (
        <Layer
          key={tag.title}
          depth={0.5 + (i % 3) * 0.18}
          mx={mx}
          my={my}
          className={`absolute z-10 hidden md:block ${tag.side === "l" ? "left-5 lg:left-8" : "right-5 lg:right-8"}`}
        >
          <div style={{ top: tag.y }} className="absolute">
            <motion.div
              initial={{ opacity: 0, x: tag.side === "l" ? -24 : 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="group flex w-[160px] cursor-pointer items-center gap-3 rounded-xl glass px-3 py-2.5 ring-gold transition-all duration-300 hover:-translate-y-0.5 hover:glow-gold"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink-900/60 ring-1 ring-gold-500/20">
                <tag.icon className="h-[18px] w-[18px] text-gold-400" />
              </span>
              <span className="leading-tight">
                <span className="block font-display text-[12px] font-bold tracking-wider text-parchment">
                  {tag.title}
                </span>
                <span className="block text-[10px] uppercase tracking-wide text-muted">
                  {tag.sub}
                </span>
              </span>
            </motion.div>
          </div>
        </Layer>
      ))}

      {/* ---- Center stage ---- */}
      <div className="relative z-20 mx-auto flex min-h-[520px] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center sm:min-h-[600px] lg:min-h-[640px]">
        <Layer depth={-0.3} mx={mx} my={my} className="flex flex-col items-center">
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-parchment-dim"
          >
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full text-emerald-soft" style={{ background: "var(--color-emerald-soft)" }} />
            {t("hero.badge")}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-4xl font-black leading-[0.95] tracking-[0.04em] text-gold-grad sm:text-6xl lg:text-7xl"
          >
            SUPER TRADING
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-5 max-w-xl font-serif text-xl text-parchment-dim sm:text-2xl"
          >
            {t("hero.tagline")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.6 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <button className="group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-b from-gold-300 to-gold-600 px-6 py-3 text-sm font-bold tracking-wide text-ink-950 transition-all duration-200 hover:from-gold-200 hover:to-gold-500 hover:glow-gold">
              {t("common.buyNow")}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
            <button className="inline-flex cursor-pointer items-center gap-2 rounded-xl glass px-6 py-3 text-sm font-semibold text-parchment ring-gold transition-colors duration-200 hover:text-gold-300">
              {t("hero.joinDiscord")}
            </button>
          </motion.div>

          {/* BUY • FAST • TRUSTED */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-9 font-serif text-sm font-semibold italic tracking-[0.35em] text-gold-500"
          >
            BUY&nbsp;&nbsp;•&nbsp;&nbsp;FAST&nbsp;&nbsp;•&nbsp;&nbsp;TRUSTED
          </motion.p>
        </Layer>
      </div>

      {/* ---- Trust strip ---- */}
      <div className="relative z-20 border-t border-gold-500/10 bg-ink-950/40 backdrop-blur-sm">
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-px sm:grid-cols-4">
          {trust.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-center gap-2 px-3 py-4 text-center"
            >
              <item.icon className="h-4 w-4 shrink-0 text-gold-400" />
              <span className="text-xs font-semibold text-parchment-dim">{t(item.key)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
