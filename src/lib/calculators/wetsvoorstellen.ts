import voorstellen from '../../data/wetsvoorstellen.json';
import { round2 } from './format';

export const VOORSTELLEN = voorstellen;
const w = voorstellen.box3;

export interface Box3NieuwInput {
  /** ontvangen rente op spaargeld en uitgeleend geld */
  rente: number;
  /** dividend, huur, pacht en andere reguliere inkomsten */
  overigeInkomsten: number;
  /** waardeverandering die belast wordt: winst bij verkoop (vermogenswinst) of jaarlijkse aanwas; verlies negatief */
  waardeverandering: number;
  /** betaalde rente op box 3-schulden en aftrekbare kosten */
  kosten: number;
  partner: boolean;
}

export interface Box3NieuwResultaat {
  resultaat: number;
  heffingsvrij: number;
  grondslag: number;
  belasting: number;
  /** verrekenbaar verlies voor volgende jaren (alleen boven de verliesdrempel) */
  verlies: number;
}

/**
 * Box 3 volgens de Wet werkelijk rendement box 3 en de novelle (beoogd per 2029):
 * 36% over het werkelijke resultaat boven het heffingsvrije resultaat van € 1.800 per persoon.
 * Een negatief resultaat is verrekenbaar voor zover het in absolute zin hoger is dan € 500 (het deel boven die drempel).
 */
export function berekenBox3Nieuw(i: Box3NieuwInput): Box3NieuwResultaat {
  const n = i.partner ? 2 : 1;
  const resultaat = i.rente + i.overigeInkomsten + i.waardeverandering - Math.max(0, i.kosten);
  const heffingsvrij = w.heffingsvrijResultaat * n;
  const grondslag = Math.max(0, resultaat - heffingsvrij);
  const drempel = w.verliesdrempel;
  const verlies = Math.max(0, -resultaat - drempel);
  return { resultaat: round2(resultaat), heffingsvrij, grondslag: round2(grondslag), belasting: round2(grondslag * w.tarief), verlies: round2(verlies) };
}
