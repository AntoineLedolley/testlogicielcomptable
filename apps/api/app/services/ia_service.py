import anthropic
import json
import os
from typing import Optional

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))
MODEL = "claude-sonnet-4-6"

SYSTEM_PROMPT = """Tu es un assistant comptable expert spécialisé dans la comptabilité immobilière française.
Ton rôle est d'extraire les données structurées d'une facture avec précision maximale.
Réponds UNIQUEMENT en JSON valide, sans texte avant ou après.
Si une information est absente, mets null."""


async def process_invoice_with_ai(
    content: str, is_image: bool = False
) -> Optional[dict]:
    try:
        if is_image:
            user_content = [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/jpeg",
                        "data": content,
                    },
                },
                {
                    "type": "text",
                    "text": "Extrais les données comptables de cette facture en JSON.",
                },
            ]
        else:
            user_content = f"Facture (texte extrait):\n\n{content[:4000]}"

        response = client.messages.create(
            model=MODEL,
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_content} if isinstance(user_content, str)
                        else user_content[0],
                        {
                            "type": "text",
                            "text": """Retourne ce JSON exact:
{
  "fournisseur": "nom fournisseur",
  "siretFournisseur": null,
  "numeroFacture": "FA-2024-001",
  "dateFacture": "2024-01-15",
  "dateEcheance": "2024-02-15",
  "montantHT": 100.00,
  "montantTVA": 20.00,
  "montantTTC": 120.00,
  "tauxTVA": 20.0,
  "devise": "EUR",
  "descriptionPrestations": "description",
  "confidenceScore": 0.9,
  "anomalies": []
}""",
                        },
                    ] if not isinstance(user_content, str) else [
                        {"type": "text", "text": user_content},
                        {
                            "type": "text",
                            "text": """Retourne ce JSON exact:
{
  "fournisseur": "nom fournisseur",
  "siretFournisseur": null,
  "numeroFacture": "FA-2024-001",
  "dateFacture": "2024-01-15",
  "dateEcheance": "2024-02-15",
  "montantHT": 100.00,
  "montantTVA": 20.00,
  "montantTTC": 120.00,
  "tauxTVA": 20.0,
  "devise": "EUR",
  "descriptionPrestations": "description",
  "confidenceScore": 0.9,
  "anomalies": []
}""",
                        },
                    ],
                }
            ],
        )

        text = response.content[0].text if response.content else ""
        return json.loads(text)
    except Exception as e:
        print(f"IA error: {e}")
        return None
