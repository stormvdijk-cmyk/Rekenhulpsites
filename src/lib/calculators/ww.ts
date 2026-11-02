import { tarieven } from '../../data/tarieven';
import { belastingOverLoon } from './belasting';
import { round2 } from './format';

const w = tarieven.ww;

export interface WwResultaat {
  dagloon: number;
  begrensd: boolean;
  wwMaandloon: number;
  brutoEerste2: number;
  brutoDaarna: number;
  nettoEerste2: number;
  nettoDaarna: number;
}

/** Netto per maand bij een bruto uitkering per maand (geen arbeidskorting; wel algemene heffingskorting). */
function nettoUitkering(brutoMaand: number, loonheffingskorting: boolean): number {
  const jaar = brutoMaand * 12;
  const b = belastingOverLoon(jaar, 0, loonheffingskorting);
  return (jaar - b.teBetalen) / 12;
}

/** Indicatie WW-uitkering op basis van een vast bruto maandloon (zonder vakantiegeld). */
export function berekenWw(brutoMaandloon: number, loonheffingskorting = true): WwResultaat {
  const ruw = (Math.max(0, brutoMaandloon) * 12) / w.werkdagenPerJaar;
  const dagloon = Math.min(ruw, w.maximumDagloon);
  const wwMaandloon = dagloon * w.werkdagenPerMaand;
  const b1 = wwMaandloon * w.percentageEerste2Maanden;
  const b2 = wwMaandloon * w.percentageDaarna;
  return {
    dagloon: round2(dagloon),
    begrensd: ruw > w.maximumDagloon,
    wwMaandloon: round2(wwMaandloon),
    brutoEerste2: round2(b1),
    brutoDaarna: round2(b2),
    nettoEerste2: round2(nettoUitkering(b1, loonheffingskorting)),
    nettoDaarna: round2(nettoUitkering(b2, loonheffingskorting)),
  };
}
