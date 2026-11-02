import { tarieven } from '../../data/tarieven';
import { berekenNettoSalaris } from './nettoSalaris';
import { round2 } from './format';

export interface VakantiegeldResultaat {
  brutoJaarloon: number;
  vakantiegeldBruto: number;
  vakantiegeldNetto: number;
  belastingOverVakantiegeld: number;
  effectiefTarief: number;
}

/** Vakantiegeld over een bruto maandloon. Netto = het extra netto dat het vakantiegeld oplevert. */
export function berekenVakantiegeld(brutoMaand: number, percentage = tarieven.vakantiegeld.minimumPercentage, loonheffingskorting = true): VakantiegeldResultaat {
  const r = berekenNettoSalaris({ brutoMaand, loonheffingskorting, vakantiegeld: true, vakantiegeldPercentage: percentage });
  const belasting = r.vakantiegeldBruto - r.vakantiegeldNetto;
  return {
    brutoJaarloon: r.brutoJaar,
    vakantiegeldBruto: r.vakantiegeldBruto,
    vakantiegeldNetto: r.vakantiegeldNetto,
    belastingOverVakantiegeld: round2(belasting),
    effectiefTarief: r.vakantiegeldBruto > 0 ? round2((belasting / r.vakantiegeldBruto) * 100) : 0,
  };
}
