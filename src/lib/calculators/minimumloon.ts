import { tarieven } from '../../data/tarieven';
import { round2 } from './format';

const m = tarieven.minimumloon;

/** Minimumloon per uur (21+) dat geldt op een datum (ISO yyyy-mm-dd). */
export function minimumUurloon(datum: string): number {
  let bedrag = m.perUur[0].bedrag;
  for (const p of m.perUur) if (datum >= p.vanaf) bedrag = p.bedrag;
  return bedrag;
}

export interface MinimumloonResultaat { uurloon: number; week: number; maand: number; jaar: number; jaarMetVakantiegeld: number }

export function berekenMinimumloon(urenPerWeek: number, datum: string): MinimumloonResultaat {
  const uur = minimumUurloon(datum);
  const week = uur * Math.max(0, urenPerWeek);
  const jaar = week * 52;
  return { uurloon: uur, week: round2(week), maand: round2(jaar / 12), jaar: round2(jaar), jaarMetVakantiegeld: round2(jaar * 1.08) };
}
