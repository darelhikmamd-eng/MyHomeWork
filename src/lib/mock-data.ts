export type RabbitStatus = "actif" | "vendu" | "decede" | "reproducteur";
export type RabbitSexe = "male" | "femelle";

export interface Rabbit {
  id: string;
  name: string;
  identifiant: string;
  race: string;
  sexe: RabbitSexe;
  dateNaissance: string;
  poids: number;
  couleur: string;
  statut: RabbitStatus;
  cageNumero: string;
  notes?: string;
}

export interface Accouplement {
  id: string;
  dateAccouplement: string;
  pereId: string;
  mereId: string;
  dateMiseBas: string;
  statut: "en_cours" | "mise_bas" | "echec";
  nombreNes?: number;
  nombreVivants?: number;
}

export interface SanteLog {
  id: string;
  rabbitId: string;
  rabbitName: string;
  type: "vaccin" | "traitement" | "observation" | "veterinaire";
  description: string;
  date: string;
  prochainRappel?: string;
}

export const mockRabbits: Rabbit[] = [
  {
    id: "r1",
    name: "Blanche",
    identifiant: "F-001",
    race: "Néo-Zélandais",
    sexe: "femelle",
    dateNaissance: "2023-06-15",
    poids: 4.2,
    couleur: "Blanc",
    statut: "reproducteur",
    cageNumero: "A1",
  },
  {
    id: "r2",
    name: "Grisou",
    identifiant: "M-001",
    race: "Néo-Zélandais",
    sexe: "male",
    dateNaissance: "2023-05-20",
    poids: 4.8,
    couleur: "Gris",
    statut: "reproducteur",
    cageNumero: "B1",
  },
  {
    id: "r3",
    name: "Cannelle",
    identifiant: "F-002",
    race: "Californien",
    sexe: "femelle",
    dateNaissance: "2023-08-10",
    poids: 3.9,
    couleur: "Fauve",
    statut: "reproducteur",
    cageNumero: "A2",
  },
  {
    id: "r4",
    name: "Hercule",
    identifiant: "M-002",
    race: "Géant Flamand",
    sexe: "male",
    dateNaissance: "2022-11-05",
    poids: 7.2,
    couleur: "Gris ardoise",
    statut: "reproducteur",
    cageNumero: "C1",
  },
  {
    id: "r5",
    name: "Noisette",
    identifiant: "F-003",
    race: "Californien",
    sexe: "femelle",
    dateNaissance: "2024-01-12",
    poids: 2.8,
    couleur: "Marron",
    statut: "actif",
    cageNumero: "A3",
  },
  {
    id: "r6",
    name: "Flocon",
    identifiant: "L-001",
    race: "Néo-Zélandais",
    sexe: "male",
    dateNaissance: "2024-03-01",
    poids: 1.4,
    couleur: "Blanc",
    statut: "actif",
    cageNumero: "D1",
  },
  {
    id: "r7",
    name: "Miel",
    identifiant: "L-002",
    race: "Néo-Zélandais",
    sexe: "femelle",
    dateNaissance: "2024-03-01",
    poids: 1.2,
    couleur: "Doré",
    statut: "actif",
    cageNumero: "D1",
  },
  {
    id: "r8",
    name: "Pepper",
    identifiant: "L-003",
    race: "Néo-Zélandais",
    sexe: "male",
    dateNaissance: "2024-03-01",
    poids: 1.3,
    couleur: "Gris",
    statut: "actif",
    cageNumero: "D1",
  },
];

export const mockAccouplements: Accouplement[] = [
  {
    id: "a1",
    dateAccouplement: "2024-04-10",
    pereId: "r2",
    mereId: "r1",
    dateMiseBas: "2024-05-11",
    statut: "en_cours",
  },
  {
    id: "a2",
    dateAccouplement: "2024-03-01",
    pereId: "r4",
    mereId: "r3",
    dateMiseBas: "2024-04-01",
    statut: "mise_bas",
    nombreNes: 8,
    nombreVivants: 7,
  },
];

export const mockSanteLogs: SanteLog[] = [
  {
    id: "s1",
    rabbitId: "r1",
    rabbitName: "Blanche",
    type: "vaccin",
    description: "Vaccin Myxomatose + VHD",
    date: "2024-04-01",
    prochainRappel: "2024-10-01",
  },
  {
    id: "s2",
    rabbitId: "r2",
    rabbitName: "Grisou",
    type: "vaccin",
    description: "Vaccin Myxomatose + VHD",
    date: "2024-04-01",
    prochainRappel: "2024-10-01",
  },
  {
    id: "s3",
    rabbitId: "r3",
    rabbitName: "Cannelle",
    type: "traitement",
    description: "Traitement anti-parasitaire",
    date: "2024-04-15",
  },
  {
    id: "s4",
    rabbitId: "r4",
    rabbitName: "Hercule",
    type: "observation",
    description: "Contrôle poids - légère perte",
    date: "2024-05-01",
    prochainRappel: "2024-05-15",
  },
];

export const dashboardStats = {
  totalRabbits: 8,
  males: 3,
  femelles: 3,
  lapereaux: 2,
  reproducteursActifs: 4,
  gestationsEnCours: 1,
  sevrageAVenir: 2,
  rappelsSante: 3,
};
