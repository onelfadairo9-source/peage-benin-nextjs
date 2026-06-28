import Link from "next/link";
import { Logo } from "./Logo";
import { APP_NAME } from "@/lib/constants";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-ink text-white/80">
      <div className="flex h-1.5 w-full">
        <span className="flex-1 bg-leaf" />
        <span className="flex-1 bg-gold" />
        <span className="flex-1 bg-brand" />
      </div>
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand/20 blur-3xl" />
      <div className="absolute -left-10 bottom-0 h-52 w-52 rounded-full bg-leaf/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 w-fit">
            <Logo variant="light" />
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/65">
            La plateforme numérique officielle de gestion et de paiement du
            péage au Bénin. Réglez vos trajets à l'avance ou au passage, en
            toute fluidité et sécurité.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wide text-white">
            Navigation
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="hover:text-gold transition-colors" href="/predefini">Mode Prédéfini</Link></li>
            <li><Link className="hover:text-gold transition-colors" href="/instantane">Mode Instantané</Link></li>
            <li><Link className="hover:text-gold transition-colors" href="/verification">Vérifier un paiement</Link></li>
            <li><Link className="hover:text-gold transition-colors" href="/admin">Espace Administration</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wide text-white">
            Contact
          </h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-2.5">
              <MapPin size={16} className="text-gold" /> Cotonou, Bénin
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={16} className="text-gold" /> +229 01 97 00 00 00
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={16} className="text-gold" /> contact@peage.bj
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-white/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {APP_NAME} — République du Bénin. Tous
            droits réservés.
          </p>
          <p>Paiements sécurisés · Mobile Money · Carte bancaire</p>
        </div>
      </div>
    </footer>
  );
}
