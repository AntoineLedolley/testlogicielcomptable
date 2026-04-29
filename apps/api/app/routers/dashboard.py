from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app.database import get_db
from app.models import Facture, AppelLoyer, StatutFacture, StatutLoyer, Immeuble

router = APIRouter()


@router.get("/")
def get_dashboard(db: Session = Depends(get_db)):
    """Données agrégées pour le tableau de bord principal."""
    now = datetime.utcnow()
    debut_mois = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    factures_a_valider = db.query(func.count(Facture.id)).filter(
        Facture.statut == StatutFacture.A_VALIDER
    ).scalar()

    loyers_en_retard = db.query(func.count(AppelLoyer.id)).filter(
        AppelLoyer.statut.in_([StatutLoyer.RETARD, StatutLoyer.IMPAYE])
    ).scalar()

    loyers_en_retard_montant = db.query(func.sum(AppelLoyer.montant_total)).filter(
        AppelLoyer.statut.in_([StatutLoyer.RETARD, StatutLoyer.IMPAYE])
    ).scalar() or 0

    loyers_encaisses_mois = db.query(func.sum(AppelLoyer.montant_total)).filter(
        AppelLoyer.statut == StatutLoyer.ENCAISSE,
        AppelLoyer.date_paiement >= debut_mois,
    ).scalar() or 0

    loyers_attendus_mois = db.query(func.sum(AppelLoyer.montant_total)).filter(
        AppelLoyer.date_echeance >= debut_mois,
        AppelLoyer.date_echeance < debut_mois.replace(month=debut_mois.month % 12 + 1),
    ).scalar() or 0

    nb_immeubles = db.query(func.count(Immeuble.id)).scalar()

    factures_recentes = (
        db.query(Facture)
        .filter(Facture.statut == StatutFacture.A_VALIDER)
        .order_by(Facture.created_at.desc())
        .limit(5)
        .all()
    )

    loyers_retard_liste = (
        db.query(AppelLoyer)
        .filter(AppelLoyer.statut.in_([StatutLoyer.RETARD, StatutLoyer.IMPAYE]))
        .order_by(AppelLoyer.date_echeance.asc())
        .limit(5)
        .all()
    )

    return {
        "kpis": {
            "factures_a_valider": factures_a_valider,
            "loyers_en_retard": loyers_en_retard,
            "loyers_en_retard_montant": round(loyers_en_retard_montant, 2),
            "loyers_encaisses_mois": round(loyers_encaisses_mois, 2),
            "loyers_attendus_mois": round(loyers_attendus_mois, 2),
            "taux_encaissement": round(
                (loyers_encaisses_mois / loyers_attendus_mois * 100) if loyers_attendus_mois > 0 else 0, 1
            ),
            "nb_immeubles": nb_immeubles,
        },
        "factures_recentes": [
            {
                "id": f.id,
                "fichier_nom": f.fichier_nom,
                "montant_ttc": f.montant_ttc,
                "statut": f.statut,
                "created_at": f.created_at.isoformat() if f.created_at else None,
            }
            for f in factures_recentes
        ],
        "loyers_retard": [
            {
                "id": l.id,
                "periode": l.periode,
                "montant_total": l.montant_total,
                "date_echeance": l.date_echeance.isoformat() if l.date_echeance else None,
                "statut": l.statut,
            }
            for l in loyers_retard_liste
        ],
    }
