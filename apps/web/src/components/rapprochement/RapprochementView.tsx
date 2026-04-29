"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Check } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Transaction {
  id: string;
  date: string;
  libelle: string;
  montant: number;
  type: string;
}

export function RapprochementView() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [uploading, setUploading] = useState(false);
  const [compteId] = useState("compte_principal");

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    await api.post(`/rapprochement/import-csv/${compteId}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const res = await api.get(`/rapprochement/non-rapprochees/${compteId}`);
    setTransactions(res.data);
    setUploading(false);
  }, [compteId]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });

  const rapprocher = async (id: string) => {
    await api.post(`/rapprochement/${id}/rapprocher`);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-400 hover:bg-gray-50"
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
        <p className="font-medium text-gray-700">
          {uploading ? "Import en cours..." : "Importez votre relevé bancaire CSV"}
        </p>
        <p className="text-sm text-gray-400">Format : Date;Libellé;Débit;Crédit</p>
      </div>

      {transactions.length > 0 && (
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="font-semibold text-gray-900">
              {transactions.length} transaction(s) à rapprocher
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase text-gray-400">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Libellé</th>
                  <th className="px-6 py-3">Montant</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-500">{formatDate(t.date)}</td>
                    <td className="px-6 py-3 font-medium">{t.libelle}</td>
                    <td className={`px-6 py-3 font-medium ${t.type === "CREDIT" ? "text-green-600" : "text-red-600"}`}>
                      {t.type === "CREDIT" ? "+" : "-"}{formatCurrency(t.montant)}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${t.type === "CREDIT" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {t.type === "CREDIT" ? "Crédit" : "Débit"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => rapprocher(t.id)}
                        className="flex items-center gap-1 rounded px-2 py-1 text-xs text-green-700 hover:bg-green-50"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Rapprocher
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
