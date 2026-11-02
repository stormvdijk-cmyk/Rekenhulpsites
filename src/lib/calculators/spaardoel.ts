import { round2 } from './format';

export interface SpaardoelInput { doel: number; startbedrag: number; rente: number; maanden: number }
export interface SpaardoelResultaat { perMaand: number; totaalInleg: number; renteOpbrengst: number; haalbaarZonderInleg: boolean }

/** Benodigde maandelijkse inleg (eind van de maand) om een doelbedrag te halen; effectieve maandrente. */
export function berekenSpaardoel({ doel, startbedrag, rente, maanden }: SpaardoelInput): SpaardoelResultaat {
  const n = Math.max(1, Math.round(maanden));
  const i = Math.pow(1 + rente / 100, 1 / 12) - 1;
  const groei = Math.pow(1 + i, n);
  const startWordt = startbedrag * groei;
  if (startWordt >= doel) return { perMaand: 0, totaalInleg: round2(startbedrag), renteOpbrengst: round2(startWordt - startbedrag), haalbaarZonderInleg: true };
  const p = i === 0 ? (doel - startbedrag) / n : ((doel - startWordt) * i) / (groei - 1);
  const inleg = startbedrag + p * n;
  return { perMaand: round2(p), totaalInleg: round2(inleg), renteOpbrengst: round2(doel - inleg), haalbaarZonderInleg: false };
}
