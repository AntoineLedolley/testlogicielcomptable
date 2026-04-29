from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, JSON, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class StatutFacture(str, enum.Enum):
    EN_ATTENTE = "EN_ATTENTE"
    EN_COURS_IA = "EN_COURS_IA"
    A_VALIDER = "A_VALIDER"
    VALIDEE = "VALIDEE"
    COMPTABILISEE = "COMPTABILISEE"
    REJETEE = "REJETEE"


class StatutLoyer(str, enum.Enum):
    EN_ATTENTE = "EN_ATTENTE"
    ENCAISSE = "ENCAISSE"
    RETARD = "RETARD"
    IMPAYE = "IMPAYE"


class Immeuble(Base):
    __tablename__ = "immeubles"

    id = Column(String, primary_key=True)
    nom = Column(String, nullable=False)
    adresse = Column(String, nullable=False)
    ville = Column(String, nullable=False)
    code_postal = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    lots = relationship("Lot", back_populates="immeuble")
    factures = relationship("Facture", back_populates="immeuble")


class Lot(Base):
    __tablename__ = "lots"

    id = Column(String, primary_key=True)
    numero = Column(String, nullable=False)
    type = Column(String, nullable=False)
    surface = Column(Float)
    etage = Column(Integer)
    immeuble_id = Column(String, ForeignKey("immeubles.id"))

    immeuble = relationship("Immeuble", back_populates="lots")
    baux = relationship("Bail", back_populates="lot")


class Locataire(Base):
    __tablename__ = "locataires"

    id = Column(String, primary_key=True)
    nom = Column(String, nullable=False)
    prenom = Column(String)
    email = Column(String)
    telephone = Column(String)
    siret = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    baux = relationship("Bail", back_populates="locataire")


class Bail(Base):
    __tablename__ = "baux"

    id = Column(String, primary_key=True)
    lot_id = Column(String, ForeignKey("lots.id"))
    locataire_id = Column(String, ForeignKey("locataires.id"))
    date_debut = Column(DateTime, nullable=False)
    date_fin = Column(DateTime)
    loyer_hc = Column(Float, nullable=False)
    charges = Column(Float, default=0)
    depot = Column(Float, default=0)
    statut = Column(String, default="ACTIF")

    lot = relationship("Lot", back_populates="baux")
    locataire = relationship("Locataire", back_populates="baux")
    appels_loyer = relationship("AppelLoyer", back_populates="bail")


class AppelLoyer(Base):
    __tablename__ = "appels_loyer"

    id = Column(String, primary_key=True)
    bail_id = Column(String, ForeignKey("baux.id"))
    periode = Column(String, nullable=False)
    montant_hc = Column(Float, nullable=False)
    charges = Column(Float, default=0)
    montant_total = Column(Float, nullable=False)
    date_echeance = Column(DateTime, nullable=False)
    date_paiement = Column(DateTime)
    statut = Column(Enum(StatutLoyer), default=StatutLoyer.EN_ATTENTE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    bail = relationship("Bail", back_populates="appels_loyer")


class Fournisseur(Base):
    __tablename__ = "fournisseurs"

    id = Column(String, primary_key=True)
    nom = Column(String, nullable=False)
    siret = Column(String)
    tva = Column(String)
    adresse = Column(String)
    email = Column(String)
    telephone = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    factures = relationship("Facture", back_populates="fournisseur")


class Facture(Base):
    __tablename__ = "factures"

    id = Column(String, primary_key=True)
    numero = Column(String)
    fournisseur_id = Column(String, ForeignKey("fournisseurs.id"))
    immeuble_id = Column(String, ForeignKey("immeubles.id"))
    date_facture = Column(DateTime)
    date_echeance = Column(DateTime)
    montant_ht = Column(Float)
    montant_tva = Column(Float)
    montant_ttc = Column(Float)
    taux_tva = Column(Float)
    devise = Column(String, default="EUR")
    statut = Column(Enum(StatutFacture), default=StatutFacture.EN_ATTENTE)
    fichier_url = Column(String)
    fichier_nom = Column(String)
    donnees_ia = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    fournisseur = relationship("Fournisseur", back_populates="factures")
    immeuble = relationship("Immeuble", back_populates="factures")


class CompteBancaire(Base):
    __tablename__ = "comptes_bancaires"

    id = Column(String, primary_key=True)
    banque = Column(String, nullable=False)
    iban = Column(String, unique=True, nullable=False)
    libelle = Column(String, nullable=False)
    solde = Column(Float, default=0)

    transactions = relationship("TransactionBancaire", back_populates="compte_bancaire")


class TransactionBancaire(Base):
    __tablename__ = "transactions_bancaires"

    id = Column(String, primary_key=True)
    compte_bancaire_id = Column(String, ForeignKey("comptes_bancaires.id"))
    date = Column(DateTime, nullable=False)
    libelle = Column(String, nullable=False)
    montant = Column(Float, nullable=False)
    type = Column(String, nullable=False)
    reference = Column(String)
    statut = Column(String, default="NON_RAPPROCHEE")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    compte_bancaire = relationship("CompteBancaire", back_populates="transactions")
