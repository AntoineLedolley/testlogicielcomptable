"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface LoyerRetard {
  id: string;
  periode: string;
  montant_total: number;
  date_echeance: string;
  statut: string;
}

export function LoyersRetard() {
  const [loyers, setLoyers] = useState<LoyerRetard[]>([]);

  useEffect(() => {
    api.get("/dashboard").then((r) => setLoyers(r.data.loyers_retard)).catch(() => {});
  }, []);

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h2 className="font-semibold text-gray-900">Loyers en retard</h2>
        <Link href="/loyers" className="text-sm text-blue-600 hover:underline">
          Gérer les relances
        </Link>
      </div>
      <div className="divide-y">
        {loyers.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-400">
            Aucun loyer en retard
          </p>
        ) : (
          loyers.map((l) => (
            <div key={l.id} className="flex items-center gap-4 px-6 py-3">
              <div className="rounded-full bg-red-50 p-1.5">
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{l.periode}</p>
                <p className="text-xs text-gray-400">Échéance : {formatDate(l.date_echeance)}</p>
              </div>
              <span className="text-sm font-semibold text-red-600">
                {formatCurrency(l.montant_total)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
