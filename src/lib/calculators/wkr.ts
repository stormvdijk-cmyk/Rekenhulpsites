import { tarieven } from '../../data/tarieven';
import { round2 } from './format';

const w = tarieven.wkr;

export interface WkrResultaat { vrijeRuimte: number; besteed: number; over: number; overschrijding: number; eindheffing: number; benutPct: number }

/** Vrije ruimte werkkostenregeling 2026 en de eindheffing van 80% over het deel erboven. */
export function berekenWkr(fiscaalLoon: number, besteed: number): WkrResultaat {
  const loon = Math.max(0, fiscaalLoon);
  const vrij = round2(Math.min(loon, w.grens) * w.percentageLaag + Math.max(0, loon - w.grens) * w.percentageHoog);
  const b = Math.max(0, besteed);
  const overschrijding = round2(Math.max(0, b - vrij));
  return {
    vrijeRuimte: vrij,
    besteed: b,
    over: round2(Math.max(0, vrij - b)),
    overschrijding,
    eindheffing: round2(overschrijding * w.eindheffing),
    benutPct: vrij > 0 ? round2((b / vrij) * 100) : 0,
  };
}
