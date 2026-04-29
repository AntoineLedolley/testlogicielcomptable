from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db

router = APIRouter()


@router.get("/")
def list_ecritures(
    journal: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return {"message": "Liste des écritures - à implémenter avec le modèle EcritureComptable"}


@router.get("/balance")
def get_balance(db: Session = Depends(get_db)):
    """Balance des comptes."""
    return {"message": "Balance générale - à implémenter"}


@router.get("/grand-livre")
def get_grand_livre(compte: Optional[str] = None, db: Session = Depends(get_db)):
    """Grand livre par compte."""
    return {"message": "Grand livre - à implémenter"}
