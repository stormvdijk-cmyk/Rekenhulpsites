import { describe, expect, it } from 'vitest';
import { berekenKia } from '../src/lib/calculators/kia';
import { brutoBpm, berekenBpm, forfaitaireAfschrijving } from '../src/lib/calculators/bpm';
import { berekenExpat, vergoedingUitTotaal } from '../src/lib/calculators/expat';
import { berekenWkr } from '../src/lib/calculators/wkr';
import { berekenGebruikelijkLoon } from '../src/lib/calculators/gebruikelijkLoon';
import { berekenEnergiebelasting } from '../src/lib/calculators/energiebelasting';
import { berekenBelastingrente, dagen30360 } from '../src/lib/calculators/belastingrente';
import { berekenThuiswerk } from '../src/lib/calculators/thuiswerk';
import { berekenRenteaftrek, forfaitVolledig } from '../src/lib/calculators/eigenWoning';

const dt = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };

describe('KIA 2026', () => {
  it('volgt de tabel van de Belastingdienst', () => {
    expect(berekenKia(2900)).toBe(0);
    expect(berekenKia(2901)).toBeCloseTo(812.28, 2);
    expect(berekenKia(50000)).toBe(14000);
    expect(berekenKia(100000)).toBe(20072);
    expect(berekenKia(200000)).toBeCloseTo(20072 - 67254 * 0.0756, 2);
    expect(berekenKia(398237)).toBe(0);
  });
});

describe('Bpm 2026', () => {
  it('voorbeeld Belastingdienst: 130 g/km → € 8.157, dieseltoeslag € 7.004,63', () => {
    expect(brutoBpm(130, false).bruto).toBe(8157);
    expect(brutoBpm(130, true).dieseltoeslag).toBe(7004.63);
  });
  it('elektrische auto (0 g/km) betaalt het vaste bedrag € 687', () => {
    expect(brutoBpm(0, false).bruto).toBe(687);
  });
  it('forfaitaire afschrijving: 25-4-2025 tot 8-7-2026 → 39% (voorbeeld Belastingdienst)', () => {
    expect(forfaitaireAfschrijving(dt('2025-04-25'), dt('2026-07-08'))).toBe(39);
  });
  it('te betalen bpm wordt naar beneden afgerond (0,61 × € 3.832 = € 2.337)', () => {
    expect(Math.floor(0.61 * 3832)).toBe(2337);
    const r = berekenBpm({ co2: 130, diesel: false, gebruikt: true, eersteToelating: dt('2025-04-25'), keuring: dt('2026-07-08') });
    expect(r.teBetalen).toBe(Math.floor(0.61 * 8157));
  });
});

describe('Expatregeling 2026', () => {
  it('voorbeeld 3: € 50.000 exclusief vergoeding → € 21.428', () => {
    expect(berekenExpat({ salaris: 50000, jongMaster: false, maanden: 12 }).maxVergoeding).toBe(21428);
  });
  it('voorbeeld 1: totaal € 70.000 → € 21.000', () => {
    expect(vergoedingUitTotaal(70000, false)).toBe(21000);
  });
  it('voorbeeld 2: totaal € 50.000 → loon zonder vergoeding moet boven € 48.013 blijven', () => {
    expect(vergoedingUitTotaal(50000, false)).toBe(1986);
  });
  it('plafond € 78.600, tijdsevenredig, en de salarisnorm', () => {
    expect(berekenExpat({ salaris: 300000, jongMaster: false, maanden: 12 }).maxVergoeding).toBe(78600);
    expect(berekenExpat({ salaris: 300000, jongMaster: false, maanden: 6 }).maxVergoeding).toBe(39300);
    expect(berekenExpat({ salaris: 45000, jongMaster: false, maanden: 12 }).maxVergoeding).toBe(0);
    expect(berekenExpat({ salaris: 45000, jongMaster: true, maanden: 12 }).maxVergoeding).toBe(19285);
  });
});

describe('Werkkostenregeling 2026', () => {
  it('voorbeeld Belastingdienst: € 1.000.000 loon → vrije ruimte € 15.080', () => {
    expect(berekenWkr(1000000, 0).vrijeRuimte).toBe(15080);
  });
  it('80% eindheffing over de overschrijding', () => {
    const r = berekenWkr(200000, 5000);
    expect(r.vrijeRuimte).toBe(4000);
    expect(r.eindheffing).toBe(800);
  });
});

describe('Gebruikelijk loon 2026', () => {
  it('minimaal € 58.000', () => {
    expect(berekenGebruikelijkLoon({ vergelijkbaar: 50000, hoogsteWerknemer: 0, lagerAannemelijk: false }).loon).toBe(58000);
  });
  it('hoogste van vergelijkbaar en meestverdienende werknemer', () => {
    expect(berekenGebruikelijkLoon({ vergelijkbaar: 70000, hoogsteWerknemer: 80000, lagerAannemelijk: false }).loon).toBe(80000);
  });
  it('lager als dat aannemelijk is', () => {
    expect(berekenGebruikelijkLoon({ vergelijkbaar: 45000, hoogsteWerknemer: 0, lagerAannemelijk: true }).loon).toBe(45000);
  });
});

describe('Energiebelasting 2026', () => {
  it('2.500 kWh en 1.000 m³ met vermindering, plus 21% btw', () => {
    const r = berekenEnergiebelasting({ kwh: 2500, m3: 1000, verblijfsfunctie: true });
    expect(r.elektriciteit).toBeCloseTo(229.03, 2);
    expect(r.gas).toBeCloseTo(600.66, 2);
    expect(r.totaalExBtw).toBeCloseTo(229.025 + 600.66 - 519.8, 2);
    expect(r.totaalInclBtw).toBeCloseTo((229.025 + 600.66 - 519.8) * 1.21, 2);
  });
  it('tweede schijf elektriciteit boven 10.000 kWh', () => {
    expect(berekenEnergiebelasting({ kwh: 12000, m3: 0, verblijfsfunctie: false }).elektriciteit).toBeCloseTo(10000 * 0.09161 + 2000 * 0.06671, 2);
  });
});

describe('Belastingrente (voorbeelden Belastingdienst)', () => {
  it('30/360: 1 juli t/m 13 september = 73 dagen', () => {
    expect(dagen30360(dt('2024-07-01'), dt('2024-09-13'))).toBe(73);
  });
  it('te laat, ongewijzigd: max 19 weken na aangifte → € 15', () => {
    const r = berekenBelastingrente({ soort: 'betalen', bedrag: 1000, belastingjaar: 2023, aangifte: dt('2024-05-03'), aanslag: dt('2024-12-04'), afwijking: false });
    expect(r.tot).toBe('2024-09-13');
    expect(r.rente).toBe(15);
  });
  it('afwijking: tot 6 weken na de aanslag, over twee jaren → € 93 + € 9 = € 102', () => {
    const r = berekenBelastingrente({ soort: 'betalen', bedrag: 2500, belastingjaar: 2023, aangifte: dt('2024-04-28'), aanslag: dt('2024-12-11'), afwijking: true });
    expect(r.tot).toBe('2025-01-22');
    expect(r.delen.map((x) => x.rente)).toEqual([93, 9]);
    expect(r.rente).toBe(102);
  });
  it('op tijd en ongewijzigd: geen rente', () => {
    expect(berekenBelastingrente({ soort: 'betalen', bedrag: 1000, belastingjaar: 2023, aangifte: dt('2024-04-30'), aanslag: dt('2024-12-04'), afwijking: false }).rente).toBe(0);
  });
  it('ontvangen: 1 juli t/m 6 weken na de aanslag, afgerond naar boven', () => {
    const r = berekenBelastingrente({ soort: 'ontvangen', bedrag: 1000, belastingjaar: 2024, aangifte: dt('2025-03-10'), aanslag: dt('2025-07-15'), afwijking: false });
    expect(r.tot).toBe('2025-08-26');
    expect(r.delen[0].dagen).toBe(56);
    expect(r.rente).toBe(Math.ceil((56 / 360) * 0.065 * 1000));
  });
});

describe('Thuiswerkvergoeding 2026', () => {
  it('2 dagen thuis en 3 dagen 20 km reizen', () => {
    const r = berekenThuiswerk({ thuisDagen: 2, kantoorDagen: 3, kmEnkel: 20 });
    expect(r.thuisDagenJaar).toBe(86);
    expect(r.reisDagenJaar).toBe(128);
    expect(r.thuiswerkJaar).toBeCloseTo(86 * 2.45, 2);
    expect(r.reiskostenJaar).toBeCloseTo(128 * 40 * 0.25, 2);
  });
});

describe('Eigen woning 2026', () => {
  it('eigenwoningforfait in alle schijven', () => {
    expect(forfaitVolledig(10000)).toBe(0);
    expect(forfaitVolledig(60000)).toBe(150);
    expect(forfaitVolledig(400000)).toBe(1400);
    expect(forfaitVolledig(1500000)).toBe(4725 + 150000 * 0.0235);
  });
  it('Wet Hillen: voorbeeld Belastingdienst € 300 × 71,867% = € 216', () => {
    // forfait € 1.400 (WOZ € 400.000), rente € 1.100 → saldo € 300
    expect(berekenRenteaftrek({ woz: 400000, rente: 1100, inkomen: 50000 }).hillenAftrek).toBe(216);
  });
  it('renteaftrek in schijf 2 levert 37,56% op', () => {
    const r = berekenRenteaftrek({ woz: 400000, rente: 11400, inkomen: 60000 });
    expect(r.saldo).toBe(-10000);
    expect(r.belastingeffect).toBeCloseTo(-3756, 2);
  });
  it('tariefsaanpassing in de hoogste schijf: maximaal 37,56%', () => {
    const r = berekenRenteaftrek({ woz: 400000, rente: 11400, inkomen: 120000 });
    expect(r.belastingeffect).toBeCloseTo(-10000 * 0.495 + 11400 * (0.495 - 0.3756) - 1400 * 0, 0);
  });
});
