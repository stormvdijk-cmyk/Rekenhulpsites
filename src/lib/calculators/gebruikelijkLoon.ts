import { tarieven } from '../../data/tarieven';

const g = tarieven.gebruikelijkLoon;

export interface GebruikelijkLoonInput {
  /** loon uit de meest vergelijkbare dienstbetrekking */
  vergelijkbaar: number;
  /** loon van de meestverdienende werknemer in de bv (of verbonden vennootschap); 0 als er geen werknemers zijn */
  hoogsteWerknemer: number;
  /** je kunt aannemelijk maken dat bij vergelijkbaar werk een lager loon gebruikelijk is */
  lagerAannemelijk: boolean;
}

export interface GebruikelijkLoonResultaat { loon: number; bepalend: 'minimum' | 'vergelijkbaar' | 'werknemer' | 'lager'; klein: boolean }

/** Gebruikelijk loon 2026 voor een aanmerkelijkbelanghouder (DGA). */
export function berekenGebruikelijkLoon(i: GebruikelijkLoonInput): GebruikelijkLoonResultaat {
  const verg = Math.max(0, i.vergelijkbaar);
  const wn = Math.max(0, i.hoogsteWerknemer);
  if (i.lagerAannemelijk) {
    // Aannemelijk gemaakt dat bij de meest vergelijkbare werkzaamheden een lager loon gebruikelijk is: dat lagere bedrag.
    return { loon: verg, bepalend: 'lager', klein: verg <= g.kleinGrens };
  }
  const loon = Math.max(verg, wn, g.minimum);
  const bepalend = loon === g.minimum && g.minimum >= verg && g.minimum >= wn ? 'minimum' : loon === wn && wn > verg ? 'werknemer' : 'vergelijkbaar';
  return { loon, bepalend, klein: false };
}
