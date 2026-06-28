"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/predefini", label: "Mode Prédéfini" },
  { href: "/instantane", label: "Mode Instantané" },
  { href: "/verification", label: "Vérifier un paiement" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-brand/10 shadow-[0_6px_24px_-16px_rgba(120,0,0,0.5)]"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" aria-label="Accueil Péage Bénin">
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                isActive(l.href)
                  ? "text-brand"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {l.label}
              {isActive(l.href) && (
                <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand" />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="hidden items-center gap-2 rounded-full border border-brand/20 bg-white/70 px-4 py-2 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand hover:text-white sm:inline-flex"
          >
            <ShieldCheck size={16} />
            Espace Admin
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-brand/15 bg-white/70 text-ink lg:hidden"
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-brand/10 glass lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                  isActive(l.href)
                    ? "bg-brand-soft text-brand-dark"
                    : "text-ink-soft hover:bg-brand-soft/60"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/admin"
              className="mt-1 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white"
            >
              <ShieldCheck size={16} /> Espace Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
