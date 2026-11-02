# Rekenhulp

Snelle, installeerbare webapp (PWA) met Nederlandstalige financiële rekenhulpen. Gebouwd met Astro (volledig statisch), vanilla TypeScript en gewone CSS. De rekenlogica staat los van de UI in `src/lib/calculators/` en is getest met Vitest.

| Rekenhulp | URL |
|---|---|
| Netto salaris | `/netto-salaris-berekenen/` |
| Uurloon ↔ maandsalaris | `/bruto-netto-uurloon/` |
| Btw | `/btw-berekenen/` |
| Vakantiegeld | `/vakantiegeld-berekenen/` |
| Procenten | `/procenten-berekenen/` |
| Samengestelde rente | `/samengestelde-rente/` |
| Maandlasten lening | `/lening-maandlasten/` |
| Inflatie (CBS) | `/inflatie-berekenen/` |
| Zzp-uurtarief | `/zzp-uurtarief-berekenen/` |
| Bijtelling auto van de zaak | `/bijtelling-auto-van-de-zaak/` |
| Kilometervergoeding | `/kilometervergoeding-berekenen/` |
| Box 3-belasting | `/box-3-belasting-berekenen/` |
| Schenkbelasting | `/schenkbelasting-berekenen/` |
| Erfbelasting | `/erfbelasting-berekenen/` |
| Overdrachtsbelasting | `/overdrachtsbelasting-berekenen/` |
| Hypotheek maandlasten | `/hypotheek-maandlasten-berekenen/` |
| Inkomstenbelasting (ook AOW, teruggave) | `/inkomstenbelasting-berekenen/` |
| Zzp netto inkomen | `/zzp-netto-inkomen-berekenen/` |
| Combinatiekorting (IACK) | `/combinatiekorting-berekenen/` |
| WW-uitkering | `/ww-uitkering-berekenen/` |
| Minimumloon | `/minimumloon-berekenen/` |
| Spaardoel | `/spaardoel-berekenen/` |
| Netto naar bruto | `/netto-naar-bruto-berekenen/` |
| Bonus en 13e maand netto | `/bonus-13e-maand-netto/` |
| Transitievergoeding | `/transitievergoeding-berekenen/` |
| Loondienst of zzp | `/loondienst-of-zzp/` |
| Vennootschapsbelasting en dividend | `/vennootschapsbelasting-berekenen/` |
| Box 2-belasting | `/box-2-belasting-berekenen/` |
| Kleineondernemersregeling | `/kor-kleineondernemersregeling/` |

Daarnaast: `/belastingtarieven-2026/`, een overzicht van alle tarieven, dat automatisch uit de tarieven-JSON wordt opgebouwd.

## Lokaal draaien

Je hebt Node.js 22 of nieuwer nodig.

```bash
npm install
```

```bash
npm run dev
```

Open daarna http://localhost:4321. Andere commando's:

```bash
npm test            # Vitest-unittests van alle rekenfuncties
npm run build       # statische site in dist/
npm run preview     # bekijk de build lokaal (service worker werkt alleen hier, niet in dev)
```

Omgevingsvariabelen zijn optioneel; zie `.env.example`. Kopieer naar `.env` om lokaal te testen.

## Projectstructuur

```
src/data/tarieven-2026.json   alle tarieven van het jaar, met bron-URL en opzoekdatum
src/data/tarieven.ts          kiest het actieve tarievenjaar (één regel)
src/data/calculators.ts       lijst van rekenhulpen: titel, categorie, verwante rekenhulpen
src/data/site.ts              sitenaam, omgevingsvariabelen, url()-helper
src/lib/calculators/*.ts      pure rekenlogica (geen DOM)
src/lib/ui.ts                 kleine helpers voor de formulieren
src/components/               CalculatorPage, AdSlot, Field, Page
src/pages/                    één .astro-bestand per pagina
tests/calculators.test.ts     unittests met handmatig nagerekende voorbeelden
.github/workflows/deploy.yml  build, test en deploy naar GitHub Pages
```

## Deployen naar GitHub Pages

1. Push de repository naar GitHub.
2. Ga naar **Settings → Pages** en kies bij *Source*: **GitHub Actions**.
3. Elke push naar `main` draait `.github/workflows/deploy.yml`: `npm ci`, `npm test`, `npm run build` en de deploy. Pull requests worden gebouwd en getest, maar niet gedeployd.
4. Zonder eigen domein staat de site op `https://<gebruiker>.github.io/<repository>/`. De workflow zet `SITE_URL` en `BASE_PATH` automatisch via `actions/configure-pages`.

### Cloudflare Pages (alternatief)

Koppel de repository in Cloudflare Pages met build command `npm run build` en output directory `dist`. Zet bij *Environment variables* `SITE_URL=https://jouwdomein.nl` en, waar nodig, de `PUBLIC_*`-variabelen hieronder. `BASE_PATH` laat je leeg.

## Een eigen domein koppelen

1. Koop een domein, bijvoorbeeld `uwrekenhulp.nl`, bij een registrar naar keuze.
2. Ga in GitHub naar **Settings → Pages → Custom domain**, vul `uwrekenhulp.nl` in en klik op *Save*. GitHub regelt het CNAME-bestand zelf bij een deploy via Actions.
3. Zet bij je registrar deze DNS-records:
   - Apex (`uwrekenhulp.nl`): vier **A**-records naar `185.199.108.153`, `185.199.109.153`, `185.199.110.153` en `185.199.111.153`. Voor IPv6 voeg je eventueel vier **AAAA**-records toe: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153` en `2606:50c0:8003::153`.
   - `www`: een **CNAME**-record naar `<gebruiker>.github.io`.
4. Wacht tot de DNS is bijgewerkt (soms tot 24 uur) en zet daarna **Enforce HTTPS** aan.
5. Ga naar **Settings → Secrets and variables → Actions → Variables** en voeg `SITE_URL` = `https://uwrekenhulp.nl` toe. Dan komen de canonical-URL's, de sitemap en `robots.txt` op het juiste domein te staan, en is `BASE_PATH` gewoon `/`.
6. Start de workflow opnieuw (tabblad *Actions* → *Run workflow*).

Controleer de IP-adressen eerst in de GitHub-documentatie: *Managing a custom domain for your GitHub Pages site*.

## Google AdSense instellen

> Tijdens testen: **klik nooit op je eigen advertenties.** Dat is in strijd met het AdSense-beleid en kan je account kosten.

1. **Zorg eerst voor een eigen domein** (zie hierboven). AdSense accepteert geen site op een subpad zoals `github.io/repository`. `ads.txt` moet bovendien in de root van het domein staan.
2. Vul je contactadres in: maak de variabele `PUBLIC_CONTACT_EMAIL` aan (zie stap 6). AdSense controleert of de contact- en privacypagina's echt inhoud hebben.
3. Meld je aan op https://adsense.google.com met je Google-account en voeg je site toe (`uwrekenhulp.nl`).
4. Je krijgt een publisher-ID van de vorm `ca-pub-1234567890123456`.
5. Kies bij *Sites → je site → Verificatiemethode* voor de **AdSense-codefragment**- of **meta-tag**-methode. Beide worden automatisch toegevoegd zodra `PUBLIC_ADSENSE_CLIENT` is ingesteld.
6. Ga in GitHub naar **Settings → Secrets and variables → Actions → tabblad Variables → New repository variable** en voeg toe:
   - `PUBLIC_ADSENSE_CLIENT` = `ca-pub-1234567890123456`
   - optioneel `PUBLIC_CONTACT_EMAIL` = je contactadres
   
   Gebruik **Variables**, geen *Secrets*: de publisher-ID staat toch publiek in de HTML, en de workflow leest `vars.*`.
7. Start de workflow opnieuw. De site laadt nu het AdSense-script en vult `/ads.txt` met
   `google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0`.
8. Vraag in AdSense de review aan. Dat duurt meestal enkele dagen tot een paar weken.
9. Na goedkeuring: maak onder *Advertenties → Per advertentieblok* drie **displayblokken** (responsief) aan, bijvoorbeeld *Onder resultaat*, *Midden uitleg* en *Onderaan*. Zet hun ID's (de waarde van `data-ad-slot`) in de variabelen `PUBLIC_ADSENSE_SLOT_RESULTAAT`, `PUBLIC_ADSENSE_SLOT_MIDDEN` en `PUBLIC_ADSENSE_SLOT_ONDER`. Zet **Auto-advertenties** uit of beperk ze, zodat er geen advertenties boven het formulier verschijnen.

TODO: `ads.txt` is nog leeg, want er is nog geen publisher-ID bekend. Na stap 6 wordt het bestand automatisch gevuld.

### Advertentieplaatsing (beleid)

`src/components/AdSlot.astro` reserveert een vaste minimale hoogte, zodat de layout niet verschuift. Per rekenhulp staan er drie blokken: onder het resultaat (na de disclaimer), halverwege de uitleg en onderaan. Er staat nooit een advertentie boven of in het formulier, en ook niet naast een knop. Elk blok heeft het label ‘Advertentie’.

## De toestemmingstool (CMP) aanzetten

Bezoekers uit de EER, het VK en Zwitserland moeten toestemming geven via een door Google gecertificeerde CMP. De site heeft bewust **geen eigen cookiebanner**. Google Consent Mode v2 staat standaard op `denied` (zie `src/layouts/Base.astro`), en de gratis CMP van Google zet de signalen op `granted` na toestemming.

1. Ga in AdSense naar **Privacy en berichten**.
2. Kies **Europese regelgeving** → *Bericht maken*.
3. Selecteer je site, kies de taal Nederlands en zet *Toestemming beheren* (de link waarmee bezoekers hun keuze later aanpassen) aan.
4. Vul de URL van je privacybeleid in: `https://uwrekenhulp.nl/privacy/`.
5. **Publiceer** het bericht. Het verschijnt automatisch, omdat het AdSense-script al op elke pagina staat.
6. Doe eventueel hetzelfde voor *Amerikaanse staatsregelgeving*.

## Google Search Console en sitemap

1. Ga naar https://search.google.com/search-console en kies **Property toevoegen → Domein**. Vul `uwrekenhulp.nl` in.
2. Verifieer met het **TXT-record** dat Google geeft. Zet dat bij je registrar in de DNS.
3. Ga naar **Sitemaps** en dien `https://uwrekenhulp.nl/sitemap-index.xml` in. `robots.txt` verwijst er ook al naar.
4. Gebruik **URL-inspectie** om de belangrijkste rekenhulpen sneller te laten indexeren.

## Analytics (optioneel, zonder cookies)

Kies één van beide en zet de variabele in GitHub (*Variables*):

- **Cloudflare Web Analytics**: maak een site aan in het Cloudflare-dashboard en zet het token in `PUBLIC_CF_ANALYTICS_TOKEN`.
- **GoatCounter**: maak een gratis account aan op goatcounter.com en zet je code (bijv. `rekenhulp` voor `rekenhulp.goatcounter.com`) in `PUBLIC_GOATCOUNTER_CODE`.

Beide zijn cookieloos en hebben geen toestemming nodig. De privacypagina past haar tekst automatisch aan.

## Tarieven bijwerken voor een nieuw jaar

Alle belastingcijfers staan in één bestand. Doe dit voor bijvoorbeeld 2027:

1. Kopieer `src/data/tarieven-2026.json` naar `src/data/tarieven-2027.json`.
2. Werk elk getal bij met de officiële bron. Pas ook `bron`, `opgezocht` en `jaar` aan. Bronnen:
   - Box 1-schijven: belastingdienst.nl → *Box 1: uitleg en tarieven*
   - Algemene heffingskorting en arbeidskorting: belastingdienst.nl → *Tabel algemene heffingskorting <jaar>* en *Tabel arbeidskorting <jaar>*
   - Bijtelling: belastingdienst.nl → *Bijtelling privégebruik auto <jaar>*
   - Zelfstandigenaftrek, mkb-winstvrijstelling, Zvw: belastingdienst.nl → *Veranderingen inkomstenbelasting <jaar>*
   - Overdrachtsbelasting, box 3, schenk- en erfbelasting, eigenwoningforfait, kilometervergoeding: zie de `bron`-velden in de JSON
   - Inflatie: voeg het nieuwe jaarcijfer toe uit CBS-tabel 70936ned (*Jaarmutatie consumentenprijsindex*)
3. Verander in `src/data/tarieven.ts` de import naar `./tarieven-2027.json`.
4. Pas de verwachte bedragen in `tests/calculators.test.ts` aan. Reken ze met de hand na; neem ze niet over uit de code.
5. Werk de rekenvoorbeelden in de uitlegteksten bij (zoek in `src/pages/` op de oude bedragen). Teksten die bedragen uit de JSON lezen, worden vanzelf bijgewerkt.
6. Draai `npm test` en `npm run build`, en controleer de voorbeelden in de browser.

## Een nieuwe rekenhulp toevoegen

1. **Logica:** maak `src/lib/calculators/<naam>.ts` met pure functies, zonder DOM. Tarieven komen uit `src/data/tarieven.ts`, niet uit losse getallen in de code.
2. **Tests:** voeg in `tests/` minstens drie voorbeelden toe die je met de hand hebt nagerekend. Draai `npm test`.
3. **Registreren:** voeg een regel toe aan `REKENHULPEN` in `src/data/calculators.ts` met slug, titel, korte omschrijving, categorie, trefwoorden voor het zoekveld en drie verwante slugs.
4. **Pagina:** kopieer een bestaande pagina, bijvoorbeeld `src/pages/btw-berekenen.astro`, naar `src/pages/<slug>.astro`. Pas aan:
   - `title` (onder 60 tekens, inclusief “ | Rekenhulp”) en `description` (onder 155 tekens);
   - het formulier, met het resultaat bovenaan in `.result` en de velden in `.form`. Gebruik `<Field>` voor invoer en `live('f', ...)` voor live berekenen;
   - de uitleg (400–800 woorden) in de slots `uitleg-1` en `uitleg-2`, met een uitgewerkt voorbeeld;
   - de FAQ (3–5 vragen) in de `faq`-array. Die wordt automatisch ook FAQPage-JSON-LD;
   - `bron` als de rekenhulp belastingregels gebruikt. Dan verschijnt de disclaimer.
5. Advertenties, breadcrumbs, structured data, verwante links en de sitemap regelt `CalculatorPage.astro` automatisch.
6. Controleer met `npm run build && npm run preview` en vul het voorbeeld uit de tekst in.
