import Image from "next/image";
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
        className="relative inline-grid place-items-center"
        style={{ width: size, height: size }}
      >
        <Image
          src="/armoiries-benin.png"
          alt="Armoiries de la République du Bénin"
          width={size}
          height={size}
          className="h-full w-full object-contain"
          priority
        />
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
