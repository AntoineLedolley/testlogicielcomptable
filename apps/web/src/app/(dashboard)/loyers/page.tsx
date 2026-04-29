import { LoyersTable } from "@/components/loyers/LoyersTable";

export default function LoyersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loyers</h1>
          <p className="text-sm text-gray-500">Suivi des encaissements et relances automatiques</p>
        </div>
      </div>
      <LoyersTable />
    </div>
  );
}
