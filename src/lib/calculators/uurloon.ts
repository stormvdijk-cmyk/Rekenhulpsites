import { round2 } from './format';

/** Gemiddeld aantal weken per maand: 52 / 12 */
export const WEKEN_PER_MAAND = 52 / 12;

export interface UurloonResultaat {
  uurloon: number;
  weekloon: number;
  maandloon: number;
  jaarloon: number;
  jaarloonMetVakantiegeld: number;
}

export function uurloonNaarSalaris(uurloon: number, urenPerWeek: number, vakantiegeldPct = 0.08): UurloonResultaat {
  const week = uurloon * urenPerWeek;
  const jaar = week * 52;
  return {
    uurloon: round2(uurloon),
    weekloon: round2(week),
    maandloon: round2(jaar / 12),
    jaarloon: round2(jaar),
    jaarloonMetVakantiegeld: round2(jaar * (1 + vakantiegeldPct)),
  };
}

export function maandloonNaarUurloon(maandloon: number, urenPerWeek: number, vakantiegeldPct = 0.08): UurloonResultaat {
  if (urenPerWeek <= 0) return uurloonNaarSalaris(0, 0, vakantiegeldPct);
  const uurloon = (maandloon * 12) / 52 / urenPerWeek;
  const r = uurloonNaarSalaris(uurloon, urenPerWeek, vakantiegeldPct);
  return { ...r, maandloon: round2(maandloon), jaarloon: round2(maandloon * 12), jaarloonMetVakantiegeld: round2(maandloon * 12 * (1 + vakantiegeldPct)) };
}
