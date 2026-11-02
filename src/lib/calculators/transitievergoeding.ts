import { tarieven } from '../../data/tarieven';
import { round2 } from './format';

const t = tarieven.transitievergoeding;

export interface TransitieInput {
  /** bruto maandsalaris inclusief vaste toeslagen */
  brutoMaand: number;
  jaren: number;
  maanden: number;
  /** 8% vakantiegeld meetellen in het maandsalaris */
  vakantiegeld: boolean;
  /** vaste 13e maand / eindejaarsuitkering meetellen */
  dertiendeMaand: boolean;
}

export interface TransitieResultaat { maandsalaris: number; dienstjaren: number; berekend: number; maximum: number; vergoeding: number; begrensd: boolean }

export function berekenTransitievergoeding(i: TransitieInput): TransitieResultaat {
  const factor = 1 + (i.vakantiegeld ? tarieven.vakantiegeld.minimumPercentage : 0) + (i.dertiendeMaand ? 1 / 12 : 0);
  const maandsalaris = Math.max(0, i.brutoMaand) * factor;
  const dienstjaren = Math.max(0, i.jaren) + Math.max(0, i.maanden) / 12;
  const berekend = (maandsalaris / 3) * dienstjaren;
  const maximum = Math.max(t.maximum, maandsalaris * 12);
  return {
    maandsalaris: round2(maandsalaris),
    dienstjaren: round2(dienstjaren),
    berekend: round2(berekend),
    maximum: round2(maximum),
    vergoeding: round2(Math.min(berekend, maximum)),
    begrensd: berekend > maximum,
  };
}
