import { anthropic, MODEL } from "./client";

export interface EntryDraft {
  journalCode: string;
  libelle: string;
  lignes: Array<{
    compteDebit: string | null;
    compteCredit: string | null;
    montant: number;
    libelle: string;
  }>;
  anomalies: string[];
}

const SYSTEM_PROMPT = `Tu es un expert-comptable immobilier français.
Génère les écritures comptables en partie double au format JSON.
Les écritures doivent être équilibrées (total débit = total crédit).
Utilise le PCG (Plan Comptable Général) français.
Réponds UNIQUEMENT en JSON valide.`;

export async function generateAccountingEntry(params: {
  typeOperation: "FACTURE_ACHAT" | "LOYER" | "REGULARISATION" | "OD";
  fournisseur?: string;
  montantHT: number;
  montantTVA: number;
  montantTTC: number;
  compteCharge: string;
  description: string;
}): Promise<EntryDraft> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Génère l'écriture comptable pour:
Type: ${params.typeOperation}
${params.fournisseur ? `Fournisseur: ${params.fournisseur}` : ""}
Montant HT: ${params.montantHT}€
TVA: ${params.montantTVA}€
TTC: ${params.montantTTC}€
Compte de charge: ${params.compteCharge}
Description: ${params.description}

Format JSON attendu:
{
  "journalCode": "ACH",
  "libelle": "Facture ...",
  "lignes": [
    {"compteDebit": "615000", "compteCredit": null, "montant": 100.00, "libelle": "Charge HT"},
    {"compteDebit": "445660", "compteCredit": null, "montant": 20.00, "libelle": "TVA déductible"},
    {"compteDebit": null, "compteCredit": "401000", "montant": 120.00, "libelle": "Fournisseur"}
  ],
  "anomalies": []
}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  return JSON.parse(text) as EntryDraft;
}
