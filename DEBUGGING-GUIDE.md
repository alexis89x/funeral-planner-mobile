# Debugging Guide - HTTP Request Logging

Sistema completo di logging delle richieste HTTP per debug dell'API.

## Cosa Viene Loggato

Quando fai login (o qualsiasi altra chiamata API), il sistema logga:

### 1. **Request Details**
```
========== HTTP REQUEST ==========
[2025-12-23T10:30:45.123Z]
Method: POST
URL: http://localhost/projects/funeral-planner-api/api-gateway.php?api=login

Headers:
  X-ipac:
  X-iptc: 1766481725783
  X-ipts: 1766481720718

Body (FormData):
username: user@example.com
password: ********
role: 100
device: iPhone 14 Pro (iPhone15,2)
os: iOS 17.5
browser: Tramonto Sereno v1.0.0
user_agent: Tramonto Sereno/1.0.0 (ios; iOS 17.5)
========== END HTTP REQUEST ==========
```

### 2. **Response Details**
```
========== HTTP RESPONSE ==========
[2025-12-23T10:30:46.456Z]
Status: 200 OK
URL: http://localhost/projects/funeral-planner-api/api-gateway.php?api=login

Response Headers:
  content-type: application/json
  ...

Response Body:
{
  "result": "ok",
  "data": {
    "token": "...",
    "role": 100,
    "status": 310
  },
  "status": 200
}
========== END HTTP RESPONSE ==========
```

### 3. **Error Details** (se fallisce)
```
💥 ===== LOGIN ERROR =====
Error Type: object
Error Message: Network request failed
Error Stack: ...
Full Error: {...}
===== END LOGIN ERROR =====
```

## Dove Vedere i Logs

### 1. **Console (Real-time)**

Tutti i logs appaiono in tempo reale nella console di Metro:

```bash
npx expo start
# Premi 'j' per aprire DevTools
# Oppure guarda la console del terminal
```

### 2. **File (Persistente)**

I logs vengono salvati automaticamente in:
```
{FileSystem.documentDirectory}logs/api-requests.log
```

Per dispositivi iOS/Android:
- iOS: `/var/mobile/Containers/Data/Application/.../Documents/logs/api-requests.log`
- Android: `/data/data/com.yourapp/files/logs/api-requests.log`

### 3. **Debug Screen (UI)**

Vai alla schermata `/debug-logs` per vedere i logs nell'app:

```typescript
// Naviga a:
router.push('/debug-logs');
```

Features:
- **Refresh**: Ricarica i logs dal file
- **Share**: Condividi i logs via email/message
- **Clear**: Pulisci tutti i logs

## Comparazione con cURL del Browser

Il sistema logga esattamente cosa viene inviato, quindi puoi confrontare con la richiesta del browser.

### Browser (da DevTools):
```bash
curl 'http://localhost:4200/api/api-gateway.php?api=login' \
  -H 'Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...' \
  -H 'X-ipac;' \
  -H 'X-iptc: 1766481725783' \
  -H 'X-ipts: 1766481720718' \
  --data-raw $'------WebKitFormBoundary...\r\nContent-Disposition: form-data; name="username"\r\n\r\nuser@example.com\r\n...'
```

### Mobile App (dai logs):
```
Headers:
  X-ipac:
  X-iptc: 1766481725783
  X-ipts: 1766481720718

FormData:
username: user@example.com
password: test
role: 100
device: iPhone 14 Pro
...
```

## Debug Checklist

Quando una richiesta fallisce, controlla:

### ✅ URL
```typescript
console.log('🌐 Request URL:', url);
// Expected: http://localhost/projects/funeral-planner-api/api-gateway.php?api=login
```

### ✅ Headers
```typescript
console.log('🔒 Security Headers:', securityHeaders);
// Check:
// - X-ipac è vuoto per login (corretto)
// - X-iptc e X-ipts sono presenti
```

### ✅ FormData
```typescript
// Verifica che tutti i campi siano presenti:
// - username
// - password
// - role
// - device
// - os
// - browser
// - user_agent
```

### ✅ Response
```typescript
console.log('📡 Response Status:', response.status);
console.log('📄 Response Body:', responseText);
// Check:
// - Status: 200?
// - Body: JSON valido?
// - result: 'ok'?
```

## Problemi Comuni

### 1. **Network Request Failed**
```
Error: Network request failed
```

**Possibili cause:**
- API server non raggiungibile
- URL sbagliato
- CORS issues
- Network timeout

**Debug:**
```typescript
// Verifica URL
console.log('URL:', API_BASE_URL);

// Prova con fetch diretto
fetch('http://localhost/...')
  .then(r => console.log('Reachable:', r.status))
  .catch(e => console.error('Not reachable:', e));
```

### 2. **Invalid JSON Response**
```
Error: Invalid JSON response: <html>...
```

**Possibili cause:**
- API ritorna HTML invece di JSON
- PHP error
- Server misconfigured

**Debug:**
```typescript
// Guarda il raw response
console.log('Raw Response:', responseText);
```

### 3. **FormData Boundary Issues**
```
Error: multipart/form-data boundary not found
```

**Possibili cause:**
- Content-Type impostato manualmente
- FormData non supportato

**Fix:**
```typescript
// NON impostare Content-Type per FormData
const response = await fetch(url, {
  method: 'POST',
  body: formData,
  // ❌ headers: { 'Content-Type': 'multipart/form-data' }
  // ✅ Let browser set it automatically
});
```

### 4. **401 Unauthorized**
```
Status: 401 Unauthorized
```

**Possibili cause:**
- Token mancante o invalido
- Security headers sbagliati

**Debug:**
```typescript
// Verifica security headers
const headers = getSecurityHeaders(token);
console.log('Headers:', headers);
// X-ipac: <token>
// X-iptc: <checksum>
// X-ipts: <timestamp>
```

## File da Controllare

Quando debug una richiesta:

1. **Request**: `contexts/AuthContext.tsx:74-120`
2. **Security Headers**: `utils/security.ts:45-53`
3. **HTTP Logger**: `utils/http-logger.ts`
4. **File Logger**: `utils/file-logger.ts`

## Logs Automatici

Il sistema logga automaticamente:
- ✅ Ogni richiesta HTTP (headers + body)
- ✅ Ogni risposta (status + body)
- ✅ Ogni errore (stack trace completo)
- ✅ FormData contents (tutti i fields)

## Export Logs

Per condividere i logs con il team:

### Metodo 1: Share dalla UI
```typescript
// Vai a /debug-logs e premi Share
router.push('/debug-logs');
```

### Metodo 2: Programmatico
```typescript
import { readLogsFromFile } from '@/utils/file-logger';

const logs = await readLogsFromFile();
console.log(logs);
```

### Metodo 3: File System
```typescript
import { getLogFilePath } from '@/utils/file-logger';

const path = getLogFilePath();
console.log('Logs at:', path);
```

## Produzione vs Development

### Development
- Tutti i logs attivi
- Console output verboso
- File logging enabled

### Production
Puoi disabilitare i logs:

```typescript
// utils/http-logger.ts
const ENABLE_LOGGING = __DEV__;

if (ENABLE_LOGGING) {
  console.log('...');
  appendLogToFile('...');
}
```

## Performance

I logs hanno impatto minimo:
- File writes sono async
- Console logs solo in dev
- Logs rotati automaticamente (TODO)

## Retention

I logs vengono mantenuti fino a quando:
- L'utente clicca "Clear" in /debug-logs
- L'app viene disinstallata
- TODO: Auto-rotation dopo X MB

## Prossimi Step

- [ ] Implementare log rotation
- [ ] Aggiungere filtri (solo errori, solo success, ecc)
- [ ] Implementare export via email
- [ ] Aggiungere timestamp più leggibili
- [ ] Implementare search nei logs
