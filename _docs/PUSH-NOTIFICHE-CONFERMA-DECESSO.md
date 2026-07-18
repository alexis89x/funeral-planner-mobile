# Piano di implementazione: notifica push su conferma decesso

**Data:** 2026-07-12
**Stato:** proposta, non ancora implementata
**Repo coinvolti:** `funeral-planner-mobile` (questo repo) + `funeral-planner-api`

---

## 1. Obiettivo

Quando il contatto di emergenza conferma il decesso (`v1/plan/request-deceased.php`), oggi il proprietario del piano riceve **solo un'email** (`ec-unlock-plan-check-owner`) per poter smentire entro il buffer prima che `cron-ok/finalize-deceased-claims.php` finalizzi la richiesta. Vogliamo aggiungere una **notifica push** che raggiunga l'utente anche ad app chiusa, dato che si tratta di un alert critico e time-sensitive.

## 2. Stato attuale (ricerca già fatta)

- **Email**: già presente e funzionante, via coda filesystem (`AppUtilsMail::addToPendingEmails`, ADR-006).
- **Push**: infrastruttura solo parziale.
  - Tabella `devices` (API) ha già la colonna `push_token`, salvata da `login.php` → `DevicesModelExtended::saveOrUpdateDevice()` (`classes/class.devices.extended.php`).
  - **Ma nessun client la popola davvero**: l'app mobile non ha `expo-notifications` come dipendenza e non manda mai `push_token` nel form-data di login (`contexts/AuthContext.tsx:361-419` manda `device_id`, `device_name`, `device_type`, `os`, `app_version`, ecc. ma non `push_token`).
  - **Nessun codice backend invia mai un push reale** (nessuna chiamata a Expo Push API, nessuna classe `PushService`). Il campo è scaffolding morto.
  - Non esiste un endpoint dedicato di registrazione/aggiornamento device: l'unico punto che scrive su `devices` è `login.php`.
- **Sistema di notifiche in-app** (`classes/class.notifications.php`, `notifications-get.php`, `notifications-set-closed.php`) esiste ma è usato solo da `message-send.php` (messaggistica interna); nessuna UI mobile o web lo consuma come centro notifiche. Non è un canale pronto all'uso per questo scopo.
- **Il rebuke lato utente esiste già ed è semplice**: `components/AreYouAliveModal.tsx` mostra un modal bloccante ovunque nell'app non appena `userProfile.current_plan.deceased` è valorizzato, e chiama l'endpoint `i-am-alive`. Questo significa che **non serve un deep link complesso**: basta che l'utente apra l'app — il modal compare da solo al reload del profilo. La notifica push deve solo portare l'utente ad aprire l'app.
- Expo SDK 54, `expo-dev-client` già presente → serve comunque una dev build / build EAS per testare i push (niente Expo Go). `app.json` ha già un `projectId` EAS configurato (`c768f55c-8f2f-4db8-b998-a7f5f552e1db`), necessario per `getExpoPushTokenAsync`.

## 3. Architettura proposta

Seguire lo stesso pattern a coda filesystem già usato per email/Telegram (ADR-006), per coerenza e per non introdurre latenza/accoppiamento nella request `request-deceased`:

```
request-deceased.php
   │ (request time)
   ▼
AppUtilsPush::addToPendingPush(...)   →  scrive un file .pushmsg in _data/_emails_/ (o nuova dir _data/_push_/)
   │ (cron, ogni minuto/pochi minuti)
   ▼
v1/cron-ok/send-pending-push.php      →  legge i .pushmsg, chiama Expo Push API, cancella i file su successo
```

## 4. Fasi

### Fase A — Backend: endpoint di registrazione push token
- Nuovo endpoint `v1/device/device-register-push.php` (case `device-register-push` in `api-gateway.php`), autenticato via token normale, riceve `push_token` (+ eventualmente `device_id`) e chiama `DevicesModelExtended::saveOrUpdateDevice()` (già supporta `push_token` in `$deviceInfo`).
  - Serve perché il permesso/token push spesso arriva **dopo** il login (prompt di permesso asincrono), quindi non basta estendere `login.php`.
- Estendere comunque `login.php` per accettare `push_token` opzionale nel form-data (se già disponibile a login time), riusando lo stesso `saveOrUpdateDevice()`.

### Fase B — Backend: invio effettivo del push
- Nuova classe `AppUtilsPush` (es. `v1/utils/push-utils.php`, sul modello di `AppUtilsMail` in `v1/utils/mails-utils.php`):
  - `addToPendingPush($userId, $userRole, $type, $title, $body, $data = [])`: recupera i device attivi con `push_token` non nullo per quell'utente (`DevicesModelExtended::getUserDevices()`), scrive un file `.pushmsg` (JSON) per ciascun token in `_data/_emails_/` (o nuova sottocartella dedicata).
  - Payload Expo: `{ to, title, body, data, sound: 'default', priority: 'high' }`.
- Nuovo cron `v1/cron-ok/send-pending-push.php`, modellato su `send-pending-telegram.php`:
  - Legge i `.pushmsg`, raggruppa in batch (Expo accetta fino a 100 messaggi per chiamata a `https://exp.host/--/api/v2/push/send`), invia, cancella i file su successo.
  - Gestire le **receipt di Expo** (`DeviceNotRegistered` → disattivare il device/pulire `push_token` da `devices`; utile per evitare di reinviare a token morti).
- Aggiungere il cron a `__CRON-SCHEDULE.txt` (ogni 1-2 minuti, come le email).

### Fase C — Backend: hook in `request-deceased.php`
- In `v1/plan/request-deceased.php`, subito dopo l'invio email (riga ~41-54), aggiungere:
  ```php
  try {
    AppUtilsPush::addToPendingPush(
      $planModel->getIdUser(),
      USER_ROLE_USER,
      'deceased-confirmation-request',
      'Verifica urgente richiesta',
      'Il tuo contatto di emergenza ha segnalato il tuo decesso. Apri l\'app per smentire se sei ancora attivo.',
      ['id_plan' => $planModel->getId()]
    );
  } catch (Exception $ex) {
    apUtilsNetwork::logExceptionV2($ex);
  }
  ```
- Stesso pattern try/catch isolato dell'email: un fallimento nell'invio push non deve bloccare la risposta principale.

### Fase D — Mobile: dipendenze e permessi
- Aggiungere `expo-notifications` (+ verificare compatibilità con `expo-dev-client` 6.x / SDK 54) a `package.json`.
- Configurare `app.json` (plugin `expo-notifications`, icona/colore notifica Android).
- Richiedere il permesso di notifica al momento opportuno (es. dopo l'onboarding/tutorial, non al primo avvio a freddo — vedi `components/ArchivioSerenoTutorial.tsx` come momento naturale).

### Fase E — Mobile: registrazione e refresh del token
- In `contexts/AuthContext.tsx`:
  - Dopo login riuscito (e anche a ogni `validateToken()`/foreground se il token Expo può cambiare), chiamare `Notifications.getExpoPushTokenAsync({ projectId: 'c768f55c-8f2f-4db8-b998-a7f5f552e1db' })` e inviarlo al backend.
  - Se disponibile **prima** del login (permesso già concesso in sessione precedente), aggiungere `push_token` al `formData` di `login()` (riga ~382-399).
  - Altrimenti, dopo aver ottenuto il token in modo asincrono, chiamare il nuovo endpoint `device-register-push` (Fase A).
  - Ascoltare `Notifications.addPushTokenListener` per aggiornare il token se Expo lo ruota.

### Fase F — Mobile: gestione del tap sulla notifica
- Grazie ad `AreYouAliveModal.tsx`, **non serve deep linking dedicato**: aprire l'app e ricaricare il profilo (`reloadProfile()`) è sufficiente perché il modal compaia automaticamente se `deceased` è valorizzato.
- Basta gestire `Notifications.addNotificationResponseReceivedListener` per forzare un `reloadProfile()` quando l'utente tocca la notifica mentre l'app è già aperta/in background (in foreground il listener `AppStateChange` già esistente in `AuthContext.tsx:275-298` probabilmente copre già il caso).

### Fase G — Edge cases
- Utente senza device registrati o con permesso negato → nessun push, solo email (comportamento attuale, nessuna regressione).
- Utente con più device (es. telefono + tablet) → inviare a tutti i device attivi con token.
- Token scaduto/non valido → gestito dalle receipt Expo in Fase B (pulizia `push_token`/`is_active`).
- Evitare doppio invio se il cron gira più volte prima della cancellazione file (stesso rischio "at-least-once" già accettato per le email, ADR-006 — non bloccante).

## 5. Testing
- Unit/manuale backend: verificare che `request-deceased.php` scriva il file `.pushmsg` e che il cron lo consumi e chiami Expo (mock in ambiente di test/staging, token reale in dev build).
- Mobile: build di sviluppo (EAS dev client) su device fisico (i push non funzionano su simulatore iOS), testare:
  1. Permesso concesso → token registrato → push ricevuto ad app chiusa/background.
  2. Permesso negato → nessun crash, flusso email invariato.
  3. Tap sulla notifica → apertura app → `AreYouAliveModal` visibile.

## 6. Domande aperte / da decidere insieme
- Vogliamo notificare anche via push l'esito quando il buffer scade e la richiesta viene finalizzata (`finalize-deceased-claims.php`), o solo alla richiesta iniziale?
- Testo/tono della notifica (l'attuale copy sopra è una bozza).
- Se riusare `_data/_emails_/` per i file `.pushmsg` o creare una cartella dedicata `_data/_push_/` (più pulito, stesso principio).