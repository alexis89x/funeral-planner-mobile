# Build e Distribuzione - Tramonto Sereno Mobile

Questa guida spiega come compilare l'app e distribuirla su App Store e Google Play Store.

## Indice

- [Prerequisiti](#prerequisiti)
- [Setup Iniziale](#setup-iniziale)
- [Profili di Build](#profili-di-build)
- [Build per Sviluppo](#build-per-sviluppo)
- [Build per Preview/Testing](#build-per-previewtesting)
- [Build per Produzione](#build-per-produzione)
- [Distribuzione su App Store (iOS)](#distribuzione-su-app-store-ios)
- [Distribuzione su Google Play Store (Android)](#distribuzione-su-google-play-store-android)
- [Aggiornamenti OTA](#aggiornamenti-ota)
- [Troubleshooting](#troubleshooting)

---

## Prerequisiti

### Software Richiesto

1. **Node.js** (v18 o superiore)
   ```bash
   node --version
   ```

2. **npm** o **yarn**
   ```bash
   npm --version
   ```

3. **Expo CLI** e **EAS CLI**
   ```bash
   npm install -g expo-cli eas-cli
   ```

4. **Account Expo**
   - Registrati su [expo.dev](https://expo.dev)
   - Questo progetto è configurato sotto l'account: `alexis89x`

### Account Developer

#### Per iOS (App Store)
- **Apple Developer Account** ($99/anno)
- Accesso a [App Store Connect](https://appstoreconnect.apple.com)
- Configurazione App ID: `com.alexis89x.funeralplannermobile`

#### Per Android (Google Play)
- **Google Play Developer Account** ($25 una tantum)
- Accesso a [Google Play Console](https://play.google.com/console)
- Package name: `com.alexis89x.funeralplannermobile`

---

## Setup Iniziale

### 1. Installa le dipendenze

```bash
npm install
```

### 2. Login su EAS

```bash
eas login
```

Inserisci le credenziali dell'account Expo (`alexis89x`).

### 3. Verifica la configurazione

```bash
eas whoami
# Output: alexis89x

eas project:info
# Dovrebbe mostrare: funeral-planner-mobile (c768f55c-8f2f-4db8-b998-a7f5f552e1db)
```

---

## Profili di Build

Il progetto ha 4 profili di build configurati in `eas.json`:

### 1. **development**
- Build di sviluppo con Expo Dev Client
- Distribuzione interna
- Per testing locale su dispositivi fisici

### 2. **development-simulator**
- Estende il profilo `development`
- Solo iOS
- Per testing su simulatore iOS

### 3. **preview**
- Build di preview per testing interno
- Genera APK per Android (non AAB)
- Per condividere con tester prima del rilascio

### 4. **production**
- Build per distribuzione negli store
- Auto-incrementa il build number
- Genera AAB per Android e IPA per iOS

---

## Build per Sviluppo

### Build per dispositivo fisico

```bash
# iOS
eas build --profile development --platform ios

# Android
eas build --profile development --platform android

# Entrambe le piattaforme
eas build --profile development --platform all
```

### Build per simulatore iOS

```bash
eas build --profile development-simulator --platform ios
```

### Installazione su dispositivo

Dopo il completamento della build, EAS fornisce un URL. Puoi:

1. **Scansionare il QR code** con il dispositivo
2. **Aprire il link** direttamente sul dispositivo
3. **Scaricare e installare** manualmente

Per iOS, potrebbe essere necessario registrare l'UDID del dispositivo:

```bash
eas device:create
```

---

## Build per Preview/Testing

Per condividere l'app con tester interni prima della distribuzione pubblica:

```bash
# iOS (genera IPA per TestFlight o distribuzione ad-hoc)
eas build --profile preview --platform ios

# Android (genera APK installabile direttamente)
eas build --profile preview --platform android

# Entrambe
eas build --profile preview --platform all
```

Il profilo `preview` è ideale per:
- Beta testing interno
- Condivisione con stakeholder
- Testing QA prima del rilascio

---

## Build per Produzione

### 1. Verifica la versione dell'app

Controlla e aggiorna il numero di versione in `app.json`:

```json
{
  "expo": {
    "version": "1.0.0",
    ...
  }
}
```

### 2. Esegui la build di produzione

```bash
# iOS
eas build --profile production --platform ios

# Android
eas build --profile production --platform android

# Entrambe
eas build --profile production --platform all
```

**Nota**: Il build number viene incrementato automaticamente grazie a `"autoIncrement": true`.

### 3. Monitora la build

Puoi monitorare lo stato della build:
- Sul terminale
- Su [expo.dev/builds](https://expo.dev/accounts/alexis89x/projects/funeral-planner-mobile/builds)

---

## Distribuzione su App Store (iOS)

### Opzione 1: Submit Automatico con EAS

Il modo più semplice è usare EAS per submit automatico:

```bash
# Build e submit in un comando
eas build --profile production --platform ios --auto-submit

# Oppure submit di una build esistente
eas submit --platform ios
```

Durante il processo ti verrà chiesto:
- Credenziali Apple ID
- Password specifica per l'app (se usi 2FA)
- Quale build vuoi submittare

### Opzione 2: Submit Manuale

1. **Scarica l'IPA** dalla dashboard di EAS

2. **Usa Transporter** (app macOS):
   - Apri Transporter
   - Trascina l'IPA nell'app
   - Clicca "Deliver"

3. **Oppure usa altool**:
   ```bash
   xcrun altool --upload-app --type ios \
     --file build.ipa \
     --username your@email.com \
     --password "app-specific-password"
   ```

### Configurazione su App Store Connect

1. Vai su [App Store Connect](https://appstoreconnect.apple.com)
2. Seleziona "Le mie app" → "Tramonto Sereno"
3. Nella sezione **Build**:
   - Attendi che la build venga processata (10-30 minuti)
   - Seleziona la build caricata
4. Compila i metadati richiesti:
   - Screenshot (richiesti per vari dispositivi)
   - Descrizione dell'app
   - Parole chiave
   - URL supporto e privacy policy
   - Informazioni sul copyright
5. Invia per la revisione

**Tempo di revisione**: 1-3 giorni lavorativi.

---

## Distribuzione su Google Play Store (Android)

### Opzione 1: Submit Automatico con EAS

```bash
# Build e submit in un comando
eas build --profile production --platform android --auto-submit

# Oppure submit di una build esistente
eas submit --platform android
```

Ti verrà chiesto di fornire:
- Service Account JSON (la prima volta)
- Quale build vuoi submittare

### Opzione 2: Submit Manuale

1. **Scarica l'AAB** dalla dashboard di EAS

2. **Vai alla Google Play Console**:
   - Apri [play.google.com/console](https://play.google.com/console)
   - Seleziona "Tramonto Sereno"

3. **Carica l'AAB**:
   - Vai su "Release" → "Produzione"
   - Clicca "Crea nuova release"
   - Carica l'AAB scaricato
   - Aggiungi le note di rilascio

4. **Compila le informazioni richieste**:
   - Screenshot (phone, tablet, ecc.)
   - Icona dell'app (512x512 PNG)
   - Grafica promozionale
   - Descrizione breve e completa
   - Categoria dell'app
   - Informazioni sul contenuto

5. **Invia per la revisione**

**Tempo di revisione**: poche ore fino a 7 giorni.

### Configurazione Service Account (Prima Volta)

Per il submit automatico Android, devi configurare un Service Account:

1. Vai su [Google Cloud Console](https://console.cloud.google.com)
2. Crea un Service Account
3. Scarica il JSON delle credenziali
4. Su Google Play Console, assegna i permessi al Service Account

Quando esegui `eas submit --platform android` la prima volta, ti verrà chiesto di caricare questo file JSON.

---

## Aggiornamenti OTA

Expo permette di inviare aggiornamenti over-the-air (OTA) senza ricompilare l'app per:
- Modifiche JavaScript
- Aggiornamenti delle risorse (immagini, font, ecc.)

**Non funziona per**:
- Modifiche al codice native
- Aggiornamenti dei moduli nativi
- Modifiche a `app.json` che richiedono rebuild

### Pubblicare un aggiornamento

```bash
# Pubblica su production
eas update --branch production --message "Descrizione aggiornamento"

# Pubblica su preview
eas update --branch main --message "Fix bug UI"
```

### Configurazione Update

L'app è configurata per ricevere aggiornamenti da:
```
https://u.expo.dev/c768f55c-8f2f-4db8-b998-a7f5f552e1db
```

Gli update sono legati alla versione dell'app (`"policy": "appVersion"`).

---

## Troubleshooting

### Build fallisce su iOS

**Problema**: Certificati mancanti o scaduti

```bash
# Rigenera i certificati
eas credentials
```

Seleziona iOS → Gestisci certificati → Rigenera

### Build fallisce su Android

**Problema**: Keystore mancante

```bash
# EAS gestisce automaticamente il keystore
# Se necessario, rigeneralo
eas credentials
```

### App rifiutata da App Store

Controlla i motivi comuni:
- Mancano screenshot richiesti
- Privacy policy non accessibile
- Funzionalità non documentate
- Crash durante la review

Vai su App Store Connect → Resolution Center per dettagli.

### App rifiutata da Google Play

Motivi comuni:
- Mancano dichiarazioni obbligatorie (privacy, content rating)
- Screenshot non conformi
- Descrizione inadeguata

Controlla la Play Console per i dettagli del rifiuto.

### Build troppo lenta

Le build EAS possono richiedere 10-30 minuti. Per accelerare:

```bash
# Usa priority build (richiede piano a pagamento)
eas build --profile production --platform ios --priority high
```

### Update OTA non ricevuto

Verifica:
1. L'app è connessa a Internet
2. Il channel corrisponde (production vs main)
3. La versione app corrisponde al runtime version
4. L'app è stata chiusa e riaperta

Forza il controllo:
```bash
# Nell'app, shake per aprire dev menu → Check for updates
```

---

## Comandi Utili

```bash
# Visualizza build recenti
eas build:list

# Visualizza info progetto
eas project:info

# Controlla stato submit
eas submit:list

# Visualizza update recenti
eas update:list

# Visualizza credenziali configurate
eas credentials

# Apri la dashboard web del progetto
eas open

# Controlla configurazione EAS
eas config --type build
```

---

## Link Utili

- **EAS Dashboard**: [expo.dev/accounts/alexis89x/projects/funeral-planner-mobile](https://expo.dev/accounts/alexis89x/projects/funeral-planner-mobile)
- **Documentazione EAS Build**: https://docs.expo.dev/build/introduction/
- **Documentazione EAS Submit**: https://docs.expo.dev/submit/introduction/
- **Documentazione EAS Update**: https://docs.expo.dev/eas-update/introduction/
- **App Store Connect**: https://appstoreconnect.apple.com
- **Google Play Console**: https://play.google.com/console

---

## Note Importanti

1. **Backup delle Credenziali**: EAS gestisce automaticamente certificati e keystore, ma è buona pratica scaricare backup periodici tramite `eas credentials`.

2. **Versioning**: Segui il [Semantic Versioning](https://semver.org/):
   - MAJOR.MINOR.PATCH (es: 1.2.3)
   - Incrementa MAJOR per breaking changes
   - Incrementa MINOR per nuove features
   - Incrementa PATCH per bug fix

3. **Testing Prima del Release**: Usa sempre il profilo `preview` per testare l'app prima di rilasciare in produzione.

4. **Store Guidelines**: Leggi le linee guida degli store prima del submit:
   - [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
   - [Google Play Policy](https://play.google.com/about/developer-content-policy/)

5. **Costi**:
   - Expo EAS: Piano gratuito disponibile con limitazioni
   - Apple Developer: $99/anno
   - Google Play: $25 una tantum

---

## Supporto

Per problemi o domande:
- Documentazione Expo: https://docs.expo.dev
- Forum Expo: https://forums.expo.dev
- Discord Expo: https://chat.expo.dev
