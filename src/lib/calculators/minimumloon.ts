import { tarieven } from '../../data/tarieven';
import { round2 } from './format';

const m = tarieven.minimumloon;

/** Minimumloon per uur dat geldt op een datum (ISO yyyy-mm-dd), voor een leeftijd (15–21+). */
export function minimumUurloon(datum: string, leeftijd = 21): number {
  const periodes = Object.keys(m.perLeeftijd).sort();
  let periode = periodes[0];
  for (const p of periodes) if (datum >= p) periode = p;
  const tabel = (m.perLeeftijd as Record<string, Record<string, number>>)[periode];
  const sleutel = String(Math.min(21, Math.max(15, Math.floor(leeftijd))));
  return tabel[sleutel];
}

export interface MinimumloonResultaat { uurloon: number; week: number; maand: number; jaar: number; jaarMetVakantiegeld: number }

export function berekenMinimumloon(urenPerWeek: number, datum: string, leeftijd = 21): MinimumloonResultaat {
  const uur = minimumUurloon(datum, leeftijd);
  const week = uur * Math.max(0, urenPerWeek);
  const jaar = week * 52;
  return { uurloon: uur, week: round2(week), maand: round2(jaar / 12), jaar: round2(jaar), jaarMetVakantiegeld: round2(jaar * 1.08) };
}
