import { tarieven, type Tarieven } from '../../data/tarieven';

type Schijf = { tot: number | null; tarief: number };

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

export function algemeneHeffingskorting(inkomen: number, t: Tarieven['algemeneHeffingskorting'] = tarieven.algemeneHeffingskorting): number {
  if (inkomen <= t.afbouwVanaf) return t.maximum;
  if (inkomen >= t.nulVanaf) return 0;
  return Math.max(0, t.maximum - t.afbouwPercentage * (inkomen - t.afbouwVanaf));
}

export function arbeidskorting(arbeidsinkomen: number, t: Tarieven['arbeidskorting'] = tarieven.arbeidskorting): number {
  const x = Math.max(0, arbeidsinkomen);
  for (const s of t.schijven) {
    if (s.tot === null || x <= s.tot) return Math.max(0, s.basis + s.percentage * (x - s.vanaf));
  }
  return 0;
}

export interface Inkomstenbelasting {
  brutoBelasting: number;
  algemeneHeffingskorting: number;
  arbeidskorting: number;
  kortingen: number;
  teBetalen: number;
}

/**
 * Belasting over loon uit dienstbetrekking. Heffingskortingen kunnen niet hoger zijn
 * dan de verschuldigde belasting (er is hier geen uitbetaling van kortingen).
 */
export function belastingOverLoon(belastbaar: number, arbeidsinkomen: number, metKortingen: boolean): Inkomstenbelasting {
  const brutoBelasting = box1Belasting(belastbaar);
  const ahk = metKortingen ? algemeneHeffingskorting(belastbaar) : 0;
  const ak = metKortingen ? arbeidskorting(arbeidsinkomen) : 0;
  const kortingen = Math.min(brutoBelasting, ahk + ak);
  return {
    brutoBelasting,
    algemeneHeffingskorting: ahk,
    arbeidskorting: ak,
    kortingen,
    teBetalen: brutoBelasting - kortingen,
  };
}
