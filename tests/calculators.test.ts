import { describe, expect, it } from 'vitest';
import { algemeneHeffingskorting, arbeidskorting, box1Belasting } from '../src/lib/calculators/belasting';
import { berekenNettoSalaris } from '../src/lib/calculators/nettoSalaris';
import { maandloonNaarUurloon, uurloonNaarSalaris } from '../src/lib/calculators/uurloon';
import { btwVanExclusief, btwVanInclusief } from '../src/lib/calculators/btw';
import { berekenVakantiegeld } from '../src/lib/calculators/vakantiegeld';
import { korting, prijsVoorKorting, procentVan, procentueleVerandering, welkProcent } from '../src/lib/calculators/procenten';
import { berekenSamengesteldeRente } from '../src/lib/calculators/samengesteldeRente';
import { berekenLening } from '../src/lib/calculators/lening';
import { berekenInflatie, prijsindex } from '../src/lib/calculators/inflatie';
import { berekenZzpUurtarief, nettoUitWinst } from '../src/lib/calculators/zzpUurtarief';
import { berekenBijtelling } from '../src/lib/calculators/bijtelling';
import { parseGetal } from '../src/lib/calculators/format';

describe('belasting 2026 (handmatig nagerekend)', () => {
  it('box 1 over € 45.360', () => {
    // 38.883 × 35,75% + 6.477 × 37,56% = 13.900,67 + 2.432,76
    expect(box1Belasting(45360)).toBeCloseTo(16333.43, 1);
  });
  it('box 1 in drie schijven over € 100.000', () => {
    // 13.900,67 + 39.543 × 37,56% + 21.574 × 49,50% = 13.900,67 + 14.852,35 + 10.679,13
    expect(box1Belasting(100000)).toBeCloseTo(39432.15, 1);
  });
  it('algemene heffingskorting', () => {
    expect(algemeneHeffingskorting(20000)).toBe(3115);
    expect(algemeneHeffingskorting(45360)).toBeCloseTo(2115.38, 1);
    expect(algemeneHeffingskorting(80000)).toBe(0);
  });
  it('arbeidskorting per schijf', () => {
    expect(arbeidskorting(10000)).toBeCloseTo(832.4, 1);
    expect(arbeidskorting(20000)).toBeCloseTo(996 + 8035 * 0.31009, 1);
    expect(arbeidskorting(45592)).toBeCloseTo(5685, 0);
    expect(arbeidskorting(140000)).toBe(0);
  });
});

describe('netto salaris', () => {
  it('€ 3.500 bruto, met korting en vakantiegeld', () => {
    const r = berekenNettoSalaris({ brutoMaand: 3500, loonheffingskorting: true, vakantiegeld: true });
    expect(r.belastbaarJaar).toBe(45360);
    expect(r.loonheffingJaar).toBeCloseTo(8537.51, 0);
    expect(r.nettoJaar).toBeCloseTo(36822.49, 0);
  });
  it('€ 3.500 bruto, zonder loonheffingskorting', () => {
    const r = berekenNettoSalaris({ brutoMaand: 3500, loonheffingskorting: false, vakantiegeld: true });
    expect(r.loonheffingJaar).toBeCloseTo(16333.43, 0);
  });
  it('€ 2.000 bruto, geen vakantiegeld', () => {
    // 24.000 × 35,75% = 8.580; AHK 3.115; AK 996 + 12.035 × 31,009% = 4.727,93; belasting 737,07
    const r = berekenNettoSalaris({ brutoMaand: 2000, loonheffingskorting: true, vakantiegeld: false });
    expect(r.loonheffingJaar).toBeCloseTo(737.07, 0);
    expect(r.nettoMaand).toBeCloseTo((24000 - 737.07) / 12, 0);
  });
  it('kortingen worden niet uitbetaald bij laag loon', () => {
    const r = berekenNettoSalaris({ brutoMaand: 800, loonheffingskorting: true, vakantiegeld: false });
    expect(r.loonheffingJaar).toBe(0);
    expect(r.nettoJaar).toBe(9600);
  });
});

describe('uurloon', () => {
  it('€ 20 per uur, 40 uur', () => {
    const r = uurloonNaarSalaris(20, 40);
    expect(r.jaarloon).toBe(41600);
    expect(r.maandloon).toBeCloseTo(3466.67, 2);
  });
  it('€ 15 per uur, 24 uur, met vakantiegeld', () => {
    expect(uurloonNaarSalaris(15, 24).jaarloonMetVakantiegeld).toBeCloseTo(15 * 24 * 52 * 1.08, 2);
  });
  it('€ 3.000 per maand bij 36 uur naar uurloon', () => {
    // 36.000 / 52 / 36 = 19,23
    expect(maandloonNaarUurloon(3000, 36).uurloon).toBeCloseTo(19.23, 2);
  });
});

describe('btw', () => {
  it('€ 100 exclusief 21%', () => expect(btwVanExclusief(100, 0.21)).toMatchObject({ btw: 21, inclusief: 121 }));
  it('€ 121 inclusief 21%', () => expect(btwVanInclusief(121, 0.21)).toMatchObject({ exclusief: 100, btw: 21 }));
  it('€ 54,50 inclusief 9%', () => expect(btwVanInclusief(54.5, 0.09)).toMatchObject({ exclusief: 50, btw: 4.5 }));
  it('€ 250 exclusief 9%', () => expect(btwVanExclusief(250, 0.09).inclusief).toBe(272.5));
});

describe('vakantiegeld', () => {
  it('8% van € 3.500 per maand', () => expect(berekenVakantiegeld(3500).vakantiegeldBruto).toBe(3360));
  it('netto vakantiegeld bij € 3.500', () => {
    // zonder vg (42.000): box1 15.071,42 − AHK 2.330,35 − AK 5.615,02 = 7.126,05
    // met vg (45.360): 8.537,51 → extra belasting 1.411,46 → netto vg 3.360 − 1.411,46 = 1.948,54
    const r = berekenVakantiegeld(3500);
    expect(r.vakantiegeldNetto).toBeCloseTo(1948.54, 0);
  });
  it('ander percentage', () => expect(berekenVakantiegeld(2500, 0.1).vakantiegeldBruto).toBe(3000));
});

describe('procenten', () => {
  it('15% van 80', () => expect(procentVan(15, 80)).toBe(12));
  it('30 van 120 is 25%', () => expect(welkProcent(30, 120)).toBe(25));
  it('stijging 80 → 100 is 25%', () => expect(procentueleVerandering(80, 100)).toBe(25));
  it('daling 100 → 80 is −20%', () => expect(procentueleVerandering(100, 80)).toBe(-20));
  it('25% korting op € 60', () => expect(korting(60, 25)).toEqual({ korting: 15, nieuwePrijs: 45 }));
  it('prijs voor korting', () => expect(prijsVoorKorting(45, 25)).toBe(60));
});

describe('samengestelde rente', () => {
  it('€ 10.000, 5%, 10 jaar, geen inleg', () => {
    expect(berekenSamengesteldeRente({ startbedrag: 10000, maandInleg: 0, rente: 5, jaren: 10 }).eindsaldo).toBeCloseTo(16288.95, 1);
  });
  it('zonder rente is eindsaldo de som van de inleg', () => {
    expect(berekenSamengesteldeRente({ startbedrag: 1000, maandInleg: 100, rente: 0, jaren: 5 }).eindsaldo).toBe(7000);
  });
  it('€ 100 per maand, 6%, 20 jaar', () => {
    // annuïteit met effectieve maandrente i = 1,06^(1/12) − 1: 100 × ((1+i)^240 − 1) / i
    const i = Math.pow(1.06, 1 / 12) - 1;
    const verwacht = (100 * (Math.pow(1 + i, 240) - 1)) / i;
    const r = berekenSamengesteldeRente({ startbedrag: 0, maandInleg: 100, rente: 6, jaren: 20 });
    expect(r.eindsaldo).toBeCloseTo(verwacht, 1);
    expect(r.perJaar).toHaveLength(20);
    expect(r.totaalIngelegd).toBe(24000);
  });
});

describe('lening', () => {
  it('annuïtair € 10.000, 6%, 60 maanden', () => {
    const r = berekenLening({ bedrag: 10000, rente: 6, looptijdMaanden: 60, vorm: 'annuitair' });
    expect(r.eersteTermijn).toBeCloseTo(193.33, 2);
    expect(r.schema[59].restschuld).toBe(0);
  });
  it('lineair € 12.000, 6%, 12 maanden', () => {
    const r = berekenLening({ bedrag: 12000, rente: 6, looptijdMaanden: 12, vorm: 'lineair' });
    expect(r.eersteTermijn).toBe(1060);
    expect(r.laatsteTermijn).toBe(1005);
    expect(r.totaleRente).toBe(390);
  });
  it('0% rente', () => {
    const r = berekenLening({ bedrag: 1200, rente: 0, looptijdMaanden: 12, vorm: 'annuitair' });
    expect(r.eersteTermijn).toBe(100);
    expect(r.totaleRente).toBe(0);
  });
});

describe('inflatie (CBS)', () => {
  it('index 2021 → 2022 is +10%', () => expect(prijsindex(2022) / prijsindex(2021)).toBeCloseTo(1.1, 6));
  it('€ 100 in 2020 naar 2025', () => {
    // 1,027 × 1,10 × 1,038 × 1,033 × 1,033
    const f = 1.027 * 1.1 * 1.038 * 1.033 * 1.033;
    expect(berekenInflatie(100, 2020, 2025).gecorrigeerd).toBeCloseTo(100 * f, 2);
  });
  it('terug in de tijd', () => {
    expect(berekenInflatie(110, 2022, 2021).gecorrigeerd).toBe(100);
  });
  it('buiten bereik geeft fout', () => expect(() => berekenInflatie(100, 1950, 2020)).toThrow());
});

describe('zzp-uurtarief', () => {
  it('netto uit € 50.000 winst met urencriterium', () => {
    // aftrek 1.200, mkb 12,7% × 48.800 = 6.197,60, belastbaar 42.602,40
    // box1 13.900,67 + 3.719,40 × 37,56% = 15.297,64
    // AHK 3.115 − 6,398% × 12.866,40 = 2.291,80; AK 5.685 − 6,51% × 4.408 = 5.398,04
    // IB 7.607,83; Zvw 4,85% × 42.602,40 = 2.066,22; netto 40.325,95
    const f = nettoUitWinst(50000, true, false);
    expect(f.belastbaar).toBeCloseTo(42602.4, 1);
    expect(f.inkomstenbelasting).toBeCloseTo(7607.83, 1);
    expect(f.netto).toBeCloseTo(40325.95, 1);
  });
  it('terugrekenen geeft dezelfde winst', () => {
    const r = berekenZzpUurtarief({ nettoPerMaand: 40325.98 / 12, kostenPerJaar: 0, reserveringPerMaand: 0, werkwekenPerJaar: 46, urenPerWeek: 40, declarabelPct: 100, urencriterium: true, starter: false });
    expect(r.benodigdeWinst).toBeCloseTo(50000, -1);
  });
  it('uurtarief = omzet / declarabele uren', () => {
    const r = berekenZzpUurtarief({ nettoPerMaand: 3000, kostenPerJaar: 5000, reserveringPerMaand: 500, werkwekenPerJaar: 46, urenPerWeek: 40, declarabelPct: 75, urencriterium: true, starter: false });
    expect(r.declarabeleUren).toBe(1380);
    expect(r.uurtarief).toBeCloseTo(r.benodigdeOmzet / 1380, 2);
    expect(r.nettoPerJaar).toBeCloseTo(42000, 0);
  });
});

describe('bijtelling', () => {
  it('benzineauto € 40.000 → 22%', () => {
    const r = berekenBijtelling({ cataloguswaarde: 40000, aandrijving: 'brandstof' });
    expect(r.bijtellingJaar).toBe(8800);
    expect(r.bijtellingMaand).toBeCloseTo(733.33, 2);
  });
  it('elektrisch € 50.000 → 18% tot 30.000 + 22% daarboven', () => {
    const r = berekenBijtelling({ cataloguswaarde: 50000, aandrijving: 'elektrisch' });
    expect(r.bijtellingJaar).toBe(5400 + 4400);
    expect(r.perSchijf[1].nettoPerMaand).toBeCloseTo((9800 * 0.3756) / 12, 2);
  });
  it('eigen bijdrage verlaagt de bijtelling', () => {
    const r = berekenBijtelling({ cataloguswaarde: 25000, aandrijving: 'elektrisch', eigenBijdrageMaand: 100 });
    expect(r.bijtellingJaar).toBe(4500 - 1200);
  });
});

describe('parseGetal', () => {
  it('leest Nederlandse notatie', () => {
    expect(parseGetal('1.234,56')).toBe(1234.56);
    expect(parseGetal('3500')).toBe(3500);
    expect(parseGetal('12,5')).toBe(12.5);
    expect(parseGetal('€ 40.000')).toBe(40000);
    expect(parseGetal('1234.5')).toBe(1234.5);
  });
});
