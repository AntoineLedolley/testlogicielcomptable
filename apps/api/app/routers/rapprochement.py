from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
import csv
import io
import uuid
from datetime import datetime

from app.database import get_db
from app.models import TransactionBancaire, CompteBancaire

router = APIRouter()


@router.post("/import-csv/{compte_id}")
async def import_releve(
    compte_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Importe un relevé bancaire CSV (format standard FR: date;libelle;debit;credit)."""
    compte = db.query(CompteBancaire).filter(CompteBancaire.id == compte_id).first()
    if not compte:
        return {"error": "Compte bancaire introuvable"}

    content = await file.read()
    reader = csv.DictReader(io.StringIO(content.decode("utf-8-sig")), delimiter=";")

    imported = 0
    for row in reader:
        try:
            date_str = row.get("Date") or row.get("date") or ""
            libelle = row.get("Libellé") or row.get("libelle") or row.get("Libelle") or ""
            debit = float((row.get("Débit") or row.get("debit") or "0").replace(",", ".").replace(" ", "") or 0)
            credit = float((row.get("Crédit") or row.get("credit") or "0").replace(",", ".").replace(" ", "") or 0)

            montant = credit - debit
            type_tx = "CREDIT" if montant >= 0 else "DEBIT"

            tx = TransactionBancaire(
                id=str(uuid.uuid4()),
                compte_bancaire_id=compte_id,
                date=datetime.strptime(date_str, "%d/%m/%Y"),
                libelle=libelle,
                montant=abs(montant),
                type=type_tx,
                statut="NON_RAPPROCHEE",
            )
            db.add(tx)
            imported += 1
        except Exception:
            continue

    db.commit()
    return {"message": f"{imported} transactions importées"}


@router.get("/non-rapprochees/{compte_id}")
def get_non_rapprochees(compte_id: str, db: Session = Depends(get_db)):
    transactions = (
        db.query(TransactionBancaire)
        .filter(
            TransactionBancaire.compte_bancaire_id == compte_id,
            TransactionBancaire.statut == "NON_RAPPROCHEE",
        )
        .order_by(TransactionBancaire.date.desc())
        .all()
    )
    return [
        {
            "id": t.id,
            "date": t.date.isoformat(),
            "libelle": t.libelle,
            "montant": t.montant,
            "type": t.type,
        }
        for t in transactions
    ]


@router.post("/{transaction_id}/rapprocher")
def rapprocher(transaction_id: str, db: Session = Depends(get_db)):
    tx = db.query(TransactionBancaire).filter(TransactionBancaire.id == transaction_id).first()
    if not tx:
        return {"error": "Transaction introuvable"}
    tx.statut = "RAPPROCHEE"
    db.commit()
    return {"message": "Transaction rapprochée"}
