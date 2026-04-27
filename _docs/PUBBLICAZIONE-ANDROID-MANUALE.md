# Pubblicare nuova versione Android

## 1. Aggiorna app.json
```json
{
  "expo": {
    "version": "1.1.0",  // <- Incrementa versione
    "android": {
      "versionCode": 2  // <- Incrementa version code
    }
  }
}
```

## 2. Crea la build
```bash
eas build --platform android --profile production
```

Aspetta 15-20 minuti.

## 3. Scarica l'AAB

Quando la build è completata, EAS ti darà un link. Scarica il file `.aab`.

Oppure vai su:
https://expo.dev/accounts/alexis89x/projects/funeral-planner-mobile/builds

Trova la build più recente e scarica l'AAB.

## 4. Carica manualmente su Google Play Console

### 4.1. Vai su Google Play Console

https://play.google.com/console

### 4.2. Seleziona l'app

- Clicca su **Tramonto Sereno**

### 4.3. Crea nuova release

- Menu laterale → **Testa e rilascia** → **Produzione**
- Clicca **"Crea nuova release"**

### 4.4. Carica l'AAB

- Trascina il file `.aab` nell'area di upload
- Oppure clicca **"Carica"** e seleziona il file
- Aspetta che venga processato (1-3 minuti)

### 4.5. Compila note di rilascio

**Note sulla release (italiano):**
```
- Aggiunto login con Google per un accesso più rapido e sicuro
- Miglioramenti alla stabilità dell'app
- Correzioni di bug minori
```

### 4.6. Revisiona e pubblica

- Scorri in basso
- Clicca **"Revisiona release"**
- Controlla che tutto sia corretto
- Clicca **"Avvia il roll-out in produzione"**

### 4.7. Conferma pubblicazione

- Clicca **"Distribuisci"** o **"Roll out"**
- Conferma

## 5. Aspetta review

Review: 1-3 giorni (a volte anche poche ore per update)

---

## Opzionale: Rollout graduale

Se vuoi pubblicare gradualmente (consigliato per aggiornamenti importanti):

1. Durante il "Roll-out in produzione", seleziona **"Rollout graduale"**
2. Scegli la percentuale iniziale (es. 10%, 20%, 50%)
3. Monitora crash e feedback
4. Aumenta gradualmente fino al 100%

Per aumentare la percentuale:
- **Produzione** → **Release attive** → **"Gestisci roll-out"** → **"Aumenta roll-out"**

---

## Note

- **versionCode** deve sempre aumentare (non può mai diminuire)
- **version** è il numero visibile agli utenti (1.1.0, 1.2.0, ecc.)
- Android è più veloce e automatico rispetto a iOS
- Puoi pubblicare senza aspettare la review iOS
