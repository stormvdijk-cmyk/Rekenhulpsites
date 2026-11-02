import { tarieven } from '../../data/tarieven';
import { round2 } from './format';

const r = tarieven.reiskosten;

export interface KmInput {
  /** afstand enkele reis woon-werk in km */
  kmEnkel: number;
  /** reisdagen per week (1-7) */
  dagenPerWeek: number;
  /** vergoeding die de werkgever per km geeft */
  vergoedingPerKm: number;
}

export interface KmResultaat {
  reisdagenJaar: number;
  kmJaar: number;
  onbelastJaar: number;
  onbelastMaand: number;
  vergoedingJaar: number;
  vergoedingMaand: number;
  belastDeelJaar: number;
}

/** Vaste reiskostenvergoeding: maximaal 214 reisdagen per jaar bij 5 dagen; naar rato bij minder dagen. */
export function berekenKilometervergoeding(i: KmInput): KmResultaat {
  const dagen = Math.min(7, Math.max(0, i.dagenPerWeek));
  const reisdagenJaar = Math.round((r.vasteVergoedingDagenFulltime * dagen) / 5);
  const kmJaar = Math.max(0, i.kmEnkel) * 2 * reisdagenJaar;
  const onbelast = kmJaar * r.onbelastPerKm;
  const vergoeding = kmJaar * Math.max(0, i.vergoedingPerKm);
  return {
    reisdagenJaar,
    kmJaar: round2(kmJaar),
    onbelastJaar: round2(onbelast),
    onbelastMaand: round2(onbelast / 12),
    vergoedingJaar: round2(vergoeding),
    vergoedingMaand: round2(vergoeding / 12),
    belastDeelJaar: round2(Math.max(0, vergoeding - onbelast)),
  };
}
