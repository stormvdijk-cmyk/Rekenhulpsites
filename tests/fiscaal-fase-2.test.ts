import { describe, expect, it } from 'vitest';
import { berekenIack, iack } from '../src/lib/calculators/iack';
import { berekenWw } from '../src/lib/calculators/ww';
import { berekenMinimumloon, minimumUurloon } from '../src/lib/calculators/minimumloon';
import { berekenSpaardoel } from '../src/lib/calculators/spaardoel';
import { berekenInkomstenbelasting } from '../src/lib/calculators/inkomstenbelasting';

describe('IACK 2026', () => {
  it('€ 20.000 arbeidsinkomen', () => expect(iack(20000)).toBeCloseTo(1575.63, 2)); // 13.761 × 11,45%
  it('maximum € 3.032', () => expect(iack(40000)).toBe(3032));
  it('onder de drempel niets', () => expect(iack(5000)).toBe(0));
  it('AOW: 5,72%', () => expect(iack(20000, true)).toBeCloseTo(787.13, 2));
  it('partner met lager inkomen krijgt de korting', () => {
    expect(berekenIack({ arbeidsinkomen: 40000, partner: true, partnerArbeidsinkomen: 25000, kindVoldoet: true, ingeschreven: true }).korting).toBe(0);
    expect(berekenIack({ arbeidsinkomen: 25000, partner: true, partnerArbeidsinkomen: 40000, kindVoldoet: true, ingeschreven: true }).korting).toBeCloseTo(2148.13, 2); // 18.761 × 11,45%
  });
  it('verlaagt de inkomstenbelasting', () => {
    const zonder = berekenInkomstenbelasting({ loon: 30000 }).teBetalen;
    const met = berekenInkomstenbelasting({ loon: 30000, iack: true }).teBetalen;
    // IACK zou (30.000 − 6.239) × 11,45% = 2.720,63 zijn, maar er is maar 2.245,87 belasting over:
    // 30.000 × 35,75% = 10.725 − AHK 3.098,11 − AK 5.381,02. Kortingen gaan niet onder nul.
    expect(zonder).toBeCloseTo(2245.87, 1);
    expect(met).toBe(0);
  });
});

describe('WW-uitkering 2026', () => {
  it('€ 3.000 bruto per maand', () => {
    // dagloon 36.000 / 261 = 137,93; × 21,75 = 3.000; 75% = 2.250; 70% = 2.100
    const r = berekenWw(3000);
    expect(r.wwMaandloon).toBeCloseTo(3000, 2);
    expect(r.brutoEerste2).toBeCloseTo(2250, 2);
    expect(r.brutoDaarna).toBeCloseTo(2100, 2);
  });
  it('netto: geen arbeidskorting', () => {
    // 27.000 × 35,75% − 3.115 = 6.537,50 → (27.000 − 6.537,50) / 12 = 1.705,21
    expect(berekenWw(3000).nettoEerste2).toBeCloseTo(1705.21, 1);
  });
  it('begrensd op het maximumdagloon', () => {
    // 309,91 × 21,75 = 6.740,54; 75% = 5.055,41; 70% = 4.718,38
    const r = berekenWw(8000);
    expect(r.begrensd).toBe(true);
    expect(r.brutoEerste2).toBeCloseTo(5055.41, 1);
    expect(r.brutoDaarna).toBeCloseTo(4718.38, 1);
  });
});

describe('minimumloon 2026 (21+)', () => {
  it('per 1 juli 2026 € 14,99', () => expect(minimumUurloon('2026-08-01')).toBe(14.99));
  it('in het eerste halfjaar € 14,71', () => expect(minimumUurloon('2026-03-15')).toBe(14.71));
  it('40 uur in augustus: € 599,60 per week, € 2.598,27 per maand', () => {
    const r = berekenMinimumloon(40, '2026-08-01');
    expect(r.week).toBeCloseTo(599.6, 2);
    expect(r.maand).toBeCloseTo(2598.27, 2);
  });
});

describe('spaardoel', () => {
  it('€ 10.000 in 24 maanden zonder rente', () => expect(berekenSpaardoel({ doel: 10000, startbedrag: 0, rente: 0, maanden: 24 }).perMaand).toBeCloseTo(416.67, 2));
  it('€ 10.000 in 24 maanden bij 5%', () => {
    // i = 1,05^(1/12) − 1 = 0,0040741; p = 10.000 × i / (1,1025 − 1) = 397,48
    expect(berekenSpaardoel({ doel: 10000, startbedrag: 0, rente: 5, maanden: 24 }).perMaand).toBeCloseTo(397.48, 2);
  });
  it('startbedrag is al genoeg', () => expect(berekenSpaardoel({ doel: 5000, startbedrag: 5000, rente: 2, maanden: 12 }).haalbaarZonderInleg).toBe(true));
});
