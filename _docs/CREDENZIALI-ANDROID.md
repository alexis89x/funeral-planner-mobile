# Gestione Credenziali Android (Keystore & SHA-1)

Questo file è il riferimento per **dove si trovano e come si gestiscono** le chiavi di firma Android del progetto (EAS + Google Play Console). Per il troubleshooting specifico di Google Sign-In (errore DEVELOPER_ERROR, quali SHA-1 aggiungere su Google Cloud) vedi **[GOOGLE-SIGNIN-FINGERPRINT.md](./GOOGLE-SIGNIN-FINGERPRINT.md)** — qui invece ci si concentra sulle credenziali stesse.

## Riferimenti per questa app (Archivio Sereno)

- Package name: `it.nanuktechnology.archiviosereno`
- Account Expo: `alexis89x`
- Progetto EAS: `funeral-planner-mobile` (projectId `c768f55c-8f2f-4db8-b998-a7f5f552e1db`)
- Build EAS: https://expo.dev/accounts/alexis89x/projects/funeral-planner-mobile/builds
- Google Play Console → **Key management** (app Archivio Sereno):
  https://play.google.com/console/u/0/developers/5699085522584129759/app/4973863053348094466/keymanagement

> ⚠️ Se lavori su un altro tema/app del monorepo (es. Tramonto Sereno), package name, projectId e link Play Console sono **diversi** — aggiorna questa sezione con i valori corretti prima di seguirne le istruzioni.

## Le 3 chiavi in gioco

| Chiave | Dove vive | Usata per |
|---|---|---|
| **Debug keystore** | `android/app/debug.keystore` (locale, generico Android) | Build locali (`npx expo run:android`) |
| **Upload keystore** | Gestita da EAS (cloud) | Firma il `.aab` generato da `eas build --profile production` prima dell'upload |
| **App signing key** | Gestita da Google Play (Play App Signing) | Ri-firma l'app dopo l'upload: è la chiave con cui l'app arriva davvero sui dispositivi degli utenti |

Google Play **non pubblica mai** l'AAB firmato con la tua upload key: lo ri-firma con la app signing key. Per questo il fingerprint SHA-1 "reale" da usare in produzione è quello di Play Console, non quello di EAS.

## 1. Gestire la Upload Keystore via EAS

Comando principale:

```bash
eas credentials
```

1. Seleziona **Android**
2. Seleziona il progetto/profilo (es. `production`)
3. Menu **Keystore: Manage everything needed to build your project**

Da qui puoi:

- **View keystore** → mostra SHA-1 / SHA-256 / MD5 fingerprint
- **Download keystore** → scarica il file `.jks` + password (fai un backup offline, non è recuperabile se persi l'accesso EAS)
- **Set up a new keystore** → ⚠️ distruttivo, genera una nuova upload key: da fare solo se stai facendo la primissima build o sai cosa comporta (vedi sezione "Upload key reset" sotto se devi sostituirla su un'app già pubblicata)
- **Remove keystore** → ⚠️ non farlo mai su un'app già in produzione senza aver prima scaricato un backup

Verifica non interattiva (senza menu):

```bash
eas credentials --platform android --non-interactive
```

## 2. Google Play Console — Key management

Link diretto (Archivio Sereno): https://play.google.com/console/u/0/developers/5699085522584129759/app/4973863053348094466/keymanagement

In questa pagina trovi due sezioni:

### App signing key
- Il certificato con cui Google **ri-firma davvero** l'app prima di distribuirla.
- Da qui copi il **SHA-1 certificate fingerprint** da usare nelle configurazioni OAuth/Google Sign-In per la build di produzione reale (quella scaricata dagli utenti dallo Store).
- Puoi anche scaricare il certificato pubblico (`.pem`), utile per servizi terzi che richiedono il certificato e non solo il fingerprint.

### Upload key
- Il certificato con cui **tu** firmi l'AAB prima di caricarlo (coincide con la keystore gestita da EAS).
- Da qui puoi vedere il fingerprint dell'upload key attualmente registrata.
- **Upload key reset**: se perdi l'accesso all'upload keystore (es. reset accidentale su EAS), da questa pagina puoi richiedere la sostituzione dell'upload key — richiede l'approvazione di Google e qualche giorno di attesa. Evitabile facendo sempre un backup della keystore EAS (vedi sopra).

> Serve un account con permessi di **Release manager/Admin** sul Play Console per vedere/modificare questa pagina.

## 3. Dove usare i fingerprint SHA-1 ottenuti

Una volta recuperati i 2-3 fingerprint (debug locale, EAS upload key, Play app signing key), vanno registrati come Client ID Android su **Google Cloud Console → API & Services → Credentials**, seguendo lo step-by-step in [GOOGLE-SIGNIN-FINGERPRINT.md](./GOOGLE-SIGNIN-FINGERPRINT.md).

## Checklist di sicurezza

- [ ] Ho scaricato e salvato offline (password manager / storage cifrato) un backup della upload keystore EAS
- [ ] So dove trovare la pagina Key management di Play Console per questa app (link sopra)
- [ ] Ho aggiunto sia il fingerprint EAS che quello Play Store su Google Cloud Console
- [ ] Nessuna keystore o file `.jks`/`.keystore` è committata nel repo (verifica `.gitignore`)
- [ ] Solo persone autorizzate hanno accesso a `eas credentials` (account Expo) e al ruolo Admin su Play Console