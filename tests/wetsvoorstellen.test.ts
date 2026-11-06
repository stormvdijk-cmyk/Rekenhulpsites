import { describe, expect, it } from 'vitest';
import { berekenBox3Nieuw, VOORSTELLEN } from '../src/lib/calculators/wetsvoorstellen';
import { box2Belasting, berekenDga } from '../src/lib/calculators/dga';
import { berekenOverdrachtsbelasting } from '../src/lib/calculators/overdrachtsbelasting';
import { berekenZzpNetto } from '../src/lib/calculators/zzpNetto';

describe('Box 3 werkelijk rendement (wetsvoorstel)', () => {
  it('voorbeeld 10 uit de memorie van toelichting: € 4.000 rente, € 20 kosten → € 784', () => {
    const r = berekenBox3Nieuw({ rente: 4000, overigeInkomsten: 0, waardeverandering: 0, kosten: 20, partner: false });
    expect(r.resultaat).toBe(3980);
    expect(r.grondslag).toBe(2180);
    expect(Math.floor(r.belasting)).toBe(784);
  });
  it('fiscale partners: heffingsvrij resultaat telt dubbel', () => {
    const r = berekenBox3Nieuw({ rente: 3000, overigeInkomsten: 1000, waardeverandering: 0, kosten: 0, partner: true });
    expect(r.heffingsvrij).toBe(3600);
    expect(r.belasting).toBe(144);
  });
  it('onder het heffingsvrij resultaat geen belasting; verlies alleen boven de drempel van € 500', () => {
    expect(berekenBox3Nieuw({ rente: 1500, overigeInkomsten: 0, waardeverandering: 0, kosten: 0, partner: false }).belasting).toBe(0);
    const v = berekenBox3Nieuw({ rente: 300, overigeInkomsten: 0, waardeverandering: -1500, kosten: 0, partner: false });
    expect(v.belasting).toBe(0);
    expect(v.verlies).toBe(700);
    expect(berekenBox3Nieuw({ rente: 0, overigeInkomsten: 0, waardeverandering: -400, kosten: 0, partner: false }).verlies).toBe(0);
  });
});

describe('Box 2 tarieven 2027–2030 (novelle)', () => {
  it('€ 100.000 dividend zonder partner', () => {
    expect(box2Belasting(100000)).toBeCloseTo(68843 * 0.245 + 31157 * 0.31, 2);
    expect(box2Belasting(100000, false, VOORSTELLEN.box2)).toBeCloseTo(68843 * 0.235 + 31157 * 0.29, 2);
  });
  it('onder de schijfgrens 1%-punt minder', () => {
    expect(box2Belasting(50000, false, VOORSTELLEN.box2)).toBeCloseTo(11750, 2);
  });
  it('DGA: lagere box 2 geeft hoger netto dividend, vpb gelijk', () => {
    const nu = berekenDga({ winstVoorBelasting: 100000, uitkeerPct: 100, partner: false });
    const vs = berekenDga({ winstVoorBelasting: 100000, uitkeerPct: 100, partner: false }, VOORSTELLEN.box2);
    expect(vs.vpb).toBe(nu.vpb);
    expect(vs.nettoDividend).toBeGreaterThan(nu.nettoDividend);
  });
});

describe('Overdrachtsbelasting 7% (Belastingplan 2027)', () => {
  const basis = { koopsom: 400000, soort: 'woning' as const, kopers: [{ leeftijd: 45, eerderGebruikt: true }] };
  it('verhuurwoning € 400.000: € 32.000 nu, € 28.000 in het voorstel', () => {
    expect(berekenOverdrachtsbelasting({ ...basis, zelfBewonen: false }).totaal).toBe(32000);
    expect(berekenOverdrachtsbelasting({ ...basis, zelfBewonen: false }, VOORSTELLEN.overdrachtsbelasting.woningNietZelfBewonen).totaal).toBe(28000);
  });
  it('zelf bewonen blijft 2%', () => {
    expect(berekenOverdrachtsbelasting({ ...basis, zelfBewonen: true }, 0.07).totaal).toBe(8000);
  });
});

describe('Ondernemersaftrek 2027', () => {
  it('starter met urencriterium: aftrek van € 3.323 naar € 910', () => {
    const i = { omzet: 60000, kosten: 10000, urencriterium: true, starter: true };
    const nu = berekenZzpNetto(i);
    const vs = berekenZzpNetto(i, { zelfstandigenaftrek: 900, startersaftrek: 10 });
    expect(nu.ondernemersaftrek).toBe(3323);
    expect(vs.ondernemersaftrek).toBe(910);
    expect(vs.belastbaar).toBeCloseTo(nu.belastbaar + 2413 * (1 - 0.127), 1);
    expect(vs.nettoJaar).toBeLessThan(nu.nettoJaar);
  });
});
