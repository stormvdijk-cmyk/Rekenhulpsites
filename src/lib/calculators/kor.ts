import { tarieven } from '../../data/tarieven';
import { round2 } from './format';

const grens = tarieven.kor.omzetgrens;

export interface KorInput {
  /** omzet per jaar, exclusief btw */
  omzet: number;
  /** btw die je betaalt op je zakelijke kosten per jaar */
  voorbelasting: number;
  /** deel van de omzet aan particulieren (0-100) */
  particulierPct: number;
  /** btw-tarief van je omzet (0,21 of 0,09) */
  tarief: number;
}

export interface KorResultaat {
  magKor: boolean;
  btwAfdragenZonderKor: number;
  /** extra opbrengst met KOR als je dezelfde prijs incl. btw aan particulieren blijft vragen */
  extraVanParticulieren: number;
  gemisteVoorbelasting: number;
  voordeel: number;
}

/**
 * Vergelijking: met KOR reken je geen btw. Particulieren betalen dezelfde prijs (die btw houd je),
 * zakelijke klanten betalen de prijs exclusief btw (zij konden de btw toch aftrekken).
 * Je mag de btw op je kosten dan niet meer aftrekken.
 */
export function berekenKor(i: KorInput): KorResultaat {
  const btw = i.omzet * i.tarief;
  const extra = btw * Math.min(100, Math.max(0, i.particulierPct)) / 100;
  return {
    magKor: i.omzet <= grens,
    btwAfdragenZonderKor: round2(Math.max(0, btw - i.voorbelasting)),
    extraVanParticulieren: round2(extra),
    gemisteVoorbelasting: round2(i.voorbelasting),
    voordeel: round2(extra - i.voorbelasting),
  };
}
