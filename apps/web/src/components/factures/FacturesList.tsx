"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle, XCircle, Eye } from "lucide-react";

interface Facture {
  id: string;
  numero: string | null;
  fichier_nom: string | null;
  montant_ht: number | null;
  montant_ttc: number | null;
  statut: string;
  created_at: string;
}

export function FacturesList() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get("/factures/").then((r) => {
      setFactures(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const valider = async (id: string) => {
    await api.put(`/factures/${id}/valider`);
    load();
  };

  const rejeter = async (id: string) => {
    await api.put(`/factures/${id}/rejeter`);
    load();
  };

  if (loading) return <div className="text-sm text-gray-400">Chargement...</div>;

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="border-b px-6 py-4">
        <h2 className="font-semibold text-gray-900">Toutes les factures ({factures.length})</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase text-gray-400">
              <th className="px-6 py-3">Fichier</th>
              <th className="px-6 py-3">N° Facture</th>
              <th className="px-6 py-3">Montant HT</th>
              <th className="px-6 py-3">Montant TTC</th>
              <th className="px-6 py-3">Statut</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {factures.map((f) => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-900">{f.fichier_nom || "—"}</td>
                <td className="px-6 py-3 text-gray-500">{f.numero || "—"}</td>
                <td className="px-6 py-3">{f.montant_ht ? formatCurrency(f.montant_ht) : "—"}</td>
                <td className="px-6 py-3 font-medium">{f.montant_ttc ? formatCurrency(f.montant_ttc) : "—"}</td>
                <td className="px-6 py-3"><StatusBadge statut={f.statut} /></td>
                <td className="px-6 py-3 text-gray-400">{formatDate(f.created_at)}</td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    {f.statut === "A_VALIDER" && (
                      <>
                        <button
                          onClick={() => valider(f.id)}
                          className="rounded p-1 text-green-600 hover:bg-green-50"
                          title="Valider"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => rejeter(f.id)}
                          className="rounded p-1 text-red-600 hover:bg-red-50"
                          title="Rejeter"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button className="rounded p-1 text-gray-400 hover:bg-gray-100" title="Voir">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {factures.length === 0 && (
          <p className="px-6 py-8 text-center text-sm text-gray-400">Aucune facture</p>
        )}
      </div>
    </div>
  );
}
