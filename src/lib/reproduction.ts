// Règles métier pour la reproduction
//
// Contrainte : un mâle reproducteur ne peut pas être accouplé
// avec plus de MAX_FEMELLES_PAR_MALE femelles DISTINCTES.

export const MAX_FEMELLES_PAR_MALE = 10;

export interface AccouplementMinimal {
  pereId: string;
  mereId: string;
  dateAccouplement: Date | string;
  dateMiseBas?: Date | string | null;
  statut?: string;
  nombreNes?: number | null;
  nombreVivants?: number | null;
  mere?: { id: string; name: string; identifiant: string } | null;
}

export interface ReproductionStats {
  femellesDistinctes: string[]; // ids
  nbFemellesDistinctes: number;
  nbAccouplements: number;
  nbPortees: number; // accouplements avec mise_bas
  quotaAtteint: boolean;
  placesRestantes: number;
}

/**
 * Calcule les statistiques de reproduction pour un mâle donné.
 */
export function getStatsPere(
  pereId: string,
  accouplements: AccouplementMinimal[]
): ReproductionStats {
  const accs = accouplements.filter((a) => a.pereId === pereId);
  const femelles = Array.from(new Set(accs.map((a) => a.mereId)));
  const nbPortees = accs.filter(
    (a) => a.statut === "mise_bas" || a.statut === "sevrage"
  ).length;
  const quotaAtteint = femelles.length >= MAX_FEMELLES_PAR_MALE;
  return {
    femellesDistinctes: femelles,
    nbFemellesDistinctes: femelles.length,
    nbAccouplements: accs.length,
    nbPortees,
    quotaAtteint,
    placesRestantes: Math.max(0, MAX_FEMELLES_PAR_MALE - femelles.length),
  };
}

/**
 * Représente une génération (= une portée) d'un mâle.
 */
export interface Generation {
  numero: number; // 1, 2, 3, …
  accouplementId: string;
  dateAccouplement: string;
  dateMiseBas: string | null;
  statut: string;
  mere: { id: string; name: string; identifiant: string } | null;
  nombreNes: number | null;
  nombreVivants: number | null;
}

/**
 * Liste chronologique des générations (portées) d'un mâle.
 */
export function getGenerationsPere(
  pereId: string,
  accouplements: (AccouplementMinimal & { id: string })[]
): Generation[] {
  return accouplements
    .filter((a) => a.pereId === pereId)
    .sort(
      (a, b) =>
        new Date(a.dateAccouplement).getTime() -
        new Date(b.dateAccouplement).getTime()
    )
    .map((a, idx) => ({
      numero: idx + 1,
      accouplementId: a.id,
      dateAccouplement:
        typeof a.dateAccouplement === "string"
          ? a.dateAccouplement
          : a.dateAccouplement.toISOString(),
      dateMiseBas: a.dateMiseBas
        ? typeof a.dateMiseBas === "string"
          ? a.dateMiseBas
          : a.dateMiseBas.toISOString()
        : null,
      statut: a.statut ?? "en_cours",
      mere: a.mere ?? null,
      nombreNes: a.nombreNes ?? null,
      nombreVivants: a.nombreVivants ?? null,
    }));
}
