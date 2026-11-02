import { tarieven } from '../../data/tarieven';
import { round2 } from './format';

const t = tarieven.schenkErf;

export type Tariefgroep = 'partnerKind' | 'kleinkind' | 'overig';

/** Tarief in twee schijven over het belaste bedrag (na vrijstelling). */
export function tariefBelasting(belast: number, groep: Tariefgroep): number {
  const [laag, hoog] = t.tarieven[groep];
  const b = Math.max(0, belast);
  return Math.min(b, t.schijfGrens) * laag + Math.max(0, b - t.schijfGrens) * hoog;
}

export interface SchenkErfResultaat { vrijstelling: number; belast: number; belasting: number; netto: number; groep: Tariefgroep }

export type Erfgenaam = 'partner' | 'kind' | 'kindBeperking' | 'kleinkind' | 'achterkleinkind' | 'ouder' | 'overig';
const ERF_GROEP: Record<Erfgenaam, Tariefgroep> = {
  partner: 'partnerKind', kind: 'partnerKind', kindBeperking: 'partnerKind',
  kleinkind: 'kleinkind', achterkleinkind: 'kleinkind', ouder: 'overig', overig: 'overig',
};

export function berekenErfbelasting(erfdeel: number, erfgenaam: Erfgenaam): SchenkErfResultaat {
  const groep = ERF_GROEP[erfgenaam];
  const vrijstelling = t.vrijstellingErf[erfgenaam];
  const belast = Math.max(0, erfdeel - vrijstelling);
  const belasting = tariefBelasting(belast, groep);
  return { vrijstelling, belast: round2(belast), belasting: round2(belasting), netto: round2(erfdeel - belasting), groep };
}

export type Ontvanger = 'kind' | 'kindEenmalig' | 'kindEenmaligStudie' | 'kleinkind' | 'overig';

export function berekenSchenkbelasting(schenking: number, ontvanger: Ontvanger): SchenkErfResultaat {
  const groep: Tariefgroep = ontvanger.startsWith('kind') ? 'partnerKind' : ontvanger === 'kleinkind' ? 'kleinkind' : 'overig';
  const vrijstelling = ontvanger === 'kleinkind' ? t.vrijstellingSchenk.overig : t.vrijstellingSchenk[ontvanger];
  const belast = Math.max(0, schenking - vrijstelling);
  const belasting = tariefBelasting(belast, groep);
  return { vrijstelling, belast: round2(belast), belasting: round2(belasting), netto: round2(schenking - belasting), groep };
}
