import { round2 } from './format';

export type Leningvorm = 'annuitair' | 'lineair';
export interface LeningInput { bedrag: number; rente: number; looptijdMaanden: number; vorm: Leningvorm }
export interface Termijn { maand: number; rente: number; aflossing: number; termijn: number; restschuld: number }
export interface LeningResultaat {
  eersteTermijn: number;
  laatsteTermijn: number;
  totaleRente: number;
  totaalBetaald: number;
  schema: Termijn[];
}

/** Maandrente = jaarrente / 12 (nominaal, zoals gebruikelijk bij leningen en hypotheken in NL). */
export function berekenLening({ bedrag, rente, looptijdMaanden, vorm }: LeningInput): LeningResultaat {
  const n = Math.max(1, Math.round(looptijdMaanden));
  const r = rente / 100 / 12;
  const schema: Termijn[] = [];
  let rest = bedrag;
  const annuiteit = r === 0 ? bedrag / n : (bedrag * r) / (1 - Math.pow(1 + r, -n));
  const vasteAflossing = bedrag / n;
  let totaleRente = 0;
  for (let m = 1; m <= n; m++) {
    const renteDeel = rest * r;
    let aflossing = vorm === 'annuitair' ? annuiteit - renteDeel : vasteAflossing;
    if (m === n) aflossing = rest;
    rest = Math.max(0, rest - aflossing);
    totaleRente += renteDeel;
    schema.push({ maand: m, rente: round2(renteDeel), aflossing: round2(aflossing), termijn: round2(renteDeel + aflossing), restschuld: round2(rest) });
  }
  return {
    eersteTermijn: schema[0].termijn,
    laatsteTermijn: schema[schema.length - 1].termijn,
    totaleRente: round2(totaleRente),
    totaalBetaald: round2(bedrag + totaleRente),
    schema,
  };
}
