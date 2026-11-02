import { round2 } from './format';

export interface BtwResultaat {
  exclusief: number;
  btw: number;
  inclusief: number;
  tarief: number;
}

/** tarief als fractie, bijv. 0.21 */
export function btwVanExclusief(exclusief: number, tarief: number): BtwResultaat {
  const btw = exclusief * tarief;
  return { exclusief: round2(exclusief), btw: round2(btw), inclusief: round2(exclusief + btw), tarief };
}

export function btwVanInclusief(inclusief: number, tarief: number): BtwResultaat {
  const exclusief = inclusief / (1 + tarief);
  return { exclusief: round2(exclusief), btw: round2(inclusief - exclusief), inclusief: round2(inclusief), tarief };
}
