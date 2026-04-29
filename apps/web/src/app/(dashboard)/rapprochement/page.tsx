import { RapprochementView } from "@/components/rapprochement/RapprochementView";

export default function RapprochementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rapprochement bancaire</h1>
        <p className="text-sm text-gray-500">
          Importez votre relevé et rapprochez automatiquement les transactions
        </p>
      </div>
      <RapprochementView />
    </div>
  );
}
