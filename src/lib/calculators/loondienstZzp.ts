import { berekenNettoSalaris } from './nettoSalaris';
import { benodigdeWinst, nettoUitWinst } from './zzpUurtarief';
import { round2 } from './format';

export interface VergelijkInput {
  brutoMaand: number;
  /** pensioenpremie werknemer per maand (verlaagt belastbaar loon) */
  pensioenpremieMaand: number;
  uurtarief: number;
  declarabeleUren: number;
  kostenPerJaar: number;
  /** wat een zzp'er zelf reserveert voor pensioen, AOV en vrije dagen (per jaar, uit netto) */
  zzpReserveringJaar: number;
}

export interface VergelijkResultaat {
  werknemerNettoJaar: number;
  zzpOmzet: number;
  zzpWinst: number;
  zzpNettoJaar: number;
  zzpBesteedbaarJaar: number;
  verschil: number;
  breakEvenTarief: number;
}

export function vergelijkLoondienstZzp(i: VergelijkInput): VergelijkResultaat {
  const w = berekenNettoSalaris({ brutoMaand: i.brutoMaand, loonheffingskorting: true, vakantiegeld: true, pensioenpremieMaand: i.pensioenpremieMaand });
  const omzet = i.uurtarief * i.declarabeleUren;
  const winst = Math.max(0, omzet - i.kostenPerJaar);
  const z = nettoUitWinst(winst, true, false);
  const besteedbaar = z.netto - i.zzpReserveringJaar;
  // Tarief waarbij het besteedbare zzp-inkomen gelijk is aan het netto van de werknemer.
  const nodigWinst = benodigdeWinst(w.nettoJaar + i.zzpReserveringJaar, true, false);
  const breakEven = i.declarabeleUren > 0 ? (nodigWinst + i.kostenPerJaar) / i.declarabeleUren : NaN;
  return {
    werknemerNettoJaar: w.nettoJaar,
    zzpOmzet: round2(omzet),
    zzpWinst: round2(winst),
    zzpNettoJaar: round2(z.netto),
    zzpBesteedbaarJaar: round2(besteedbaar),
    verschil: round2(besteedbaar - w.nettoJaar),
    breakEvenTarief: round2(breakEven),
  };
}
