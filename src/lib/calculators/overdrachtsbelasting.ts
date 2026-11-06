import { tarieven } from '../../data/tarieven';
import { round2 } from './format';

const t = tarieven.overdrachtsbelasting;

export type Soort = 'woning' | 'overig';

export interface Koper {
  /** leeftijd op het moment van de overdracht */
  leeftijd: number;
  /** heeft de koper de startersvrijstelling al eens gebruikt? */
  eerderGebruikt: boolean;
}

export interface OverdrachtInput {
  koopsom: number;
  soort: Soort;
  /** gaat de koper (of gaan de kopers) er zelf wonen als hoofdverblijf? */
  zelfBewonen: boolean;
  /** 1 of 2 kopers; bij 2 kopers ieder voor de helft */
  kopers: Koper[];
}

export interface KoperResultaat { aandeel: number; tarief: number; belasting: number; starter: boolean; reden: string }
export interface OverdrachtResultaat { totaal: number; perKoper: KoperResultaat[]; effectiefTarief: number }

/** Optioneel een ander tarief voor woningen die je niet zelf bewoont (wetsvoorstel). */
export function berekenOverdrachtsbelasting(i: OverdrachtInput, tariefNietZelfBewonen: number = t.woningNietZelfBewonen): OverdrachtResultaat {
  const koopsom = Math.max(0, i.koopsom);
  const kopers = i.kopers.length ? i.kopers : [{ leeftijd: 40, eerderGebruikt: true }];
  const aandeel = koopsom / kopers.length;
  const perKoper = kopers.map((k): KoperResultaat => {
    if (i.soort === 'overig') return { aandeel, tarief: t.overig, belasting: aandeel * t.overig, starter: false, reden: 'Geen woning: algemeen tarief' };
    if (!i.zelfBewonen) return { aandeel, tarief: tariefNietZelfBewonen, belasting: aandeel * tariefNietZelfBewonen, starter: false, reden: 'Woning die je niet zelf bewoont' };
    const leeftijdOk = k.leeftijd >= t.starterMinLeeftijd && k.leeftijd <= t.starterMaxLeeftijd;
    const waardeOk = koopsom <= t.starterWoningwaardegrens;
    if (leeftijdOk && waardeOk && !k.eerderGebruikt) return { aandeel, tarief: 0, belasting: 0, starter: true, reden: 'Startersvrijstelling' };
    const reden = !leeftijdOk ? 'Leeftijd valt buiten 18 t/m 34 jaar' : !waardeOk ? 'Woning boven de woningwaardegrens' : 'Startersvrijstelling al eerder gebruikt';
    return { aandeel, tarief: t.eigenWoning, belasting: aandeel * t.eigenWoning, starter: false, reden };
  });
  const totaal = perKoper.reduce((s, k) => s + k.belasting, 0);
  return {
    totaal: round2(totaal),
    perKoper: perKoper.map((k) => ({ ...k, aandeel: round2(k.aandeel), belasting: round2(k.belasting) })),
    effectiefTarief: koopsom > 0 ? round2((totaal / koopsom) * 100) : 0,
  };
}
