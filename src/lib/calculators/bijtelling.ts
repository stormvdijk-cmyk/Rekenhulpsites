import { tarieven } from '../../data/tarieven';
import { round2 } from './format';

const t = tarieven.bijtelling;
export type Aandrijving = 'brandstof' | 'elektrisch' | 'waterstof';

export interface BijtellingInput {
  cataloguswaarde: number;
  aandrijving: Aandrijving;
  /** eigen bijdrage per maand die de werkgever inhoudt op het nettoloon */
  eigenBijdrageMaand?: number;
}

export interface SchijfEffect { tarief: number; nettoPerMaand: number; nettoPerJaar: number }
export interface BijtellingResultaat {
  bijtellingJaar: number;
  bijtellingMaand: number;
  effectiefPercentage: number;
  perSchijf: SchijfEffect[];
}

export function berekenBijtelling({ cataloguswaarde, aandrijving, eigenBijdrageMaand = 0 }: BijtellingInput): BijtellingResultaat {
  const w = Math.max(0, cataloguswaarde);
  let jaar: number;
  if (aandrijving === 'elektrisch') {
    jaar = Math.min(w, t.elektrischGrens) * t.elektrischVerlaagd + Math.max(0, w - t.elektrischGrens) * t.standaard;
  } else if (aandrijving === 'waterstof') {
    jaar = w * t.waterstofZonnecel;
  } else {
    jaar = w * t.standaard;
  }
  jaar = Math.max(0, jaar - eigenBijdrageMaand * 12);
  const perSchijf = tarieven.box1.schijven.map((s) => ({
    tarief: round2(s.tarief * 100),
    nettoPerMaand: round2((jaar * s.tarief) / 12),
    nettoPerJaar: round2(jaar * s.tarief),
  }));
  return {
    bijtellingJaar: round2(jaar),
    bijtellingMaand: round2(jaar / 12),
    effectiefPercentage: w > 0 ? round2(((jaar + eigenBijdrageMaand * 12) / w) * 100) : 0,
    perSchijf,
  };
}
