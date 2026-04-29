import { anthropic, MODEL } from "./client";

export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantContext {
  organisationNom: string;
  immeubles?: string[];
  soldesBancaires?: Record<string, number>;
  loyersEnRetard?: number;
  facturesEnAttente?: number;
}

const buildSystemPrompt = (ctx: AssistantContext) => `Tu es CogirIA, l'assistant comptable intelligent de ${ctx.organisationNom}.
Tu aides les comptables et gestionnaires immobiliers dans leurs tâches quotidiennes.
Tu connais le PCG français, la comptabilité immobilière, et la réglementation locative.

Contexte actuel:
${ctx.immeubles ? `- Immeubles gérés: ${ctx.immeubles.join(", ")}` : ""}
${ctx.soldesBancaires ? `- Soldes bancaires: ${JSON.stringify(ctx.soldesBancaires)}` : ""}
${ctx.loyersEnRetard !== undefined ? `- Loyers en retard: ${ctx.loyersEnRetard}` : ""}
${ctx.facturesEnAttente !== undefined ? `- Factures à valider: ${ctx.facturesEnAttente}` : ""}

Tes capacités:
- Répondre aux questions comptables et fiscales
- Expliquer des écritures comptables
- Suggérer des comptes PCG
- Analyser des situations financières
- Guider sur les procédures de relance locataire
- Détecter des anomalies dans les données

Réponds en français, de façon concise et professionnelle.`;

export async function accountingAssistant(
  messages: AssistantMessage[],
  context: AssistantContext
): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: buildSystemPrompt(context),
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}
