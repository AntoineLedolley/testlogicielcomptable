import { anthropic, MODEL } from "./client";

export interface AccountSuggestion {
  compteNumero: string;
  compteLibelle: string;
  confidence: number;
  justification: string;
}

const SYSTEM_PROMPT = `Tu es un expert-comptable français spécialisé en immobilier.
Tu dois suggérer le compte comptable PCG (Plan Comptable Général) le plus adapté
pour une ligne de facture dans le contexte d'une société de gestion immobilière.
Réponds UNIQUEMENT en JSON valide.`;

export async function classifyAccount(
  description: string,
  fournisseur: string,
  montant: number,
  planComptable: Array<{ numero: string; libelle: string }>
): Promise<AccountSuggestion[]> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Description: "${description}"
Fournisseur: "${fournisseur}"
Montant HT: ${montant}€

Plan comptable disponible:
${planComptable.map((c) => `${c.numero} - ${c.libelle}`).join("\n")}

Propose les 3 meilleurs comptes en JSON:
[{"compteNumero":"615000","compteLibelle":"Entretien","confidence":0.92,"justification":"..."}]`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "[]";
  return JSON.parse(text) as AccountSuggestion[];
}
