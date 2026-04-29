from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
import anthropic
import os

from app.database import get_db
from app.models import AppelLoyer, Facture, Immeuble, StatutLoyer, StatutFacture

router = APIRouter()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))
MODEL = "claude-sonnet-4-6"


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]


@router.post("/chat")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """Chat avec l'assistant comptable IA."""
    loyers_retard = db.query(func.count(AppelLoyer.id)).filter(
        AppelLoyer.statut.in_([StatutLoyer.RETARD, StatutLoyer.IMPAYE])
    ).scalar()

    factures_attente = db.query(func.count(Facture.id)).filter(
        Facture.statut == StatutFacture.A_VALIDER
    ).scalar()

    immeubles = db.query(Immeuble.nom).all()
    noms_immeubles = [i.nom for i in immeubles]

    system_prompt = f"""Tu es CogirIA, l'assistant comptable intelligent de Cogir Immobilier.
Tu aides les comptables et gestionnaires immobiliers dans leurs tâches quotidiennes.
Tu connais le PCG français, la comptabilité immobilière, et la réglementation locative française.

Contexte en temps réel:
- Immeubles gérés: {", ".join(noms_immeubles) if noms_immeubles else "aucun pour l'instant"}
- Loyers en retard: {loyers_retard}
- Factures à valider: {factures_attente}

Tes capacités:
- Répondre aux questions comptables et fiscales
- Expliquer des écritures comptables (PCG)
- Suggérer les bons comptes comptables
- Analyser des situations financières immobilières
- Guider sur les procédures de relance locataire
- Détecter des anomalies dans les données

Réponds en français, de façon concise et professionnelle.
Utilise des listes à puces quand c'est pertinent."""

    response = client.messages.create(
        model=MODEL,
        max_tokens=2048,
        system=system_prompt,
        messages=[{"role": m.role, "content": m.content} for m in request.messages],
    )

    return {"response": response.content[0].text if response.content else ""}


@router.post("/relance/{appel_id}")
async def generer_relance(appel_id: str, db: Session = Depends(get_db)):
    """Génère automatiquement une lettre de relance pour un loyer impayé."""
    appel = db.query(AppelLoyer).filter(AppelLoyer.id == appel_id).first()
    if not appel:
        raise HTTPException(status_code=404, detail="Appel de loyer introuvable")

    bail = appel.bail
    locataire = bail.locataire
    lot = bail.lot

    from datetime import datetime
    jours_retard = (datetime.utcnow() - appel.date_echeance).days

    niveau = 1 if jours_retard <= 15 else 2 if jours_retard <= 45 else 3
    tonalite = "amiable" if niveau == 1 else "ferme" if niveau == 2 else "contentieux"

    response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"""Rédige une lettre de relance de niveau {niveau} ({tonalite}) pour:
Locataire: {locataire.prenom or ""} {locataire.nom}
Adresse du lot: {lot.immeuble.adresse}, {lot.immeuble.ville}
Montant dû: {appel.montant_total:.2f}€
Jours de retard: {jours_retard}
Période: {appel.periode}

Réponds en JSON: {{"objet": "...", "corps": "...", "niveau": {niveau}}}""",
        }],
    )

    import json
    text = response.content[0].text
    try:
        result = json.loads(text)
    except Exception:
        result = {"objet": "Relance loyer impayé", "corps": text, "niveau": niveau}

    return result
