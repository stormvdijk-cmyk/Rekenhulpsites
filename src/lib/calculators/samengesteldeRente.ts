import { round2 } from './format';

export interface RenteInput {
  startbedrag: number;
  maandInleg: number;
  /** jaarrente in procenten, bijv. 4 */
  rente: number;
  jaren: number;
  /** inleg aan begin van de maand (true) of eind (false) */
  inlegBegin?: boolean;
}

export interface RenteJaar { jaar: number; ingelegd: number; rente: number; saldo: number }
export interface RenteResultaat { eindsaldo: number; totaalIngelegd: number; totaleRente: number; perJaar: RenteJaar[] }

/** Maandelijkse samengestelde rente met effectieve maandrente (1+r)^(1/12)-1. */
export function berekenSamengesteldeRente(i: RenteInput): RenteResultaat {
  const maandRente = Math.pow(1 + i.rente / 100, 1 / 12) - 1;
  let saldo = i.startbedrag;
  let ingelegd = i.startbedrag;
  const perJaar: RenteJaar[] = [];
  const maanden = Math.round(i.jaren * 12);
  for (let m = 1; m <= maanden; m++) {
    if (i.inlegBegin) { saldo += i.maandInleg; saldo *= 1 + maandRente; }
    else { saldo *= 1 + maandRente; saldo += i.maandInleg; }
    ingelegd += i.maandInleg;
    if (m % 12 === 0 || m === maanden) {
      perJaar.push({ jaar: Math.ceil(m / 12), ingelegd: round2(ingelegd), rente: round2(saldo - ingelegd), saldo: round2(saldo) });
    }
  }
  return { eindsaldo: round2(saldo), totaalIngelegd: round2(ingelegd), totaleRente: round2(saldo - ingelegd), perJaar };
}
