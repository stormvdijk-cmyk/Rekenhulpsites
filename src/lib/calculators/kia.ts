import { tarieven } from '../../data/tarieven';
import { round2 } from './format';

const k = tarieven.kia;

/** Kleinschaligheidsinvesteringsaftrek 2026 over het totaal aan investeringen in een jaar. */
export function berekenKia(investering: number): number {
  const i = Math.max(0, investering);
  if (i < k.minimum || i > k.maximum) return 0;
  if (i <= k.grens1) return round2(i * k.percentage);
  if (i <= k.grens2) return k.vastBedrag;
  return round2(k.vastBedrag - (i - k.grens2) * k.afbouwPercentage);
}
