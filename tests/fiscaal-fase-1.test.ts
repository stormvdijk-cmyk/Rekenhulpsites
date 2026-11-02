import { describe, expect, it } from 'vitest';
import { berekenInkomstenbelasting } from '../src/lib/calculators/inkomstenbelasting';
import { berekenNettoSalaris } from '../src/lib/calculators/nettoSalaris';
import { berekenZzpNetto } from '../src/lib/calculators/zzpNetto';
import { ouderenkorting } from '../src/lib/calculators/belasting';

describe('inkomstenbelasting 2026', () => {
  it('loon € 45.360 geeft dezelfde belasting als netto salaris', () => {
    expect(berekenInkomstenbelasting({ loon: 45360 }).teBetalen).toBeCloseTo(8537.51, 1);
  });
  it('teruggave: € 9.000 ingehouden', () => {
    expect(berekenInkomstenbelasting({ loon: 45360, ingehoudenLoonheffing: 9000 }).saldo).toBeCloseTo(462.49, 1);
  });
  it('aftrekposten verlagen het belastbaar inkomen, niet de arbeidskorting', () => {
    // belastbaar 45.000: box1 13.900,67 + 6.117 × 37,56% = 16.198,22
    // AHK 3.115 − 6,398% × 15.264 = 2.138,41; AK over € 50.000: 5.685 − 6,51% × 4.408 = 5.398,04
    const r = berekenInkomstenbelasting({ loon: 50000, aftrekposten: 5000 });
    expect(r.belastbaarInkomen).toBe(45000);
    expect(r.teBetalen).toBeCloseTo(8661.77, 1);
  });
  it('AOW: € 30.000 pensioen en AOW, alleenstaand', () => {
    // 30.000 × 17,85% = 5.355; AHK 1.556 − 3,195% × 264 = 1.547,57; OUK 2.067; AOUK 540
    const r = berekenInkomstenbelasting({ loon: 0, overigInkomen: 30000, aow: true, alleenstaand: true });
    expect(r.arbeidskorting).toBe(0);
    expect(r.teBetalen).toBeCloseTo(1200.43, 1);
  });
  it('AOW: € 50.000, met partner', () => {
    // box1 38.883 × 17,85% + 11.117 × 37,56% = 6.940,62 + 4.175,55 = 11.116,17
    // AHK 1.556 − 3,195% × 20.264 = 908,57; OUK 2.067 − 15% × 3.998 = 1.467,30
    const r = berekenInkomstenbelasting({ loon: 0, overigInkomen: 50000, aow: true });
    expect(r.teBetalen).toBeCloseTo(8740.3, 1);
  });
  it('ouderenkorting is nul vanaf € 59.782', () => {
    expect(ouderenkorting(40000)).toBe(2067);
    expect(ouderenkorting(60000)).toBe(0);
  });
});

describe('netto salaris met pensioenpremie', () => {
  it('€ 3.500 bruto met € 200 pensioenpremie per maand', () => {
    // belastbaar 45.360 − 2.400 = 42.960; box1 15.431,99; AHK 2.268,93; AK 5.633,74 → 7.529,32
    const r = berekenNettoSalaris({ brutoMaand: 3500, loonheffingskorting: true, vakantiegeld: true, pensioenpremieMaand: 200 });
    expect(r.loonheffingJaar).toBeCloseTo(7529.32, 1);
    expect(r.nettoJaar).toBeCloseTo(35430.68, 1);
  });
  it('AOW-gerechtigde werknemer betaalt minder', () => {
    const jong = berekenNettoSalaris({ brutoMaand: 2000, loonheffingskorting: true, vakantiegeld: false });
    const aow = berekenNettoSalaris({ brutoMaand: 2000, loonheffingskorting: true, vakantiegeld: false, aow: true });
    // 24.000 × 17,85% = 4.284 − AHK 1.556 − AK (498 + 15,483% × 12.035 = 2.361,38) − OUK 2.067 → 0
    expect(aow.loonheffingJaar).toBe(0);
    expect(jong.loonheffingJaar).toBeGreaterThan(0);
  });
});

describe('zzp netto inkomen', () => {
  it('€ 60.000 omzet en € 10.000 kosten', () => {
    const r = berekenZzpNetto({ omzet: 60000, kosten: 10000, urencriterium: true, starter: false });
    expect(r.winst).toBe(50000);
    expect(r.nettoJaar).toBeCloseTo(40325.98, 0);
    expect(r.teReserveren).toBeCloseTo(9674.02, 0);
  });
  it('zonder urencriterium betaal je meer', () => {
    const met = berekenZzpNetto({ omzet: 60000, kosten: 10000, urencriterium: true, starter: false });
    const zonder = berekenZzpNetto({ omzet: 60000, kosten: 10000, urencriterium: false, starter: false });
    expect(zonder.nettoJaar).toBeLessThan(met.nettoJaar);
  });
  it('kosten hoger dan omzet: geen belasting', () => {
    expect(berekenZzpNetto({ omzet: 5000, kosten: 8000, urencriterium: true, starter: false }).teReserveren).toBe(0);
  });
});
