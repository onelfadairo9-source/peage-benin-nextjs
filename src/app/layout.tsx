import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Péage Bénin — Réseau National de Péage",
    template: "%s · Péage Bénin",
  },
  description:
    "Plateforme officielle de paiement du péage au Bénin. Réglez vos trajets et passages en ligne, en toute sécurité, avec Mobile Money ou carte bancaire.",
  keywords: [
    "péage Bénin",
    "paiement péage",
    "Mobile Money",
    "Cotonou",
    "Parakou",
    "RNIE",
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
