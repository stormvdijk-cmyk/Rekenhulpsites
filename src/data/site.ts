// Centrale site-instellingen. Waarden die per omgeving verschillen komen uit PUBLIC_*-omgevingsvariabelen.
export const SITE = {
  naam: 'Rekenhulp',
  slogan: 'Snel en eerlijk rekenen met geld',
  // Contactadres voor contact-/privacypagina. Zet PUBLIC_CONTACT_EMAIL als GitHub-variabele.
  contactEmail: (import.meta.env.PUBLIC_CONTACT_EMAIL as string | undefined) || '',
};

export const ADSENSE_CLIENT = ((import.meta.env.PUBLIC_ADSENSE_CLIENT as string | undefined) || '').trim();

// Ad-unit-ID's per positie (optioneel). Zonder ID gebruikt AdSense de responsieve standaard via auto-ads niet;
// maak in AdSense drie displayblokken aan en zet hun ID's in deze variabelen.
export const AD_SLOTS = {
  resultaat: (import.meta.env.PUBLIC_ADSENSE_SLOT_RESULTAAT as string | undefined) || '',
  midden: (import.meta.env.PUBLIC_ADSENSE_SLOT_MIDDEN as string | undefined) || '',
  onder: (import.meta.env.PUBLIC_ADSENSE_SLOT_ONDER as string | undefined) || '',
};

export const ANALYTICS = {
  // Cloudflare Web Analytics-token (cookieloos)
  cloudflareToken: ((import.meta.env.PUBLIC_CF_ANALYTICS_TOKEN as string | undefined) || '').trim(),
  // GoatCounter-code, bijv. "rekenhulp" voor rekenhulp.goatcounter.com (cookieloos)
  goatcounter: ((import.meta.env.PUBLIC_GOATCOUNTER_CODE as string | undefined) || '').trim(),
};

/** Interne link met de juiste base (GitHub Pages-projectsite draait op /<repo>/). */
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const p = path.replace(/^\//, '');
  return `${base}/${p}`.replace(/\/+$/, '/') || '/';
}
