import { tarieven } from '../../data/tarieven';
import { belastingOverLoon, marginaalTarief } from './belasting';
import { round2 } from './format';

export interface NettoSalarisInput {
  /** Bruto maandsalaris, zonder vakantiegeld */
  brutoMaand: number;
  /** Loonheffingskorting toepassen (doe je bij één werkgever tegelijk) */
  loonheffingskorting: boolean;
  /** Vakantiegeld meerekenen (8% van het jaarsalaris) */
  vakantiegeld: boolean;
  vakantiegeldPercentage?: number;
}

export interface NettoSalarisResultaat {
  brutoMaand: number;
  brutoJaar: number;
  vakantiegeldBruto: number;
  belastbaarJaar: number;
  loonheffingJaar: number;
  algemeneHeffingskorting: number;
  arbeidskorting: number;
  nettoJaar: number;
  /** Gemiddeld netto per maand inclusief vakantiegeld (jaar / 12) */
  nettoMaandGemiddeld: number;
  /** Netto per maand zonder vakantiegeld (het bedrag dat je maandelijks ziet) */
  nettoMaand: number;
  vakantiegeldNetto: number;
  gemiddeldTarief: number;
  marginaalTarief: number;
}

export function berekenNettoSalaris(input: NettoSalarisInput): NettoSalarisResultaat {
  const pct = input.vakantiegeldPercentage ?? tarieven.vakantiegeld.minimumPercentage;
  const brutoMaand = Math.max(0, input.brutoMaand);
  const brutoJaar = brutoMaand * 12;
  const vakantiegeldBruto = input.vakantiegeld ? brutoJaar * pct : 0;
  const belastbaarJaar = brutoJaar + vakantiegeldBruto;

  const b = belastingOverLoon(belastbaarJaar, belastbaarJaar, input.loonheffingskorting);
  const nettoJaar = belastbaarJaar - b.teBetalen;

  // Netto vakantiegeld = verschil tussen netto met en zonder vakantiegeld.
  const zonder = belastingOverLoon(brutoJaar, brutoJaar, input.loonheffingskorting);
  const nettoZonderVg = brutoJaar - zonder.teBetalen;
  const vakantiegeldNetto = nettoJaar - nettoZonderVg;

  return {
    brutoMaand: round2(brutoMaand),
    brutoJaar: round2(brutoJaar),
    vakantiegeldBruto: round2(vakantiegeldBruto),
    belastbaarJaar: round2(belastbaarJaar),
    loonheffingJaar: round2(b.teBetalen),
    algemeneHeffingskorting: round2(b.algemeneHeffingskorting),
    arbeidskorting: round2(b.arbeidskorting),
    nettoJaar: round2(nettoJaar),
    nettoMaandGemiddeld: round2(nettoJaar / 12),
    nettoMaand: round2(nettoZonderVg / 12),
    vakantiegeldNetto: round2(vakantiegeldNetto),
    gemiddeldTarief: belastbaarJaar > 0 ? round2((b.teBetalen / belastbaarJaar) * 100) : 0,
    marginaalTarief: round2(marginaalTarief(belastbaarJaar) * 100),
  };
}
