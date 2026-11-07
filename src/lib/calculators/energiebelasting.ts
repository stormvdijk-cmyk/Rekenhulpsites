import { tarieven } from '../../data/tarieven';
import { round2 } from './format';

const e = tarieven.energiebelasting;
const btw = tarieven.btw.algemeen;

function schijven(verbruik: number, tabel: { tot: number | null; tarief: number }[]): number {
  let rest = Math.max(0, verbruik), vorige = 0, som = 0;
  for (const s of tabel) {
    const tot = s.tot ?? Infinity;
    const deel = Math.min(rest, tot - vorige);
    if (deel <= 0) break;
    som += deel * s.tarief;
    rest -= deel;
    vorige = tot;
  }
  return som;
}

export interface EnergieInput { kwh: number; m3: number; verblijfsfunctie: boolean }
export interface EnergieResultaat { elektriciteit: number; gas: number; vermindering: number; totaalExBtw: number; btw: number; totaalInclBtw: number; perMaand: number }

/** Energiebelasting 2026 op je energierekening (jaarverbruik), met belastingvermindering en 21% btw. */
export function berekenEnergiebelasting(i: EnergieInput): EnergieResultaat {
  const el = schijven(i.kwh, e.elektriciteit);
  const gas = schijven(i.m3, e.gas);
  const verm = i.verblijfsfunctie ? e.vermindering : 0;
  const ex = el + gas - verm;
  const b = ex * btw;
  return {
    elektriciteit: round2(el),
    gas: round2(gas),
    vermindering: verm,
    totaalExBtw: round2(ex),
    btw: round2(b),
    totaalInclBtw: round2(ex + b),
    perMaand: round2((ex + b) / 12),
  };
}
