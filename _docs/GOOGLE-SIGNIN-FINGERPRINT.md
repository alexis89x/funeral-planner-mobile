# Google Sign-In: Gestione Fingerprint SHA-1

## ⚠️ Domanda Importante: Va fatto per ogni release?

**NO! È una configurazione ONE-TIME!** 🎉

Una volta configurati i fingerprint SHA-1 su Google Cloud Console, **non devi rifarlo per ogni release**. I fingerprint rimangono gli stessi per tutte le versioni future dell'app (1.0.0, 1.0.1, 2.0.0, ecc.).

**Devi riconfigurare SOLO se:**
- Crei una nuova app/progetto da zero
- Resetti le credentials EAS (molto raro)
- Cambi l'App Signing su Play Store (praticamente mai)

**In pratica:** Configurazione iniziale → Funziona per sempre ✅

---

## Il Problema

Google Sign-In su Android richiede che i **fingerprint SHA-1** dell'app siano registrati nella Google Cloud Console. Il problema è che **ogni tipo di build genera un fingerprint diverso**, e questo può causare errori di autenticazione.

## Perché esistono fingerprint diversi?

Android firma ogni APK/AAB con una **chiave crittografica** (keystore). Ogni keystore genera un fingerprint SHA-1 unico. Nel nostro flusso di sviluppo e distribuzione abbiamo **3 diversi keystore**:

### 1. **Development Build** (Build locale)
- Generato da: `npx expo run:android`
- Keystore: Debug keystore Android (locale)
- Uso: Testing locale durante sviluppo

### 2. **EAS Build** (Preview/Direct Distribution)
- Generato da: `eas build --profile preview`
- Keystore: Gestito da EAS (creato alla prima build)
- Uso: Build di test distribuite direttamente (non via Play Store)

### 3. **Play Store Distribution** (Produzione)
- Generato da: Google Play App Signing
- Keystore: Gestito da Google Play Console
- Uso: App scaricate dagli utenti dal Play Store

**⚠️ IMPORTANTE:** Quando carichi un AAB su Play Store, Google **ri-firma l'app con la sua chiave** (Play App Signing). Questo genera un fingerprint **completamente diverso** da quello della build EAS!

## Come ottenere i fingerprint

### 1. Fingerprint Development (Locale)

Per ottenere il fingerprint della build locale:

```bash
cd android
./gradlew signingReport
```

Cerca la sezione `debug` e copia il `SHA-1`.

### 2. Fingerprint EAS Build

Per ottenere il fingerprint delle build EAS:

```bash
eas credentials
```

1. Seleziona **Android**
2. Scegli il profilo (**preview** o **production**)
3. Vai su **Keystore: Manage everything needed to build your project**
4. Copia il **SHA1 Fingerprint**

**Nota:** Preview e production di solito usano lo stesso keystore, quindi hanno lo stesso fingerprint.

**Esempio output:**
```
SHA1 Fingerprint: 7D:FD:98:C8:AD:C6:19:77:D1:07:38:47:97:87:BA:65:EB:35:10:87
```

### 3. Fingerprint Play Store

Per ottenere il fingerprint usato da Google Play:

1. Vai su **Google Play Console**
2. Seleziona la tua app
3. **Setup → App signing** (o "Configurazione → Firma dell'app")
4. Cerca **"App signing key certificate"**
5. Copia il **SHA-1 certificate fingerprint**

**⚠️ Questo è il più importante** perché è quello che vedranno gli utenti finali!

## Come configurare Google Cloud Console

### 1. Vai su Google Cloud Console

https://console.cloud.google.com

### 2. Seleziona il progetto

Scegli il progetto associato alla tua app (es: "Tramonto Sereno")

### 3. Vai su Credentials

**API & Services → Credentials**

### 4. Trova/Crea OAuth 2.0 Client ID per Android

Se non esiste, crealo:
- Tipo: **Android**
- Nome: Es. "Tramonto Sereno Android"
- Package name: `it.nanuktechnology.tramontosereno`

### 5. Aggiungi TUTTI i fingerprint

Clicca sul Client ID Android e aggiungi:

1. **SHA-1 Development** (se fai test locali)
2. **SHA-1 EAS Build** (per build preview/dirette)
3. **SHA-1 Play Store** (per app distribuite dal Play Store)

**⚠️ NON RIMUOVERE i fingerprint precedenti!** Google OAuth accetta multipli SHA-1 per lo stesso Client ID.

### Esempio configurazione finale:

```
Client ID Android: Tramonto Sereno Android
Package name: it.nanuktechnology.tramontosereno

SHA-1 Fingerprints:
1. AA:BB:CC:DD... (Development - debug keystore)
2. 7D:FD:98:C8... (EAS Build)
3. XX:YY:ZZ:WW... (Play Store App Signing)
```

## Verifica configurazione app.json

Assicurati che `app.json` abbia il Web Client ID corretto:

```json
{
  "expo": {
    "plugins": [
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.XXXXX",
          "androidClientId": "XXXXX.apps.googleusercontent.com"
        }
      ]
    ]
  }
}
```

**⚠️ IMPORTANTE:** Usa il **Web Client ID**, NON l'Android Client ID!

## Troubleshooting

### Errore: "DEVELOPER_ERROR" o "Error 10"

**Causa:** Il fingerprint SHA-1 non è stato aggiunto a Google Cloud Console o non corrisponde.

**Soluzione:**
1. Verifica quale build stai usando (locale/EAS/Play Store)
2. Ottieni il fingerprint corretto per quella build
3. Aggiungilo a Google Cloud Console
4. Aspetta 5-10 minuti per la propagazione

### Errore: Package name mismatch

**Causa:** Il package name su Google Cloud Console non corrisponde a quello dell'app.

**Soluzione:**
- Package name app: `it.nanuktechnology.tramontosereno`
- Package name Google Cloud: deve essere **identico**

### Login funziona in sviluppo ma non in produzione

**Causa:** Hai aggiunto solo il fingerprint EAS, ma non quello Play Store.

**Soluzione:**
- Ottieni il fingerprint Play Store (vedi sopra)
- Aggiungilo a Google Cloud Console
- Crea una nuova release e caricala su Play Store

### Login funziona su Play Store ma non in preview

**Causa:** Hai aggiunto solo il fingerprint Play Store, ma non quello EAS.

**Soluzione:**
- Ottieni il fingerprint EAS (vedi sopra)
- Aggiungilo a Google Cloud Console

## Best Practices

1. ✅ **Aggiungi TUTTI i fingerprint** (development, EAS, Play Store) fin dall'inizio
2. ✅ **Non rimuovere** fingerprint precedenti quando ne aggiungi di nuovi
3. ✅ **Aspetta 5-10 minuti** dopo aver aggiunto fingerprint prima di testare
4. ✅ **Testa su ogni tipo di build** (locale, preview, Play Store) prima del rilascio
5. ✅ **Documenta i fingerprint** in un posto sicuro per riferimento futuro

## Riepilogo Checklist

Prima di rilasciare in produzione, verifica:

- [ ] Fingerprint EAS aggiunto a Google Cloud Console
- [ ] Fingerprint Play Store aggiunto a Google Cloud Console
- [ ] Package name corretto su Google Cloud Console
- [ ] Web Client ID corretto in app.json
- [ ] Testato login su build EAS preview
- [ ] Testato login su app scaricata da Play Store (internal/alpha test)
- [ ] Aspettato 5-10 minuti dopo ogni modifica a Google Cloud Console

## Riferimenti

- [Google Sign-In Android Setup](https://developers.google.com/identity/sign-in/android/start-integrating)
- [Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756)
- [EAS Build Credentials](https://docs.expo.dev/app-signing/app-credentials/)
