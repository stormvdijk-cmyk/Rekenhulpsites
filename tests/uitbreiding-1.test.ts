import { describe, expect, it } from 'vitest';
import { berekenOverdrachtsbelasting } from '../src/lib/calculators/overdrachtsbelasting';
import { berekenBox3 } from '../src/lib/calculators/box3';
import { berekenErfbelasting, berekenSchenkbelasting } from '../src/lib/calculators/schenkErf';
import { aftrekTarief, berekenHypotheek, eigenwoningforfait } from '../src/lib/calculators/hypotheek';
import { berekenKilometervergoeding } from '../src/lib/calculators/kilometervergoeding';

const k = (leeftijd: number, eerderGebruikt = false) => ({ leeftijd, eerderGebruikt });

describe('overdrachtsbelasting 2026', () => {
  it('starter van 30 onder de grens betaalt niets', () => {
    expect(berekenOverdrachtsbelasting({ koopsom: 400000, soort: 'woning', zelfBewonen: true, kopers: [k(30)] }).totaal).toBe(0);
  });
  it('koper van 40 die zelf gaat wonen: 2%', () => {
    expect(berekenOverdrachtsbelasting({ koopsom: 400000, soort: 'woning', zelfBewonen: true, kopers: [k(40)] }).totaal).toBe(8000);
  });
  it('woning niet zelf bewonen: 8%', () => {
    expect(berekenOverdrachtsbelasting({ koopsom: 400000, soort: 'woning', zelfBewonen: false, kopers: [k(30)] }).totaal).toBe(32000);
  });
  it('bedrijfspand: 10,4%', () => {
    expect(berekenOverdrachtsbelasting({ koopsom: 400000, soort: 'overig', zelfBewonen: false, kopers: [k(30)] }).totaal).toBe(41600);
  });
  it('twee kopers: 30 en 40 jaar, ieder de helft', () => {
    // 30-jarige: € 200.000 × 0% ; 40-jarige: € 200.000 × 2% = € 4.000
    expect(berekenOverdrachtsbelasting({ koopsom: 400000, soort: 'woning', zelfBewonen: true, kopers: [k(30), k(40)] }).totaal).toBe(4000);
  });
  it('starter boven de woningwaardegrens betaalt 2% over alles', () => {
    expect(berekenOverdrachtsbelasting({ koopsom: 600000, soort: 'woning', zelfBewonen: true, kopers: [k(28)] }).totaal).toBe(12000);
  });
  it('35 jaar valt buiten de startersvrijstelling', () => {
    expect(berekenOverdrachtsbelasting({ koopsom: 300000, soort: 'woning', zelfBewonen: true, kopers: [k(35)] }).totaal).toBe(6000);
  });
});

describe('box 3 2026', () => {
  it('€ 100.000 spaargeld + € 50.000 beleggingen, geen partner', () => {
    // rendement 1.280 + 3.000 = 4.280; grondslag 150.000 − 59.357 = 90.643
    // voordeel 90.643 × 4.280 / 150.000 = 2.586,35; belasting 36% = 931,08
    const r = berekenBox3({ banktegoeden: 100000, overigeBezittingen: 50000, schulden: 0, partner: false });
    expect(r.grondslag).toBe(90643);
    expect(r.voordeel).toBeCloseTo(2586.35, 2);
    expect(r.belasting).toBeCloseTo(931.08, 2);
  });
  it('partners met € 150.000 spaargeld en € 10.000 schuld', () => {
    // schulden 10.000 − 7.600 = 2.400; rendement 1.920 − 64,80 = 1.855,20
    // rendementsgrondslag 147.600; grondslag 147.600 − 118.714 = 28.886
    // voordeel 28.886 × 1.855,20 / 147.600 = 363,07; belasting 130,71
    const r = berekenBox3({ banktegoeden: 150000, overigeBezittingen: 0, schulden: 10000, partner: true });
    expect(r.aftrekbareSchulden).toBe(2400);
    expect(r.voordeel).toBeCloseTo(363.07, 2);
    expect(r.belasting).toBeCloseTo(130.71, 2);
  });
  it('onder het heffingsvrij vermogen: geen belasting', () => {
    expect(berekenBox3({ banktegoeden: 50000, overigeBezittingen: 0, schulden: 0, partner: false }).belasting).toBe(0);
  });
});

describe('schenkbelasting 2026', () => {
  it('€ 20.000 aan een kind', () => {
    // 20.000 − 6.908 = 13.092 × 10% = 1.309,20
    expect(berekenSchenkbelasting(20000, 'kind').belasting).toBeCloseTo(1309.2, 2);
  });
  it('€ 10.000 aan een kleinkind', () => {
    // 10.000 − 2.769 = 7.231 × 18% = 1.301,58
    expect(berekenSchenkbelasting(10000, 'kleinkind').belasting).toBeCloseTo(1301.58, 2);
  });
  it('€ 200.000 aan een vriend (twee schijven)', () => {
    // 197.231: 158.669 × 30% = 47.600,70 + 38.562 × 40% = 15.424,80
    expect(berekenSchenkbelasting(200000, 'overig').belasting).toBeCloseTo(63025.5, 2);
  });
  it('eenmalig verhoogd € 33.129 aan kind is vrijgesteld', () => {
    expect(berekenSchenkbelasting(33129, 'kindEenmalig').belasting).toBe(0);
  });
});

describe('erfbelasting 2026', () => {
  it('kind erft € 100.000', () => {
    // 100.000 − 26.230 = 73.770 × 10% = 7.377
    expect(berekenErfbelasting(100000, 'kind').belasting).toBeCloseTo(7377, 2);
  });
  it('partner erft € 1.000.000', () => {
    // 1.000.000 − 828.035 = 171.965: 158.669 × 10% + 13.296 × 20% = 15.866,90 + 2.659,20
    expect(berekenErfbelasting(1000000, 'partner').belasting).toBeCloseTo(18526.1, 2);
  });
  it('ouder erft € 100.000 (tarief overige verkrijgers)', () => {
    // 100.000 − 62.110 = 37.890 × 30% = 11.367
    expect(berekenErfbelasting(100000, 'ouder').belasting).toBeCloseTo(11367, 2);
  });
});

describe('hypotheek 2026', () => {
  it('eigenwoningforfait', () => {
    expect(eigenwoningforfait(350000)).toBeCloseTo(1225, 2);
    expect(eigenwoningforfait(1500000)).toBeCloseTo(4725 + 150000 * 0.0235, 2);
    expect(eigenwoningforfait(50000)).toBeNull();
  });
  it('aftrektarief is je schijf, maximaal 37,56%', () => {
    expect(aftrekTarief(30000)).toBe(0.3575);
    expect(aftrekTarief(60000)).toBe(0.3756);
    expect(aftrekTarief(150000)).toBe(0.3756);
  });
  it('€ 300.000 annuïtair, 4%, 30 jaar, WOZ € 350.000, inkomen € 60.000', () => {
    // bruto 1.432,25; rente maand 1 = 1.000; forfait 1.225 / 12 = 102,08
    // voordeel (1.000 − 102,08) × 37,56% = 337,26; netto 1.094,99
    const r = berekenHypotheek({ bedrag: 300000, rente: 4, looptijdMaanden: 360, vorm: 'annuitair', woz: 350000, brutoJaarinkomen: 60000 });
    expect(r.brutoEersteMaand).toBeCloseTo(1432.25, 2);
    expect(r.nettoEersteMaand).toBeCloseTo(1094.99, 1);
  });
});

describe('kilometervergoeding 2026', () => {
  it('20 km enkele reis, 5 dagen', () => {
    // 214 dagen × 40 km = 8.560 km × € 0,25 = € 2.140 per jaar
    const r = berekenKilometervergoeding({ kmEnkel: 20, dagenPerWeek: 5, vergoedingPerKm: 0.25 });
    expect(r.kmJaar).toBe(8560);
    expect(r.onbelastJaar).toBe(2140);
    expect(r.onbelastMaand).toBeCloseTo(178.33, 2);
  });
  it('3 dagen per week: 128 reisdagen', () => {
    expect(berekenKilometervergoeding({ kmEnkel: 10, dagenPerWeek: 3, vergoedingPerKm: 0.25 }).reisdagenJaar).toBe(128);
  });
  it('werkgever geeft € 0,30: het meerdere is belast', () => {
    // 8.560 × 0,30 = 2.568; belast 2.568 − 2.140 = 428
    expect(berekenKilometervergoeding({ kmEnkel: 20, dagenPerWeek: 5, vergoedingPerKm: 0.3 }).belastDeelJaar).toBe(428);
  });
});
