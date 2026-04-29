"use client";

import { FileText, AlertTriangle, CheckCircle, Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface KPIs {
  factures_a_valider: number;
  loyers_en_retard: number;
  loyers_en_retard_montant: number;
  loyers_encaisses_mois: number;
  loyers_attendus_mois: number;
  taux_encaissement: number;
  nb_immeubles: number;
}

export function DashboardKPIs() {
  const [kpis, setKpis] = useState<KPIs | null>(null);

  useEffect(() => {
    api.get("/dashboard").then((r) => setKpis(r.data.kpis)).catch(() => {});
  }, []);

  const cards = [
    {
      label: "Factures à valider",
      value: kpis?.factures_a_valider ?? "—",
      icon: FileText,
      color: "text-orange-600 bg-orange-50",
      urgent: (kpis?.factures_a_valider ?? 0) > 0,
    },
    {
      label: "Loyers en retard",
      value: kpis ? `${kpis.loyers_en_retard} (${kpis.loyers_en_retard_montant.toLocaleString("fr-FR")}€)` : "—",
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50",
      urgent: (kpis?.loyers_en_retard ?? 0) > 0,
    },
    {
      label: "Taux d'encaissement",
      value: kpis ? `${kpis.taux_encaissement}%` : "—",
      icon: CheckCircle,
      color: "text-green-600 bg-green-50",
      urgent: false,
    },
    {
      label: "Immeubles gérés",
      value: kpis?.nb_immeubles ?? "—",
      icon: Building2,
      color: "text-blue-600 bg-blue-50",
      urgent: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={cn(
            "rounded-xl border bg-white p-5 shadow-sm",
            card.urgent && "border-l-4 border-l-red-500"
          )}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <div className={cn("rounded-lg p-2", card.color)}>
              <card.icon className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
