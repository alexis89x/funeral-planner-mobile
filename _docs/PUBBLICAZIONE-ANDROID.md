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

## 3. Submit su Google Play Console
```bash
eas submit --platform android --profile production
```

Aspetta 10-15 minuti.

## 4. Su Google Play Console

https://play.google.com/console

### 5. Vai alla tua app

- Seleziona **Tramonto Sereno**
- Menu laterale → **Release** → **Produzione**

### 6. Crea nuova release

- Clicca **"Crea nuova release"**
- La build dovrebbe essere già caricata automaticamente da EAS
- Se non vedi la build, aspetta qualche minuto e ricarica la pagina

### 7. Compila note di rilascio

**Note sulla release (italiano):**
```
- Aggiunto login con Google per un accesso più rapido e sicuro
- Miglioramenti alla stabilità dell'app
- Correzioni di bug minori
```

Puoi aggiungere altre lingue se necessario (inglese, ecc.)

### 8. Revisiona e pubblica

- Scorri in basso
- Clicca **"Revisiona release"**
- Controlla che tutto sia corretto
- Clicca **"Avvia il roll-out in produzione"**

### 9. Conferma pubblicazione

- Clicca **"Distribuisci"** o **"Roll out"**
- Google Play Console ti chiederà conferma
- Conferma

### 10. Aspetta review

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
