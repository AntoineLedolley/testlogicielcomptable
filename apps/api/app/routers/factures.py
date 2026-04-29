from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
import uuid
import base64
import os

from app.database import get_db
from app.models import Facture, Fournisseur, StatutFacture
from app.schemas import FactureOut, FactureCreate
from app.services.ia_service import process_invoice_with_ai

router = APIRouter()


@router.get("/", response_model=list[FactureOut])
def list_factures(
    statut: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    query = db.query(Facture)
    if statut:
        query = query.filter(Facture.statut == statut)
    return query.order_by(Facture.created_at.desc()).offset(skip).limit(limit).all()


@router.post("/upload")
async def upload_facture(
    file: UploadFile = File(...),
    immeuble_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    """Upload une facture et lance l'extraction IA automatiquement."""
    if file.content_type not in ["application/pdf", "image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Format non supporté (PDF, JPEG, PNG)")

    content = await file.read()
    facture_id = str(uuid.uuid4())

    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = f"{upload_dir}/{facture_id}_{file.filename}"
    with open(file_path, "wb") as f:
        f.write(content)

    facture = Facture(
        id=facture_id,
        fichier_url=file_path,
        fichier_nom=file.filename,
        immeuble_id=immeuble_id,
        statut=StatutFacture.EN_COURS_IA,
    )
    db.add(facture)
    db.commit()

    is_image = file.content_type.startswith("image/")
    content_b64 = base64.b64encode(content).decode() if is_image else content.decode("utf-8", errors="ignore")
    extraction = await process_invoice_with_ai(content_b64, is_image)

    if extraction:
        facture.donnees_ia = extraction
        facture.numero = extraction.get("numeroFacture")
        facture.montant_ht = extraction.get("montantHT")
        facture.montant_tva = extraction.get("montantTVA")
        facture.montant_ttc = extraction.get("montantTTC")
        facture.taux_tva = extraction.get("tauxTVA")
        facture.statut = StatutFacture.A_VALIDER

        fournisseur_nom = extraction.get("fournisseur")
        if fournisseur_nom:
            fournisseur = db.query(Fournisseur).filter(Fournisseur.nom.ilike(f"%{fournisseur_nom}%")).first()
            if not fournisseur:
                fournisseur = Fournisseur(
                    id=str(uuid.uuid4()),
                    nom=fournisseur_nom,
                    siret=extraction.get("siretFournisseur"),
                )
                db.add(fournisseur)
            facture.fournisseur_id = fournisseur.id

        db.commit()

    db.refresh(facture)
    return {"id": facture.id, "statut": facture.statut, "donnees_ia": facture.donnees_ia}


@router.get("/{facture_id}", response_model=FactureOut)
def get_facture(facture_id: str, db: Session = Depends(get_db)):
    facture = db.query(Facture).filter(Facture.id == facture_id).first()
    if not facture:
        raise HTTPException(status_code=404, detail="Facture introuvable")
    return facture


@router.put("/{facture_id}/valider")
def valider_facture(facture_id: str, db: Session = Depends(get_db)):
    facture = db.query(Facture).filter(Facture.id == facture_id).first()
    if not facture:
        raise HTTPException(status_code=404, detail="Facture introuvable")
    facture.statut = StatutFacture.VALIDEE
    db.commit()
    return {"message": "Facture validée", "id": facture_id}


@router.put("/{facture_id}/rejeter")
def rejeter_facture(facture_id: str, db: Session = Depends(get_db)):
    facture = db.query(Facture).filter(Facture.id == facture_id).first()
    if not facture:
        raise HTTPException(status_code=404, detail="Facture introuvable")
    facture.statut = StatutFacture.REJETEE
    db.commit()
    return {"message": "Facture rejetée", "id": facture_id}
