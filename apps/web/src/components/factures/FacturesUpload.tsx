"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface ExtractionResult {
  id: string;
  statut: string;
  donnees_ia: {
    fournisseur: string;
    montantTTC: number;
    numeroFacture: string;
    dateFacture: string;
    anomalies: string[];
    confidenceScore: number;
  } | null;
}

export function FacturesUpload() {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [result, setResult] = useState<ExtractionResult | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setStatus("uploading");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/factures/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
    maxFiles: 1,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50",
          status === "uploading" && "pointer-events-none opacity-60"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          {status === "uploading" ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
              <p className="font-medium text-blue-700">L&apos;IA extrait les données...</p>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-gray-400" />
              <div>
                <p className="font-medium text-gray-700">
                  Glissez une facture ou cliquez pour sélectionner
                </p>
                <p className="text-sm text-gray-400">PDF, JPEG ou PNG — l&apos;IA extrait tout automatiquement</p>
              </div>
            </>
          )}
        </div>
      </div>

      {status === "success" && result?.donnees_ia && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            <div className="flex-1">
              <p className="font-medium text-green-800">Extraction réussie</p>
              <div className="mt-2 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                <div>
                  <span className="text-gray-500">Fournisseur</span>
                  <p className="font-medium">{result.donnees_ia.fournisseur || "—"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Montant TTC</span>
                  <p className="font-medium">
                    {result.donnees_ia.montantTTC?.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }) || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">N° facture</span>
                  <p className="font-medium">{result.donnees_ia.numeroFacture || "—"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Confiance IA</span>
                  <p className="font-medium">{Math.round((result.donnees_ia.confidenceScore || 0) * 100)}%</p>
                </div>
              </div>
              {result.donnees_ia.anomalies?.length > 0 && (
                <div className="mt-3 rounded bg-yellow-50 border border-yellow-200 p-2">
                  <p className="text-xs font-medium text-yellow-800">Anomalies détectées :</p>
                  {result.donnees_ia.anomalies.map((a, i) => (
                    <p key={i} className="text-xs text-yellow-700">{a}</p>
                  ))}
                </div>
              )}
              <button className="mt-3 rounded-lg bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700">
                Valider et comptabiliser
              </button>
            </div>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-700">Erreur lors du traitement. Vérifiez le fichier.</p>
        </div>
      )}
    </div>
  );
}
