import { describe, expect, it } from 'vitest';
import { berekenGiftenaftrek, berekenJaarruimte, berekenZorgkostenaftrek, zorgkostenDrempel } from '../src/lib/calculators/aftrekposten';
import { berekenLoonkosten } from '../src/lib/calculators/werkgever';
import { berekenAowDatum } from '../src/lib/calculators/aow';

describe('giftenaftrek 2026', () => {
  it('drempel 1% maar minimaal € 60', () => {
    expect(berekenGiftenaftrek({ drempelinkomen: 4000, gewoneGiften: 500, cultureleGiften: 0, periodiekeGiften: 0 }).drempel).toBe(60);
  });
  it('€ 50.000 drempelinkomen, € 1.200 giften: aftrek € 700', () => {
    expect(berekenGiftenaftrek({ drempelinkomen: 50000, gewoneGiften: 1200, cultureleGiften: 0, periodiekeGiften: 0 }).aftrekGewoon).toBe(700);
  });
  it('maximaal 10% van het drempelinkomen', () => {
    expect(berekenGiftenaftrek({ drempelinkomen: 30000, gewoneGiften: 10000, cultureleGiften: 0, periodiekeGiften: 0 }).aftrekGewoon).toBe(3000);
  });
  it('culturele ANBI: Belastingdienst-voorbeeld € 500 → € 625', () => {
    const r = berekenGiftenaftrek({ drempelinkomen: 0, gewoneGiften: 0, cultureleGiften: 500, periodiekeGiften: 0 });
    expect(r.verhogingCultureel).toBe(125);
  });
  it('culturele verhoging maximaal € 1.250 (voorbeeld € 6.000 → € 7.250)', () => {
    expect(berekenGiftenaftrek({ drempelinkomen: 100000, gewoneGiften: 0, cultureleGiften: 6000, periodiekeGiften: 0 }).verhogingCultureel).toBe(1250);
  });
  it('periodieke giften volledig aftrekbaar', () => {
    expect(berekenGiftenaftrek({ drempelinkomen: 40000, gewoneGiften: 0, cultureleGiften: 0, periodiekeGiften: 2400 }).totaal).toBe(2400);
  });
});

describe('zorgkostenaftrek 2026', () => {
  it('drempeltabel zonder partner', () => {
    expect(zorgkostenDrempel(8000, false)).toBe(166);
    expect(zorgkostenDrempel(30000, false)).toBeCloseTo(495, 2); // 1,65%
    expect(zorgkostenDrempel(60000, false)).toBeCloseTo(848 + 8589 * 0.0575, 2);
  });
  it('drempel met partner: € 332 tot € 19.360', () => expect(zorgkostenDrempel(15000, true)).toBe(332));
  it('verhoging 40% onder € 41.123', () => {
    // kosten 2.000 + 40% = 2.800 − drempel 495 = 2.305
    expect(berekenZorgkostenaftrek({ drempelinkomen: 30000, partner: false, aow: false, kostenMetVerhoging: 2000, kostenZonderVerhoging: 0 }).aftrek).toBe(2305);
  });
  it('verhoging 113% bij AOW', () => {
    expect(berekenZorgkostenaftrek({ drempelinkomen: 30000, partner: false, aow: true, kostenMetVerhoging: 1000, kostenZonderVerhoging: 0 }).verhoging).toBe(1130);
  });
  it('geen verhoging boven € 41.123', () => {
    expect(berekenZorgkostenaftrek({ drempelinkomen: 45000, partner: false, aow: false, kostenMetVerhoging: 2000, kostenZonderVerhoging: 500 }).verhoging).toBe(0);
  });
});

describe('jaarruimte 2026', () => {
  it('zzp\'er zonder pensioen, € 60.000', () => {
    // 30% × (60.000 − 19.172) = 12.248,40
    expect(berekenJaarruimte({ inkomenVorigJaar: 60000, factorA: 0, pensioenpremie: 0, stortingFor: 0 }).jaarruimte).toBeCloseTo(12248.4, 2);
  });
  it('werknemer met factor A € 800', () => {
    // 12.248,40 − 6,27 × 800 = 7.232,40
    expect(berekenJaarruimte({ inkomenVorigJaar: 60000, factorA: 800, pensioenpremie: 0, stortingFor: 0 }).jaarruimte).toBeCloseTo(7232.4, 2);
  });
  it('maximaal € 35.589 boven de aftoppingsgrens', () => {
    // 30% × 118.628 = 35.588,40; de Belastingdienst publiceert dit afgerond als € 35.589
    expect(berekenJaarruimte({ inkomenVorigJaar: 200000, factorA: 0, pensioenpremie: 0, stortingFor: 0 }).jaarruimte).toBeCloseTo(35588.4, 2);
  });
  it('geen negatieve jaarruimte', () => {
    expect(berekenJaarruimte({ inkomenVorigJaar: 40000, factorA: 2000, pensioenpremie: 0, stortingFor: 0 }).jaarruimte).toBe(0);
  });
});

describe('loonkosten werkgever 2026', () => {
  it('€ 3.500 bruto, vast contract, kleine werkgever, Whk 1,17%', () => {
    // bruto 45.360; AWf 2,74% 1.242,86; Aof 6,27% 2.844,07; Wko 0,5% 226,80; Whk 1,17% 530,71; Zvw 6,10% 2.766,96
    const r = berekenLoonkosten({ brutoMaand: 3500, vakantiegeld: true, dertiendeMaand: false, vastContract: true, kleineWerkgever: true, whk: 0.0117, pensioenWerkgeverPct: 0 });
    expect(r.awf).toBeCloseTo(1242.86, 1);
    expect(r.zvw).toBeCloseTo(2766.96, 1);
    expect(r.premiesTotaal).toBeCloseTo(7611.41, 0);
    expect(r.loonkostenJaar).toBeCloseTo(52971.41, 0);
  });
  it('premies over maximaal € 79.409', () => {
    const r = berekenLoonkosten({ brutoMaand: 8000, vakantiegeld: true, dertiendeMaand: false, vastContract: true, kleineWerkgever: true, whk: 0.01, pensioenWerkgeverPct: 0 });
    expect(r.premieloon).toBe(79409);
  });
  it('flexcontract kost meer WW-premie', () => {
    const vast = berekenLoonkosten({ brutoMaand: 3000, vakantiegeld: true, dertiendeMaand: false, vastContract: true, kleineWerkgever: true, whk: 0.01, pensioenWerkgeverPct: 0 });
    const flex = berekenLoonkosten({ brutoMaand: 3000, vakantiegeld: true, dertiendeMaand: false, vastContract: false, kleineWerkgever: true, whk: 0.01, pensioenWerkgeverPct: 0 });
    expect(flex.awf - vast.awf).toBeCloseTo(38880 * 0.05, 1);
  });
});

describe('AOW-leeftijd', () => {
  const iso = (d: Date | null) => d?.toISOString().slice(0, 10);
  it('geboren 15 maart 1959: 67 jaar, 15 maart 2026', () => expect(iso(berekenAowDatum(new Date(Date.UTC(1959, 2, 15))).datum)).toBe('2026-03-15'));
  it('geboren 1 november 1960: 67 jaar, 1 november 2027', () => expect(iso(berekenAowDatum(new Date(Date.UTC(1960, 10, 1))).datum)).toBe('2027-11-01'));
  it('geboren 10 januari 1961: 67 jaar en 3 maanden, 10 april 2028', () => {
    const r = berekenAowDatum(new Date(Date.UTC(1961, 0, 10)));
    expect(r.leeftijdMaand).toBe(3);
    expect(iso(r.datum)).toBe('2028-04-10');
  });
  it('geboren 1 juni 1964: 2031', () => expect(iso(berekenAowDatum(new Date(Date.UTC(1964, 5, 1))).datum)).toBe('2031-09-01'));
  it('later geboren: nog niet vastgesteld', () => expect(berekenAowDatum(new Date(Date.UTC(1970, 0, 1))).bekend).toBe(false));
});

import { berekenBijtelling } from '../src/lib/calculators/bijtelling';
describe('bijtelling per jaar van eerste toelating (cijferbijlage loonheffingen 2026)', () => {
  it('elektrisch 2025: 17% tot € 30.000', () => expect(berekenBijtelling({ cataloguswaarde: 40000, aandrijving: 'elektrisch', jaarToelating: '2025' }).bijtellingJaar).toBe(30000 * 0.17 + 10000 * 0.22));
  it('elektrisch 2022: 16% tot € 35.000', () => expect(berekenBijtelling({ cataloguswaarde: 40000, aandrijving: 'elektrisch', jaarToelating: '2022' }).bijtellingJaar).toBe(35000 * 0.16 + 5000 * 0.22));
  it('elektrisch 2021 binnen 60 maanden: 12% tot € 40.000', () => expect(berekenBijtelling({ cataloguswaarde: 45000, aandrijving: 'elektrisch', jaarToelating: '2021-binnen-60' }).bijtellingJaar).toBeCloseTo(40000 * 0.12 + 5000 * 0.22, 2));
  it('benzine vóór 2017: 25%', () => expect(berekenBijtelling({ cataloguswaarde: 30000, aandrijving: 'brandstof', jaarToelating: 'voor-2017' }).bijtellingJaar).toBe(7500));
  it('waterstof: korting zonder CAP', () => expect(berekenBijtelling({ cataloguswaarde: 60000, aandrijving: 'waterstof', jaarToelating: '2025' }).bijtellingJaar).toBeCloseTo(60000 * 0.17, 2));
});
