import { belastingOverLoon, marginaalTarief, schijvenVoor } from './belasting';
import { round2 } from './format';

export interface IbInput {
  /** loon uit dienstbetrekking (bruto, incl. vakantiegeld en bijtelling, na pensioenpremie) */
  loon: number;
  /** winst uit onderneming na ondernemersaftrek en mkb-vrijstelling (telt als arbeidsinkomen) */
  winst?: number;
  /** AOW, pensioen, uitkeringen en ander box 1-inkomen dat geen arbeidsinkomen is */
  overigInkomen?: number;
  /** aftrekposten box 1 (hypotheekrente minus eigenwoningforfait, giften, zorgkosten) */
  aftrekposten?: number;
  aow?: boolean;
  alleenstaand?: boolean;
  /** al ingehouden loonheffing; optioneel voor de teruggave-schatting */
  ingehoudenLoonheffing?: number;
}

export interface IbResultaat {
  belastbaarInkomen: number;
  brutoBelasting: number;
  algemeneHeffingskorting: number;
  arbeidskorting: number;
  ouderenkorting: number;
  alleenstaandeOuderenkorting: number;
  kortingen: number;
  teBetalen: number;
  gemiddeldTarief: number;
  marginaalTarief: number;
  /** positief = terugkrijgen, negatief = bijbetalen; null als er geen loonheffing is opgegeven */
  saldo: number | null;
}

export function berekenInkomstenbelasting(i: IbInput): IbResultaat {
  const arbeidsinkomen = Math.max(0, i.loon) + Math.max(0, i.winst ?? 0);
  const belastbaar = Math.max(0, arbeidsinkomen + Math.max(0, i.overigInkomen ?? 0) - Math.max(0, i.aftrekposten ?? 0));
  const b = belastingOverLoon(belastbaar, arbeidsinkomen, true, { aow: i.aow, alleenstaand: i.alleenstaand });
  const heeftLh = i.ingehoudenLoonheffing !== undefined && i.ingehoudenLoonheffing !== null && Number.isFinite(i.ingehoudenLoonheffing) && i.ingehoudenLoonheffing > 0;
  return {
    belastbaarInkomen: round2(belastbaar),
    brutoBelasting: round2(b.brutoBelasting),
    algemeneHeffingskorting: round2(b.algemeneHeffingskorting),
    arbeidskorting: round2(b.arbeidskorting),
    ouderenkorting: round2(b.ouderenkorting),
    alleenstaandeOuderenkorting: round2(b.alleenstaandeOuderenkorting),
    kortingen: round2(b.kortingen),
    teBetalen: round2(b.teBetalen),
    gemiddeldTarief: belastbaar > 0 ? round2((b.teBetalen / belastbaar) * 100) : 0,
    marginaalTarief: round2(marginaalTarief(belastbaar, schijvenVoor(i.aow)) * 100),
    saldo: heeftLh ? round2((i.ingehoudenLoonheffing as number) - b.teBetalen) : null,
  };
}
