"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle, Mail } from "lucide-react";

interface Appel {
  id: string;
  periode: string;
  montant_total: number;
  date_echeance: string;
  jours_retard?: number;
  statut: string;
}

const STATUT_LABELS: Record<string, { label: string; class: string }> = {
  EN_ATTENTE: { label: "En attente", class: "bg-yellow-100 text-yellow-700" },
  ENCAISSE: { label: "Encaissé", class: "bg-green-100 text-green-700" },
  RETARD: { label: "Retard", class: "bg-orange-100 text-orange-700" },
  IMPAYE: { label: "Impayé", class: "bg-red-100 text-red-700" },
};

export function LoyersTable() {
  const [appels, setAppels] = useState<Appel[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get("/loyers/").then((r) => {
      setAppels(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const encaisser = async (id: string) => {
    await api.post(`/loyers/${id}/encaisser`);
    load();
  };

  const genererRelance = async (id: string) => {
    const res = await api.post(`/assistant/relance/${id}`);
    alert(`Lettre de relance générée :\n\nObjet: ${res.data.objet}\n\n${res.data.corps}`);
  };

  if (loading) return <div className="text-sm text-gray-400">Chargement...</div>;

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase text-gray-400">
              <th className="px-6 py-3">Période</th>
              <th className="px-6 py-3">Montant</th>
              <th className="px-6 py-3">Échéance</th>
              <th className="px-6 py-3">Retard</th>
              <th className="px-6 py-3">Statut</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {appels.map((a) => {
              const s = STATUT_LABELS[a.statut] || { label: a.statut, class: "bg-gray-100 text-gray-600" };
              return (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{a.periode}</td>
                  <td className="px-6 py-3">{formatCurrency(a.montant_total)}</td>
                  <td className="px-6 py-3 text-gray-500">{formatDate(a.date_echeance)}</td>
                  <td className="px-6 py-3">
                    {a.jours_retard !== undefined && a.jours_retard > 0
                      ? <span className="text-red-600 font-medium">{a.jours_retard}j</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${s.class}`}>
                      {s.label}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      {a.statut !== "ENCAISSE" && (
                        <button
                          onClick={() => encaisser(a.id)}
                          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Encaisser
                        </button>
                      )}
                      {(a.statut === "RETARD" || a.statut === "IMPAYE") && (
                        <button
                          onClick={() => genererRelance(a.id)}
                          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-blue-700 hover:bg-blue-50"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Relance IA
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {appels.length === 0 && (
          <p className="px-6 py-8 text-center text-sm text-gray-400">Aucun appel de loyer</p>
        )}
      </div>
    </div>
  );
}
