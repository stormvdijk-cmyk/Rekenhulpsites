import { nettoUitWinst } from './zzpUurtarief';
import { round2 } from './format';

export interface ZzpNettoInput { omzet: number; kosten: number; urencriterium: boolean; starter: boolean }
export interface ZzpNettoResultaat {
  winst: number; ondernemersaftrek: number; mkbVrijstelling: number; belastbaar: number;
  inkomstenbelasting: number; zvw: number; nettoJaar: number; nettoMaand: number; teReserveren: number; reserveringPct: number;
}

/** Van omzet (excl. btw) en kosten naar netto inkomen als zzp'er, met de regels van 2026. */
export function berekenZzpNetto(i: ZzpNettoInput): ZzpNettoResultaat {
  const winst = Math.max(0, i.omzet - i.kosten);
  const f = nettoUitWinst(winst, i.urencriterium, i.starter);
  const reserveren = f.inkomstenbelasting + f.zvw;
  return {
    winst: round2(winst),
    ondernemersaftrek: round2(f.ondernemersaftrek),
    mkbVrijstelling: round2(f.mkbVrijstelling),
    belastbaar: round2(f.belastbaar),
    inkomstenbelasting: round2(f.inkomstenbelasting),
    zvw: round2(f.zvw),
    nettoJaar: round2(f.netto),
    nettoMaand: round2(f.netto / 12),
    teReserveren: round2(reserveren),
    reserveringPct: winst > 0 ? round2((reserveren / winst) * 100) : 0,
  };
}
