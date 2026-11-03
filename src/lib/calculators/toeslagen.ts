import { tarieven } from '../../data/tarieven';
import { round2 } from './format';

// ---------- Zorgtoeslag ----------
const z = tarieven.zorgtoeslag;
export interface ZorgtoeslagResultaat { recht: boolean; reden: string; perJaar: number; perMaand: number; normpremie: number; standaardpremie: number }

export function berekenZorgtoeslag(toetsingsinkomen: number, partner: boolean, vermogen = 0): ZorgtoeslagResultaat {
  const standaard = z.standaardpremie * (partner ? 2 : 1);
  const grens = partner ? z.inkomensgrensPartner : z.inkomensgrensAlleen;
  const vgrens = partner ? z.vermogensgrensPartner : z.vermogensgrensAlleen;
  const norm = (partner ? z.normpremiePartner : z.normpremieAlleen) * z.drempelinkomen + z.normpremieBoven * Math.max(0, toetsingsinkomen - z.drempelinkomen);
  const leeg = { perJaar: 0, perMaand: 0, normpremie: round2(norm), standaardpremie: standaard };
  if (vermogen > vgrens) return { ...leeg, recht: false, reden: `Je vermogen is hoger dan € ${vgrens.toLocaleString('nl-NL')}.` };
  if (toetsingsinkomen > grens) return { ...leeg, recht: false, reden: `Je inkomen is hoger dan € ${grens.toLocaleString('nl-NL')}.` };
  const jaar = Math.max(0, standaard - norm);
  return { recht: jaar > 0, reden: jaar > 0 ? 'Je hebt recht op zorgtoeslag.' : 'De normpremie is hoger dan de standaardpremie.', perJaar: round2(jaar), perMaand: Math.floor(jaar / 12), normpremie: round2(norm), standaardpremie: standaard };
}

// ---------- Huurtoeslag (berekening 2026) ----------
const h = tarieven.huurtoeslag;
export interface HuurtoeslagInput {
  kaleHuur: number;
  /** aantal personen in het huishouden (zonder onderhuurders) */
  personen: number;
  /** iedereen in het huishouden jonger dan 21 */
  allenJongerDan21: boolean;
  /** rekeninkomen: toetsingsinkomens van aanvrager, partner en medebewoners samen */
  rekeninkomen: number;
  vermogen?: number;
}
export interface HuurtoeslagResultaat { perMaand: number; rekenhuur: number; basishuur: number; deelA: number; deelB: number; deelC: number; correctie: number; recht: boolean; reden: string }

export function berekenHuurtoeslag(i: HuurtoeslagInput): HuurtoeslagResultaat {
  const een = i.personen <= 1;
  const rekenhuur = Math.min(Math.max(0, i.kaleHuur), i.allenJongerDan21 ? h.huurgrensJong : h.huurgrens);
  const basishuur = een ? h.basishuurEen : h.basishuurMeer;
  const nul = { perMaand: 0, rekenhuur: round2(rekenhuur), basishuur, deelA: 0, deelB: 0, deelC: 0, correctie: 0 };
  if ((i.vermogen ?? 0) > h.vermogensgrensPerPersoon * Math.max(1, i.personen)) return { ...nul, recht: false, reden: 'Je vermogen is te hoog.' };
  if (rekenhuur <= basishuur) return { ...nul, recht: false, reden: 'Je huur is niet hoger dan de basishuur.' };
  const A = Math.min(rekenhuur, h.kwaliteitskortingsgrens) - basishuur;
  let B = 0, C = 0;
  if (!i.allenJongerDan21) {
    const afto = i.personen <= 2 ? h.aftoppingsgrensKlein : h.aftoppingsgrensGroot;
    if (rekenhuur > h.kwaliteitskortingsgrens) B = (Math.min(rekenhuur, afto) - h.kwaliteitskortingsgrens) * h.vergoedingB;
    if (rekenhuur > afto) C = (rekenhuur - afto) * h.vergoedingC;
  }
  const ijk = een ? h.ijkpuntEen : h.ijkpuntMeer;
  const afb = een ? h.afbouwEen : h.afbouwMeer;
  const D = Math.max(0, i.rekeninkomen - ijk) * (afb / 12);
  const totaal = Math.max(0, A + B + C - D);
  return { perMaand: Math.floor(totaal), rekenhuur: round2(rekenhuur), basishuur, deelA: round2(A), deelB: round2(B), deelC: round2(C), correctie: round2(D), recht: totaal >= 1, reden: totaal >= 1 ? 'Je hebt recht op huurtoeslag.' : 'Je inkomen is te hoog voor huurtoeslag bij deze huur.' };
}

// ---------- Kindgebonden budget ----------
const k = tarieven.kindgebondenBudget;
export interface KgbInput { leeftijden: number[]; partner: boolean; toetsingsinkomen: number; vermogen?: number }
export interface KgbResultaat { perJaar: number; perMaand: number; maximum: number; verhoging: number; vermindering: number; recht: boolean; reden: string }

export function berekenKindgebondenBudget(i: KgbInput): KgbResultaat {
  const kinderen = i.leeftijden.filter((l) => l >= 0 && l < 18);
  if (!kinderen.length) return { perJaar: 0, perMaand: 0, maximum: 0, verhoging: 0, vermindering: 0, recht: false, reden: 'Je hebt geen kinderen jonger dan 18.' };
  const vgrens = i.partner ? k.vermogensgrensPartner : k.vermogensgrensAlleen;
  const kop = k.maxEenKindAlleen - k.maxEenKindPartner;
  const maximum = kinderen.length * k.perKind + (i.partner ? 0 : kop);
  const verhoging = kinderen.reduce((s, l) => s + (l >= 16 ? k.verhoging16en17 : l >= 12 ? k.verhoging12tot15 : 0), 0);
  const drempel = i.partner ? k.drempelPartner : k.drempelAlleen;
  const vermindering = Math.max(0, i.toetsingsinkomen - drempel) * k.afbouwPercentage;
  if ((i.vermogen ?? 0) > vgrens) return { perJaar: 0, perMaand: 0, maximum, verhoging, vermindering: round2(vermindering), recht: false, reden: 'Je vermogen is te hoog.' };
  const jaar = Math.max(0, maximum + verhoging - vermindering);
  return { perJaar: round2(jaar), perMaand: round2(jaar / 12), maximum, verhoging, vermindering: round2(vermindering), recht: jaar > 0, reden: jaar > 0 ? 'Je hebt recht op kindgebonden budget.' : 'Je inkomen is te hoog voor kindgebonden budget.' };
}

// ---------- Kinderopvangtoeslag ----------
const o = tarieven.kinderopvangtoeslag;
export type Opvangsoort = 'dagopvang' | 'bso' | 'gastouder';
export interface OpvangKind { soort: Opvangsoort; urenPerMaand: number; uurtarief: number }
export interface OpvangKindResultaat extends OpvangKind { uurprijs: number; uren: number; kosten: number; percentage: number; toeslag: number; eersteKind: boolean }

export function percentageKot(toetsingsinkomen: number, eersteKind: boolean): number {
  const x = Math.max(0, Math.floor(toetsingsinkomen));
  const r = o.tabel.find((t) => x >= t.van && x <= t.tot) ?? o.tabel[o.tabel.length - 1];
  return eersteKind ? r.eerste : r.volgende;
}

const maxUurprijs = (s: Opvangsoort) => (s === 'dagopvang' ? o.maxUurprijsDagopvang : s === 'bso' ? o.maxUurprijsBso : o.maxUurprijsGastouder);

export function berekenKinderopvangtoeslag(kinderen: OpvangKind[], toetsingsinkomen: number): { perMaand: number; perKind: OpvangKindResultaat[] } {
  const met = kinderen.map((k) => {
    const uurprijs = Math.min(k.uurtarief, maxUurprijs(k.soort));
    const uren = Math.min(k.urenPerMaand, o.maxUrenPerMaand);
    return { ...k, uurprijs, uren, kosten: uren * uurprijs };
  });
  // 1e kind = meeste uren; bij gelijke uren de hoogste kosten
  const volgorde = [...met.keys()].sort((a, b) => met[b].uren - met[a].uren || met[b].kosten - met[a].kosten);
  const eerste = volgorde[0];
  const perKind = met.map((k, idx) => {
    const isEerste = idx === eerste;
    const pct = percentageKot(toetsingsinkomen, isEerste);
    return { ...k, kosten: round2(k.kosten), percentage: pct, toeslag: round2(k.kosten * pct), eersteKind: isEerste };
  });
  const totaal = perKind.reduce((s, k) => s + k.kosten * k.percentage, 0);
  return { perMaand: Math.floor(totaal), perKind };
}
