import { tarieven } from '../../data/tarieven';
import { marginaalTarief } from './belasting';
import { round2 } from './format';

const e = tarieven.eigenWoning;
const topgrens = tarieven.box1.schijven[1].tot as number;
const topTarief = tarieven.box1.schijven[2].tarief;

/** Eigenwoningforfait 2026 voor elke WOZ-waarde (alle schijven uit Fiscale informatie 2026). */
export function forfaitVolledig(woz: number): number {
  const w = Math.max(0, woz);
  if (w > e.forfaitVillaGrens) return round2(e.forfaitVillaBasis + (w - e.forfaitVillaGrens) * e.forfaitVillaPercentage);
  const s = e.forfaitSchijven.find((x) => w <= x.tot) ?? e.forfaitSchijven[e.forfaitSchijven.length - 1];
  return round2(w * s.pct);
}

export interface RenteaftrekInput {
  woz: number;
  /** betaalde hypotheekrente en aftrekbare kosten per jaar */
  rente: number;
  /** belastbaar inkomen uit werk en woning zonder de eigen woning */
  inkomen: number;
}

export interface RenteaftrekResultaat {
  forfait: number;
  saldo: number; // forfait − rente; negatief = aftrekpost
  hillenAftrek: number;
  inkomenEigenWoning: number; // wat er per saldo bij of af gaat van het inkomen
  belastingeffect: number; // negatief = je betaalt minder belasting
  netteRentePerMaand: number;
  aftrekTarief: number;
  tariefsaanpassing: number;
}

/**
 * Hypotheekrenteaftrek 2026: eigenwoningforfait min aftrekbare rente en kosten.
 * Aftrek levert maximaal 37,56% op (tariefsaanpassing in de hoogste schijf).
 * Is het forfait hoger dan de rente, dan geldt de aftrek wegens geen of een kleine eigenwoningschuld (Wet Hillen, 71,867%).
 */
export function berekenRenteaftrek(i: RenteaftrekInput): RenteaftrekResultaat {
  const forfait = forfaitVolledig(i.woz);
  const rente = Math.max(0, i.rente);
  const saldo = forfait - rente;
  const hillenAftrek = saldo > 0 ? Math.round(saldo * e.hillenPercentage) : 0;
  const inkomenEigenWoning = saldo > 0 ? saldo - hillenAftrek : saldo;
  const basis = Math.max(0, i.inkomen);

  // Belasting met en zonder eigen woning, per schijf, plus tariefsaanpassing voor aftrek in de hoogste schijf.
  const box1 = (x: number) => {
    let b = 0, vorige = 0;
    for (const s of tarieven.box1.schijven) {
      const tot = s.tot ?? Infinity;
      if (x > vorige) b += (Math.min(x, tot) - vorige) * s.tarief;
      vorige = tot;
    }
    return b;
  };
  const metEw = Math.max(0, basis + inkomenEigenWoning);
  let effect = box1(metEw) - box1(basis);
  let tariefsaanpassing = 0;
  if (rente > 0) {
    // Deel van de aftrekbare kosten dat in de hoogste schijf valt (boven de grens van schijf 2).
    const aftrekInTop = Math.min(rente, Math.max(0, basis + forfait - topgrens));
    tariefsaanpassing = aftrekInTop * (topTarief - e.maxAftrekTarief);
    effect += tariefsaanpassing;
  }
  return {
    forfait,
    saldo: round2(saldo),
    hillenAftrek,
    inkomenEigenWoning: round2(inkomenEigenWoning),
    belastingeffect: round2(effect),
    netteRentePerMaand: round2((rente + effect) / 12),
    aftrekTarief: round2(Math.min(marginaalTarief(basis), e.maxAftrekTarief) * 100),
    tariefsaanpassing: round2(tariefsaanpassing),
  };
}
