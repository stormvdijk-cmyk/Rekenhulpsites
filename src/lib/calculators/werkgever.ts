import { tarieven } from '../../data/tarieven';
import { round2 } from './format';

const w = tarieven.werkgever;

export interface LoonkostenInput {
  brutoMaand: number;
  vakantiegeld: boolean;
  dertiendeMaand: boolean;
  /** vast contract (lage WW-premie) of flex (hoge WW-premie) */
  vastContract: boolean;
  /** kleine werkgever: lage Aof-premie */
  kleineWerkgever: boolean;
  /** percentage gedifferentieerde premie Whk (als fractie) */
  whk: number;
  /** werkgeversdeel pensioenpremie, percentage van het brutoloon (als fractie) */
  pensioenWerkgeverPct: number;
}

export interface LoonkostenResultaat {
  brutoJaar: number; premieloon: number; awf: number; aof: number; wko: number; whk: number; zvw: number; pensioen: number;
  premiesTotaal: number; loonkostenJaar: number; loonkostenMaand: number; opslagPct: number;
}

export function berekenLoonkosten(i: LoonkostenInput): LoonkostenResultaat {
  const bruto = Math.max(0, i.brutoMaand) * 12 * (1 + (i.vakantiegeld ? tarieven.vakantiegeld.minimumPercentage : 0)) + (i.dertiendeMaand ? Math.max(0, i.brutoMaand) : 0);
  const pl = Math.min(bruto, w.maximumPremieloon);
  const awf = pl * (i.vastContract ? w.awfLaag : w.awfHoog);
  const aof = pl * (i.kleineWerkgever ? w.aofLaag : w.aofHoog);
  const wko = pl * w.wko;
  const whk = pl * Math.max(0, i.whk);
  const zvw = pl * w.werkgeversheffingZvw;
  const pensioen = bruto * Math.max(0, i.pensioenWerkgeverPct);
  const premies = awf + aof + wko + whk + zvw;
  const totaal = bruto + premies + pensioen;
  return {
    brutoJaar: round2(bruto), premieloon: round2(pl), awf: round2(awf), aof: round2(aof), wko: round2(wko), whk: round2(whk), zvw: round2(zvw), pensioen: round2(pensioen),
    premiesTotaal: round2(premies), loonkostenJaar: round2(totaal), loonkostenMaand: round2(totaal / 12), opslagPct: bruto > 0 ? round2(((totaal - bruto) / bruto) * 100) : 0,
  };
}
