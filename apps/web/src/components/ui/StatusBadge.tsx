const STATUTS: Record<string, { label: string; class: string }> = {
  EN_ATTENTE: { label: "En attente", class: "bg-yellow-100 text-yellow-700" },
  EN_COURS_IA: { label: "IA en cours", class: "bg-blue-100 text-blue-700" },
  A_VALIDER: { label: "À valider", class: "bg-orange-100 text-orange-700" },
  VALIDEE: { label: "Validée", class: "bg-green-100 text-green-700" },
  COMPTABILISEE: { label: "Comptabilisée", class: "bg-emerald-100 text-emerald-700" },
  REJETEE: { label: "Rejetée", class: "bg-red-100 text-red-700" },
};

export function StatusBadge({ statut }: { statut: string }) {
  const s = STATUTS[statut] || { label: statut, class: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${s.class}`}>
      {s.label}
    </span>
  );
}
