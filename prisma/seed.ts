import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const races = [
  "Néo-Zélandais",
  "Californien",
  "Géant Flamand",
  "Rex",
  "Bélier Français",
  "Fauve de Bourgogne",
  "Blanc de Termonde",
  "Lapin de Garenne",
];

const couleurs = [
  "Blanc",
  "Gris",
  "Fauve",
  "Noir",
  "Marron",
  "Bringé",
  "Blanc et noir",
  "Gris ardoise",
  "Doré",
  "Roux",
  "Crème",
];

const statuts = [
  "actif",
  "actif",
  "actif",
  "reproducteur",
  "reproducteur",
  "reproducteur",
  "vendu",
  "decede",
];

const prenomsMales = [
  "Grisou", "Hercule", "Flocon", "Pepper", "Titan", "Bruno", "Oscar", "Max",
  "Zeus", "Thor", "Rex", "Balou", "Simba", "Nemo", "Diego", "Gaston",
  "Léon", "Félix", "Arthur", "Hugo", "Noé", "Coco", "Bambou", "Filou",
  "Riquet", "Pacha", "Sultan", "Roc", "Goliath", "Speedy",
];

const prenomsFemelles = [
  "Blanche", "Cannelle", "Noisette", "Miel", "Luna", "Bella", "Caramel",
  "Perle", "Rosée", "Violette", "Câline", "Doucette", "Fée", "Glycine",
  "Iris", "Jasmine", "Lili", "Margot", "Nina", "Olive", "Pépette",
  "Rousse", "Stella", "Tulipe", "Vanille", "Xena", "Yuki", "Zelda",
  "Ambre", "Brume",
];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number) {
  return Math.floor(randomBetween(min, max + 1));
}

function randomFrom<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function randomDate(startYear: number, endYear: number): Date {
  const start = new Date(`${startYear}-01-01`).getTime();
  const end = new Date(`${endYear}-12-31`).getTime();
  return new Date(start + Math.random() * (end - start));
}

async function main() {
  console.log("🌱 Suppression des anciennes données...");
  await prisma.santeLog.deleteMany();
  await prisma.lapereau.deleteMany();
  await prisma.accouplement.deleteMany();
  await prisma.poidsLog.deleteMany();
  await prisma.rabbit.deleteMany();

  console.log("🐇 Génération de 100 lapins...");

  const rabbits = [];

  for (let i = 1; i <= 100; i++) {
    const sexe = i % 2 === 0 ? "male" : "femelle";
    const prenoms = sexe === "male" ? prenomsMales : prenomsFemelles;
    const prenom = prenoms[(i - 1) % prenoms.length];
    const name = `${prenom}${i > prenoms.length ? ` ${Math.ceil(i / prenoms.length)}` : ""}`;
    const identifiant = `${sexe === "male" ? "M" : "F"}-${String(i).padStart(3, "0")}`;
    const race = randomFrom(races);
    const statut = randomFrom(statuts);
    const couleur = randomFrom(couleurs);
    const dateNaissance = randomDate(2022, 2025);

    // Poids selon la race
    let poidsMin = 1.5, poidsMax = 5.0;
    if (race === "Géant Flamand") { poidsMin = 5.5; poidsMax = 9.0; }
    if (race === "Rex") { poidsMin = 3.0; poidsMax = 4.5; }
    if (race === "Bélier Français") { poidsMin = 3.5; poidsMax = 5.5; }
    const poids = parseFloat(randomBetween(poidsMin, poidsMax).toFixed(2));

    const cageLettre = String.fromCharCode(65 + Math.floor((i - 1) / 10)); // A, B, C...
    const cageNum = ((i - 1) % 10) + 1;
    const cageNumero = `${cageLettre}${cageNum}`;

    rabbits.push({
      name,
      identifiant,
      race,
      sexe,
      dateNaissance,
      poids,
      couleur,
      statut,
      cageNumero,
      notes: i % 7 === 0 ? "Lapin de bonne constitution, très actif." : null,
    });
  }

  const created = await prisma.rabbit.createMany({ data: rabbits });
  console.log(`✅ ${created.count} lapins créés.`);

  // Récupérer les IDs pour les accouplements
  const allRabbits = await prisma.rabbit.findMany();
  const males = allRabbits.filter((r) => r.sexe === "male" && r.statut === "reproducteur");
  const femelles = allRabbits.filter((r) => r.sexe === "femelle" && r.statut === "reproducteur");

  console.log(`🔬 ${males.length} mâles reproducteurs, ${femelles.length} femelles reproductrices.`);

  // Créer des accouplements (jusqu'à 15)
  const nbAcc = Math.min(15, males.length, femelles.length);
  console.log(`💕 Génération de ${nbAcc} accouplements...`);

  for (let i = 0; i < nbAcc; i++) {
    const pere = males[i % males.length];
    const mere = femelles[i % femelles.length];
    const dateAcc = randomDate(2025, 2026);
    const dateMiseBas = new Date(dateAcc.getTime() + 31 * 24 * 60 * 60 * 1000);
    const isPast = dateMiseBas < new Date();
    const statut = isPast && Math.random() > 0.3 ? "mise_bas" : isPast ? "echec" : "en_cours";

    await prisma.accouplement.create({
      data: {
        pereId: pere.id,
        mereId: mere.id,
        dateAccouplement: dateAcc,
        dateMiseBas,
        statut,
        nombreNes: statut === "mise_bas" ? randomInt(4, 10) : null,
        nombreVivants: statut === "mise_bas" ? randomInt(3, 9) : null,
      },
    });
  }
  console.log(`✅ ${nbAcc} accouplements créés.`);

  // Créer des soins de santé (2 à 4 par lapin reproducteur)
  console.log("💉 Génération des soins de santé...");
  const reproducteurs = allRabbits.filter((r) => r.statut === "reproducteur" || r.statut === "actif");
  let nbSoins = 0;

  for (const rabbit of reproducteurs.slice(0, 40)) {
    const nbSoinsLapin = randomInt(1, 3);
    for (let j = 0; j < nbSoinsLapin; j++) {
      const type = randomFrom(["vaccin", "vaccin", "traitement", "observation", "veterinaire"] as const);
      const dateSoin = randomDate(2024, 2026);
      const hasRappel = type === "vaccin" || type === "traitement";
      const rappelDate = hasRappel
        ? new Date(dateSoin.getTime() + randomInt(90, 180) * 24 * 60 * 60 * 1000)
        : null;

      const descriptions: Record<string, string[]> = {
        vaccin: ["Vaccin Myxomatose + VHD", "Rappel vaccin VHD2", "Primo-vaccination Myxomatose"],
        traitement: ["Traitement anti-parasitaire", "Antibiothérapie 5j", "Traitement gale auriculaire"],
        observation: ["Contrôle poids mensuel", "Examen clinique de routine", "Palpation abdominale"],
        veterinaire: ["Visite vétérinaire de contrôle", "Consultation suite à diarrhée", "Bilan de santé annuel"],
      };

      await prisma.santeLog.create({
        data: {
          rabbitId: rabbit.id,
          type,
          description: randomFrom(descriptions[type]),
          date: dateSoin,
          prochainRappel: rappelDate,
          veterinaire: type === "veterinaire" ? randomFrom(["Dr. Martin", "Dr. Dubois", "Dr. Bernard"]) : null,
          cout: type === "veterinaire" ? randomBetween(25, 80) : null,
        },
      });
      nbSoins++;
    }
  }
  console.log(`✅ ${nbSoins} soins de santé créés.`);

  // Créer les aliments de base
  console.log("🌾 Génération des aliments...");
  const alimentsData = [
    { nom: "Foin de luzerne", type: "foin", unite: "kg", stockActuel: 120, stockMin: 20, prixUnitaire: 0.85, fournisseur: "Coopérative Agricole du Val" },
    { nom: "Foin de prairie", type: "foin", unite: "kg", stockActuel: 80, stockMin: 15, prixUnitaire: 0.60, fournisseur: "Ferme Durand" },
    { nom: "Granulés croissance", type: "granules", unite: "kg", stockActuel: 45, stockMin: 10, prixUnitaire: 1.20, fournisseur: "Nutri-Lapins SARL" },
    { nom: "Granulés reproduction", type: "granules", unite: "kg", stockActuel: 8, stockMin: 10, prixUnitaire: 1.50, fournisseur: "Nutri-Lapins SARL" },
    { nom: "Granulés engraissement", type: "granules", unite: "kg", stockActuel: 60, stockMin: 15, prixUnitaire: 1.10, fournisseur: "Nutri-Lapins SARL" },
    { nom: "Carottes", type: "legumes", unite: "kg", stockActuel: 12, stockMin: 5, prixUnitaire: 0.45, fournisseur: null },
    { nom: "Chou frisé", type: "legumes", unite: "kg", stockActuel: 3, stockMin: 4, prixUnitaire: 0.55, fournisseur: null },
    { nom: "Persil frais", type: "legumes", unite: "kg", stockActuel: 2, stockMin: 2, prixUnitaire: 1.20, fournisseur: null },
    { nom: "Supplément minéral", type: "supplement", unite: "kg", stockActuel: 5, stockMin: 2, prixUnitaire: 4.50, fournisseur: "VetPharma" },
    { nom: "Vitamines C+E", type: "supplement", unite: "g", stockActuel: 500, stockMin: 100, prixUnitaire: 0.08, fournisseur: "VetPharma" },
  ];

  for (const a of alimentsData) {
    await prisma.aliment.create({ data: a });
  }
  console.log(`✅ ${alimentsData.length} aliments créés.`);

  // Quelques distributions récentes
  const createdAliments = await prisma.aliment.findMany();
  const foin = createdAliments.find((a) => a.nom === "Foin de luzerne");
  const granules = createdAliments.find((a) => a.nom === "Granulés croissance");

  if (foin && granules) {
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      await prisma.distributionAliment.create({
        data: { alimentId: foin.id, quantite: 4.5, date: d, cageNumero: "Toutes", notes: null },
      });
      await prisma.distributionAliment.create({
        data: { alimentId: granules.id, quantite: 2.0, date: d, cageNumero: "Toutes", notes: null },
      });
    }
    await prisma.aliment.update({ where: { id: foin.id }, data: { stockActuel: { decrement: 7 * 4.5 } } });
    await prisma.aliment.update({ where: { id: granules.id }, data: { stockActuel: { decrement: 7 * 2.0 } } });
    console.log("✅ 14 distributions des 7 derniers jours créées.");
  }

  // Créer des transactions financières (3 derniers mois)
  console.log("💶 Génération des transactions financières...");

  const depenses = [
    // Alimentation mensuelle
    { categorie: "alimentation", desc: "Achat foin de luzerne 200 kg", montant: 170, moisOffset: 2 },
    { categorie: "alimentation", desc: "Granulés croissance 50 kg", montant: 60, moisOffset: 2 },
    { categorie: "alimentation", desc: "Granulés reproduction 20 kg", montant: 30, moisOffset: 2 },
    { categorie: "alimentation", desc: "Légumes et verdure (carottes, chou)", montant: 18, moisOffset: 2 },
    { categorie: "alimentation", desc: "Achat foin de luzerne 200 kg", montant: 170, moisOffset: 1 },
    { categorie: "alimentation", desc: "Granulés croissance 50 kg", montant: 60, moisOffset: 1 },
    { categorie: "alimentation", desc: "Achat foin de prairie 100 kg", montant: 60, moisOffset: 1 },
    { categorie: "alimentation", desc: "Achat foin de luzerne 200 kg", montant: 170, moisOffset: 0 },
    { categorie: "alimentation", desc: "Granulés engraissement 40 kg", montant: 44, moisOffset: 0 },
    // Vétérinaire
    { categorie: "veterinaire", desc: "Vaccin Myxomatose + VHD (lot 30)", montant: 145, moisOffset: 2 },
    { categorie: "veterinaire", desc: "Consultation Dr. Martin", montant: 55, moisOffset: 1 },
    { categorie: "veterinaire", desc: "Traitement anti-parasitaire", montant: 38, moisOffset: 0 },
    { categorie: "veterinaire", desc: "Rappel vaccin VHD2 (lot 20)", montant: 98, moisOffset: 0 },
    // Équipement
    { categorie: "equipement", desc: "Achat 4 cages maternité", montant: 220, moisOffset: 2 },
    { categorie: "equipement", desc: "Litière bois pressée ×10", montant: 45, moisOffset: 1 },
    { categorie: "equipement", desc: "Réparation système d'abreuvement", montant: 85, moisOffset: 1 },
    { categorie: "equipement", desc: "Désinfectant bâtiment 10L", montant: 32, moisOffset: 0 },
    // Énergie
    { categorie: "energie", desc: "Facture électricité bâtiment", montant: 78, moisOffset: 2 },
    { categorie: "energie", desc: "Facture eau mois en cours", montant: 22, moisOffset: 2 },
    { categorie: "energie", desc: "Facture électricité bâtiment", montant: 82, moisOffset: 1 },
    { categorie: "energie", desc: "Facture eau", montant: 19, moisOffset: 1 },
    { categorie: "energie", desc: "Facture électricité bâtiment", montant: 75, moisOffset: 0 },
  ];

  const recettes = [
    { categorie: "vente_lapin", desc: "Vente 8 lapins vivants (M. Bernard)", montant: 192, moisOffset: 2 },
    { categorie: "vente_lapin", desc: "Vente 5 lapins reproducteurs", montant: 175, moisOffset: 2 },
    { categorie: "vente_viande", desc: "Vente viande 12 kg boucherie locale", montant: 156, moisOffset: 2 },
    { categorie: "vente_lapin", desc: "Vente 10 lapins vivants (marché)", montant: 240, moisOffset: 1 },
    { categorie: "vente_viande", desc: "Vente viande 18 kg restaurant", montant: 234, moisOffset: 1 },
    { categorie: "vente_fumier", desc: "Vente fumier composté 300 kg", montant: 45, moisOffset: 1 },
    { categorie: "vente_lapin", desc: "Vente 12 lapins vivants (M. Dupont)", montant: 288, moisOffset: 0 },
    { categorie: "vente_viande", desc: "Vente viande 15 kg AMAP", montant: 195, moisOffset: 0 },
    { categorie: "vente_lapin", desc: "Vente 3 lapins reproducteurs", montant: 105, moisOffset: 0 },
    { categorie: "vente_fumier", desc: "Vente fumier composté 200 kg", montant: 30, moisOffset: 0 },
  ];

  let nbTransactions = 0;
  const now2 = new Date();

  for (const d of depenses) {
    const date = new Date(now2.getFullYear(), now2.getMonth() - d.moisOffset, randomInt(1, 28));
    await prisma.transaction.create({
      data: { type: "depense", categorie: d.categorie, montant: d.montant, date, description: d.desc, notes: null },
    });
    nbTransactions++;
  }

  for (const r of recettes) {
    const date = new Date(now2.getFullYear(), now2.getMonth() - r.moisOffset, randomInt(1, 28));
    await prisma.transaction.create({
      data: { type: "recette", categorie: r.categorie, montant: r.montant, date, description: r.desc, notes: null },
    });
    nbTransactions++;
  }
  console.log(`✅ ${nbTransactions} transactions créées.`);

  console.log("\n🎉 Base de données alimentée avec succès !");
  console.log(`   • Lapins   : 100`);
  console.log(`   • Accouplements : ${nbAcc}`);
  console.log(`   • Soins    : ${nbSoins}`);
  console.log(`   • Aliments : ${alimentsData.length}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
