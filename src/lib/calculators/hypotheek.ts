import { tarieven } from '../../data/tarieven';
import { berekenLening, type Leningvorm, type Termijn } from './lening';
import { marginaalTarief } from './belasting';
import { round2 } from './format';

const e = tarieven.eigenWoning;

/** Eigenwoningforfait per jaar; null als de WOZ-waarde onder de ondergrens van deze rekenhulp ligt. */
export function eigenwoningforfait(woz: number): number | null {
  if (woz < e.forfaitVanaf) return null;
  if (woz > e.forfaitVillaGrens) return e.forfaitVillaBasis + (woz - e.forfaitVillaGrens) * e.forfaitVillaPercentage;
  return woz * e.forfaitPercentage;
}

/** Tarief waartegen de hypotheekrente aftrekbaar is: je schijftarief, maximaal 37,56%. */
export function aftrekTarief(brutoJaarinkomen: number): number {
  return Math.min(marginaalTarief(brutoJaarinkomen), e.maxAftrekTarief);
}

export interface HypotheekInput {
  bedrag: number;
  rente: number;
  looptijdMaanden: number;
  vorm: Leningvorm;
  woz: number;
  brutoJaarinkomen: number;
}

export interface HypotheekResultaat {
  brutoEersteMaand: number;
  nettoEersteMaand: number;
  brutoGemiddeldJaar1: number;
  nettoGemiddeldJaar1: number;
  renteJaar1: number;
  forfaitJaar: number | null;
  aftrekTarief: number;
  belastingvoordeelJaar1: number;
  totaleRente: number;
  schema: Termijn[];
}

export function berekenHypotheek(i: HypotheekInput): HypotheekResultaat {
  const l = berekenLening({ bedrag: i.bedrag, rente: i.rente, looptijdMaanden: i.looptijdMaanden, vorm: i.vorm });
  const jaar1 = l.schema.slice(0, 12);
  const renteJaar1 = jaar1.reduce((s, x) => s + x.rente, 0);
  const brutoJaar1 = jaar1.reduce((s, x) => s + x.termijn, 0);
  const forfait = eigenwoningforfait(i.woz);
  const tarief = aftrekTarief(i.brutoJaarinkomen);
  // Saldo eigen woning = forfait − rente. Is dat positief (forfait hoger dan rente), dan geldt Wet Hillen: geen bijtelling.
  const aftrekbaar = Math.max(0, renteJaar1 - (forfait ?? 0));
  const voordeel = aftrekbaar * tarief;
  const maanden = jaar1.length || 1;
  const voordeelEersteMaand = Math.max(0, l.schema[0].rente - (forfait ?? 0) / 12) * tarief;
  return {
    brutoEersteMaand: l.eersteTermijn,
    nettoEersteMaand: round2(l.eersteTermijn - voordeelEersteMaand),
    brutoGemiddeldJaar1: round2(brutoJaar1 / maanden),
    nettoGemiddeldJaar1: round2((brutoJaar1 - voordeel) / maanden),
    renteJaar1: round2(renteJaar1),
    forfaitJaar: forfait === null ? null : round2(forfait),
    aftrekTarief: round2(tarief * 100),
    belastingvoordeelJaar1: round2(voordeel),
    totaleRente: l.totaleRente,
    schema: l.schema,
  };
}
