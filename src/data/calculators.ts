export type Categorie = 'Salaris' | 'Belasting' | 'Sparen & lenen' | 'Zakelijk';

export interface Rekenhulp {
  slug: string;
  titel: string;
  kort: string;
  categorie: Categorie;
  verwant: string[];
  trefwoorden: string;
}

export const CATEGORIEEN: Categorie[] = ['Salaris', 'Belasting', 'Sparen & lenen', 'Zakelijk'];

export const REKENHULPEN: Rekenhulp[] = [
  { slug: 'netto-salaris-berekenen', titel: 'Netto salaris berekenen', kort: 'Van bruto naar netto per maand en per jaar.', categorie: 'Salaris', verwant: ['vakantiegeld-berekenen', 'bruto-netto-uurloon', 'bijtelling-auto-van-de-zaak'], trefwoorden: 'bruto netto loon salaris loonheffing heffingskorting' },
  { slug: 'bruto-netto-uurloon', titel: 'Uurloon naar maandsalaris', kort: 'Reken uurloon om naar maand- en jaarsalaris en terug.', categorie: 'Salaris', verwant: ['netto-salaris-berekenen', 'vakantiegeld-berekenen', 'zzp-uurtarief-berekenen'], trefwoorden: 'uurloon maandloon jaarloon uren per week' },
  { slug: 'vakantiegeld-berekenen', titel: 'Vakantiegeld berekenen', kort: '8% vakantiegeld, bruto en netto.', categorie: 'Salaris', verwant: ['netto-salaris-berekenen', 'bruto-netto-uurloon', 'procenten-berekenen'], trefwoorden: 'vakantiebijslag vakantiegeld 8 procent mei' },
  { slug: 'btw-berekenen', titel: 'Btw berekenen', kort: '21% en 9%, inclusief en exclusief btw.', categorie: 'Belasting', verwant: ['procenten-berekenen', 'zzp-uurtarief-berekenen', 'inflatie-berekenen'], trefwoorden: 'btw vat omzetbelasting 21 9 inclusief exclusief' },
  { slug: 'bijtelling-auto-van-de-zaak', titel: 'Bijtelling auto van de zaak', kort: 'Bijtelling per maand en het netto effect per schijf.', categorie: 'Belasting', verwant: ['netto-salaris-berekenen', 'lening-maandlasten', 'zzp-uurtarief-berekenen'], trefwoorden: 'bijtelling leaseauto elektrisch cataloguswaarde' },
  { slug: 'inflatie-berekenen', titel: 'Inflatie berekenen', kort: 'Koopkracht van een bedrag tussen twee jaartallen.', categorie: 'Belasting', verwant: ['samengestelde-rente', 'procenten-berekenen', 'netto-salaris-berekenen'], trefwoorden: 'inflatie koopkracht cbs cpi prijzen geldontwaarding' },
  { slug: 'procenten-berekenen', titel: 'Procenten berekenen', kort: 'Percentage van, stijging of daling en korting.', categorie: 'Sparen & lenen', verwant: ['btw-berekenen', 'inflatie-berekenen', 'samengestelde-rente'], trefwoorden: 'procent percentage korting stijging daling' },
  { slug: 'samengestelde-rente', titel: 'Samengestelde rente', kort: 'Sparen of beleggen met maandelijkse inleg, met grafiek.', categorie: 'Sparen & lenen', verwant: ['inflatie-berekenen', 'lening-maandlasten', 'procenten-berekenen'], trefwoorden: 'rente op rente sparen beleggen vermogen groei' },
  { slug: 'lening-maandlasten', titel: 'Maandlasten lening', kort: 'Annuïtair en lineair, met aflossingstabel.', categorie: 'Sparen & lenen', verwant: ['samengestelde-rente', 'procenten-berekenen', 'netto-salaris-berekenen'], trefwoorden: 'lening krediet hypotheek annuiteit lineair aflossing' },
  { slug: 'zzp-uurtarief-berekenen', titel: 'Zzp-uurtarief berekenen', kort: 'Van gewenst netto inkomen naar een minimaal uurtarief.', categorie: 'Zakelijk', verwant: ['btw-berekenen', 'bruto-netto-uurloon', 'bijtelling-auto-van-de-zaak'], trefwoorden: 'zzp freelancer uurtarief zelfstandige ondernemer' },
];

export const rekenhulp = (slug: string): Rekenhulp => {
  const r = REKENHULPEN.find((x) => x.slug === slug);
  if (!r) throw new Error(`Onbekende rekenhulp ${slug}`);
  return r;
};
