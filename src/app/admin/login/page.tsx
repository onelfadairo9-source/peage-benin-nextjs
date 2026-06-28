"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ShieldCheck, Loader2, Lock, User, ArrowLeft, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        router.replace("/admin");
        router.refresh();
      } else {
        setError(data.message ?? "Identifiants incorrects.");
      }
    } catch {
      setError("Connexion impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hero-mesh relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
        <div className="absolute -left-16 top-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute -right-10 bottom-10 h-80 w-80 rounded-full bg-leaf/20 blur-3xl" />
        <div className="relative">
          <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur w-fit">
            <Logo variant="light" />
          </div>
        </div>
        <div className="relative text-white">
          <ShieldCheck size={40} className="text-gold" />
          <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight">
            Espace Administration
          </h1>
          <p className="mt-3 max-w-md text-white/80">
            Pilotez l’ensemble du réseau de péage : abonnements, passages,
            paiements et statistiques en temps réel.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-white/80">
            {[
              "Vue d’ensemble des revenus",
              "Vérification de tous les paiements",
              "Suivi des abonnements et passages",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/50">
          © {new Date().getFullYear()} Péage Bénin — République du Bénin
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col items-center justify-center bg-[#fbf7f7] px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center lg:hidden">
            <Logo />
          </div>
          <h2 className="font-display text-2xl font-extrabold text-ink">
            Connexion
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Accédez au tableau de bord d’administration.
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">
                Identifiant
              </span>
              <div className="relative">
                <User
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
                />
                <input
                  className="input-field !pl-10"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">
                Mot de passe
              </span>
              <div className="relative">
                <Lock
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
                />
                <input
                  className="input-field !pl-10"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </label>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-brand flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-bold"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin-slow" /> Connexion…
                </>
              ) : (
                <>
                  <ShieldCheck size={18} /> Se connecter
                </>
              )}
            </button>
          </form>

          <div className="mt-5 rounded-xl border border-brand/10 bg-white p-3 text-center text-xs text-ink-soft">
            <span className="font-semibold text-ink">Démo :</span> identifiant{" "}
            <code className="rounded bg-brand-soft px-1.5 py-0.5 font-mono text-brand-dark">
              admin
            </code>{" "}
            · mot de passe{" "}
            <code className="rounded bg-brand-soft px-1.5 py-0.5 font-mono text-brand-dark">
              peage2026
            </code>
          </div>

          <Link
            href="/"
            className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-ink-soft transition-colors hover:text-brand"
          >
            <ArrowLeft size={15} /> Retour au site
          </Link>
        </div>
      </div>
    </div>
  );
}
