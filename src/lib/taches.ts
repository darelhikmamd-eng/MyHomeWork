import { addDays } from "@/lib/utils";

export type TypeTache =
  | "palpation"
  | "boite_nid"
  | "mise_bas"
  | "sevrage"
  | "retour_saillie";

export interface TacheInput {
  accouplementId: string;
  type: TypeTache;
  dateEcheance: Date;
}

export interface ParametresTaches {
  rythmeReproduction: "intensif" | "extensif";
  intervalleIntensif: number;
  intervalleExtensif: number;
}

/**
 * Génère les 5 tâches automatiques à partir de la date de saillie.
 *
 * Règles métier :
 *  - Palpation    : J+12 (médiane 10-14j)
 *  - Boîte à nid  : J+28 (éviter contamination si trop tôt)
 *  - Mise-bas     : J+31
 *  - Sevrage      : J+31+35 = J+66 (5 semaines post-mise-bas)
 *  - Retour saillie :
 *      intensif  = dateMiseBas + intervalleIntensif (défaut 42j) = J+73
 *      extensif  = dateMiseBas + intervalleExtensif (défaut 21j) = J+52
 */
export function genererTachesAccouplement(
  accouplementId: string,
  dateAccouplement: Date,
  params: ParametresTaches
): TacheInput[] {
  const dateAcc = new Date(dateAccouplement);
  const dateMiseBas = addDays(dateAcc, 31);

  const intervalle =
    params.rythmeReproduction === "intensif"
      ? params.intervalleIntensif
      : params.intervalleExtensif;

  return [
    {
      accouplementId,
      type: "palpation",
      dateEcheance: addDays(dateAcc, 12),
    },
    {
      accouplementId,
      type: "boite_nid",
      dateEcheance: addDays(dateAcc, 28),
    },
    {
      accouplementId,
      type: "mise_bas",
      dateEcheance: dateMiseBas,
    },
    {
      accouplementId,
      type: "sevrage",
      dateEcheance: addDays(dateMiseBas, 35),
    },
    {
      accouplementId,
      type: "retour_saillie",
      dateEcheance: addDays(dateMiseBas, intervalle),
    },
  ];
}

export const LABELS_TACHES: Record<TypeTache, string> = {
  palpation: "Palpation",
  boite_nid: "Pose boîte à nid",
  mise_bas: "Mise-bas prévue",
  sevrage: "Sevrage",
  retour_saillie: "Retour à la saillie",
};

export const ICONS_TACHES: Record<TypeTache, string> = {
  palpation: "🔍",
  boite_nid: "📦",
  mise_bas: "🐣",
  sevrage: "🌱",
  retour_saillie: "💞",
};

export const CAUSES_DECES = [
  { value: "presevrage_froid_ecrasement", label: "Pré-sevrage (froid / écrasement)" },
  { value: "cannibalisme_maternel", label: "Cannibalisme maternel" },
  { value: "postsevrage_5sem", label: "Post-sevrage (~5 semaines)" },
  { value: "postsevrage_7sem", label: "Post-sevrage (~7 semaines)" },
  { value: "postsevrage_9sem", label: "Post-sevrage (~9 semaines)" },
  { value: "maladie_fulgurante_vhd", label: "Maladie foudroyante (VHD...)" },
  { value: "autre", label: "Autre / Indéterminée" },
] as const;

export const COULEURS_VULVE = [
  { value: "blanche", label: "Blanche — faibles chances ⚠️", variant: "warning" },
  { value: "rose", label: "Rose — réceptivité normale", variant: "ok" },
  { value: "rouge", label: "Rouge — bonne réceptivité ✓", variant: "good" },
  { value: "violacee", label: "Violacée — pic de réceptivité ✓✓", variant: "good" },
] as const;
