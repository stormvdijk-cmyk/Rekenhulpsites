import { tarieven } from '../../data/tarieven';
import { round2 } from './format';

const reeks: Record<string, number> = tarieven.inflatie.jaarmutatie;
export const INFLATIE_JAREN = Object.keys(reeks).map(Number).sort((a, b) => a - b);
export const EERSTE_JAAR = INFLATIE_JAREN[0] - 1; // prijsniveau eind/gemiddeld jaar vóór eerste mutatie
export const LAATSTE_JAAR = INFLATIE_JAREN[INFLATIE_JAREN.length - 1];

/** Prijsindex met index(EERSTE_JAAR) = 100, opgebouwd uit de CBS-jaarmutaties. */
export function prijsindex(jaar: number): number {
  if (jaar < EERSTE_JAAR || jaar > LAATSTE_JAAR) throw new RangeError(`Jaar buiten bereik ${EERSTE_JAAR}-${LAATSTE_JAAR}`);
  let idx = 100;
  for (let j = EERSTE_JAAR + 1; j <= jaar; j++) idx *= 1 + reeks[String(j)] / 100;
  return idx;
}

export interface InflatieResultaat {
  bedrag: number;
  vanJaar: number;
  naarJaar: number;
  gecorrigeerd: number;
  totaleInflatie: number;
  gemiddeldPerJaar: number;
  koopkrachtVerlies: number;
}

/** Wat is een bedrag uit vanJaar waard in prijzen van naarJaar? */
export function berekenInflatie(bedrag: number, vanJaar: number, naarJaar: number): InflatieResultaat {
  const factor = prijsindex(naarJaar) / prijsindex(vanJaar);
  const jaren = Math.abs(naarJaar - vanJaar);
  return {
    bedrag,
    vanJaar,
    naarJaar,
    gecorrigeerd: round2(bedrag * factor),
    totaleInflatie: round2((factor - 1) * 100),
    // gemiddelde jaarlijkse inflatie in de periode tussen beide jaren
    gemiddeldPerJaar: jaren === 0 ? 0 : round2((Math.pow(Math.max(factor, 1 / factor), 1 / jaren) - 1) * 100),
    koopkrachtVerlies: round2((1 - 1 / factor) * 100),
  };
}
