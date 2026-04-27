# Changelog

## [v1.3.0] - 2026-04-27

### Aggiunto
- Schermata contatto di emergenza con WebView dedicata
- Tab Emergenza con navigazione interna
- Gestione postMessage della webapp nelle schermate di emergenza

### Migliorato
- Cache intelligente per le WebView: ricarica solo se i dati sono scaduti (3 ore)
- Gestione cambio piano: force reload alla navigazione verso il piano selezionato
- Gestione cambio password obbligatorio al login (status 350)

### Corretto
- Navigazione corretta dopo il cambio piano


## [v1.2.0] - 2026-03-28

### Aggiunto
- Pulsante per creare una nuova pianificazione
- Tab Emergenza
- Comando `refreshUser` nei messaggi dalla webapp
- Verifica upgrade del piano con relativo flusso di navigazione

### Migliorato
- Layout generale della schermata piani
- Rimozione cache lato WebView per garantire contenuti aggiornati


## [v1.1.0] - 2026-02-19

### Aggiunto
- Schermata "I miei piani" con lista piani e cambio piano attivo
- Schermata prodotti/servizi
- Login Google con selezione account forzata
- Image picker per il profilo utente
- Loading screen iniziale
- Supporto `tsMobileApp` flag iniettato nelle WebView
- Mostra ultima email salvata nella schermata di login
- Eliminazione account (parziale)

### Migliorato
- Layout servizi e icone tab
- Integrazione con versione minima richiesta dal backend
- Schermata onoranza funebre usa la pagina nativa
- Login email: mostra indicatore di forza password
- Safe area view su tutti gli schermi principali

### Corretto
- Navigazione verso il piano dopo il login
- Problemi di TypeScript e lint
- Fix standalone mode e filename nelle WebView


## [v1.0.0] - 2026-01-12

### Prima release
- Login via email con token JWT
- WebView principale con iniezione token
- Tab: Il mio piano, Servizi, Onoranza funebre, Profilo
- Download PDF da WebView
- Gestione messaggi postMessage dalla webapp (goBack, navigate, downloadPDF)
- Tema chiaro/scuro
- Build Android e iOS