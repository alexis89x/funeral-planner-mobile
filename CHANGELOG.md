# Changelog

## [Unreleased]

### Aggiunto
- Schermata contatti di emergenza nativa: lista con swipe per eliminare, azioni rapide per chiamare o inviare email al contatto
- Form nativo per aggiungere e modificare contatti di emergenza
- Schermata documenti allegati: lista con swipe per eliminare, anteprima inline per immagini e PDF, barra di utilizzo spazio
- Form nativo per caricare documenti con selezione tipo documento e note
- Componente `AppWebView` centralizzato: gestisce iniezione token, versione app, messaggi `postMessage` e indicatore di caricamento
- Componente `PlanSwitcher` per cambiare piano attivo direttamente nelle schermate dei servizi
- Utility `hasMultiplePlans` e costanti per i tipi di documento

### Migliorato
- Spazio di archiviazione documenti: il limite massimo viene ora letto dalla risposta API (`upload-list`) invece di essere hardcoded
- Refactoring di tutte le WebView interne (emergenza, servizi, piano, onoranza) per usare `AppWebView`
- Tab Emergenza: voce "Contatti di Emergenza" ora apre la schermata nativa invece di una WebView
- Cache prodotti con TTL configurabile
- Pulizia cache WebView disponibile dalle impostazioni

## [v2.0.0] - 2026-05-13

### Aggiunto
- Pulsante "Cambia onoranza funebre" nella schermata profilo: visibile solo se l'utente è collegato a un'onoranza funebre (`id_partner_referral`), chiede conferma e invia la richiesta tramite API (`user-request-unlink`)
- Richiesta permesso di localizzazione nella schermata "Cerca onoranza": le coordinate vengono passate alla WebView come parametri URL e salvate in `localStorage`
- Banner di aggiornamento disponibile: controlla silenziosamente la versione più recente dell'app all'avvio e mostra un banner una tantum (per versione) con link al download
- Sezione FAQ con categorie e risposte, caricamento dinamico da API con cache giornaliera e fallback locale
- Sezione Tutorial con video guide
- Nuovo tab "Altro" con impostazioni, FAQ, logout e cancellazione account
- Possibilità di scollegare il piano dall'onoranza funebre

### Migliorato
- Nuovo layout della schermata di login
- Navigazione migliorata tra piano personale e piani multipli
- Safe area e layout generale
- Localizzazione della schermata di ricerca
- Aggiornamento dipendenze

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
