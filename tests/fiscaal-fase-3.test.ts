import { describe, expect, it } from 'vitest';
import { nettoNaarBruto } from '../src/lib/calculators/nettoNaarBruto';
import { berekenBonus } from '../src/lib/calculators/bonus';
import { vergelijkLoondienstZzp } from '../src/lib/calculators/loondienstZzp';
import { berekenTransitievergoeding } from '../src/lib/calculators/transitievergoeding';
import { berekenDga, box2Belasting, vennootschapsbelasting } from '../src/lib/calculators/dga';
import { berekenKor } from '../src/lib/calculators/kor';
import { bijtellingNettoEffect } from '../src/lib/calculators/bijtellingExact';
import { nettoUitWinst } from '../src/lib/calculators/zzpUurtarief';

describe('netto naar bruto', () => {
  it('€ 2.906,16 netto ↔ € 3.500 bruto (terugrekenen)', () => {
    expect(nettoNaarBruto({ nettoMaand: 2906.16, loonheffingskorting: true, vakantiegeld: true }).gevondenBruto).toBeCloseTo(3500, 0);
  });
  it('€ 2.000 netto zonder loonheffingskorting vraagt meer bruto', () => {
    const met = nettoNaarBruto({ nettoMaand: 2000, loonheffingskorting: true, vakantiegeld: true }).gevondenBruto;
    const zonder = nettoNaarBruto({ nettoMaand: 2000, loonheffingskorting: false, vakantiegeld: true }).gevondenBruto;
    expect(zonder).toBeGreaterThan(met);
  });
  it('uitkomst geeft het gevraagde netto', () => {
    expect(nettoNaarBruto({ nettoMaand: 3000, loonheffingskorting: true, vakantiegeld: false }).nettoMaand).toBeCloseTo(3000, 1);
  });
});

describe('bonus en 13e maand', () => {
  it('€ 3.000 bonus bij € 3.500 bruto per maand', () => {
    // zonder: 8.537,51; met (48.360): box1 17.460,23 − AHK 1.923,44 − AK 5.504,80 = 10.031,99
    const r = berekenBonus({ brutoMaand: 3500, bonus: 3000, vakantiegeld: true, loonheffingskorting: true });
    expect(r.belasting).toBeCloseTo(1494.48, 1);
    expect(r.bonusNetto).toBeCloseTo(1505.52, 1);
  });
  it('geen bonus: niets', () => expect(berekenBonus({ brutoMaand: 3000, bonus: 0, vakantiegeld: true, loonheffingskorting: true }).bonusNetto).toBe(0));
  it('hogere bonus valt deels in 49,5%', () => {
    const r = berekenBonus({ brutoMaand: 6000, bonus: 10000, vakantiegeld: true, loonheffingskorting: true });
    // jaarloon 77.760 + 10.000: grotendeels in schijf 3 plus de afbouw van AHK en AK tot de nulpunten
    expect(r.effectiefTarief).toBeGreaterThan(49);
  });
});

describe('transitievergoeding 2026', () => {
  it('KvK-voorbeeld: 9 jaar, € 3.000', () => expect(berekenTransitievergoeding({ brutoMaand: 3000, jaren: 9, maanden: 0, vakantiegeld: false, dertiendeMaand: false }).vergoeding).toBe(9000));
  it('met vakantiegeld en 6 maanden extra', () => {
    // 3.240 / 3 × 9,5 = 10.260
    expect(berekenTransitievergoeding({ brutoMaand: 3000, jaren: 9, maanden: 6, vakantiegeld: true, dertiendeMaand: false }).vergoeding).toBeCloseTo(10260, 2);
  });
  it('maximum: € 102.000 of een jaarsalaris als dat hoger is', () => {
    const r = berekenTransitievergoeding({ brutoMaand: 10000, jaren: 40, maanden: 0, vakantiegeld: false, dertiendeMaand: false });
    expect(r.begrensd).toBe(true);
    expect(r.vergoeding).toBe(120000);
    expect(berekenTransitievergoeding({ brutoMaand: 7000, jaren: 45, maanden: 0, vakantiegeld: false, dertiendeMaand: false }).vergoeding).toBe(102000);
  });
});

describe('vennootschapsbelasting en box 2 (2026)', () => {
  it('Vpb over € 300.000', () => expect(vennootschapsbelasting(300000)).toBeCloseTo(38000 + 25800, 2));
  it('Vpb over € 100.000', () => expect(vennootschapsbelasting(100000)).toBeCloseTo(19000, 2));
  it('box 2 over € 100.000, geen partner', () => expect(box2Belasting(100000)).toBeCloseTo(26525.2, 1)); // 68.843 × 24,5% + 31.157 × 31%
  it('box 2 met partner: alles in 24,5%', () => expect(box2Belasting(100000, true)).toBeCloseTo(24500, 2));
  it('DGA: € 100.000 winst volledig uitkeren', () => {
    // Vpb 19.000; dividend 81.000: 16.866,535 + 12.157 × 31% = 20.635,205 → 20.635,21; netto 60.364,79
    const r = berekenDga({ winstVoorBelasting: 100000, uitkeerPct: 100, partner: false });
    expect(r.box2).toBe(20635.21);
    expect(r.nettoDividend).toBe(60364.79);
    expect(r.totaleDruk).toBeCloseTo(39.64, 1);
  });
});

describe('KOR', () => {
  it('particuliere klanten: btw blijft bij jou', () => {
    const r = berekenKor({ omzet: 18000, voorbelasting: 500, particulierPct: 100, tarief: 0.21 });
    expect(r.magKor).toBe(true);
    expect(r.voordeel).toBe(3780 - 500);
  });
  it('alleen zakelijke klanten: KOR kost je de voorbelasting', () => {
    expect(berekenKor({ omzet: 18000, voorbelasting: 500, particulierPct: 0, tarief: 0.21 }).voordeel).toBe(-500);
  });
  it('boven € 20.000 geen KOR', () => expect(berekenKor({ omzet: 25000, voorbelasting: 0, particulierPct: 50, tarief: 0.21 }).magKor).toBe(false));
});

describe('bijtelling exact', () => {
  it('€ 9.900 bijtelling bij € 3.500 bruto', () => {
    // 55.260: box1 20.051,87 − AHK 1.481,97 − AK 5.055,61 = 13.514,29; − 8.537,51 = 4.976,78
    const r = bijtellingNettoEffect(3500, 9900);
    expect(r.perJaar).toBeCloseTo(4976.78, 1);
    expect(r.perMaand).toBeCloseTo(414.73, 1);
  });
  it('bij een hoog salaris (schijf 3, voorbij de afbouw) is het 49,5%', () => {
    expect(bijtellingNettoEffect(12000, 6000).effectiefTarief).toBeCloseTo(49.5, 1);
  });
});

describe('loondienst vs zzp', () => {
  it('break-even tarief levert hetzelfde netto op', () => {
    const r = vergelijkLoondienstZzp({ brutoMaand: 3500, pensioenpremieMaand: 0, uurtarief: 60, declarabeleUren: 1300, kostenPerJaar: 5000, zzpReserveringJaar: 6000 });
    expect(r.werknemerNettoJaar).toBeCloseTo(36822.49, 1);
    const winst = r.breakEvenTarief * 1300 - 5000;
    expect(nettoUitWinst(winst, true, false).netto - 6000).toBeCloseTo(36822.49, -1);
  });
  it('omzet en verschil kloppen', () => {
    const r = vergelijkLoondienstZzp({ brutoMaand: 3500, pensioenpremieMaand: 0, uurtarief: 60, declarabeleUren: 1300, kostenPerJaar: 5000, zzpReserveringJaar: 6000 });
    expect(r.zzpOmzet).toBe(78000);
    expect(r.zzpWinst).toBe(73000);
    expect(r.verschil).toBeCloseTo(r.zzpBesteedbaarJaar - r.werknemerNettoJaar, 2);
  });
});
