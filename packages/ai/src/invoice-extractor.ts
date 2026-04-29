import { anthropic, MODEL } from "./client";

export interface InvoiceExtraction {
  fournisseur: string | null;
  siretFournisseur: string | null;
  numeroFacture: string | null;
  dateFacture: string | null;
  dateEcheance: string | null;
  montantHT: number | null;
  montantTVA: number | null;
  montantTTC: number | null;
  tauxTVA: number | null;
  devise: string;
  descriptionPrestations: string | null;
  confidenceScore: number;
  anomalies: string[];
}

const SYSTEM_PROMPT = `Tu es un assistant comptable expert spécialisé dans la comptabilité immobilière française.
Ton rôle est d'extraire les données structurées d'une facture avec une précision maximale.
Réponds UNIQUEMENT en JSON valide, sans aucun texte avant ou après.
Si une information est absente ou illisible, mets null.
Détecte toute anomalie (montants incohérents, TVA incorrecte, date manquante, doublon potentiel).`;

export async function extractInvoiceData(
  documentContent: string,
  isBase64Image = false
): Promise<InvoiceExtraction> {
  const content = isBase64Image
    ? [
        {
          type: "image" as const,
          source: {
            type: "base64" as const,
            media_type: "image/jpeg" as const,
            data: documentContent,
          },
        },
        {
          type: "text" as const,
          text: "Extrais toutes les données comptables de cette facture au format JSON.",
        },
      ]
    : [{ type: "text" as const, text: `Facture:\n\n${documentContent}` }];

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          ...content,
          {
            type: "text",
            text: `Retourne ce JSON exact:
{
  "fournisseur": "nom du fournisseur",
  "siretFournisseur": "SIRET si présent",
  "numeroFacture": "numéro de facture",
  "dateFacture": "YYYY-MM-DD",
  "dateEcheance": "YYYY-MM-DD",
  "montantHT": 0.00,
  "montantTVA": 0.00,
  "montantTTC": 0.00,
  "tauxTVA": 20.0,
  "devise": "EUR",
  "descriptionPrestations": "description courte",
  "confidenceScore": 0.95,
  "anomalies": []
}`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  return JSON.parse(text) as InvoiceExtraction;
}
