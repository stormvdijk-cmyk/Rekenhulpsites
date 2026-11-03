import { tarieven } from '../../data/tarieven';
import { round2 } from './format';

const t = tarieven.bijtelling;
export type Aandrijving = 'brandstof' | 'elektrisch' | 'waterstof';
/** jaar van eerste toelating, zoals in de cijferbijlage loonheffingen 2026 */
export type ToelatingJaar = '2026' | '2025' | '2024' | '2023' | '2022' | '2021-binnen-60' | '2021-na-60' | '2017-2020' | 'voor-2017';

export interface BijtellingInput {
  cataloguswaarde: number;
  aandrijving: Aandrijving;
  /** eigen bijdrage per maand die de werkgever inhoudt op het nettoloon */
  eigenBijdrageMaand?: number;
  jaarToelating?: ToelatingJaar;
}

export interface SchijfEffect { tarief: number; nettoPerMaand: number; nettoPerJaar: number }
export interface BijtellingResultaat {
  bijtellingJaar: number;
  bijtellingMaand: number;
  effectiefPercentage: number;
  percentageTotCap: number;
  cap: number | null;
  perSchijf: SchijfEffect[];
}

export function berekenBijtelling({ cataloguswaarde, aandrijving, eigenBijdrageMaand = 0, jaarToelating = '2026' }: BijtellingInput): BijtellingResultaat {
  const w = Math.max(0, cataloguswaarde);
  const basis = jaarToelating === 'voor-2017' ? t.standaardVoor2017 : t.standaard;
  let jaar: number;
  let pctTotCap = basis;
  let cap: number | null = null;
  if (aandrijving === 'brandstof' || jaarToelating === 'voor-2017') {
    jaar = w * basis;
  } else {
    const k = t.elektrischKortingPerJaar.find((x) => x.jaar === jaarToelating) ?? t.elektrischKortingPerJaar[0];
    pctTotCap = basis - k.korting;
    if (aandrijving === 'waterstof') {
      jaar = w * pctTotCap; // geen CAP voor waterstof en zonnecel
    } else {
      cap = k.cap;
      jaar = Math.min(w, k.cap) * pctTotCap + Math.max(0, w - k.cap) * basis;
    }
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
    percentageTotCap: round2(pctTotCap * 100),
    cap,
    perSchijf,
  };
}
