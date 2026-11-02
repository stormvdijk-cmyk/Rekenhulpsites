import { berekenNettoSalaris, type NettoSalarisInput, type NettoSalarisResultaat } from './nettoSalaris';
import { round2 } from './format';

export type NettoNaarBrutoInput = Omit<NettoSalarisInput, 'brutoMaand'> & { nettoMaand: number };

/** Zoekt het bruto maandsalaris dat het gewenste netto per maand (zonder vakantiegeld) oplevert. */
export function nettoNaarBruto(i: NettoNaarBrutoInput): NettoSalarisResultaat & { gevondenBruto: number } {
  const { nettoMaand, ...rest } = i;
  let lo = 0;
  let hi = Math.max(1000, nettoMaand * 4);
  for (let k = 0; k < 80; k++) {
    const mid = (lo + hi) / 2;
    if (berekenNettoSalaris({ ...rest, brutoMaand: mid }).nettoMaand < nettoMaand) lo = mid; else hi = mid;
  }
  const bruto = round2(hi);
  return { ...berekenNettoSalaris({ ...rest, brutoMaand: bruto }), gevondenBruto: bruto };
}
