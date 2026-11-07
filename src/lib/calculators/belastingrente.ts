import { tarieven } from '../../data/tarieven';

const r = tarieven.belastingrente;

const d = (s: string) => { const [y, m, dd] = s.split('-').map(Number); return new Date(y, m - 1, dd); };
const plusDagen = (x: Date, n: number) => new Date(x.getFullYear(), x.getMonth(), x.getDate() + n);
const iso = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;

/** Aantal rentedagen van van t/m tot (beide inbegrepen) met 30 dagen per maand en 360 per jaar. */
export function dagen30360(van: Date, tot: Date): number {
  if (tot < van) return 0;
  const d1 = Math.min(30, van.getDate()), d2 = Math.min(30, tot.getDate());
  return (tot.getFullYear() - van.getFullYear()) * 360 + (tot.getMonth() - van.getMonth()) * 30 + (d2 - d1) + 1;
}

export type Situatie = 'op-tijd-ongewijzigd' | 'te-laat-ongewijzigd' | 'afwijking';
export interface RenteInput {
  soort: 'betalen' | 'ontvangen';
  bedrag: number;
  belastingjaar: number;
  /** datum waarop de Belastingdienst je aangifte ontving */
  aangifte: Date;
  /** datum op de (definitieve) aanslag */
  aanslag: Date;
  /** wijkt de aanslag af van je aangifte? */
  afwijking: boolean;
}
export interface RenteDeel { van: string; tot: string; dagen: number; pct: number; rente: number }
export interface RenteResultaat { rente: number; reden: string; delen: RenteDeel[]; van?: string; tot?: string }

/** Belastingrente inkomstenbelasting volgens de regels en rekenvoorbeelden van de Belastingdienst. */
export function berekenBelastingrente(i: RenteInput): RenteResultaat {
  const start = new Date(i.belastingjaar + 1, 6, 1); // 1 juli na het belastingjaar
  const eenMei = new Date(i.belastingjaar + 1, 4, 1);
  let eind: Date;
  if (i.soort === 'betalen') {
    if (!i.afwijking && i.aangifte < eenMei) return { rente: 0, reden: 'Je deed vóór 1 mei aangifte en de aanslag volgt je aangifte: geen belastingrente.', delen: [] };
    eind = plusDagen(i.aanslag, 42);
    if (!i.afwijking) { const max = plusDagen(i.aangifte, 133); if (max < eind) eind = max; }
  } else {
    if (i.afwijking) return { rente: 0, reden: 'De aanslag wijkt af van je aangifte: dan krijg je geen belastingrente vergoed.', delen: [] };
    if (i.aanslag <= start) return { rente: 0, reden: 'De aanslag is vóór 1 juli na het belastingjaar opgelegd: geen belastingrente.', delen: [] };
    if (i.aanslag <= plusDagen(i.aangifte, 91)) return { rente: 0, reden: 'De Belastingdienst deed er niet langer dan 13 weken over: geen belastingrente.', delen: [] };
    eind = plusDagen(i.aanslag, 42);
  }
  if (eind < start) return { rente: 0, reden: 'De renteperiode begint pas op 1 juli na het belastingjaar; de aanslag kwam eerder.', delen: [] };

  // Splits de periode per tarief en per kalenderjaar.
  const grenzen = r.perioden.map((p) => ({ van: d(p.vanaf), pct: p.pct }));
  const delen: RenteDeel[] = [];
  let cursor = start;
  while (cursor <= eind) {
    const p = [...grenzen].reverse().find((g) => g.van <= cursor) ?? grenzen[0];
    const volgendeTarief = grenzen.find((g) => g.van > cursor)?.van;
    const jaarEind = new Date(cursor.getFullYear(), 11, 31);
    let deelEind = eind < jaarEind ? eind : jaarEind;
    if (volgendeTarief && plusDagen(volgendeTarief, -1) < deelEind) deelEind = plusDagen(volgendeTarief, -1);
    const n = dagen30360(cursor, deelEind);
    const ruw = (n / 360) * (p.pct / 100) * Math.max(0, i.bedrag);
    delen.push({ van: iso(cursor), tot: iso(deelEind), dagen: n, pct: p.pct, rente: i.soort === 'betalen' ? Math.floor(ruw + 1e-9) : Math.ceil(ruw - 1e-9) });
    cursor = plusDagen(deelEind, 1);
  }
  const rente = delen.reduce((s, x) => s + x.rente, 0);
  return { rente, reden: i.soort === 'betalen' ? 'Je betaalt belastingrente over de periode hieronder.' : 'Je krijgt belastingrente vergoed over de periode hieronder.', delen, van: iso(start), tot: iso(eind) };
}
