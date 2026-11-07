import { tarieven } from '../../data/tarieven';
import { round2 } from './format';

const rk = tarieven.reiskosten;

export interface ThuiswerkInput { thuisDagen: number; kantoorDagen: number; kmEnkel: number }
export interface ThuiswerkResultaat { thuisDagenJaar: number; reisDagenJaar: number; thuiswerkJaar: number; reiskostenJaar: number; totaalJaar: number; totaalMaand: number; thuiswerkMaand: number; reiskostenMaand: number }

/**
 * Maximale onbelaste vaste vergoeding voor thuiswerken (€ 2,45 per dag) en woon-werkverkeer (€ 0,25 per km),
 * uitgaande van 214 dagen per jaar bij een vijfdaagse werkweek (naar verhouding bij minder dagen).
 * Per dag krijg je óf een thuiswerkvergoeding óf een reiskostenvergoeding.
 */
export function berekenThuiswerk(i: ThuiswerkInput): ThuiswerkResultaat {
  const thuis = Math.min(5, Math.max(0, i.thuisDagen));
  const kantoor = Math.min(5 - thuis, Math.max(0, i.kantoorDagen));
  const thuisJaar = Math.round((rk.vasteVergoedingDagenFulltime * thuis) / 5);
  const reisJaar = Math.round((rk.vasteVergoedingDagenFulltime * kantoor) / 5);
  const tw = thuisJaar * rk.thuiswerkPerDag;
  const reis = reisJaar * Math.max(0, i.kmEnkel) * 2 * rk.onbelastPerKm;
  return {
    thuisDagenJaar: thuisJaar,
    reisDagenJaar: reisJaar,
    thuiswerkJaar: round2(tw),
    reiskostenJaar: round2(reis),
    totaalJaar: round2(tw + reis),
    totaalMaand: round2((tw + reis) / 12),
    thuiswerkMaand: round2(tw / 12),
    reiskostenMaand: round2(reis / 12),
  };
}
