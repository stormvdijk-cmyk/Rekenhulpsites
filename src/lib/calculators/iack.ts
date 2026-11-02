import { tarieven } from '../../data/tarieven';
import { round2 } from './format';

const t = tarieven.iack;

/** Inkomensafhankelijke combinatiekorting 2026 over het arbeidsinkomen. */
export function iack(arbeidsinkomen: number, aow = false): number {
  const pct = aow ? t.percentageAow : t.percentage;
  const max = aow ? t.maximumAow : t.maximum;
  if (arbeidsinkomen <= t.drempel) return 0;
  return round2(Math.min(max, (arbeidsinkomen - t.drempel) * pct));
}

export interface IackInput {
  /** eigen arbeidsinkomen (loon + winst) */
  arbeidsinkomen: number;
  /** heeft een fiscale partner? dan alleen de laagste verdiener */
  partner: boolean;
  partnerArbeidsinkomen?: number;
  /** kind jonger dan 12 op 1 januari, geboren vóór 2025 */
  kindVoldoet: boolean;
  /** kind staat minstens 6 maanden op je woonadres ingeschreven */
  ingeschreven: boolean;
  aow?: boolean;
}

export interface IackResultaat { korting: number; recht: boolean; reden: string; maximumBij: number }

export function berekenIack(i: IackInput): IackResultaat {
  const maximumBij = Math.round(t.drempel + t.maximum / t.percentage);
  if (!i.kindVoldoet) return { korting: 0, recht: false, reden: 'Je kind moet op 1 januari jonger dan 12 zijn en vóór 1 januari 2025 geboren.', maximumBij };
  if (!i.ingeschreven) return { korting: 0, recht: false, reden: 'Je kind moet minstens 6 maanden op je woonadres ingeschreven staan.', maximumBij };
  if (i.partner && (i.partnerArbeidsinkomen ?? 0) < i.arbeidsinkomen) return { korting: 0, recht: false, reden: 'Je partner heeft het laagste arbeidsinkomen en krijgt de korting.', maximumBij };
  const korting = iack(i.arbeidsinkomen, i.aow);
  if (korting === 0) return { korting: 0, recht: false, reden: `Je arbeidsinkomen moet hoger zijn dan € ${t.drempel.toLocaleString('nl-NL')}.`, maximumBij };
  return { korting, recht: true, reden: korting >= (i.aow ? t.maximumAow : t.maximum) ? 'Je krijgt de maximale korting.' : 'Je krijgt een deel van de maximale korting.', maximumBij };
}
