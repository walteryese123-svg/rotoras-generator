# Controles v0.22

65 modeltests geslaagd: bestaande CSV/geometry/draadcontroles plus absolute lengtes, ISO-tolerantiegrenzen en automatische labelplaatsing.
TypeScript/offline productiebuild gecontroleerd.
Browsercontrole: precies één blad, labelvakken zonder onderlinge overlap, numerieke passingen, slepen/opslag, SVG-download en tabletbreedte. A3 én A4 leveren één PDF-pagina. UNC-kopgat, linkse draad, kamer en buitendraad apart gecontroleerd.
Passingsbron: Schaeffler MH1 pp.10–16; Helion Tools voor ≤3 mm; RE-AL AG voor N9 ≤50 mm. Bronverwijzingen in src/fits.json.
Bij onvoldoende bladruimte of een niet-opgenomen passing meldt het programma dit; het drukt geen onvolledige werktekening af. Handmatig verplaatste teksten zijn door de gebruiker af te stellen.
Geen Windows executable of tabletinstallatie gebouwd. Inventor-regels blijven afzonderlijk beschikbaar.

Extra browsercontrole v0.22: geen witte tekstachtergronden, slechts één DIN509-E-vermelding, juiste beginmaat/lengte/N9/diepte. Extra modeltest: spiebaan begint in tweede sectie en loopt over een diameterstap; relatieve beginmaat en beide radiale dieptes kloppen.

Extra browsertest: 192 mm as met Ø50, twee spiebanen, M4-kopgat, buitendraad, passingen en veel randbewerkingen. Beide N9-aanduidingen worden geplaatst; geen ruimtemelding; hulplijnen beginnen op de hartlijn.

Wijziging v0.22: vaste profielschets en verplaatsing invoercontroles naar de invoerkolom. TypeScript/Vite-build en Tauri-configuratiecontrole geslaagd. Browsercontrole in deze sessie kon niet starten door een onbruikbaar browserbestand; controleer scrollgedrag na openen.

Wijziging v0.22: vaste schermindeling met zelfstandig scrollende invoerkolom. TypeScript/Vite-build en Tauri-configuratiecontrole geslaagd. Browsercontrole is in deze omgeving niet beschikbaar.

Wijziging v0.22: assectiepaneel op volledige linkerhoogte, alleen tabelregels scrollen. Projectgegevens rechts en apart scrollvak voor spiebanen/kopgaten. TypeScript/Vite-build en Tauri-configuratiecontrole geslaagd; browsercontrole niet beschikbaar in deze omgeving.

Wijziging v0.22: compacte projectbalk en volledige projectopslag. Alle 67 tests geslaagd, inclusief exacte formules, vaste totale lengte, gemengde lengtewijzen, bewerkingen en oud project zonder lengthInput. TypeScript/Vite-build geslaagd. Schermindeling hier niet in een browser getest.

Wijziging v0.22: gedeeld invoerpaneel met Assecties/Spiebanen/Tapgaten. Panelen blijven gemonteerd bij wisselen om invoer en scrollpositie te behouden. TypeScript/Vite-build geslaagd; browsercontrole niet beschikbaar.
