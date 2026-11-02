import { round2 } from './format';

/** Hoeveel is p% van x? */
export const procentVan = (p: number, x: number): number => round2((p / 100) * x);

/** Hoeveel procent is deel van geheel? */
export const welkProcent = (deel: number, geheel: number): number => (geheel === 0 ? NaN : round2((deel / geheel) * 100));

/** Procentuele verandering van oud naar nieuw (positief = stijging). */
export const procentueleVerandering = (oud: number, nieuw: number): number => (oud === 0 ? NaN : round2(((nieuw - oud) / Math.abs(oud)) * 100));

export interface KortingResultaat { korting: number; nieuwePrijs: number }
export function korting(prijs: number, procent: number): KortingResultaat {
  const k = prijs * (procent / 100);
  return { korting: round2(k), nieuwePrijs: round2(prijs - k) };
}

/** Oorspronkelijke prijs terugrekenen uit een prijs na p% korting. */
export const prijsVoorKorting = (prijsNa: number, procent: number): number => (procent >= 100 ? NaN : round2(prijsNa / (1 - procent / 100)));
