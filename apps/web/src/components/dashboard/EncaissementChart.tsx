"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MOCK_DATA = [
  { mois: "Jan", encaisse: 18500, attendu: 20000 },
  { mois: "Fév", encaisse: 19200, attendu: 20000 },
  { mois: "Mar", encaisse: 20000, attendu: 20000 },
  { mois: "Avr", encaisse: 17800, attendu: 20000 },
  { mois: "Mai", encaisse: 19500, attendu: 20000 },
  { mois: "Jun", encaisse: 20000, attendu: 20000 },
];

export function EncaissementChart() {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-semibold text-gray-900">Encaissement des loyers (6 mois)</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={MOCK_DATA}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            formatter={(value: number) =>
              value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
            }
          />
          <Bar dataKey="attendu" fill="#e5e7eb" name="Attendu" radius={[4, 4, 0, 0]} />
          <Bar dataKey="encaisse" fill="#2563eb" name="Encaissé" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
