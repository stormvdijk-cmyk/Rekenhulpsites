import { tarieven } from '../../data/tarieven';
import { round2 } from './format';

// ---------- Giften ----------
const g = tarieven.giften;
export interface GiftenInput { drempelinkomen: number; gewoneGiften: number; cultureleGiften: number; periodiekeGiften: number }
export interface GiftenResultaat { drempel: number; maximum: number; aftrekGewoon: number; verhogingCultureel: number; aftrekPeriodiek: number; totaal: number }

/** Giftenaftrek 2026: gewone giften boven drempel (1%, min € 60) tot max 10%; culturele ANBI +25% (max € 1.250); periodieke giften volledig. */
export function berekenGiftenaftrek(i: GiftenInput): GiftenResultaat {
  const di = Math.max(0, i.drempelinkomen);
  const drempel = Math.max(g.drempelMinimum, di * g.drempelPercentage);
  const verhoging = Math.min(g.cultureelMaximum, Math.max(0, i.cultureleGiften) * g.cultureelVerhoging);
  const maximum = di * g.maximumPercentage + verhoging;
  const gewoon = Math.max(0, i.gewoneGiften) + Math.max(0, i.cultureleGiften);
  const aftrekGewoon = Math.min(maximum, Math.max(0, gewoon + verhoging - drempel));
  const periodiek = Math.max(0, i.periodiekeGiften);
  return { drempel: round2(drempel), maximum: round2(maximum), aftrekGewoon: round2(aftrekGewoon), verhogingCultureel: round2(verhoging), aftrekPeriodiek: round2(periodiek), totaal: round2(aftrekGewoon + periodiek) };
}

// ---------- Zorgkosten ----------
const z = tarieven.zorgkosten;
export interface ZorgkostenInput {
  drempelinkomen: number;
  partner: boolean;
  aow: boolean;
  /** kosten die meetellen voor de verhoging (hulpmiddelen, dieet, extra kleding, vervoer, enz.) */
  kostenMetVerhoging: number;
  /** genees- en heelkundige hulp en reiskosten ziekenbezoek (tellen niet mee voor de verhoging) */
  kostenZonderVerhoging: number;
}
export interface ZorgkostenResultaat { drempel: number; verhoging: number; totaleKosten: number; aftrek: number }

export function zorgkostenDrempel(drempelinkomen: number, partner: boolean): number {
  const di = Math.max(0, drempelinkomen);
  const tot = partner ? z.drempelVastTotPartner : z.drempelVastTot;
  if (di <= tot) return partner ? z.drempelVastPartner : z.drempelVast;
  if (di <= z.grensHoog) return di * z.drempelPercentage;
  return z.drempelHoogBasis + (di - z.grensHoog) * z.drempelHoogPercentage;
}

export function berekenZorgkostenaftrek(i: ZorgkostenInput): ZorgkostenResultaat {
  const drempel = zorgkostenDrempel(i.drempelinkomen, i.partner);
  const verhoging = i.drempelinkomen <= z.verhogingGrens ? Math.max(0, i.kostenMetVerhoging) * (i.aow ? z.verhogingAow : z.verhoging) : 0;
  const totaal = Math.max(0, i.kostenMetVerhoging) + Math.max(0, i.kostenZonderVerhoging) + verhoging;
  return { drempel: round2(drempel), verhoging: round2(verhoging), totaleKosten: round2(totaal), aftrek: round2(Math.max(0, totaal - drempel)) };
}

// ---------- Jaarruimte lijfrente ----------
const l = tarieven.lijfrente;
export interface JaarruimteInput {
  /** inkomen vorig jaar: loon, winst en resultaat overig werk (box 1) */
  inkomenVorigJaar: number;
  /** factor A van je UPO (opbouw in een uitkeringsregeling); 0 als je geen pensioen opbouwt */
  factorA: number;
  /** inleg in een beschikbarepremieregeling of onder de Wtp (werkgever + werknemer), indien van toepassing */
  pensioenpremie: number;
  /** stortingen in een fiscale oudedagsreserve (ondernemers) */
  stortingFor: number;
}
export interface JaarruimteResultaat { premiegrondslag: number; ruimteVoorAftrek: number; aftrekPensioen: number; jaarruimte: number }

export function berekenJaarruimte(i: JaarruimteInput): JaarruimteResultaat {
  const grondslag = Math.max(0, Math.min(i.inkomenVorigJaar, l.aftoppingsgrens) - l.franchise);
  const ruimte = grondslag * l.percentage;
  const opbouw = Math.max(0, i.factorA) * l.factorA + Math.max(0, i.pensioenpremie) + Math.max(0, i.stortingFor);
  return { premiegrondslag: round2(grondslag), ruimteVoorAftrek: round2(ruimte), aftrekPensioen: round2(opbouw), jaarruimte: round2(Math.min(l.maximaleJaarruimte, Math.max(0, ruimte - opbouw))) };
}
