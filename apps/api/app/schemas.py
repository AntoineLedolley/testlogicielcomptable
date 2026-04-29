from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class FactureOut(BaseModel):
    id: str
    numero: Optional[str]
    montant_ht: Optional[float]
    montant_tva: Optional[float]
    montant_ttc: Optional[float]
    taux_tva: Optional[float]
    devise: str
    statut: str
    fichier_nom: Optional[str]
    fichier_url: Optional[str]
    donnees_ia: Optional[Any]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class FactureCreate(BaseModel):
    numero: Optional[str] = None
    fournisseur_id: Optional[str] = None
    immeuble_id: Optional[str] = None
    montant_ht: Optional[float] = None
    montant_tva: Optional[float] = None
    montant_ttc: Optional[float] = None
    taux_tva: Optional[float] = None
