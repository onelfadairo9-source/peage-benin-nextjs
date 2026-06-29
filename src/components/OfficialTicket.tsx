"use client";

import { QrCode } from "@/components/QrCode";
import { formatShortDate, formatTime } from "@/lib/format";
import { vehicleName } from "@/lib/constants";
import { Printer } from "lucide-react";
import type { ReceiptData } from "@/components/ConfirmationClient";

/**
 * Reproduit le format d'un ticket physique de péage béninois (type SIRB) :
 * poste, date/heure, cabine, percepteur, direction, montant.
 * S'imprime séparément du reçu principal (déclenche sa propre fenêtre
 * d'impression filtrée par un id dédié).
 */
export function OfficialTicket({ data }: { data: ReceiptData }) {
  const dateRef = data.paidAt ?? data.createdAt;
  const station = data.details["Poste de péage"] ?? "Péage Bénin";
  const direction =
    data.details["Sens"] ?? data.details["Trajet"] ?? "—";

  function printTicket() {
    document.body.classList.add("printing-ticket");
    window.print();
    // Nettoie après la boîte de dialogue d'impression (fermeture immédiate ou non)
    setTimeout(() => document.body.classList.remove("printing-ticket"), 500);
  }

  return (
    <div className="mt-4">
      <button
        onClick={printTicket}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-ink/15 bg-white py-3 text-sm font-bold text-ink transition hover:bg-ink/5 print:hidden"
      >
        <Printer size={16} /> Télécharger le reçu officiel (format poste de péage)
      </button>

      {/* Ticket caché à l'écran, affiché uniquement lors de l'impression de cette zone */}
      <div id="official-ticket-print" className="ticket-only mx-auto mt-4 hidden w-[300px] bg-white p-4 font-mono text-[12px] leading-tight text-black">
        <p className="text-center text-[13px] font-bold underline">
          POSTE DE PEAGE BENIN
        </p>
        <p className="text-center">
          {formatShortDate(dateRef)} - {formatTime(dateRef)} {station.toUpperCase()}
        </p>
        <p className="my-1.5 border-t border-dashed border-black" />

        <p>CABINE: {data.kind === "passage" ? "VR" : "PR"}</p>
        <p>REFERENCE: {data.reference}</p>
        <p>PLAQUE: {data.plate}</p>
        <p>VEHICULE: {vehicleName(data.vehicleType).toUpperCase()}</p>
        <p>DIRECTION: {direction.toUpperCase()}</p>

        <p className="my-1.5 border-t border-dashed border-black" />
        <p className="text-center text-[22px] font-bold">
          {Math.round(data.amount).toLocaleString("fr-FR")} FCFA
        </p>
        <p className="my-1.5 border-t border-dashed border-black" />

        <div className="flex justify-center py-1.5">
          <QrCode value={data.reference} size={90} />
        </div>
        <p className="text-center text-[10px]">
          Péage Bénin — Reçu officiel généré électroniquement
        </p>
      </div>

      {/* Règles d'impression : masque tout sauf le ticket quand on imprime */}
      <style jsx global>{`
        @media print {
          body.printing-ticket * {
            visibility: hidden;
          }
          body.printing-ticket #official-ticket-print {
            visibility: visible;
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
          }
          body.printing-ticket #official-ticket-print * {
            visibility: visible;
          }
        }
      `}</style>
    </div>
  );
}
