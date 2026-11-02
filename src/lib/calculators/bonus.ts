import { tarieven } from '../../data/tarieven';
import { belastingOverLoon } from './belasting';
import { round2 } from './format';

export interface BonusInput {
  brutoMaand: number;
  /** bruto bonus, 13e maand of eindejaarsuitkering */
  bonus: number;
  vakantiegeld: boolean;
  loonheffingskorting: boolean;
  aow?: boolean;
}

export interface BonusResultaat { bonusBruto: number; bonusNetto: number; belasting: number; effectiefTarief: number; jaarloonZonder: number }

/** Netto bonus = verschil in netto jaarinkomen met en zonder bonus (jaarberekening). */
export function berekenBonus(i: BonusInput): BonusResultaat {
  const basis = i.brutoMaand * 12 * (i.vakantiegeld ? 1 + tarieven.vakantiegeld.minimumPercentage : 1);
  const opties = { aow: i.aow };
  const zonder = belastingOverLoon(basis, basis, i.loonheffingskorting, opties).teBetalen;
  const met = belastingOverLoon(basis + i.bonus, basis + i.bonus, i.loonheffingskorting, opties).teBetalen;
  const belasting = met - zonder;
  return {
    bonusBruto: round2(i.bonus),
    bonusNetto: round2(i.bonus - belasting),
    belasting: round2(belasting),
    effectiefTarief: i.bonus > 0 ? round2((belasting / i.bonus) * 100) : 0,
    jaarloonZonder: round2(basis),
  };
}
