import type { LucideIcon } from "lucide-react";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  accent = "brand",
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accent?: "brand" | "leaf";
}) {
  const grad =
    accent === "leaf"
      ? "from-leaf to-leaf-dark"
      : "from-brand-dark to-brand";
  return (
    <section className="relative overflow-hidden border-b border-brand/10">
      <div className="hero-mesh absolute inset-0 opacity-95" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_120%,rgba(0,0,0,0.3),transparent_55%)]" />
      <div className="relative mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <div className="flex items-center gap-4">
          <span
            className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${grad} text-white shadow-[0_14px_34px_-12px_rgba(120,0,0,0.7)]`}
          >
            <Icon size={26} />
          </span>
          <div>
            <span className="chip border border-white/20 bg-white/10 text-white/90">
              {eyebrow}
            </span>
            <h1 className="mt-1.5 font-display text-3xl font-extrabold text-white sm:text-4xl">
              {title}
            </h1>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-white/80">{subtitle}</p>
      </div>
      <svg viewBox="0 0 1440 50" className="block w-full" preserveAspectRatio="none">
        <path d="M0 50 C 480 0 960 0 1440 50 Z" fill="#fbf7f7" />
      </svg>
    </section>
  );
}
