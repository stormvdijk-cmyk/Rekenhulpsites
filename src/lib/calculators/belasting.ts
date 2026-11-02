import { tarieven, type Tarieven } from '../../data/tarieven';

type Schijf = { tot: number | null; tarief: number };

/** Box 1-schijven: jonger dan de AOW-leeftijd, of het hele jaar AOW-leeftijd (geboren vanaf 1946). */
export const schijvenVoor = (aow = false): Schijf[] => (aow ? tarieven.aow.schijven : tarieven.box1.schijven);

/** Box 1-belasting (inclusief premies volksverzekeringen) over een belastbaar jaarinkomen. */
export function box1Belasting(inkomen: number, schijven: Schijf[] = tarieven.box1.schijven): number {
  let rest = Math.max(0, inkomen);
  let vorige = 0;
  let totaal = 0;
  for (const s of schijven) {
    const grens = s.tot ?? Infinity;
    const deel = Math.min(rest, grens - vorige);
    if (deel <= 0) break;
    totaal += deel * s.tarief;
    rest -= deel;
    vorige = grens;
  }
  return totaal;
}

/** Het marginale tarief (schijf) waarin een inkomen valt. */
export function marginaalTarief(inkomen: number, schijven: Schijf[] = tarieven.box1.schijven): number {
  for (const s of schijven) if (s.tot === null || inkomen <= s.tot) return s.tarief;
  return schijven[schijven.length - 1].tarief;
}

type AhkTabel = { maximum: number; afbouwVanaf: number; afbouwPercentage: number; nulVanaf: number };
type AkTabel = { schijven: { vanaf: number; tot: number | null; basis: number; percentage: number }[] };

export function algemeneHeffingskorting(inkomen: number, t: AhkTabel = tarieven.algemeneHeffingskorting): number {
  if (inkomen <= t.afbouwVanaf) return t.maximum;
  if (inkomen >= t.nulVanaf) return 0;
  return Math.max(0, t.maximum - t.afbouwPercentage * (inkomen - t.afbouwVanaf));
}

export function arbeidskorting(arbeidsinkomen: number, t: AkTabel = tarieven.arbeidskorting): number {
  const x = Math.max(0, arbeidsinkomen);
  for (const s of t.schijven) {
    if (s.tot === null || x <= s.tot) return Math.max(0, s.basis + s.percentage * (x - s.vanaf));
  }
  return 0;
}

/** Ouderenkorting 2026 (alleen AOW-leeftijd), op basis van het verzamelinkomen. */
export function ouderenkorting(verzamelinkomen: number, t: Tarieven['aow']['ouderenkorting'] = tarieven.aow.ouderenkorting): number {
  if (verzamelinkomen <= t.afbouwVanaf) return t.maximum;
  return Math.max(0, t.maximum - t.afbouwPercentage * (verzamelinkomen - t.afbouwVanaf));
}

export interface Inkomstenbelasting {
  brutoBelasting: number;
  algemeneHeffingskorting: number;
  arbeidskorting: number;
  ouderenkorting: number;
  alleenstaandeOuderenkorting: number;
  kortingen: number;
  teBetalen: number;
}

export interface BelastingOpties {
  aow?: boolean;
  /** alleen bij AOW: alleenstaande-ouderenkorting */
  alleenstaand?: boolean;
}

/**
 * Belasting in box 1. Heffingskortingen kunnen niet hoger zijn dan de verschuldigde
 * belasting (geen uitbetaling van kortingen).
 */
export function belastingOverLoon(belastbaar: number, arbeidsinkomen: number, metKortingen: boolean, opties: BelastingOpties = {}): Inkomstenbelasting {
  const aow = Boolean(opties.aow);
  const brutoBelasting = box1Belasting(belastbaar, schijvenVoor(aow));
  const ahk = metKortingen ? algemeneHeffingskorting(belastbaar, aow ? tarieven.aow.algemeneHeffingskorting : tarieven.algemeneHeffingskorting) : 0;
  const ak = metKortingen ? arbeidskorting(arbeidsinkomen, aow ? tarieven.aow.arbeidskorting : tarieven.arbeidskorting) : 0;
  const ouk = metKortingen && aow ? ouderenkorting(belastbaar) : 0;
  const aouk = metKortingen && aow && opties.alleenstaand ? tarieven.aow.alleenstaandeOuderenkorting : 0;
  const kortingen = Math.min(brutoBelasting, ahk + ak + ouk + aouk);
  return {
    brutoBelasting,
    algemeneHeffingskorting: ahk,
    arbeidskorting: ak,
    ouderenkorting: ouk,
    alleenstaandeOuderenkorting: aouk,
    kortingen,
    teBetalen: brutoBelasting - kortingen,
  };
}
