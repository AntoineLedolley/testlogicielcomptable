import { DashboardKPIs } from "@/components/dashboard/DashboardKPIs";
import { FacturesRecentes } from "@/components/dashboard/FacturesRecentes";
import { LoyersRetard } from "@/components/dashboard/LoyersRetard";
import { EncaissementChart } from "@/components/dashboard/EncaissementChart";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-500">Vue d&apos;ensemble de votre activité comptable</p>
      </div>

      <DashboardKPIs />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <EncaissementChart />
        <LoyersRetard />
      </div>

      <FacturesRecentes />
    </div>
  );
}
