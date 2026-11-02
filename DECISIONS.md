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

## Fiscaal fase 1 (november 2026)
- **AOW-tarieven** toegevoegd (`aow` in de JSON): eerste schijf 17,85% (hele jaar AOW, geboren vanaf 1946), AHK € 1.556 (afbouw 3,195%), arbeidskorting-tabel AOW (max € 2.840), ouderenkorting € 2.067 (15% afbouw boven € 46.002), alleenstaande-ouderenkorting € 540. AOW in de loop van het jaar en geboren vóór 1946 worden niet berekend (staat op de pagina).
- **`belastingOverLoon` heeft opties** `{ aow, alleenstaand }`; bestaande uitkomsten zijn ongewijzigd (alle oude tests groen).
- **Netto salaris:** pensioenpremie (werknemersdeel) verlaagt het belastbaar loon; AOW-optie.
- **Inkomstenbelasting:** arbeidskorting over loon + winst, AHK en schijven over belastbaar inkomen na aftrekposten. Teruggave = ingehouden loonheffing − verschuldigde belasting. Box 2/3 in het verzamelinkomen en IACK zitten er niet in.
- **Zzp netto inkomen:** hergebruikt `nettoUitWinst` uit de uurtariefrekenhulp.
- **Belastingtarieven 2026-pagina:** leest alles uit de JSON, zodat een jaarupdate deze pagina automatisch bijwerkt. Het jaartal staat in de slug; bij 2027 komt er een nieuwe pagina bij.
- **Zorgtoeslag niet gebouwd:** de standaardpremie 2026 en het normpremie-percentage boven het drempelinkomen konden niet met een officiële bron worden bevestigd.

## Fiscaal fase 2 (november 2026)
- **IACK 2026:** drempel € 6.239, 11,45%, max € 3.032 (AOW 5,72%, max € 1.513). De bovengrens van de tabel (€ 32.710 of € 32.719) volgt uit drempel + max/percentage = € 32.719. Kan als optie in de inkomstenbelasting; kortingen niet onder nul.
- **WW:** dagloon ≈ maandloon × 12 / 261, WW-maandloon = dagloon × 21,75, 75% (2 mnd) / 70%. Maximumdagloon € 309,91 (UWV, vanaf 1-1-2026). Netto zonder arbeidskorting. De duur van de WW wordt niet berekend.
- **Minimumloon:** alleen 21+ (€ 14,71 jan–jun, € 14,99 vanaf 1-7-2026, Rijksoverheid). De jeugdpercentages zijn niet bevestigd en daarom weggelaten.
- **Spaardoel:** inverse van de spaarformule met effectieve maandrente, inleg aan het eind van de maand.
- **Niet gebouwd (cijfers niet bevestigd):** kindgebonden budget (afbouwpercentage 2026), huurtoeslag (formule basishuur 2026), zorgtoeslag (standaardpremie en normpremie 2026).
