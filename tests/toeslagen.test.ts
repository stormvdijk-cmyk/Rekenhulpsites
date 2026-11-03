import { describe, expect, it } from 'vitest';
import { berekenHuurtoeslag, berekenKinderopvangtoeslag, berekenKindgebondenBudget, berekenZorgtoeslag, percentageKot } from '../src/lib/calculators/toeslagen';

describe('zorgtoeslag 2026 (officiële rekenvoorbeelden Belastingdienst)', () => {
  it('Wouter, alleenstaand, € 19.000: normpremie € 568,55', () => {
    const r = berekenZorgtoeslag(19000, false);
    expect(r.normpremie).toBeCloseTo(568.55, 2);
    expect(r.perJaar).toBeCloseTo(2119 - 568.55, 2);
  });
  it('maximaal € 1.550 alleenstaand, € 2.963 met partner', () => {
    expect(Math.floor(berekenZorgtoeslag(25000, false).perJaar)).toBe(1550);
    expect(Math.floor(berekenZorgtoeslag(25000, true).perJaar)).toBe(2962); // 4.238 − 4,289% × 29.736 = 2.962,62
  });
  it('alleenstaand € 35.000: 2.119 − (568,55 + 13,73% × 5.264)', () => {
    expect(berekenZorgtoeslag(35000, false).perJaar).toBeCloseTo(2119 - 568.55 - 722.75, 1);
  });
  it('boven de inkomensgrens: geen recht', () => expect(berekenZorgtoeslag(41000, false).recht).toBe(false));
  it('vermogen te hoog: geen recht', () => expect(berekenZorgtoeslag(20000, false, 150000).recht).toBe(false));
});

describe('huurtoeslag 2026 (officiële rekenvoorbeelden)', () => {
  it('Sem, 20 jaar, € 22.000, huur € 600 → € 295', () => {
    const r = berekenHuurtoeslag({ kaleHuur: 600, personen: 1, allenJongerDan21: true, rekeninkomen: 22000 });
    expect(r.rekenhuur).toBe(498.2);
    expect(r.deelA).toBeCloseTo(295.68, 2);
    expect(r.perMaand).toBe(295);
  });
  it('Demi en Sophie met kind, € 34.000, huur € 1.200 → € 492', () => {
    const r = berekenHuurtoeslag({ kaleHuur: 1200, personen: 3, allenJongerDan21: false, rekeninkomen: 34000 });
    expect(r.deelA).toBeCloseTo(297.49, 2);
    expect(r.deelB).toBeCloseTo(172.86, 2);
    expect(r.deelC).toBeCloseTo(67.51, 1); // 168,79 × 40% = 67,516 (Belastingdienst toont 67,51)
    expect(r.correctie).toBeCloseTo(45.83, 2);
    expect(r.perMaand).toBe(492);
  });
  it('huur onder de basishuur: niets', () => expect(berekenHuurtoeslag({ kaleHuur: 180, personen: 1, allenJongerDan21: false, rekeninkomen: 15000 }).perMaand).toBe(0));
  it('alleenstaande, € 30.000, huur € 650', () => {
    // A 498,20 − 202,52 = 295,68; B (650 − 498,20) × 65% = 98,67; C 0; D (30.000 − 23.425) × 27% / 12 = 147,94
    expect(berekenHuurtoeslag({ kaleHuur: 650, personen: 1, allenJongerDan21: false, rekeninkomen: 30000 }).perMaand).toBe(246);
  });
});

describe('kindgebonden budget 2026', () => {
  it('ouders met 2 kinderen (5 en 13), € 45.000', () => {
    // max 5.160 + 724 = 5.884; vermindering 7,6% × (45.000 − 39.141) = 445,28 → 5.438,72
    const r = berekenKindgebondenBudget({ leeftijden: [5, 13], partner: true, toetsingsinkomen: 45000 });
    expect(r.perJaar).toBeCloseTo(5438.72, 2);
  });
  it('alleenstaande ouder met 1 kind, onder de drempel: € 5.996', () => {
    expect(berekenKindgebondenBudget({ leeftijden: [4], partner: false, toetsingsinkomen: 25000 }).perJaar).toBe(5996);
  });
  it('3 kinderen met partner: 3 × 2.580 + verhogingen', () => {
    expect(berekenKindgebondenBudget({ leeftijden: [3, 12, 16], partner: true, toetsingsinkomen: 30000 }).perJaar).toBe(3 * 2580 + 724 + 964);
  });
  it('hoog inkomen: niets', () => expect(berekenKindgebondenBudget({ leeftijden: [5], partner: true, toetsingsinkomen: 120000 }).perJaar).toBe(0));
  it('vermogen te hoog', () => expect(berekenKindgebondenBudget({ leeftijden: [5], partner: true, toetsingsinkomen: 30000, vermogen: 200000 }).recht).toBe(false));
});

describe('kinderopvangtoeslag 2026 (officiële rekenvoorbeelden)', () => {
  it('Chris en Khadija: 122 uur × € 10,50 bij € 60.000 → € 1.202', () => {
    const r = berekenKinderopvangtoeslag([{ soort: 'dagopvang', urenPerMaand: 122, uurtarief: 10.5 }], 60000);
    expect(r.perKind[0].toeslag).toBeCloseTo(1202.86, 1);
    expect(r.perMaand).toBe(1202);
  });
  it('Cynthia en Hannah: 2 kinderen bij € 120.000', () => {
    const r = berekenKinderopvangtoeslag([
      { soort: 'bso', urenPerMaand: 65, uurtarief: 10.1 },
      { soort: 'dagopvang', urenPerMaand: 87, uurtarief: 12.45 },
    ], 120000);
    expect(r.perKind[1].eersteKind).toBe(true);
    expect(r.perKind[1].toeslag).toBeCloseTo(592.07, 1);
    expect(r.perKind[0].toeslag).toBeCloseTo(570.21, 1);
    expect(r.perMaand).toBe(1162);
  });
  it('tabelgrenzen', () => {
    expect(percentageKot(10000, true)).toBe(0.96);
    expect(percentageKot(250000, true)).toBe(0.365);
    expect(percentageKot(250000, false)).toBe(0.682);
  });
  it('maximaal 230 uur per maand', () => {
    expect(berekenKinderopvangtoeslag([{ soort: 'dagopvang', urenPerMaand: 300, uurtarief: 11 }], 30000).perKind[0].uren).toBe(230);
  });
});
