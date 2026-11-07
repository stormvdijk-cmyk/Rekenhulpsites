import { tarieven } from '../../data/tarieven';
import { marginaalTarief } from './belasting';
import { round2 } from './format';

const x = tarieven.expatregeling;

export interface ExpatInput {
  /** bruto jaarsalaris zonder de expatvergoeding */
  salaris: number;
  /** jonger dan 30 met een (gelijkwaardige) Nederlandse master: lagere salarisnorm */
  jongMaster: boolean;
  /** aantal maanden in het jaar dat de regeling geldt (1–12) */
  maanden: number;
  /** wetenschappelijk onderzoeker of arts in opleiding tot specialist: geen salarisnorm */
  geenNorm?: boolean;
}

export interface ExpatResultaat {
  norm: number;
  voldoetAanNorm: boolean;
  maxVergoeding: number;
  plafond: number;
  totaalLoon: number;
  belastingvoordeel: number;
  marginaal: number;
}

/** Maximale belastingvrije vergoeding met de expatregeling (30%-regeling) in 2026. */
export function berekenExpat(i: ExpatInput): ExpatResultaat {
  const salaris = Math.max(0, i.salaris);
  const maanden = Math.min(12, Math.max(0, i.maanden));
  const norm = i.geenNorm ? 0 : i.jongMaster ? x.salarisnormJong : x.salarisnorm;
  const voldoet = salaris > norm;
  const plafond = round2((x.maxVergoeding * maanden) / 12);
  // 30/70 van het loon exclusief vergoeding = 30% van het loon inclusief vergoeding.
  const verg = voldoet ? Math.min((salaris * x.percentage) / (1 - x.percentage), plafond) : 0;
  const totaal = salaris + verg;
  const marginaal = marginaalTarief(totaal);
  return {
    norm,
    voldoetAanNorm: voldoet,
    maxVergoeding: Math.floor(verg),
    plafond,
    totaalLoon: round2(totaal),
    belastingvoordeel: round2(Math.floor(verg) * marginaal),
    marginaal: round2(marginaal * 100),
  };
}

/** Variant voor een vast totaalbedrag (loon inclusief vergoeding): het loon zonder vergoeding moet boven de norm blijven. */
export function vergoedingUitTotaal(totaal: number, jongMaster: boolean, maanden = 12): number {
  const norm = jongMaster ? x.salarisnormJong : x.salarisnorm;
  const t = Math.max(0, totaal);
  const plafond = (x.maxVergoeding * Math.min(12, Math.max(0, maanden))) / 12;
  return Math.max(0, Math.floor(Math.min(t * x.percentage, t - norm - 1, plafond)));
}
