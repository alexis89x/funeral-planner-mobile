# Pubblicare nuova versione iOS

## 1. Aggiorna app.json
```json
{
  "expo": {
    "version": "1.1.0",  // <- Incrementa versione
    "ios": {
      "buildNumber": "3"  // <- Incrementa build number
    }
  }
}
```

## 2. Crea la build
```bash
eas build --platform ios --profile production
```

Aspetta 15-20 minuti.

## 3. Submit su App Store Connect
```bash
eas submit --platform ios --profile production
```

Aspetta 10-15 minuti.

## 4. Su App Store Connect

https://appstoreconnect.apple.com/apps/6758154902/distribution

### 5. Crea nuova versione

- Menu laterale sinistro → sotto "iOS App" → clicca "+"
- Seleziona versione: **1.1.0**

### 6. Compila campi obbligatori

**What's New in This Version:**
```
- Aggiunto login con Google per un accesso più rapido e sicuro
- Miglioramenti alla stabilità dell'app
- Correzioni di bug minori
```

### 7. Seleziona la build

- Sezione "Build" → clicca "+ Select a build before you submit your app"
- Seleziona **build 3** (versione 1.1.0)
- Clicca "Done"

### 8. Submit

- Clicca "Save" (in alto a destra)
- Clicca "Submit for Review" (in alto a destra)
- Conferma

### 9. Aspetta review

Review: 24-48 ore (di solito più veloce per update)
