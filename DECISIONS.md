# Beslissingen

Datum: 2 november 2026.

## Omgeving en levering
- **Geen GitHub-repository gekoppeld.** De sessie had geen repository en geen geldig GitHub-token. Alles is lokaal gebouwd en getest in git (branch `feature/lancering`, basis `main`). Pushen, de live URL en de pull request moeten nog gebeuren zodra er een repository is gekoppeld.
- **Directe toegang tot belastingdienst.nl, rijksoverheid.nl en cbs.nl was geblokkeerd** door de netwerkinstellingen van de bouwomgeving. Alle tarieven zijn daarom opgezocht via een webzoekopdracht die beperkt was tot die officiële domeinen. Ze zijn overgenomen van de daar getoonde officiële pagina's (URL's in `tarieven-2026.json`). Waar mogelijk zijn de cijfers onderling gecontroleerd: de arbeidskortingsschijven sluiten op elkaar aan (€ 996, € 5.300, € 5.685 en € 0 bij € 132.920), en de afbouw van de algemene heffingskorting komt precies op € 0 bij € 78.426. **Advies: laat de eigenaar de bedragen één keer naast de bronpagina's leggen.**

## Inhoud en cijfers
- **Tarievenjaar 2026** (het lopende jaar). Alle cijfers staan in `src/data/tarieven-2026.json`, met bron en opzoekdatum.
- **Alleen voor wie jonger is dan de AOW-leeftijd.** De AOW-tarieven verschillen per geboortemaand. Dat staat in de uitleg.
- **Netto salaris = jaarberekening.** De rekenhulp gebruikt box 1 met de algemene heffingskorting en de arbeidskorting, en verdeelt het resultaat over twaalf maanden. De officiële loonbelastingtabellen konden niet worden opgehaald (pdf). Kortingen worden afgetopt op de verschuldigde belasting (geen uitbetaling). Pensioenpremie zit er niet in. Dat staat in de tekst.
- **Netto vakantiegeld = verschil** tussen het netto jaarinkomen met en zonder vakantiegeld. Zo tellen de afbouw van de kortingen en de schijfgrenzen mee.
- **Inflatie: 1999–2025.** De CBS-jaarmutaties 2000–2025 zijn bevestigd via CBS-publicaties. Oudere jaren konden niet volledig worden bevestigd (1992–1998 ontbraken) en zijn weggelaten, volgens de regel ‘niet bouwen wat niet bevestigd is’. Index 1999 = 100.
- **Zzp-uurtarief:** zelfstandigenaftrek € 1.200, startersaftrek € 2.123, mkb-winstvrijstelling 12,7%, aftrekbeperking tot 37,56%, Zvw 4,85% tot € 79.409, plus AHK en arbeidskorting op de winst. De reservering (pensioen, AOV, buffer) wordt behandeld als netto-uitgave, wat voorzichtig is. De benodigde winst wordt met bisectie teruggerekend.
- **Bijtelling:** percentages voor een datum eerste toelating in 2026. Het netto effect is bijtelling × schijftarief. Het effect op de afbouw van de kortingen wordt in de tekst genoemd, maar niet berekend.
- **Samengestelde rente:** effectieve maandrente (1+r)^(1/12)−1. Inleg aan het eind van de maand.
- **Lening:** nominale maandrente r/12, zoals gebruikelijk bij Nederlandse leningen.
- **Btw:** 21% / 9% / 0%.

## Techniek
- **Astro 7.4, `build.format: 'directory'`.** URL's eindigen op `/` (bijv. `/btw-berekenen/`). Dat zijn de canonieke URL's, omdat GitHub Pages `/btw-berekenen` toch doorstuurt naar `/btw-berekenen/`.
- **Geen UI-framework.** Elke rekenhulp heeft een klein `<script>` (vanilla TS, door Astro gebundeld). Gedeelde helpers staan in `src/lib/ui.ts`.
- **Live berekenen zonder Bereken-knop.** De uitkomst verschijnt tijdens het typen. Zo is er ook geen knop waar een advertentie naast kan staan (AdSense-beleid). De invoer komt in de querystring, zodat een berekening deelbaar is.
- **Stylesheet inline** (`inlineStylesheets: 'always'`). Dat scheelt een render-blocking request. Lighthouse mobiel geeft 97–100 op alle categorieën.
- **PWA met `@vite-pwa/astro` 2.0** (generateSW). Precache van alle pagina's. De querystring wordt genegeerd bij het opzoeken in de cache, zodat gedeelde links ook offline werken. AdSense en analytics worden niet gecachet.
- **`ads.txt` en `robots.txt` worden gegenereerd** (endpoints in `src/pages/`), zodat ze de juiste ID en het juiste domein krijgen uit de omgevingsvariabelen.
- **AdSense via `vars.*` (repository-variabelen), niet via secrets.** De publisher-ID is publiek, en zo is hij zichtbaar en aanpasbaar.
- **Consent Mode v2 staat standaard op denied, en er is geen eigen banner.** De Google-CMP regelt de toestemming. Zonder publisher-ID wordt er geen enkel Google-script geladen.
- **Contactadres via `PUBLIC_CONTACT_EMAIL`.** Er was geen adres opgegeven en we wilden geen adres publiceren zonder toestemming. Tot het is ingesteld, staat op de contactpagina dat het adres volgt.
- **Grafiek als eigen inline SVG** (geen chartbibliotheek), met een tooltip en een tabel per jaar als alternatief. De kleuren zijn gecontroleerd op kleurenblindheid en contrast, in licht en donker.

## Uitbreiding november 2026 (6 rekenhulpen)
- **Nieuwe categorie Wonen** (overdrachtsbelasting, hypotheek).
- **Overdrachtsbelasting:** 0% (starter 18 t/m 34, zelf bewonen, woning ≤ € 555.000, eenmalig), 2%, 8% (niet zelf bewonen, sinds 2026), 10,4% (overig). Bij twee kopers ieder de helft; de woningwaardegrens geldt voor de hele woning.
- **Box 3:** forfaitaire berekening 2026 (heffingsvrij € 59.357, schuldendrempel € 3.800, 1,28% / 6,00% / 2,70%, tarief 36%). De percentages voor bank en schulden zijn voorlopig; dat staat op de pagina. Tegenbewijsregeling niet berekend.
- **Schenk- en erfbelasting:** tarieven 10/20, 18/36, 30/40 met schijfgrens € 158.669. Schenkingen tussen partners en bedrijfsopvolging zijn bewust weggelaten.
- **Hypotheek:** bruto via de bestaande leningslogica; netto = bruto − (rente − forfait/12) × aftrektarief (schijftarief, max 37,56%). Wet Hillen niet berekend (dan nul voordeel). Eigenwoningforfait alleen voor WOZ ≥ € 75.000 (lagere schijven niet bevestigd).
- **Kilometervergoeding:** € 0,25/km (2026, terugwerkende kracht), vaste vergoeding 214 dagen bij 5 dagen per week, naar rato.
- **Niet gebouwd:** minimumloon (bedragen per halfjaar niet bevestigd).
