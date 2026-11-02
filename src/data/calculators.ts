export type Categorie = 'Werk & salaris' | 'Belastingen' | 'Schenken & erven' | 'Wonen' | 'Sparen & lenen' | 'Ondernemen' | 'Handig rekenen';

export interface Rekenhulp {
  slug: string;
  titel: string;
  kort: string;
  categorie: Categorie;
  verwant: string[];
  trefwoorden: string;
}

export const CATEGORIEEN: Categorie[] = ['Werk & salaris', 'Belastingen', 'Wonen', 'Sparen & lenen', 'Ondernemen', 'Schenken & erven', 'Handig rekenen'];

export interface Onderwerp { naam: Categorie; omschrijving: string; icoon: string }

/** Onderwerpen op de homepage, met korte uitleg en een eenvoudig icoon (SVG-pad, 24×24). */
export const ONDERWERPEN: Onderwerp[] = [
  { naam: 'Werk & salaris', omschrijving: 'Loon, uitkeringen en vergoedingen als werknemer.', icoon: 'M4 7h16v12H4zM9 7V5h6v2M4 12h16' },
  { naam: 'Belastingen', omschrijving: 'Inkomstenbelasting, kortingen en vermogensbelasting.', icoon: 'M6 3h9l3 3v15H6zM9 9h6M9 13h6M9 17h4' },
  { naam: 'Wonen', omschrijving: 'Een huis kopen en je hypotheek.', icoon: 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6' },
  { naam: 'Sparen & lenen', omschrijving: 'Sparen, rente, lenen en de waarde van geld.', icoon: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 8v8M9.5 10.5c0-1 1-1.5 2.5-1.5s2.5.6 2.5 1.6-1 1.4-2.5 1.4-2.5.4-2.5 1.5 1 1.5 2.5 1.5 2.5-.5 2.5-1.5' },
  { naam: 'Ondernemen', omschrijving: 'Voor zzp\'ers en ondernemers: tarief, netto en btw.', icoon: 'M4 20h16M7 16v-4M12 16V8M17 16V5' },
  { naam: 'Schenken & erven', omschrijving: 'Belasting over schenkingen en erfenissen.', icoon: 'M4 10h16v10H4zM12 10v10M4 14h16M12 10c-2-4-6-4-6-1 0 1 2 1 6 1zM12 10c2-4 6-4 6-1 0 1-2 1-6 1z' },
  { naam: 'Handig rekenen', omschrijving: 'Snel procenten en kortingen uitrekenen.', icoon: 'M6 18L18 6M8 8.5a1.5 1.5 0 1 0 0-.01M16 16.5a1.5 1.5 0 1 0 0-.01' },
];

export const REKENHULPEN: Rekenhulp[] = [
  { slug: 'netto-salaris-berekenen', titel: 'Netto salaris berekenen', kort: 'Van bruto naar netto per maand en per jaar.', categorie: 'Werk & salaris', verwant: ['inkomstenbelasting-berekenen', 'vakantiegeld-berekenen', 'bijtelling-auto-van-de-zaak'], trefwoorden: 'bruto netto loon salaris loonheffing heffingskorting pensioen aow' },
  { slug: 'bruto-netto-uurloon', titel: 'Uurloon naar maandsalaris', kort: 'Reken uurloon om naar maand- en jaarsalaris en terug.', categorie: 'Werk & salaris', verwant: ['netto-salaris-berekenen', 'vakantiegeld-berekenen', 'zzp-uurtarief-berekenen'], trefwoorden: 'uurloon maandloon jaarloon uren per week' },
  { slug: 'vakantiegeld-berekenen', titel: 'Vakantiegeld berekenen', kort: '8% vakantiegeld, bruto en netto.', categorie: 'Werk & salaris', verwant: ['netto-salaris-berekenen', 'bruto-netto-uurloon', 'procenten-berekenen'], trefwoorden: 'vakantiebijslag vakantiegeld 8 procent mei' },
  { slug: 'btw-berekenen', titel: 'Btw berekenen', kort: '21% en 9%, inclusief en exclusief btw.', categorie: 'Ondernemen', verwant: ['procenten-berekenen', 'zzp-uurtarief-berekenen', 'inflatie-berekenen'], trefwoorden: 'btw vat omzetbelasting 21 9 inclusief exclusief' },
  { slug: 'bijtelling-auto-van-de-zaak', titel: 'Bijtelling auto van de zaak', kort: 'Bijtelling per maand en het netto effect per schijf.', categorie: 'Werk & salaris', verwant: ['netto-salaris-berekenen', 'lening-maandlasten', 'zzp-uurtarief-berekenen'], trefwoorden: 'bijtelling leaseauto elektrisch cataloguswaarde' },
  { slug: 'inflatie-berekenen', titel: 'Inflatie berekenen', kort: 'Koopkracht van een bedrag tussen twee jaartallen.', categorie: 'Sparen & lenen', verwant: ['samengestelde-rente', 'procenten-berekenen', 'netto-salaris-berekenen'], trefwoorden: 'inflatie koopkracht cbs cpi prijzen geldontwaarding' },
  { slug: 'procenten-berekenen', titel: 'Procenten berekenen', kort: 'Percentage van, stijging of daling en korting.', categorie: 'Handig rekenen', verwant: ['btw-berekenen', 'inflatie-berekenen', 'samengestelde-rente'], trefwoorden: 'procent percentage korting stijging daling' },
  { slug: 'samengestelde-rente', titel: 'Samengestelde rente', kort: 'Sparen of beleggen met maandelijkse inleg, met grafiek.', categorie: 'Sparen & lenen', verwant: ['inflatie-berekenen', 'lening-maandlasten', 'procenten-berekenen'], trefwoorden: 'rente op rente sparen beleggen vermogen groei' },
  { slug: 'lening-maandlasten', titel: 'Maandlasten lening', kort: 'Annuïtair en lineair, met aflossingstabel.', categorie: 'Sparen & lenen', verwant: ['hypotheek-maandlasten-berekenen', 'samengestelde-rente', 'procenten-berekenen'], trefwoorden: 'lening krediet annuiteit lineair aflossing persoonlijke lening' },
  { slug: 'zzp-uurtarief-berekenen', titel: 'Zzp-uurtarief berekenen', kort: 'Van gewenst netto inkomen naar een minimaal uurtarief.', categorie: 'Ondernemen', verwant: ['zzp-netto-inkomen-berekenen', 'btw-berekenen', 'bruto-netto-uurloon'], trefwoorden: 'zzp freelancer uurtarief zelfstandige ondernemer' },
  { slug: 'kilometervergoeding-berekenen', titel: 'Kilometervergoeding berekenen', kort: 'Onbelaste reiskostenvergoeding voor woon-werkverkeer.', categorie: 'Werk & salaris', verwant: ['netto-salaris-berekenen', 'bijtelling-auto-van-de-zaak', 'bruto-netto-uurloon'], trefwoorden: 'reiskosten reiskostenvergoeding woon-werk kilometer 0,25' },
  { slug: 'box-3-belasting-berekenen', titel: 'Box 3-belasting berekenen', kort: 'Belasting over spaargeld en beleggingen.', categorie: 'Belastingen', verwant: ['samengestelde-rente', 'schenkbelasting-berekenen', 'inflatie-berekenen'], trefwoorden: 'box 3 vermogensbelasting spaargeld beleggingen heffingsvrij vermogen' },
  { slug: 'schenkbelasting-berekenen', titel: 'Schenkbelasting berekenen', kort: 'Belastingvrij schenken en de schenkbelasting.', categorie: 'Schenken & erven', verwant: ['erfbelasting-berekenen', 'box-3-belasting-berekenen', 'overdrachtsbelasting-berekenen'], trefwoorden: 'schenken schenking vrijstelling kind kleinkind' },
  { slug: 'erfbelasting-berekenen', titel: 'Erfbelasting berekenen', kort: 'Erfbelasting per erfgenaam, met vrijstellingen.', categorie: 'Schenken & erven', verwant: ['schenkbelasting-berekenen', 'box-3-belasting-berekenen', 'inflatie-berekenen'], trefwoorden: 'erfenis erven successierecht vrijstelling partner kind' },
  { slug: 'overdrachtsbelasting-berekenen', titel: 'Overdrachtsbelasting berekenen', kort: '0%, 2%, 8% of 10,4%, met startersvrijstelling.', categorie: 'Wonen', verwant: ['hypotheek-maandlasten-berekenen', 'schenkbelasting-berekenen', 'procenten-berekenen'], trefwoorden: 'overdrachtsbelasting huis kopen starter startersvrijstelling woning' },
  { slug: 'hypotheek-maandlasten-berekenen', titel: 'Hypotheek maandlasten', kort: 'Bruto en netto maandlasten met renteaftrek.', categorie: 'Wonen', verwant: ['overdrachtsbelasting-berekenen', 'lening-maandlasten', 'netto-salaris-berekenen'], trefwoorden: 'hypotheek maandlasten hypotheekrenteaftrek eigenwoningforfait netto huis' },
  { slug: 'inkomstenbelasting-berekenen', titel: 'Inkomstenbelasting berekenen', kort: 'Box 1 met kortingen, ook voor AOW, plus teruggave.', categorie: 'Belastingen', verwant: ['netto-salaris-berekenen', 'box-3-belasting-berekenen', 'hypotheek-maandlasten-berekenen'], trefwoorden: 'inkomstenbelasting aangifte teruggave bijbetalen aow pensioen box 1 heffingskorting' },
  { slug: 'zzp-netto-inkomen-berekenen', titel: 'Zzp netto inkomen', kort: 'Van omzet en kosten naar netto, met wat je moet reserveren.', categorie: 'Ondernemen', verwant: ['zzp-uurtarief-berekenen', 'btw-berekenen', 'inkomstenbelasting-berekenen'], trefwoorden: 'zzp netto winst reserveren belasting ondernemer zelfstandigenaftrek mkb' },
  { slug: 'combinatiekorting-berekenen', titel: 'Combinatiekorting (IACK)', kort: 'Inkomensafhankelijke combinatiekorting voor werkende ouders.', categorie: 'Belastingen', verwant: ['inkomstenbelasting-berekenen', 'netto-salaris-berekenen', 'bruto-netto-uurloon'], trefwoorden: 'iack combinatiekorting werkende ouders kind jonger dan 12 heffingskorting' },
  { slug: 'ww-uitkering-berekenen', titel: 'WW-uitkering berekenen', kort: 'Bruto en netto WW per maand, 75% en 70%.', categorie: 'Werk & salaris', verwant: ['netto-salaris-berekenen', 'inkomstenbelasting-berekenen', 'vakantiegeld-berekenen'], trefwoorden: 'ww uitkering werkloosheid uwv dagloon ontslag' },
  { slug: 'minimumloon-berekenen', titel: 'Minimumloon 2026', kort: 'Minimumloon per uur, week, maand en jaar.', categorie: 'Werk & salaris', verwant: ['bruto-netto-uurloon', 'netto-salaris-berekenen', 'vakantiegeld-berekenen'], trefwoorden: 'minimumloon wml wettelijk minimumloon per uur 2026' },
  { slug: 'spaardoel-berekenen', titel: 'Spaardoel berekenen', kort: 'Hoeveel moet ik per maand sparen voor mijn doel?', categorie: 'Sparen & lenen', verwant: ['samengestelde-rente', 'inflatie-berekenen', 'box-3-belasting-berekenen'], trefwoorden: 'sparen spaardoel per maand sparen voor huis auto vakantie buffer' },
];

export const rekenhulp = (slug: string): Rekenhulp => {
  const r = REKENHULPEN.find((x) => x.slug === slug);
  if (!r) throw new Error(`Onbekende rekenhulp ${slug}`);
  return r;
};
