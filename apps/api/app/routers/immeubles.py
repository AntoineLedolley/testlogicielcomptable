from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid

from app.database import get_db
from app.models import Immeuble, Lot

router = APIRouter()


class ImmeubleCreate(BaseModel):
    nom: str
    adresse: str
    ville: str
    code_postal: str


@router.get("/")
def list_immeubles(db: Session = Depends(get_db)):
    immeubles = db.query(Immeuble).all()
    return [
        {
            "id": i.id,
            "nom": i.nom,
            "adresse": i.adresse,
            "ville": i.ville,
            "code_postal": i.code_postal,
            "nb_lots": len(i.lots),
        }
        for i in immeubles
    ]


@router.post("/")
def create_immeuble(data: ImmeubleCreate, db: Session = Depends(get_db)):
    immeuble = Immeuble(id=str(uuid.uuid4()), **data.model_dump())
    db.add(immeuble)
    db.commit()
    db.refresh(immeuble)
    return immeuble


@router.get("/{immeuble_id}")
def get_immeuble(immeuble_id: str, db: Session = Depends(get_db)):
    immeuble = db.query(Immeuble).filter(Immeuble.id == immeuble_id).first()
    if not immeuble:
        raise HTTPException(status_code=404, detail="Immeuble introuvable")
    return {
        "id": immeuble.id,
        "nom": immeuble.nom,
        "adresse": immeuble.adresse,
        "ville": immeuble.ville,
        "lots": [
            {
                "id": l.id,
                "numero": l.numero,
                "type": l.type,
                "surface": l.surface,
                "baux_actifs": len([b for b in l.baux if b.statut == "ACTIF"]),
            }
            for l in immeuble.lots
        ],
    }
