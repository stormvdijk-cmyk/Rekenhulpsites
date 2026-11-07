import { tarieven } from '../../data/tarieven';
import { round2 } from './format';

const t = tarieven.bpm;

/** Bruto bpm 2026 op basis van de CO₂-uitstoot (WLTP), met eventuele dieseltoeslag. */
export function brutoBpm(co2: number, diesel: boolean): { tabel: number; dieseltoeslag: number; bruto: number } {
  const g = Math.max(0, Math.floor(co2));
  const rij = [...t.schijven].reverse().find((s) => g >= s.vanaf) ?? t.schijven[0];
  const tabel = rij.basis + (g - rij.vanaf) * rij.perGram;
  const dieseltoeslag = diesel && g > t.dieselDrempel ? round2((g - t.dieselDrempel) * t.dieselToeslagPerGram) : 0;
  return { tabel, dieseltoeslag, bruto: round2(tabel + dieseltoeslag) };
}

const isLaatsteDag = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() === d.getDate();

/** Voeg n maanden toe; een einddatum op de laatste dag van een kortere maand telt als volle maand. */
function plusMaanden(d: Date, n: number): Date {
  const doel = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const laatste = new Date(doel.getFullYear(), doel.getMonth() + 1, 0).getDate();
  return new Date(doel.getFullYear(), doel.getMonth(), isLaatsteDag(d) ? laatste : Math.min(d.getDate(), laatste));
}

/** Volle maanden tussen twee datums en of er daarna nog een gedeeltelijke maand is. */
export function maandenTussen(van: Date, tot: Date): { vol: number; deels: boolean } {
  if (tot <= van) return { vol: 0, deels: false };
  let vol = 0;
  while (plusMaanden(van, vol + 1) <= tot) vol++;
  return { vol, deels: plusMaanden(van, vol) < tot };
}

/** Afschrijvingspercentage volgens de forfaitaire tabel (0–100). */
export function forfaitaireAfschrijving(eersteToelating: Date, keuring: Date): number {
  const { vol, deels } = maandenTussen(eersteToelating, keuring);
  const rij = [...t.afschrijving].reverse().find((r) => vol >= r.vanafMaanden) ?? t.afschrijving[0];
  const extra = vol - rij.vanafMaanden + (deels ? 1 : 0);
  return Math.min(100, Math.round((rij.pct + extra * rij.perMaand) * 100) / 100);
}

export interface BpmInput { co2: number; diesel: boolean; gebruikt: boolean; eersteToelating?: Date; keuring?: Date }
export interface BpmResultaat { tabel: number; dieseltoeslag: number; bruto: number; afschrijvingPct: number; afschrijving: number; teBetalen: number }

export function berekenBpm(i: BpmInput): BpmResultaat {
  const b = brutoBpm(i.co2, i.diesel);
  const pct = i.gebruikt && i.eersteToelating && i.keuring ? forfaitaireAfschrijving(i.eersteToelating, i.keuring) : 0;
  // Te betalen bpm: (100 − afschrijving) / 100 × bruto bpm, afgerond op hele euro's naar beneden.
  const teBetalen = Math.floor(((100 - pct) / 100) * b.bruto + 1e-9);
  return { ...b, afschrijvingPct: pct, afschrijving: round2(b.bruto - teBetalen), teBetalen };
}
