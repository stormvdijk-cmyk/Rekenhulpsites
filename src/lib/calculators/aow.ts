import { tarieven } from '../../data/tarieven';

const per = tarieven.aowLeeftijd.perJaar as Record<string, [number, number]>;
const jaren = Object.keys(per).map(Number).sort((a, b) => a - b);

function plus(d: Date, jaar: number, maand: number): Date {
  const r = new Date(Date.UTC(d.getUTCFullYear() + jaar, d.getUTCMonth() + maand, d.getUTCDate()));
  // 29 februari / maandeinde: terug naar de laatste dag van de maand
  if (r.getUTCDate() !== d.getUTCDate()) r.setUTCDate(0);
  return r;
}

export interface AowResultaat { bekend: boolean; leeftijdJaar: number; leeftijdMaand: number; datum: Date | null; toelichting: string }

/** AOW-datum op basis van de vastgestelde AOW-leeftijden per kalenderjaar. */
export function berekenAowDatum(geboren: Date): AowResultaat {
  for (const j of jaren) {
    const [a, m] = per[String(j)];
    const d = plus(geboren, a, m);
    if (d.getUTCFullYear() === j) return { bekend: true, leeftijdJaar: a, leeftijdMaand: m, datum: d, toelichting: `In ${j} is de AOW-leeftijd ${a} jaar${m ? ` en ${m} maanden` : ''}.` };
    if (d.getUTCFullYear() < j) break;
  }
  const eerste = jaren[0];
  const laatste = jaren[jaren.length - 1];
  const [a0, m0] = per[String(eerste)];
  if (plus(geboren, a0, m0).getUTCFullYear() < eerste) return { bekend: false, leeftijdJaar: a0, leeftijdMaand: m0, datum: null, toelichting: `Je hebt de AOW-leeftijd al vóór ${eerste} bereikt.` };
  const [al, ml] = per[String(laatste)];
  return { bekend: false, leeftijdJaar: al, leeftijdMaand: ml, datum: null, toelichting: `De AOW-leeftijd is vastgesteld tot en met ${laatste}. Voor latere jaren is die nog niet bekend; reken met minimaal ${al} jaar en ${ml} maanden.` };
}
