// ─────────────────────────────────────────────────────────────────────────────
// Base de connaissances : recommandations cuniculture par saison et climat
// Sources : INRA Cuniculture, FAO Rabbit Husbandry, ITAVI, expérience tropicale
// ─────────────────────────────────────────────────────────────────────────────

export type Climat = "tropical" | "tempere";

export type SaisonId =
  | "saison_seche"
  | "saison_des_pluies"
  | "printemps"
  | "ete"
  | "automne"
  | "hiver";

export type Categorie =
  | "temperature"
  | "hydratation"
  | "alimentation"
  | "sante"
  | "reproduction"
  | "hygiene"
  | "infrastructure";

export type Priorite = "haute" | "normale" | "basse";

export interface FarmStats {
  totalAnimaux: number;
  tauxMortalite: number; // en %
  nbReproducteurs: number;
  nbLapereaux: number;
  nbDecedes: number;
}

export interface Recommandation {
  id: string;
  categorie: Categorie;
  titre: string;
  description: string;
  priorite: Priorite;
  actions: string[]; // étapes concrètes
}

export interface Saison {
  id: SaisonId;
  climat: Climat;
  nom: string;
  description: string;
  emoji: string;
  mois: string;
  temperatureOptimale: string;
  risquesPrincipaux: string[];
  recommandations: Recommandation[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Détection de la saison en cours
// ─────────────────────────────────────────────────────────────────────────────

export function detectSaison(date: Date, climat: Climat): SaisonId {
  const mois = date.getMonth() + 1; // 1-12

  if (climat === "tropical") {
    // Afrique de l'Ouest (Bénin, Côte d'Ivoire, Sénégal, etc.)
    // Saison sèche : novembre à mars (Harmattan déc-fév)
    // Saison des pluies : avril à octobre
    if (mois >= 11 || mois <= 3) return "saison_seche";
    return "saison_des_pluies";
  }

  // Tempéré (hémisphère Nord)
  if (mois >= 3 && mois <= 5) return "printemps";
  if (mois >= 6 && mois <= 8) return "ete";
  if (mois >= 9 && mois <= 11) return "automne";
  return "hiver";
}

// ─────────────────────────────────────────────────────────────────────────────
// Base de données des saisons et recommandations
// ─────────────────────────────────────────────────────────────────────────────

export const SAISONS: Record<SaisonId, Saison> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // TROPICAL — SAISON SÈCHE (Nov – Mars)
  // ═══════════════════════════════════════════════════════════════════════════
  saison_seche: {
    id: "saison_seche",
    climat: "tropical",
    nom: "Saison sèche",
    description:
      "Période chaude et sèche, avec l'Harmattan en décembre-février. La chaleur (>30°C) et la poussière sont les premiers ennemis du lapin, sensible au coup de chaleur dès 28°C.",
    emoji: "☀️",
    mois: "Novembre — Mars",
    temperatureOptimale: "15 – 22°C (le lapin souffre au-delà de 28°C)",
    risquesPrincipaux: [
      "Coup de chaleur (mortalité brutale en 2-3h)",
      "Déshydratation et baisse de fertilité des mâles",
      "Maladies respiratoires liées à la poussière (Harmattan)",
      "Baisse d'appétit et perte de poids",
      "Stérilité temporaire des reproducteurs (>30°C)",
    ],
    recommandations: [
      {
        id: "sec_temp_ventilation",
        categorie: "temperature",
        titre: "Refroidir activement les cages aux heures chaudes",
        description:
          "Entre 12h et 16h, la température dans les cages peut dépasser 35°C et tuer les lapins. Le coup de chaleur est la première cause de mortalité en saison sèche.",
        priorite: "haute",
        actions: [
          "Installer des bouteilles d'eau congelées dans chaque cage à 11h",
          "Mouiller le sol du clapier 2× par jour (matin + midi)",
          "Vérifier que la ventilation est ouverte côté nord/ombre",
          "Brumiser le toit en tôle aux heures chaudes",
          "Déplacer les cages exposées au soleil direct",
        ],
      },
      {
        id: "sec_hydratation",
        categorie: "hydratation",
        titre: "Eau fraîche illimitée — changée 2× par jour",
        description:
          "Un lapin adulte boit 200-300 ml/jour en saison fraîche, mais 500-800 ml en saison sèche. L'eau tiède est refusée et favorise la déshydratation silencieuse.",
        priorite: "haute",
        actions: [
          "Changer l'eau le matin (6h) ET en fin d'après-midi (17h)",
          "Ajouter une pincée de sel + vitamine C 1× par semaine",
          "Nettoyer les abreuvoirs au savon tous les 3 jours (algues)",
          "Surveiller l'urine concentrée (signe de déshydratation)",
        ],
      },
      {
        id: "sec_alim_horaires",
        categorie: "alimentation",
        titre: "Nourrir tôt le matin et tard le soir uniquement",
        description:
          "Le lapin mange peu quand il fait chaud. Concentrer les rations aux heures fraîches augmente l'ingestion de 20-30% et limite le gaspillage.",
        priorite: "haute",
        actions: [
          "Repas du matin avant 7h (granulés + verdure)",
          "Repas du soir après 18h (foin + complément)",
          "Augmenter la proportion de verdure fraîche (laitue, herbe coupée)",
          "Éviter les aliments fermentescibles aux heures chaudes",
          "Ajouter de la luzerne fraîche pour les femelles allaitantes",
        ],
      },
      {
        id: "sec_repro_pause",
        categorie: "reproduction",
        titre: "Réduire les saillies en pic de chaleur (Jan-Fév)",
        description:
          "À plus de 30°C, les mâles deviennent temporairement stériles (qualité spermatique chute de 40-60%). Les saillies en pleine canicule donnent peu de portées et des lapereaux fragiles.",
        priorite: "normale",
        actions: [
          "Suspendre les nouvelles saillies entre 12h et 17h",
          "Programmer les accouplements tôt le matin (5h-7h)",
          "Préférer les mâles ayant déjà reproduit avec succès",
          "Reporter les portées planifiées de janvier à mars",
        ],
      },
      {
        id: "sec_resp_harmattan",
        categorie: "sante",
        titre: "Prévenir les affections respiratoires (Harmattan)",
        description:
          "La poussière fine de l'Harmattan irrite les voies respiratoires et favorise la pasteurellose (Snuffles). Les jeunes lapereaux y sont très sensibles.",
        priorite: "haute",
        actions: [
          "Humidifier le sol du clapier 2× par jour",
          "Installer un brise-vent ou un voile fin côté nord",
          "Aérer aux heures non poussiéreuses (tôt le matin)",
          "Surveiller éternuements, écoulement nasal, perte d'appétit",
          "Isoler immédiatement tout sujet suspect",
        ],
      },
      {
        id: "sec_alim_appetence",
        categorie: "alimentation",
        titre: "Verdure fraîche pour stimuler l'appétit",
        description:
          "Les granulés secs sont peu appétents en saison chaude. Apporter de la verdure (40-50% de la ration) restaure l'ingestion et hydrate naturellement.",
        priorite: "normale",
        actions: [
          "Récolter herbe, feuilles de patate douce, feuilles de manioc",
          "Donner la verdure légèrement fanée (jamais mouillée)",
          "Compléter avec son de blé tamisé et fruits (papaye, mangue)",
          "Limiter les aliments très énergétiques (maïs broyé) la journée",
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TROPICAL — SAISON DES PLUIES (Avr – Oct)
  // ═══════════════════════════════════════════════════════════════════════════
  saison_des_pluies: {
    id: "saison_des_pluies",
    climat: "tropical",
    nom: "Saison des pluies",
    description:
      "Période humide et chaude (24-30°C, humidité >80%). La coccidiose et les maladies respiratoires explosent — c'est la saison de loin la plus meurtrière pour les lapereaux.",
    emoji: "🌧️",
    mois: "Avril — Octobre",
    temperatureOptimale: "15 – 22°C (avec humidité < 70%)",
    risquesPrincipaux: [
      "Coccidiose intestinale (cause #1 de mortalité des lapereaux : 30-70%)",
      "Pasteurellose et autres affections respiratoires",
      "Moisissures et mycotoxines dans le foin/granulés",
      "Diarrhées (entérotoxémie, colibacillose)",
      "Parasites externes (gale, poux) favorisés par l'humidité",
    ],
    recommandations: [
      {
        id: "plu_coccidiose",
        categorie: "sante",
        titre: "Protocole anti-coccidiose strict (URGENT)",
        description:
          "La coccidiose tue jusqu'à 70% des lapereaux non traités en saison des pluies. Elle frappe entre le sevrage (5 sem) et 12 semaines. Symptômes : diarrhée, abdomen gonflé, croissance arrêtée, mort en 2-5 jours.",
        priorite: "haute",
        actions: [
          "Traitement préventif : Sulfaquinoxaline (eau de boisson) 3 jours avant sevrage, 3 jours après",
          "Cure curative au moindre cas suspect (Toltrazuril ou Sulfa)",
          "Nettoyer les fientes 2× par jour (les œufs de coccidies se transmettent par les crottes)",
          "Flamber les cages au chalumeau entre 2 portées",
          "Ne JAMAIS donner d'herbe coupée mouillée ou récoltée près des cages",
        ],
      },
      {
        id: "plu_humidite",
        categorie: "infrastructure",
        titre: "Maîtriser l'humidité dans le clapier",
        description:
          "Au-delà de 75% d'humidité, les voies respiratoires des lapins s'irritent et les pathogènes prolifèrent. L'humidité est le facteur n°1 d'aggravation des maladies en saison des pluies.",
        priorite: "haute",
        actions: [
          "Vérifier que le toit ne fuit nulle part — réparer toute infiltration",
          "Surélever les cages de 80 cm minimum au-dessus du sol",
          "Installer une ventilation transversale (entrée air + sortie opposée)",
          "Étaler une fine couche de chaux vive sous les cages 1× par mois",
          "Ne pas laver les cages avec excès d'eau — préférer brossage à sec",
        ],
      },
      {
        id: "plu_aliment_stockage",
        categorie: "alimentation",
        titre: "Protéger les aliments des moisissures",
        description:
          "Le maïs, le foin et les granulés moisissent en 48h en saison humide. Les mycotoxines (aflatoxine) causent des avortements, malformations et morts subites.",
        priorite: "haute",
        actions: [
          "Stocker granulés et maïs sur palettes, jamais à même le sol",
          "Acheter en petites quantités (consommation < 15 jours)",
          "Jeter immédiatement tout aliment avec odeur ou taches blanches/vertes",
          "Sécher le foin au soleil avant chaque distribution",
          "Vérifier les sacs régulièrement — un kg moisi contamine tout le sac",
        ],
      },
      {
        id: "plu_hygiene",
        categorie: "hygiene",
        titre: "Renforcer la désinfection des cages",
        description:
          "L'humidité multiplie par 5 la durée de vie des pathogènes sur les surfaces. La désinfection doit être plus fréquente et plus rigoureuse.",
        priorite: "haute",
        actions: [
          "Désinfecter chaque cage après chaque portée (eau de Javel diluée 1/10)",
          "Vide sanitaire de 5-7 jours entre 2 occupants",
          "Désinfecter abreuvoirs et mangeoires 1× par semaine",
          "Brûler ou désinfecter la litière et les boîtes de mise-bas",
          "Pédiluve à l'entrée du clapier (chaux vive ou crésyl)",
        ],
      },
      {
        id: "plu_diarrhee",
        categorie: "sante",
        titre: "Surveillance quotidienne des selles",
        description:
          "Une diarrhée non traitée tue un lapereau en 24-48h. La détection précoce permet souvent de sauver l'animal avec une simple cure.",
        priorite: "haute",
        actions: [
          "Vérifier les crottes chaque matin (forme, couleur, abondance)",
          "Crottes molles/liquides = isoler immédiatement + diète foin seul",
          "Hydrater avec eau + sucre + sel (ORS lapin) pendant 24h",
          "Antibiotique (Sulfa ou Enrofloxacine) si confirmé par véto",
          "Probiotiques (yaourt nature) en convalescence",
        ],
      },
      {
        id: "plu_repro_optimum",
        categorie: "reproduction",
        titre: "Saison favorable à la reproduction (températures modérées)",
        description:
          "La saison des pluies, malgré les risques sanitaires, offre les meilleures températures pour la reproduction (24-28°C). À condition que la santé soit maîtrisée, les taux de gestation sont excellents.",
        priorite: "normale",
        actions: [
          "Planifier les saillies prioritaires de mai à août",
          "Renforcer l'apport en vitamines E et sélénium aux reproducteurs",
          "Boîte de mise-bas garnie de paille SÈCHE (changer si humide)",
          "Vacciner systématiquement les femelles 15 jours avant mise-bas",
        ],
      },
      {
        id: "plu_litiere",
        categorie: "hygiene",
        titre: "Litière sèche obligatoire dans les nids",
        description:
          "Une litière humide dans le nid provoque pneumonie et hypothermie des nouveau-nés. C'est la 2e cause de mortalité néonatale en saison des pluies.",
        priorite: "haute",
        actions: [
          "Vérifier l'humidité du nid chaque jour",
          "Remplacer la litière dès qu'elle est tiède ou tassée",
          "Utiliser paille séchée au soleil ou copeaux de bois",
          "Surélever la boîte de mise-bas pour éviter remontée capillaire",
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TEMPÉRÉ — PRINTEMPS (Mars – Mai)
  // ═══════════════════════════════════════════════════════════════════════════
  printemps: {
    id: "printemps",
    climat: "tempere",
    nom: "Printemps",
    description:
      "Saison idéale pour la reproduction : températures douces, jours qui s'allongent. Attention aux variations thermiques jour/nuit et au retour des parasites.",
    emoji: "🌱",
    mois: "Mars — Mai",
    temperatureOptimale: "15 – 20°C",
    risquesPrincipaux: [
      "Écarts thermiques jour/nuit (jusqu'à 15°C)",
      "Retour des parasites internes (vers, coccidies)",
      "Allergies respiratoires liées aux pollens",
      "Apparition des mouches (myiase potentielle)",
    ],
    recommandations: [
      {
        id: "pri_repro_intensif",
        categorie: "reproduction",
        titre: "Période optimale pour intensifier la reproduction",
        description:
          "Photopériode croissante + températures idéales = pic naturel de fertilité. C'est le moment de planifier les portées qui sevreront en été.",
        priorite: "haute",
        actions: [
          "Programmer 70% des saillies annuelles entre mars et mai",
          "Vérifier que les femelles ont un BCS (note état corporel) de 3/5",
          "Renforcer en vitamines A et E 15 jours avant saillie",
          "Surveiller le retour des chaleurs après mise-bas",
        ],
      },
      {
        id: "pri_vermifuge",
        categorie: "sante",
        titre: "Vermifugation de printemps",
        description:
          "Les œufs de parasites dormants pendant l'hiver éclosent avec la hausse des températures. Une cure préventive évite l'explosion estivale.",
        priorite: "haute",
        actions: [
          "Vermifuge à l'Ivermectine ou Fenbendazole sur tout le cheptel",
          "Renouveler 15 jours plus tard pour cibler les œufs éclos",
          "Désinfecter les cages le même jour",
          "Surveiller les selles 2 semaines après",
        ],
      },
      {
        id: "pri_thermique",
        categorie: "temperature",
        titre: "Gérer les écarts jour/nuit",
        description:
          "Au printemps, il peut faire 22°C l'après-midi et 5°C la nuit. Cet écart fragilise les lapereaux et favorise les coups de froid.",
        priorite: "normale",
        actions: [
          "Fermer partiellement la ventilation la nuit",
          "Bâcher le côté nord du clapier après 18h",
          "Vérifier l'isolation des boîtes de mise-bas",
          "Ne pas tondre les femelles trop tôt en saison",
        ],
      },
      {
        id: "pri_mouches",
        categorie: "hygiene",
        titre: "Anticiper l'arrivée des mouches",
        description:
          "Les mouches reviennent en avril-mai et pondent dans les plaies, les zones souillées et autour de l'anus. La myiase (asticots) peut tuer en 48h.",
        priorite: "normale",
        actions: [
          "Installer pièges et bandes adhésives dès avril",
          "Évacuer les fientes quotidiennement",
          "Tondre la zone péri-anale des femelles allaitantes",
          "Inspecter les lapins 2× par semaine (surtout zone anus, oreilles)",
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TEMPÉRÉ — ÉTÉ (Juin – Août)
  // ═══════════════════════════════════════════════════════════════════════════
  ete: {
    id: "ete",
    climat: "tempere",
    nom: "Été",
    description:
      "Saison la plus à risque en climat tempéré : les lapins, originaires des zones froides, supportent mal les températures >25°C. Coups de chaleur fréquents en canicule.",
    emoji: "☀️",
    mois: "Juin — Août",
    temperatureOptimale: "15 – 22°C (danger >28°C)",
    risquesPrincipaux: [
      "Coup de chaleur (mortalité brutale)",
      "Stérilité temporaire des mâles >30°C",
      "Myiase (asticots) sur plaies et zones humides",
      "Baisse d'ingestion → perte de poids",
    ],
    recommandations: [
      {
        id: "ete_rafraichir",
        categorie: "temperature",
        titre: "Rafraîchir activement en cas de canicule",
        description:
          "Au-delà de 28°C, le lapin entre en hyperthermie. Il halète, refuse de manger, et peut mourir en quelques heures sans intervention.",
        priorite: "haute",
        actions: [
          "Bouteilles d'eau congelées dans chaque cage à 11h",
          "Brumiser les oreilles (zone de thermorégulation principale)",
          "Ventilateur orienté vers le toit, jamais directement sur les lapins",
          "Mouiller le sol du clapier 2× par jour",
          "Récolter et donner de l'herbe fraîche tôt le matin",
        ],
      },
      {
        id: "ete_hydratation",
        categorie: "hydratation",
        titre: "Eau fraîche en permanence",
        description:
          "Un lapin perd 30-40% d'eau par halètement en été. L'eau tiède est refusée, accélérant la déshydratation.",
        priorite: "haute",
        actions: [
          "Vérifier les abreuvoirs 3× par jour",
          "Glaçons dans l'eau aux heures chaudes",
          "Doubler le nombre d'abreuvoirs par cage",
          "Vitamine C dans l'eau (stress thermique)",
        ],
      },
      {
        id: "ete_repro_pause",
        categorie: "reproduction",
        titre: "Pause des reproductions en canicule",
        description:
          "Les mâles deviennent stériles temporairement >30°C, et les femelles gestantes risquent l'avortement par stress thermique.",
        priorite: "normale",
        actions: [
          "Suspendre les saillies si température >28°C prévue",
          "Reprogrammer fin août / début septembre",
          "Surveiller les femelles gestantes (avortements)",
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TEMPÉRÉ — AUTOMNE (Sept – Nov)
  // ═══════════════════════════════════════════════════════════════════════════
  automne: {
    id: "automne",
    climat: "tempere",
    nom: "Automne",
    description:
      "Saison de transition. Préparer les animaux et l'infrastructure à l'hiver. Les reproducteurs entrent en mue, la fertilité baisse.",
    emoji: "🍂",
    mois: "Septembre — Novembre",
    temperatureOptimale: "15 – 20°C",
    risquesPrincipaux: [
      "Mue → baisse de fertilité",
      "Premiers froids nocturnes",
      "Stocks de foin à constituer",
      "Humidité croissante",
    ],
    recommandations: [
      {
        id: "aut_stocks",
        categorie: "alimentation",
        titre: "Constituer les stocks pour l'hiver",
        description:
          "L'herbe fraîche disparaît en novembre. Les stocks de foin et granulés doivent couvrir 4-5 mois minimum.",
        priorite: "haute",
        actions: [
          "Calculer les besoins : ~100g foin + 150g granulés par lapin/jour",
          "Stocker foin dans un lieu sec, surélevé",
          "Acheter granulés en sacs scellés (max 3 mois de conso à la fois)",
          "Vérifier l'absence d'humidité dans le stockage",
        ],
      },
      {
        id: "aut_vermifuge_auto",
        categorie: "sante",
        titre: "Vermifugation d'automne",
        description:
          "Cure de fin de saison pour entrer l'hiver sans charge parasitaire. C'est aussi le bon moment pour vacciner contre la myxomatose et la VHD.",
        priorite: "normale",
        actions: [
          "Vermifuger tout le cheptel",
          "Vaccination annuelle myxomatose + VHD (RHD)",
          "Inspection sanitaire complète",
          "Trier les sujets faibles avant l'hiver",
        ],
      },
      {
        id: "aut_infrastructure",
        categorie: "infrastructure",
        titre: "Préparer l'isolation hivernale",
        description:
          "Anticiper les premiers gels en isolant les abreuvoirs et les côtés exposés au vent dominant.",
        priorite: "normale",
        actions: [
          "Bâcher le côté nord du clapier",
          "Isoler les conduites d'eau (laine de verre, gaine mousse)",
          "Garnir les boîtes de mise-bas de paille épaisse",
          "Vérifier l'étanchéité du toit",
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TEMPÉRÉ — HIVER (Déc – Fév)
  // ═══════════════════════════════════════════════════════════════════════════
  hiver: {
    id: "hiver",
    climat: "tempere",
    nom: "Hiver",
    description:
      "Le lapin tolère bien le froid (jusqu'à -10°C s'il est au sec), mais l'eau gèle et la baisse de luminosité réduit la fertilité.",
    emoji: "❄️",
    mois: "Décembre — Février",
    temperatureOptimale: "5 – 18°C",
    risquesPrincipaux: [
      "Abreuvoirs gelés (déshydratation rapide)",
      "Baisse de fertilité (jours courts)",
      "Hypothermie des nouveau-nés",
      "Maladies respiratoires si ventilation insuffisante",
    ],
    recommandations: [
      {
        id: "hiv_eau",
        categorie: "hydratation",
        titre: "Empêcher l'eau de geler",
        description:
          "Un lapin privé d'eau >12h se déshydrate et arrête de manger. C'est la première cause de problème en hiver tempéré.",
        priorite: "haute",
        actions: [
          "Vérifier les abreuvoirs 3× par jour",
          "Préférer abreuvoirs en plastique aux bouteilles (gèlent moins vite)",
          "Apporter de l'eau tiède le matin (5-10°C)",
          "Abreuvoirs chauffants si température <-5°C prolongée",
        ],
      },
      {
        id: "hiv_calorie",
        categorie: "alimentation",
        titre: "Augmenter l'apport énergétique",
        description:
          "Pour maintenir leur température corporelle (39°C), les lapins consomment 20-30% de plus en hiver. Sans cet apport, ils maigrissent.",
        priorite: "haute",
        actions: [
          "Augmenter les granulés de 20-30%",
          "Distribuer foin à volonté (combustion = chaleur)",
          "Ajouter avoine ou maïs concassé (céréales énergétiques)",
          "Vérifier le poids 1× par semaine",
        ],
      },
      {
        id: "hiv_lapereaux",
        categorie: "reproduction",
        titre: "Protéger les nouveau-nés du froid",
        description:
          "Les lapereaux nus meurent en quelques heures à <10°C. La boîte de mise-bas doit être isolée et bien garnie.",
        priorite: "haute",
        actions: [
          "Paille épaisse (10 cm) dans la boîte de mise-bas",
          "Boîte fermée sur 3 côtés, ouverture côté sud",
          "Vérifier la portée 2× par jour (lapereaux tombés = mort en 1h)",
          "Lampe chauffante infrarouge si température <0°C",
        ],
      },
      {
        id: "hiv_ventilation",
        categorie: "infrastructure",
        titre: "Maintenir une ventilation minimale",
        description:
          "Tendance fréquente : tout calfeutrer pour garder la chaleur. Erreur — l'humidité et l'ammoniac s'accumulent et provoquent pneumonies et conjonctivites.",
        priorite: "normale",
        actions: [
          "Garder une entrée d'air haute, côté abrité du vent",
          "Évacuer les fientes quotidiennement (source d'ammoniac)",
          "Pas d'eau stagnante au sol",
          "Test simple : si ça sent l'ammoniac en entrant, c'est trop fermé",
        ],
      },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Alertes personnalisées basées sur l'état réel de la ferme
// ─────────────────────────────────────────────────────────────────────────────

export interface AlertePersonnalisee {
  niveau: "critique" | "attention" | "info";
  titre: string;
  message: string;
}

export function genererAlertes(saison: Saison, stats: FarmStats): AlertePersonnalisee[] {
  const alertes: AlertePersonnalisee[] = [];

  // Mortalité élevée → toujours critique
  if (stats.tauxMortalite > 20) {
    alertes.push({
      niveau: "critique",
      titre: `Taux de mortalité élevé : ${stats.tauxMortalite}%`,
      message:
        saison.climat === "tropical" && saison.id === "saison_des_pluies"
          ? "En saison des pluies, ce taux indique probablement une coccidiose non maîtrisée. Vérifiez le protocole de désinfection et lancez une cure préventive sur tout le cheptel."
          : "Inspectez l'ensemble du cheptel et appliquez en priorité les recommandations sanitaires ci-dessous. Consultez un vétérinaire si plusieurs symptômes apparaissent.",
    });
  } else if (stats.tauxMortalite > 10) {
    alertes.push({
      niveau: "attention",
      titre: `Mortalité à surveiller : ${stats.tauxMortalite}%`,
      message:
        "Le taux acceptable est <8% en élevage maîtrisé. Identifiez la cause principale (sevrage, maladie, accident) avant qu'elle ne s'aggrave.",
    });
  }

  // Saison sèche + beaucoup d'animaux → risque thermique aggravé
  if (saison.id === "saison_seche" && stats.totalAnimaux > 30) {
    alertes.push({
      niveau: "attention",
      titre: "Cheptel important en saison sèche",
      message: `Avec ${stats.totalAnimaux} animaux, la densité augmente le risque de coup de chaleur. Espacez les cages si possible et vérifiez la ventilation transversale.`,
    });
  }

  // Saison pluies + lapereaux → coccidiose
  if (saison.id === "saison_des_pluies" && stats.nbLapereaux > 5) {
    alertes.push({
      niveau: "critique",
      titre: `${stats.nbLapereaux} lapereaux en saison des pluies`,
      message:
        "C'est l'âge le plus à risque (sevrage → 12 sem). Démarrez immédiatement le protocole anti-coccidiose. Plus de la moitié des élevages perdent 30%+ de leurs lapereaux faute de prévention.",
    });
  }

  // Hiver + lapereaux
  if (saison.id === "hiver" && stats.nbLapereaux > 0) {
    alertes.push({
      niveau: "attention",
      titre: `${stats.nbLapereaux} lapereaux exposés au froid`,
      message:
        "Vérifiez deux fois par jour les boîtes de mise-bas. Un lapereau tombé hors du nid meurt en moins d'une heure.",
    });
  }

  // Été + reproducteurs
  if (saison.id === "ete" && stats.nbReproducteurs > 0) {
    alertes.push({
      niveau: "info",
      titre: "Période défavorable à la reproduction",
      message: `Vos ${stats.nbReproducteurs} reproducteurs sont peu fertiles en été. Reprogrammez les saillies importantes pour septembre.`,
    });
  }

  return alertes;
}
