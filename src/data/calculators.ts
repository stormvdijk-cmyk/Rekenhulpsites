export type Categorie = 'Salaris' | 'Belasting' | 'Wonen' | 'Sparen & lenen' | 'Zakelijk';

export interface Rekenhulp {
  slug: string;
  titel: string;
  kort: string;
  categorie: Categorie;
  verwant: string[];
  trefwoorden: string;
}

export const CATEGORIEEN: Categorie[] = ['Salaris', 'Belasting', 'Wonen', 'Sparen & lenen', 'Zakelijk'];

export const REKENHULPEN: Rekenhulp[] = [
  { slug: 'netto-salaris-berekenen', titel: 'Netto salaris berekenen', kort: 'Van bruto naar netto per maand en per jaar.', categorie: 'Salaris', verwant: ['inkomstenbelasting-berekenen', 'vakantiegeld-berekenen', 'bijtelling-auto-van-de-zaak'], trefwoorden: 'bruto netto loon salaris loonheffing heffingskorting pensioen aow' },
  { slug: 'bruto-netto-uurloon', titel: 'Uurloon naar maandsalaris', kort: 'Reken uurloon om naar maand- en jaarsalaris en terug.', categorie: 'Salaris', verwant: ['netto-salaris-berekenen', 'vakantiegeld-berekenen', 'zzp-uurtarief-berekenen'], trefwoorden: 'uurloon maandloon jaarloon uren per week' },
  { slug: 'vakantiegeld-berekenen', titel: 'Vakantiegeld berekenen', kort: '8% vakantiegeld, bruto en netto.', categorie: 'Salaris', verwant: ['netto-salaris-berekenen', 'bruto-netto-uurloon', 'procenten-berekenen'], trefwoorden: 'vakantiebijslag vakantiegeld 8 procent mei' },
  { slug: 'btw-berekenen', titel: 'Btw berekenen', kort: '21% en 9%, inclusief en exclusief btw.', categorie: 'Belasting', verwant: ['procenten-berekenen', 'zzp-uurtarief-berekenen', 'inflatie-berekenen'], trefwoorden: 'btw vat omzetbelasting 21 9 inclusief exclusief' },
  { slug: 'bijtelling-auto-van-de-zaak', titel: 'Bijtelling auto van de zaak', kort: 'Bijtelling per maand en het netto effect per schijf.', categorie: 'Belasting', verwant: ['netto-salaris-berekenen', 'lening-maandlasten', 'zzp-uurtarief-berekenen'], trefwoorden: 'bijtelling leaseauto elektrisch cataloguswaarde' },
  { slug: 'inflatie-berekenen', titel: 'Inflatie berekenen', kort: 'Koopkracht van een bedrag tussen twee jaartallen.', categorie: 'Belasting', verwant: ['samengestelde-rente', 'procenten-berekenen', 'netto-salaris-berekenen'], trefwoorden: 'inflatie koopkracht cbs cpi prijzen geldontwaarding' },
  { slug: 'procenten-berekenen', titel: 'Procenten berekenen', kort: 'Percentage van, stijging of daling en korting.', categorie: 'Sparen & lenen', verwant: ['btw-berekenen', 'inflatie-berekenen', 'samengestelde-rente'], trefwoorden: 'procent percentage korting stijging daling' },
  { slug: 'samengestelde-rente', titel: 'Samengestelde rente', kort: 'Sparen of beleggen met maandelijkse inleg, met grafiek.', categorie: 'Sparen & lenen', verwant: ['inflatie-berekenen', 'lening-maandlasten', 'procenten-berekenen'], trefwoorden: 'rente op rente sparen beleggen vermogen groei' },
  { slug: 'lening-maandlasten', titel: 'Maandlasten lening', kort: 'Annuïtair en lineair, met aflossingstabel.', categorie: 'Sparen & lenen', verwant: ['hypotheek-maandlasten-berekenen', 'samengestelde-rente', 'procenten-berekenen'], trefwoorden: 'lening krediet annuiteit lineair aflossing persoonlijke lening' },
  { slug: 'zzp-uurtarief-berekenen', titel: 'Zzp-uurtarief berekenen', kort: 'Van gewenst netto inkomen naar een minimaal uurtarief.', categorie: 'Zakelijk', verwant: ['zzp-netto-inkomen-berekenen', 'btw-berekenen', 'bruto-netto-uurloon'], trefwoorden: 'zzp freelancer uurtarief zelfstandige ondernemer' },
  { slug: 'kilometervergoeding-berekenen', titel: 'Kilometervergoeding berekenen', kort: 'Onbelaste reiskostenvergoeding voor woon-werkverkeer.', categorie: 'Salaris', verwant: ['netto-salaris-berekenen', 'bijtelling-auto-van-de-zaak', 'bruto-netto-uurloon'], trefwoorden: 'reiskosten reiskostenvergoeding woon-werk kilometer 0,25' },
  { slug: 'box-3-belasting-berekenen', titel: 'Box 3-belasting berekenen', kort: 'Belasting over spaargeld en beleggingen.', categorie: 'Belasting', verwant: ['samengestelde-rente', 'schenkbelasting-berekenen', 'inflatie-berekenen'], trefwoorden: 'box 3 vermogensbelasting spaargeld beleggingen heffingsvrij vermogen' },
  { slug: 'schenkbelasting-berekenen', titel: 'Schenkbelasting berekenen', kort: 'Belastingvrij schenken en de schenkbelasting.', categorie: 'Belasting', verwant: ['erfbelasting-berekenen', 'box-3-belasting-berekenen', 'overdrachtsbelasting-berekenen'], trefwoorden: 'schenken schenking vrijstelling kind kleinkind' },
  { slug: 'erfbelasting-berekenen', titel: 'Erfbelasting berekenen', kort: 'Erfbelasting per erfgenaam, met vrijstellingen.', categorie: 'Belasting', verwant: ['schenkbelasting-berekenen', 'box-3-belasting-berekenen', 'inflatie-berekenen'], trefwoorden: 'erfenis erven successierecht vrijstelling partner kind' },
  { slug: 'overdrachtsbelasting-berekenen', titel: 'Overdrachtsbelasting berekenen', kort: '0%, 2%, 8% of 10,4%, met startersvrijstelling.', categorie: 'Wonen', verwant: ['hypotheek-maandlasten-berekenen', 'schenkbelasting-berekenen', 'procenten-berekenen'], trefwoorden: 'overdrachtsbelasting huis kopen starter startersvrijstelling woning' },
  { slug: 'hypotheek-maandlasten-berekenen', titel: 'Hypotheek maandlasten', kort: 'Bruto en netto maandlasten met renteaftrek.', categorie: 'Wonen', verwant: ['overdrachtsbelasting-berekenen', 'lening-maandlasten', 'netto-salaris-berekenen'], trefwoorden: 'hypotheek maandlasten hypotheekrenteaftrek eigenwoningforfait netto huis' },
  { slug: 'inkomstenbelasting-berekenen', titel: 'Inkomstenbelasting berekenen', kort: 'Box 1 met kortingen, ook voor AOW, plus teruggave.', categorie: 'Belasting', verwant: ['netto-salaris-berekenen', 'box-3-belasting-berekenen', 'hypotheek-maandlasten-berekenen'], trefwoorden: 'inkomstenbelasting aangifte teruggave bijbetalen aow pensioen box 1 heffingskorting' },
  { slug: 'zzp-netto-inkomen-berekenen', titel: 'Zzp netto inkomen', kort: 'Van omzet en kosten naar netto, met wat je moet reserveren.', categorie: 'Zakelijk', verwant: ['zzp-uurtarief-berekenen', 'btw-berekenen', 'inkomstenbelasting-berekenen'], trefwoorden: 'zzp netto winst reserveren belasting ondernemer zelfstandigenaftrek mkb' },
  { slug: 'combinatiekorting-berekenen', titel: 'Combinatiekorting (IACK)', kort: 'Inkomensafhankelijke combinatiekorting voor werkende ouders.', categorie: 'Belasting', verwant: ['inkomstenbelasting-berekenen', 'netto-salaris-berekenen', 'bruto-netto-uurloon'], trefwoorden: 'iack combinatiekorting werkende ouders kind jonger dan 12 heffingskorting' },
  { slug: 'ww-uitkering-berekenen', titel: 'WW-uitkering berekenen', kort: 'Bruto en netto WW per maand, 75% en 70%.', categorie: 'Salaris', verwant: ['netto-salaris-berekenen', 'inkomstenbelasting-berekenen', 'vakantiegeld-berekenen'], trefwoorden: 'ww uitkering werkloosheid uwv dagloon ontslag' },
  { slug: 'minimumloon-berekenen', titel: 'Minimumloon 2026', kort: 'Minimumloon per uur, week, maand en jaar.', categorie: 'Salaris', verwant: ['bruto-netto-uurloon', 'netto-salaris-berekenen', 'vakantiegeld-berekenen'], trefwoorden: 'minimumloon wml wettelijk minimumloon per uur 2026' },
  { slug: 'spaardoel-berekenen', titel: 'Spaardoel berekenen', kort: 'Hoeveel moet ik per maand sparen voor mijn doel?', categorie: 'Sparen & lenen', verwant: ['samengestelde-rente', 'inflatie-berekenen', 'box-3-belasting-berekenen'], trefwoorden: 'sparen spaardoel per maand sparen voor huis auto vakantie buffer' },
];

export const rekenhulp = (slug: string): Rekenhulp => {
  const r = REKENHULPEN.find((x) => x.slug === slug);
  if (!r) throw new Error(`Onbekende rekenhulp ${slug}`);
  return r;
};
