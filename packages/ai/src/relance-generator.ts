import { anthropic, MODEL } from "./client";

export interface RelanceResult {
  objet: string;
  corps: string;
  niveauRelance: 1 | 2 | 3;
  tonalite: "AMIABLE" | "FERME" | "CONTENTIEUX";
}

export async function analyzeRelanceLoyer(params: {
  locataireNom: string;
  locatairePrenom: string;
  adresseLot: string;
  montantDu: number;
  nombreJoursRetard: number;
  historiqueImpaye: boolean;
}): Promise<RelanceResult> {
  const niveau =
    params.nombreJoursRetard <= 15
      ? 1
      : params.nombreJoursRetard <= 45
        ? 2
        : 3;

  const tonalite =
    niveau === 1 ? "AMIABLE" : niveau === 2 ? "FERME" : "CONTENTIEUX";

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: `Tu es un gestionnaire immobilier professionnel français.
Rédige des lettres de relance loyer conformes à la législation française.
Ton courrier doit être professionnel, clair et approprié au niveau de relance.`,
    messages: [
      {
        role: "user",
        content: `Rédige une lettre de relance de niveau ${niveau} (${tonalite}) pour:
Locataire: ${params.locatairePrenom} ${params.locataireNom}
Adresse: ${params.adresseLot}
Montant dû: ${params.montantDu.toFixed(2)}€
Jours de retard: ${params.nombreJoursRetard}
Historique impayé: ${params.historiqueImpaye ? "Oui" : "Non"}

Réponds en JSON:
{
  "objet": "Objet du courrier",
  "corps": "Corps complet du courrier (avec formule de politesse)",
  "niveauRelance": ${niveau},
  "tonalite": "${tonalite}"
}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  return JSON.parse(text) as RelanceResult;
}
