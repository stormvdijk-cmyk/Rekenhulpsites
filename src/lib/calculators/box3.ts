import { tarieven } from '../../data/tarieven';
import { round2 } from './format';

const t = tarieven.box3;

export interface Box3Input {
  banktegoeden: number;
  /** beleggingen, tweede woning, uitgeleend geld, crypto en overige bezittingen */
  overigeBezittingen: number;
  schulden: number;
  /** fiscale partner het hele jaar: heffingsvrij vermogen en schuldendrempel tellen dubbel */
  partner: boolean;
}

export interface Box3Resultaat {
  rendement: number;
  rendementsgrondslag: number;
  heffingsvrij: number;
  grondslag: number;
  effectiefRendement: number;
  voordeel: number;
  belasting: number;
  aftrekbareSchulden: number;
}

/** Box 3 volgens de forfaitaire berekening 2026 (Belastingdienst). */
export function berekenBox3(i: Box3Input): Box3Resultaat {
  const n = i.partner ? 2 : 1;
  const bank = Math.max(0, i.banktegoeden);
  const overig = Math.max(0, i.overigeBezittingen);
  const aftrekbareSchulden = Math.max(0, Math.max(0, i.schulden) - t.drempelSchulden * n);
  const rendement = bank * t.rendementBank + overig * t.rendementOverig - aftrekbareSchulden * t.rendementSchulden;
  const rendementsgrondslag = bank + overig - aftrekbareSchulden;
  const heffingsvrij = t.heffingsvrijVermogen * n;
  const grondslag = Math.max(0, rendementsgrondslag - heffingsvrij);
  const effectief = rendementsgrondslag > 0 ? Math.max(0, rendement) / rendementsgrondslag : 0;
  const voordeel = grondslag * effectief;
  return {
    rendement: round2(rendement),
    rendementsgrondslag: round2(rendementsgrondslag),
    heffingsvrij,
    grondslag: round2(grondslag),
    effectiefRendement: Math.round(effectief * 1e6) / 1e4, // in % met 2 decimalen
    voordeel: round2(voordeel),
    belasting: round2(voordeel * t.tarief),
    aftrekbareSchulden: round2(aftrekbareSchulden),
  };
}
