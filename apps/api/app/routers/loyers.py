from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import Optional

from app.database import get_db
from app.models import AppelLoyer, Bail, StatutLoyer

router = APIRouter()


@router.get("/")
def list_appels_loyer(
    statut: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    query = db.query(AppelLoyer)
    if statut:
        query = query.filter(AppelLoyer.statut == statut)
    return query.order_by(AppelLoyer.date_echeance.desc()).offset(skip).limit(limit).all()


@router.get("/retards")
def get_retards(db: Session = Depends(get_db)):
    """Liste tous les loyers en retard avec calcul des jours."""
    retards = (
        db.query(AppelLoyer)
        .filter(AppelLoyer.statut.in_([StatutLoyer.RETARD, StatutLoyer.IMPAYE]))
        .all()
    )
    now = datetime.utcnow()
    return [
        {
            "id": a.id,
            "periode": a.periode,
            "montant_total": a.montant_total,
            "date_echeance": a.date_echeance.isoformat(),
            "jours_retard": (now - a.date_echeance).days,
            "statut": a.statut,
        }
        for a in retards
    ]


@router.post("/{appel_id}/encaisser")
def encaisser_loyer(appel_id: str, db: Session = Depends(get_db)):
    appel = db.query(AppelLoyer).filter(AppelLoyer.id == appel_id).first()
    if not appel:
        raise HTTPException(status_code=404, detail="Appel introuvable")
    appel.statut = StatutLoyer.ENCAISSE
    appel.date_paiement = datetime.utcnow()
    db.commit()
    return {"message": "Loyer encaissé", "id": appel_id}


@router.post("/generer-mensuel")
def generer_appels_mensuels(db: Session = Depends(get_db)):
    """Génère les appels de loyer pour le mois courant sur tous les baux actifs."""
    baux = db.query(Bail).filter(Bail.statut == "ACTIF").all()
    now = datetime.utcnow()
    periode = now.strftime("%Y-%m")
    created = 0

    for bail in baux:
        existing = db.query(AppelLoyer).filter(
            AppelLoyer.bail_id == bail.id,
            AppelLoyer.periode == periode,
        ).first()
        if existing:
            continue

        appel = AppelLoyer(
            id=str(__import__("uuid").uuid4()),
            bail_id=bail.id,
            periode=periode,
            montant_hc=bail.loyer_hc,
            charges=bail.charges,
            montant_total=bail.loyer_hc + bail.charges,
            date_echeance=now.replace(day=1),
            statut=StatutLoyer.EN_ATTENTE,
        )
        db.add(appel)
        created += 1

    db.commit()
    return {"message": f"{created} appels de loyer générés pour {periode}"}
