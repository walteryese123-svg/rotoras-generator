# Rotoras Generator — testversie 0.12

Gebaseerd op jouw Rotoras_Generator_V3.5.xlsm, Rotoras Generator 2.2.6 (uitgebreid naar 2.3.2) en DWG Generator 0.9.25.

## Nieuw in 0.12: linksdraad en rechtsdraad

Bij uitwendige draad en beide kopgaten staat nu een aparte keuze **Draairichting**: Rechtsdraad (RH) of Linksdraad (LH). **Beginzijde links/rechts** blijft uitsluitend de referentie voor de draadlengte. Het sectieoverzicht en de kopgatinvoer tonen LH/RH. In de DWG krijgen linksdraadaanduidingen het achtervoegsel LH. CSV bewaart LH in veld 8 van DRAAD en veld 13 van KOP; lege velden en oude projecten betekenen rechtsdraad. Gebruik hiervoor Part 2.4.3 en DWG 0.10.1. Part 2.4.3 bevat ook de correctie Face.Evaluator.RangeBox uit 2.4.2 en de uitgebreidere foutmelding.

## Nieuw in 0.11: metrische draad en UNC

De draadtabel komt uit de aangeleverde `thread.xlsx`: ISO Metric profile (499 aanduidingen) en UNC uit ANSI Unified Screw Threads (39 aanduidingen). Standaardklassen: buiten 6g / 2A, binnen 6H / 2B. Draairichting is per bewerking instelbaar: rechts (RH) of links (LH). UNC blijft in inch-aanduiding, alle geometrische invoer is in mm.

**Uitwendige draad:** open Bewerk bij een sectie, kies Draad, draadsoort en aanduiding. De diameter moet gelijk zijn aan de nominale draadmaat (bij 1/2-13 UNC: 12,7 mm). Draadlengte leeg = hele sectie; anders een lengte vanaf links of rechts. Randbewerkingen blijven bestaan: de fysieke draad begint pas op het cilindrische vlak. Bij gelijke aansluitende diameters kan de draad op een deel van het doorlopende vlak worden gezet. DIN76-1 B blijft uitsluitend de bestaande tabel voor metrische grove draad gebruiken; combinatie met fijne draad of UNC wordt geblokkeerd.

**Kopse draadgaten:** links en rechts afzonderlijk, centraal. Boordiameter wordt uit de draadtabel voorgesteld, maar is aanpasbaar. Voor tabelregels zonder boordiameter moet deze zelf worden ingevuld. Alle dieptes zijn vanaf het oorspronkelijke kopvlak: x = einde cilindrisch boorgat, y = einde draad, d = einde kamer. De 118° boorpunt komt na x. De draad begint onder kamer/afschuining. Afschuining is standaard 2 × 30°, axiale maat. Boorpunten, overlappende kopgaten en doorbraak naar de buitenzijde worden gecontroleerd. Onder de kamer blijft de ingevoerde boordiameter behouden.

CSV met draad gebruikt de bestaande 18 kolommen en aanvullende **DRAAD**- en **KOP**-records. Deze zijn geen extra assecties. Zonder draad blijven oude exports gelijk. Gebruik voor draad uitsluitend **Rotoras_Generator_V2.4.3.iLogicVb**; oudere Part-regels begrijpen deze records niet. **Rotoras_DWG_Generator_v0.10.2.ilogicvb** neemt de draadklasse, spoed en kopgatnotities over en bevat alle recente verbeteringen aan afschuining- en radiusaanduidingen.

De offline app, gegevenscontroles en CSV/project-rondgang zijn getest. De nieuwe Part- en DWG-regels zijn nog niet in Inventor uitgevoerd; test eerst een eenvoudige as met één draadsectie en één kopgat in een leeg Part. Inventor-draad wordt als standaard draadfeature aangebracht, geen uitgesneden helix.

## Direct proberen op Windows

1. Pak het volledige ZIP-bestand uit in een vaste map, bijvoorbeeld Documenten/Rotoras.
2. Open de map `Startversie` en dubbelklik op `Start_Rotoras.cmd`.
3. De app opent in een eigen Edge-venster. Zonder Edge opent hij in de standaardbrowser. Je kunt ook `Rotoras_Generator.html` direct openen.
4. Dubbelklik op `Maak_Bureaubladicoon.cmd` voor een snelkoppeling op je bureaublad. Verplaats de uitgepakte map daarna niet.

Deze startversie werkt zonder internet, Node.js, Excel of installatie. Dit is een lokale browserversie in een appvenster, nog geen gecompileerd Tauri-programma.

De as M050465 uit jouw Excel staat als voorbeeld geladen. Als je invoer hebt gewijzigd, wordt die lokaal automatisch hersteld bij opnieuw openen. Gebruik **Project opslaan** om een eigen projectbestand te bewaren. Automatisch herstel is geen vervanging voor een opgeslagen projectbestand; wissen van browsergegevens of verplaatsen van het HTML-bestand kan dat herstel kwijt maken.

## Sneller secties toevoegen in versie 0.10

De tabelvolgorde is **Sectie / Lengte-invoer / Diameter / Afstand / Details**. Diameter en Afstand staan direct naast elkaar; met Tab ga je van diameter naar afstand.

**+** voegt altijd een nieuwe sectie aan het einde toe, ook als een eerdere sectie geselecteerd is. De tabel scrolt naar die rij en diameter krijgt focus. Diameter en Afstand zijn leeg, zodat je direct kunt typen. De lengte-invoermethode van de laatste sectie wordt overgenomen; de vaste totale aslengte blijft gelijk. Ook een nieuw project begint met lege maatvelden. Een lege afstand blijft onvolledig en telt niet als een automatisch ingevulde eindmaat. CSV-export wordt pas mogelijk nadat de benodigde maten geldig zijn ingevuld.

Met het muiswiel boven de tekening zoom je zonder dat de pagina meescrolt. Buiten de tekening blijft normaal scrollen werken. Inventor-regels en CSV-indeling zijn niet veranderd.

## Compacte invoer in versie 0.9

De afstandskolom heeft een klein invoerveld van circa vier cijfers breed. Rekenen en langere expressies blijven mogelijk; de invoer wordt niet op vier tekens begrensd. **Bewerk** opent een kleine popup in plaats van een extra paneel onder de tabel. Passing en randmaten hebben compacte velden. Linkerrand en Rechterrand staan naast elkaar; op smalle schermen onder elkaar. Wijzigingen worden direct toegepast. Sluiten kan via ×, Sluiten, Escape of buiten de popup klikken. De CSV en Inventor-regels zijn gelijk aan versie 0.8.

## Snelle asopbouw en losse spiebanen in versie 0.8

Vul de tabel **Assecties** rechtstreeks in: diameter, lengte-invoer en afstand. Rekenen blijft in de diameter- en afstandvelden mogelijk. Onder de afstand staat de berekende sectielengte. Nieuwe secties nemen de bestaande invoermethode over. De totale aslengte bovenaan blijft vast totdat je die zelf wijzigt.

Klik op **Bewerk** bij een rij om een compacte popup met de passing en linker/rechter randbewerkingen van die sectie te openen. Klik op × om de details weer dicht te zetten. Een klik op een sectie in de tekening opent dezelfde details. De acties Verwijder en Undo blijven op een vaste plek onder de tabel.

**Spiebanen** heeft een eigen paneel. Gebruik **+ Spiebaan** voor elke sleuf. Alle sleuven hebben een beginpositie vanaf de linkerzijde van de gehele as, totale lengte, breedte en absolute bodemdiameter. Meerdere spiebanen mogen in dezelfde assectie liggen en een spiebaan mag meerdere secties kruisen. Toevoegen, verwijderen en herschikken van assecties verplaatsen of verwijderen de spiebanen niet; de app controleert ze opnieuw tegen de actuele geometrie. Het is ook mogelijk meer spiebanen dan assecties te maken. Ze liggen in deze versie allemaal in dezelfde bestaande freesrichting.

Oude CSV- en projectbestanden openen nog. Bestaande spiebanen worden automatisch naar het aparte paneel overgezet met behoud van hun maten. Bewaar het nieuwe projectbestand om de losse spiebanen, rekenexpressies en absolute lengte-invoer te behouden. Open nieuwe projecten met deze versie; oudere apps kennen het aparte spiebanenpaneel niet.

Gebruik de regels in **Inventor**: Part **2.3.2** en DWG **0.9.25**. Deze verwerken ook extra spiebanen wanneer er meer spiebanen dan assecties zijn. De sectiekolommen blijven gelijk; extra spiebanen krijgen een aparte SPIE-regel die geen extra cilindrische sectie maakt. De oude regel 2.3.1 kan deze extra regels niet lezen. Test het meegeleverde voorbeeld **Drie_spiebanen_op_een_sectie** op je Inventor-pc: de aangepaste regels zijn hier niet in Inventor gecompileerd of uitgevoerd.

## Vaste totale aslengte en invoermethode in versie 0.7

**Totale aslengte** staat bovenaan bij de projectgegevens en blijft exact zoals je die hebt ingevuld, ook bij toevoegen, verwijderen, verplaatsen en omschakelen van secties. Alleen zelf bewerken van dit veld verandert de opgegeven maat. **Berekende lengte** ernaast toont de som van de actuele secties. Met een opgegeven totale lengte moet die som overeenkomen voordat CSV-export mogelijk is. Laat het algemene veld leeg als je alleen losse sectielengtes wilt opbouwen zonder vaste totale maat.

Nieuwe secties nemen altijd de invoermethode van de vorige over. Na Ø12 met rechterrand 14 mm vanaf links krijgt de volgende sectie ook vanaf links (met lege diameter en afstand; vul zelf de volgende rechterrand in). Bij rechts worden de volgende secties nog steeds automatisch omgeschakeld. Vul eerst bovenaan de totale aslengte in voordat je rechts kiest. Als de laatste bestaande sectie al tot het einde loopt, past er geen extra sectie meer binnen de vaste lengte: pas dan de sectiematen aan. De app vergroot de totale lengte nooit automatisch.

## Lengte-invoer in versie 0.6

Kies per sectie **Lengte per sectie**, **Rechterrand vanaf links** of **Rechterrand vanaf rechts**. De twee absolute keuzes meten altijd de rechterrand van de geselecteerde sectie; de app berekent daaruit de sectielengte. Bijvoorbeeld: de vorige rechterrand ligt op 220 mm en de huidige op 262,5 mm vanaf links; de sectielengte wordt 42,5 mm.

Kies je vanaf sectie 7 voor rechts, dan schakelen sectie 7 en alle volgende secties automatisch mee. De bestaande geometrie blijft bij omschakelen gelijk. Je kunt afzonderlijke secties daarna weer op incrementele invoer zetten. Elke nieuwe sectie neemt de invoermethode van de vorige sectie over: incrementeel, vanaf links of vanaf rechts.

Bovenaan staat altijd **Totale aslengte**; stel hier de totale lengte van de schets in voordat je vanaf rechts kiest. Een rechterrand op 94 mm vanaf rechts ligt bij een totale lengte van 515 mm op 421 mm vanaf links. De laatste rechterrand heeft maat 0 vanaf rechts. Deze maat verandert uitsluitend door handmatig bewerken van dit algemene veld.

Rekenexpressies zoals `262,5 - 2,15` blijven in elk maatveld mogelijk. De ingevoerde maat, referentie en rekenexpressie worden bewaard in het projectbestand. CSV bevat berekende incrementele sectielengtes. Gebruik de meegeleverde Inventor-regel 2.3.2, ook voor extra losse spiebanen. Oude CSV-bestanden hebben alleen sectielengtes en openen daarom als incrementele invoer. Gebruik het projectbestand om absolute invoer te bewaren.

Maten die een negatieve of nul sectielengte opleveren, ongeldige expressies en een laatste sectie die niet op de totale aslengte eindigt blokkeren CSV-export. Een wijziging aan een absolute maat past de naastliggende lengtes aan; controleer die berekende lengtes in de sectielijst en tekening.

## Verbeteringen in versie 0.2

De sectielijst heeft een vaste hoogte en scrolt binnen het paneel. Verwijder en Undo blijven daardoor op dezelfde plaats, ook als je achter elkaar secties verwijdert. De invoervelden staan nu direct naast de sectielijst; de tekening staat rechts. Op smallere schermen staat de tekening onder de twee invoerpanelen.

## Verbetering in versie 0.3

Verslepen van de 2D-tekening selecteert geen maatteksten meer. Invoervelden blijven normaal selecteerbaar en bewerkbaar.

## Randbewerkingen per sectie in versie 0.5

Selecteer de sectie waarop een bewerking daadwerkelijk moet komen. Bij die sectie staan **Linkerrand** en **Rechterrand**. De bewerkingen worden ook per sectie en kant opgeslagen, niet meer als gebruikersinvoer bij de aansluiting naar de volgende sectie.

- Bij Ø45 → Ø40 → Ø45 selecteer je de middelste Ø40 en stel je daar links én rechts een ondersnijding in.
- Bij Ø40 → Ø45 → Ø40 selecteer je de middelste Ø45 en stel je daar links én rechts een afschuining in.
- Bij Ø40 → Ø45 → Ø50 kan de middelste Ø45 links een buitenafschuining en rechts een ondersnijding hebben.
- De bewerking op een grote diameter stel je in bij die grote sectie; die op een kleine diameter bij die kleine sectie.
- Een rand aan het uiteinde van de hele as staat eveneens bij de betreffende sectie en kant.

De app biedt op een kleine diameter de binnenrandbewerkingen Radius, binnenafschuining 45°, DIN509-E en DIN76-1 B. Op een grote diameter of kopse uiteinde biedt hij de buitenafschuining met maat en hoek. Bij gelijke aangrenzende diameters is er geen schouder. Als je een diameter wijzigt waardoor een bestaande randbewerking niet meer past, blijft die bewerking op dezelfde sectie staan en wordt export geblokkeerd totdat je hem aanpast. Secties verplaatsen verplaatst hun eigen randbewerkingen mee.

**Maat = axiale lengte in mm, hoek = hoek ten opzichte van de as.** Voor 2 × 15° vul je maat 2 en hoek 15 in. De radiale afname is 2 × tan(15°), ongeveer 0,536 mm. Een lege hoek bij een actieve maat betekent 45°. Kies **Geen** om een randbewerking uit te schakelen.

Je oude CSV's en projecten worden bij openen automatisch vertaald naar de juiste secties en kanten. Nieuwe projectbestanden gebruiken schema 2; oudere appversies kunnen die nieuwe projecten niet openen. De actuele app opent wel oudere projecten. De totale sectie- en aslengte blijven onveranderd door afschuiningen.

De sectiekolommen blijven compatibel met Inventor-regel **2.3.1**; extra losse SPIE-regels vereisen **2.3.2**. De app vertaalt de sectiegebonden invoer naar het bestaande CSV-formaat. Zonder nieuwe buiten-/eindafschuiningen gebruikt hij 12 kolommen, met deze afschuiningen 18 kolommen. Gebruik in deze versie de meegeleverde regel 2.3.2 voor alle ondersteunde combinaties. Gebruik nooit regel 2.2.6 voor een CSV met nieuwe afschuiningen: die zou de extra gegevens overslaan.

De interne CSV-kolomnamen, zoals OvergangRechts en BuitenMaat, beschrijven nog steeds de aansluitingen. Ze bepalen niet waar je de bewerkingen in de app invoert. De zichtbare invoer en opgeslagen projecten horen bij de daadwerkelijke sectie.

In Inventor worden de nieuwe afschuiningen als revolve-cuts gemaakt. De bestaande binnenranden worden eerst gemaakt, de buiten-/eindafschuiningen daarna, de spiebanen vervolgens. De randgegevens worden ook als custom iProperty Rotoras_AfschuiningData opgeslagen. De DWG Generator 0.9.24 blijft ongewijzigd en voegt nog geen extra automatische maatnotities voor deze afschuiningen toe.

De map **Voorbeelden** bevat de drie genoemde asvormen. Open een voorbeeldproject om de linker- en rechterbewerkingen bij de middelste sectie te bekijken. Zie INVENTOR_LEESMIJ.txt voor het gebruiken van de generatorregel.

## Werken met de app

- Selecteer een sectie links; wijzig diameter, lengte, passing en de linker- en rechterrand.
- Met **+** voeg je een sectie na de geselecteerde sectie toe. Met de pijlen wijzig je de volgorde. **Undo** herstelt eerdere invoer tijdens deze sessie.
- Bij diameter en lengte kun je rekenen, bijvoorbeeld `262,8-53,5`, `40+10` of `(40+10)/2`. Getallen gebruiken een komma of punt. Excel-celverwijzingen worden niet ondersteund.
- De tekening verandert direct. X en Y gebruiken dezelfde schaal. Scroll om te zoomen, sleep om de tekening te verplaatsen. **Passend** herstelt het overzicht.
- Kleine secties krijgen pas leesbare maatlabels bij inzoomen. De invoervelden tonen altijd hun exacte waarden.
- Zijaanzicht toont de spiebaanbodem gestippeld. Bovenaanzicht toont de sleuf met breedte en afgeronde uiteinden. De snede blijft op een absolute bodemdiameter, ook over meerdere secties.
- Beginpositie van een spiebaan is vanaf de linker kopse zijde van de hele as. De bodemdiameter is **geen freesdiepte**. De radiale snijdiepte is `(asdiameter - bodemdiameter)/2`.
- Een sleuf mag rechts buiten de as lopen. De aangeleverde Inventor-regel weigert een negatieve beginpositie, ondanks een opmerking over links uitsteken in die regel; de app volgt deze werkelijke controle.
- Projecten worden opgeslagen als `.rotoras.json`. **Open CSV / project** opent deze projecten of bestaande CSV-bestanden.
- Via Instellingen kun je het voorbeeld opnieuw laden en de exportmap instellen.

## Naar Inventor

1. Verhelp de rode invoercontroles. Waarschuwingen blokkeren de export niet.
2. Klik op **Exporteer CSV**. De lokale startversie downloadt het CSV-bestand via de browser. Het bestand staat doorgaans in Downloads, tenzij je browser om een locatie vraagt.
3. Zet de CSV in dezelfde map als je Excel-export, of selecteer het gedownloade bestand rechtstreeks in de Inventor-regel:

   `\\ds01\CadData$\Inventor\Klanten\De bruyn\CSV`

4. Gebruik de meegeleverde Rotoras Generator 2.3.2 in een leeg Inventor-part. De app start Inventor niet automatisch.
5. Gebruik vervolgens de meegeleverde DWG Generator 0.9.25, die ook extra onafhankelijke spiebanen leest.

De eerste 12 CSV-kolommen blijven gelijk aan de echte VBA-export, in exact dezelfde volgorde:

`Sectie;Diameter;Passing;Lengte;OvergangRechts;Radius;Diepte;Breedte;SpieBegin;SpieLengte;SpieBreedte;SpieDiepte`

De export gebruikt puntkomma's, decimale komma's en Windows-regelafbrekingen. Oudere 11-koloms CSV's zonder Passing worden bij import herkend. Het nieuwe 18-koloms formaat wordt eveneens herkend. Onbekende kolomformaten worden geweigerd om gegevensverlies te voorkomen.

## Ondersnijdingen en beperkingen

DIN509-E gebruikt jouw Excel-radius/depth/breedtetabel. De preview volgt de 15°-inloop, vlakke bodem en radius uit jouw iLogic-regel. Bij een te grote radius toont hij de kleinere radius die Inventor zal kiezen. De CSV behoudt de oorspronkelijke radius, diepte en breedte. Dit voorkomt dat een kleinere radius ten onrechte een andere tabeldiepte krijgt.

DIN76-1 B gebruikt exact de 40 metrische grove draadmaten M1 t/m M68 uit jouw bestanden. Bij een niet-standaard diameter, zoals 21,5 mm, rondt de app niet af en blokkeert hij de export. De preview berekent de profielbreedte zoals Inventor; de CSV houdt de Excel-betekenis van Radius/Diepte/Breedte aan. Alleen de draadondersnijding wordt gemodelleerd. Breng de schroefdraad zelf aan in Inventor.

De DIN6885-hulp neemt de adviestabel uit jouw Excel over. Dit advies past een bestaande spiebaan niet automatisch aan.

Tapgaten zitten niet in de aangeleverde Excel of iLogic-koppeling en zijn nog niet ingebouwd. Daarvoor moet het gegevensformaat én de Inventor-regel later worden uitgebreid.

De preview is een geometrische controlehulp en geen vrijgegeven werktekening. Inventor blijft de geometrie en werktekening maken. Het volledige profiel is hier niet in Autodesk Inventor uitgevoerd; test eerst een bekende as en vergelijk de uitkomst voordat je deze versie voor productie gebruikt. De spiebaanweergave is een projectie, zonder exacte booleaanse verwerking van elkaar overlappende sleuven.

## Het echte Windows-programma bouwen

De map `Broncode` bevat dezelfde interface met een Tauri 2 Windows-host. In die versie gebruiken openen en opslaan echte Windows-bestandsdialogen, met de netwerkmap als startlocatie voor CSV-export.

Er zit **geen gecompileerde .exe** in dit pakket. De TypeScript-interface, exporttests en configuratie zijn gecontroleerd; de Rust-host, Windows-dialogen en installer moeten nog op Windows worden gebouwd en getest.

Voor het eenmalig bouwen zijn nodig:

1. Node.js 22.12 of hoger (bij voorkeur Node.js 24 LTS).
2. Rust 1.90 of hoger met de standaard MSVC-toolchain.
3. Microsoft C++ Build Tools, met de workload **Desktop development with C++**.
4. Microsoft Edge WebView2 Runtime.

Herstart na installatie je terminal of computer. Open vervolgens `Broncode/Bouw_Windows.cmd`. Die installeert de vastgelegde npm-afhankelijkheden en bouwt de NSIS-installatie-EXE. De output staat in `Broncode/src-tauri/target/release/bundle/nsis`.

De standaard installer is voor de huidige gebruiker. Een collega die de gebouwde installer ontvangt, hoeft geen Node.js of Rust te installeren. De installer is niet digitaal ondertekend.

Officiële bouwinstructies:

- https://v2.tauri.app/start/prerequisites/
- https://v2.tauri.app/distribute/windows-installer/

## Voor verdere ontwikkeling

Interface: React + TypeScript + SVG. De berekeningen en CSV-uitwisseling staan apart in `src/model.ts`; profielopbouw staat in `src/geometry.ts`. Bestandsopslag staat in `src/files.ts`. Hierdoor kan dezelfde interface later als webapp worden gebruikt.

Vanuit `Broncode`:

```text
npm ci
npm test
npm run build
npm run dev
npm run portable
npm run windows
```

`npm run portable` maakt opnieuw de zelfstandige HTML-testversie. Voor een toekomstige webversie kan de inhoud van `dist` worden gehost. Centrale projectopslag en accounts moeten dan nog worden toegevoegd.

Numerieke uitvoer wordt afgerond op maximaal acht decimalen om rekenartefacten zoals 27,150000000000002 te voorkomen. De ingevoerde expressies blijven in projectbestanden behouden.

## Werktekening v0.22

Eén pagina met doorsnede boven en aanzicht onder, volgens de Inventor-indeling. Absolute lengtematen vanaf de kopse kanten tot de grootste assectie; diameters met passingsgrenzen op drie decimalen staan bij het onderste aanzicht. Afschuining-/radiusnotities staan onder de doorsnede en spiebanen onder het aanzicht. De DIN509-E-tabel staat linksboven. Teksten kunnen worden versleept en worden met het project opgeslagen. Afdrukken/PDF en SVG bevatten hetzelfde volledige blad.

Tolerantiewaarden komen uit de lokale, gecontroleerde brongegevens in src/fits.json. Niet-opgenomen passingen worden expliciet gemeld. CSV en de Inventor-regels houden hun bestaande werking.

### Wijzigingen v0.22

Alle maatteksten zonder witte achtergrond. DIN509-E wordt alleen in de ondersnijdingstabel genoemd; individuele radiuspijlen tonen R. Spiebanen krijgen op het aanzicht echte maten voor de afstand vanaf het begin van de assectie tot het begin van de spiebaan en van begin tot eind van de spiebaan. De breedtemaat krijgt N9 met numerieke toleranties. De radiale diepte staat naast de breedtemaat, met een omhoogwijzend pijltje en horizontale onderstreep. Bij een spiebaan over meerdere diameters wordt elke lokale diepte aangegeven. De losse dieptemaat bij de doorsnede vervalt.

Nieuw v0.22: de profielschets blijft bovenaan zichtbaar tijdens scrollen door assecties, spiebanen en kopse draadgaten. Op smallere schermen staat de schets boven de invoer. Invoercontroles staan onder de kopgaten.

Nieuw v0.22: titel, totale aslengte en profielschets blijven volledig vast. Alleen de invoerkolom vanaf Assecties scrolt, inclusief spiebanen en kopgaten.

Nieuw v0.22: vast assectiepaneel met + en Verwijder/Undo altijd zichtbaar; alleen de tabelregels scrollen. Projectnummer en lengtegegevens staan rechts boven de schets. Spiebanen, kopgaten en invoercontroles staan in een zelfstandig scrollend gedeelte rechts onder de schets.

Nieuw v0.22: compactere gegevens boven de schets. Gebruik Project opslaan (.rotoras.json) voor alle originele invoer, berekeningen, totale lengte, lengtewijzen en bewerkingen. Exporteer CSV is voor de berekende Inventor-maten. Oudere projecten behouden ook lengteberekeningen bij omrekening.

Nieuw v0.22: wissel links tussen Assecties, Spiebanen en Tapgaten. De schets gebruikt het gehele rechterdeel onder de projectgegevens. Wisselen behoudt alle invoer; assectieknoppen blijven vast.
