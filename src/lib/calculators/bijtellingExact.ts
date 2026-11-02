import { tarieven } from '../../data/tarieven';
import { belastingOverLoon } from './belasting';
import { round2 } from './format';

/** Exact netto effect van een bijtelling bij een gegeven salaris (incl. afbouw van heffingskortingen). */
export function bijtellingNettoEffect(brutoMaand: number, bijtellingJaar: number, vakantiegeld = true): { perMaand: number; perJaar: number; effectiefTarief: number } {
  const loon = brutoMaand * 12 * (vakantiegeld ? 1 + tarieven.vakantiegeld.minimumPercentage : 1);
  const zonder = belastingOverLoon(loon, loon, true).teBetalen;
  const met = belastingOverLoon(loon + bijtellingJaar, loon + bijtellingJaar, true).teBetalen;
  const jaar = met - zonder;
  return { perMaand: round2(jaar / 12), perJaar: round2(jaar), effectiefTarief: bijtellingJaar > 0 ? round2((jaar / bijtellingJaar) * 100) : 0 };
}
