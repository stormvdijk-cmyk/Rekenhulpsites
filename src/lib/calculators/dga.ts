import { tarieven } from '../../data/tarieven';
import { round2 } from './format';

const v = tarieven.vpb;
const b = tarieven.box2;

export function vennootschapsbelasting(winst: number): number {
  const w = Math.max(0, winst);
  return Math.min(w, v.grens) * v.tariefLaag + Math.max(0, w - v.grens) * v.tariefHoog;
}

/** Box 2-belasting; met fiscale partner kan ieder de eerste schijf gebruiken. */
export interface Box2Tarieven { tariefLaag: number; tariefHoog: number }

/** Box 2 over inkomen uit aanmerkelijk belang; optioneel met andere tarieven (wetsvoorstel), zelfde schijfgrens. */
export function box2Belasting(inkomen: number, partner = false, tarief: Box2Tarieven = b): number {
  const x = Math.max(0, inkomen);
  const grens = b.grens * (partner ? 2 : 1);
  return Math.min(x, grens) * tarief.tariefLaag + Math.max(0, x - grens) * tarief.tariefHoog;
}

export interface DgaInput { winstVoorBelasting: number; uitkeerPct: number; partner: boolean }
export interface DgaResultaat { vpb: number; winstNaVpb: number; dividend: number; box2: number; nettoDividend: number; totaleDruk: number; ingehouden: number }

/** Van winst in de BV naar netto dividend voor de aandeelhouder. */
export function berekenDga(i: DgaInput, tarief: Box2Tarieven = b): DgaResultaat {
  const vpb = vennootschapsbelasting(i.winstVoorBelasting);
  const naVpb = Math.max(0, i.winstVoorBelasting - vpb);
  const dividend = naVpb * Math.min(100, Math.max(0, i.uitkeerPct)) / 100;
  const box2 = round2(box2Belasting(dividend, i.partner, tarief));
  const totaal = vpb + box2;
  return {
    vpb: round2(vpb),
    winstNaVpb: round2(naVpb),
    dividend: round2(dividend),
    box2: round2(box2),
    nettoDividend: round2(dividend - box2),
    ingehouden: round2(naVpb - dividend),
    totaleDruk: i.winstVoorBelasting > 0 && dividend > 0 ? round2(((vpb * (dividend / naVpb) + box2) / (i.winstVoorBelasting * (dividend / naVpb))) * 100) : 0,
  };
}
