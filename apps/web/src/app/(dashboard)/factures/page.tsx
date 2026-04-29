import { FacturesUpload } from "@/components/factures/FacturesUpload";
import { FacturesList } from "@/components/factures/FacturesList";

export default function FacturesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
        <p className="text-sm text-gray-500">
          Importez vos factures — l&apos;IA extrait automatiquement les données
        </p>
      </div>
      <FacturesUpload />
      <FacturesList />
    </div>
  );
}
