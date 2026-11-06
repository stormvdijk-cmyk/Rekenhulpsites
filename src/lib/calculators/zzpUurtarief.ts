import { tarieven } from '../../data/tarieven';
import { algemeneHeffingskorting, arbeidskorting, box1Belasting } from './belasting';
import { round2 } from './format';

const o = tarieven.ondernemer;

export interface ZzpFiscaal {
  winst: number;
  ondernemersaftrek: number;
  mkbVrijstelling: number;
  belastbaar: number;
  inkomstenbelasting: number;
  zvw: number;
  netto: number;
}

/** Netto besteedbaar inkomen bij een bepaalde winst (vereenvoudigd, alleen box 1). */
export interface Ondernemersaftrek { zelfstandigenaftrek: number; startersaftrek: number }

export function nettoUitWinst(winst: number, urencriterium: boolean, starter: boolean, aftrek: Ondernemersaftrek = o): ZzpFiscaal {
  const w = Math.max(0, winst);
  const aftrekMax = urencriterium ? aftrek.zelfstandigenaftrek + (starter ? aftrek.startersaftrek : 0) : 0;
  const ondernemersaftrek = Math.min(aftrekMax, w);
  const mkbVrijstelling = (w - ondernemersaftrek) * o.mkbWinstvrijstelling;
  const aftrekposten = ondernemersaftrek + mkbVrijstelling;
  const belastbaar = Math.max(0, w - aftrekposten);

  let ib = box1Belasting(belastbaar);
  // Aftrekbeperking: aftrekposten leveren maximaal het tarief van schijf 2 op.
  const topgrens = tarieven.box1.schijven[1].tot as number;
  const topTarief = tarieven.box1.schijven[2].tarief;
  const inTop = Math.min(aftrekposten, Math.max(0, w - topgrens));
  ib += inTop * (topTarief - o.aftrekTariefMaximum);

  const kortingen = algemeneHeffingskorting(belastbaar) + arbeidskorting(w);
  ib = Math.max(0, ib - kortingen);
  const zvw = Math.min(belastbaar, o.zvwMaximumInkomen) * o.zvwPercentage;
  return { winst: w, ondernemersaftrek, mkbVrijstelling, belastbaar, inkomstenbelasting: ib, zvw, netto: w - ib - zvw };
}

/** Benodigde winst voor een gewenst netto inkomen (bisectie). */
export function benodigdeWinst(gewenstNetto: number, urencriterium: boolean, starter: boolean): number {
  let lo = 0;
  let hi = Math.max(1000, gewenstNetto * 3);
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (nettoUitWinst(mid, urencriterium, starter).netto < gewenstNetto) lo = mid; else hi = mid;
  }
  return hi;
}

export interface ZzpInput {
  /** gewenst netto inkomen per maand */
  nettoPerMaand: number;
  /** zakelijke kosten per jaar */
  kostenPerJaar: number;
  /** reservering per maand voor pensioen, AOV en buffer (uit netto) */
  reserveringPerMaand: number;
  werkwekenPerJaar: number;
  urenPerWeek: number;
  /** percentage van de uren dat declarabel is (0-100) */
  declarabelPct: number;
  urencriterium: boolean;
  starter: boolean;
}

export interface ZzpResultaat {
  uurtarief: number;
  uurtariefInclBtw: number;
  declarabeleUren: number;
  benodigdeWinst: number;
  benodigdeOmzet: number;
  inkomstenbelasting: number;
  zvw: number;
  nettoPerJaar: number;
}

export function berekenZzpUurtarief(i: ZzpInput): ZzpResultaat {
  const nettoJaar = (i.nettoPerMaand + i.reserveringPerMaand) * 12;
  const winst = benodigdeWinst(nettoJaar, i.urencriterium, i.starter);
  const f = nettoUitWinst(winst, i.urencriterium, i.starter);
  const omzet = winst + i.kostenPerJaar;
  const uren = i.werkwekenPerJaar * i.urenPerWeek * (i.declarabelPct / 100);
  const uurtarief = uren > 0 ? omzet / uren : NaN;
  return {
    uurtarief: round2(uurtarief),
    uurtariefInclBtw: round2(uurtarief * (1 + tarieven.btw.algemeen)),
    declarabeleUren: round2(uren),
    benodigdeWinst: round2(winst),
    benodigdeOmzet: round2(omzet),
    inkomstenbelasting: round2(f.inkomstenbelasting),
    zvw: round2(f.zvw),
    nettoPerJaar: round2(f.netto),
  };
}
