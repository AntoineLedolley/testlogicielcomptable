import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const org = await prisma.organisation.upsert({
    where: { id: "org_cogir_demo" },
    update: {},
    create: {
      id: "org_cogir_demo",
      nom: "Cogir Immobilier",
      siret: "12345678900000",
      adresse: "123 Rue de la Paix, 75001 Paris",
    },
  });

  // Plan comptable immobilier simplifié
  const comptes = [
    { numero: "101000", libelle: "Capital", classe: 1, type: "PASSIF" },
    { numero: "164000", libelle: "Emprunts bancaires", classe: 1, type: "PASSIF" },
    { numero: "211000", libelle: "Terrains", classe: 2, type: "ACTIF" },
    { numero: "213000", libelle: "Constructions", classe: 2, type: "ACTIF" },
    { numero: "401000", libelle: "Fournisseurs", classe: 4, type: "PASSIF" },
    { numero: "411000", libelle: "Locataires", classe: 4, type: "ACTIF" },
    { numero: "445660", libelle: "TVA déductible", classe: 4, type: "ACTIF" },
    { numero: "445710", libelle: "TVA collectée", classe: 4, type: "PASSIF" },
    { numero: "512000", libelle: "Banque principale", classe: 5, type: "ACTIF" },
    { numero: "601000", libelle: "Achats matières", classe: 6, type: "CHARGE" },
    { numero: "606100", libelle: "Fournitures entretien", classe: 6, type: "CHARGE" },
    { numero: "611000", libelle: "Sous-traitance", classe: 6, type: "CHARGE" },
    { numero: "613000", libelle: "Locations", classe: 6, type: "CHARGE" },
    { numero: "615000", libelle: "Entretien et réparations", classe: 6, type: "CHARGE" },
    { numero: "616000", libelle: "Assurances", classe: 6, type: "CHARGE" },
    { numero: "622600", libelle: "Honoraires comptables", classe: 6, type: "CHARGE" },
    { numero: "627000", libelle: "Frais bancaires", classe: 6, type: "CHARGE" },
    { numero: "702000", libelle: "Loyers habitation", classe: 7, type: "PRODUIT" },
    { numero: "703000", libelle: "Loyers commerciaux", classe: 7, type: "PRODUIT" },
    { numero: "708500", libelle: "Charges refacturées", classe: 7, type: "PRODUIT" },
  ] as const;

  for (const compte of comptes) {
    await prisma.compte.upsert({
      where: { numero_organisationId: { numero: compte.numero, organisationId: org.id } },
      update: {},
      create: { ...compte, organisationId: org.id },
    });
  }

  const journaux = [
    { code: "ACH", libelle: "Journal des achats", type: "ACHATS" },
    { code: "VTE", libelle: "Journal des ventes/loyers", type: "VENTES" },
    { code: "BNQ", libelle: "Journal de banque", type: "BANQUE" },
    { code: "OD", libelle: "Opérations diverses", type: "OD" },
  ] as const;

  for (const journal of journaux) {
    await prisma.journal.upsert({
      where: { code_organisationId: { code: journal.code, organisationId: org.id } },
      update: {},
      create: { ...journal, organisationId: org.id },
    });
  }

  console.log("Seeding complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
