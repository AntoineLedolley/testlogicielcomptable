"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface FactureItem {
  id: string;
  fichier_nom: string;
  montant_ttc: number | null;
  statut: string;
  created_at: string;
}

export function FacturesRecentes() {
  const [factures, setFactures] = useState<FactureItem[]>([]);

  useEffect(() => {
    api.get("/dashboard").then((r) => setFactures(r.data.factures_recentes)).catch(() => {});
  }, []);

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h2 className="font-semibold text-gray-900">Factures à valider</h2>
        <Link href="/factures" className="text-sm text-blue-600 hover:underline">
          Voir tout
        </Link>
      </div>
      <div className="divide-y">
        {factures.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-400">
            Aucune facture en attente de validation
          </p>
        ) : (
          factures.map((f) => (
            <Link
              key={f.id}
              href={`/factures/${f.id}`}
              className="flex items-center justify-between px-6 py-3 hover:bg-gray-50"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{f.fichier_nom || "Facture sans nom"}</p>
                <p className="text-xs text-gray-400">{formatDate(f.created_at)}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-900">
                  {f.montant_ttc ? formatCurrency(f.montant_ttc) : "—"}
                </span>
                <StatusBadge statut={f.statut} />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
