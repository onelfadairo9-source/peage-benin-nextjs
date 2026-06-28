import { APP_NAME } from "@/lib/constants";

export function Logo({
  variant = "dark",
  size = 40,
}: {
  variant?: "dark" | "light";
  size?: number;
}) {
  const text = variant === "light" ? "text-white" : "text-ink";
  const sub = variant === "light" ? "text-white/70" : "text-ink-soft";
  return (
    <span className="flex items-center gap-2.5">
      <span
        className="relative inline-grid place-items-center rounded-2xl shadow-[0_8px_20px_-8px_rgba(213,0,0,0.7)]"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <rect width="48" height="48" rx="13" fill="url(#lg)" />
          <path
            d="M24 9 L33 39 H15 Z"
            fill="rgba(255,255,255,0.12)"
          />
          {/* road */}
          <path
            d="M17 35 L24 14 L31 35"
            stroke="#fff"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M24 20 V24"
            stroke="#FCD116"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <circle cx="24" cy="36.5" r="2" fill="#FCD116" />
          <defs>
            <linearGradient id="lg" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E2231A" />
              <stop offset="1" stopColor="#8E0000" />
            </linearGradient>
          </defs>
        </svg>
      </span>
      <span className="leading-none">
        <span className={`font-display text-[1.05rem] font-extrabold ${text}`}>
          {APP_NAME}
        </span>
        <span className={`block text-[0.62rem] font-semibold uppercase tracking-[0.18em] ${sub}`}>
          République du Bénin
        </span>
      </span>
    </span>
  );
}
