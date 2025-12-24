# API Service Utility

Utility comune per tutte le chiamate API nell'applicazione Tramonto Sereno. Simile al servizio `HttpClient` di Angular.

## Caratteristiche

- **Gestione automatica del token**: Recupera il token da AsyncStorage e lo include in ogni richiesta
- **Security headers**: Aggiunge automaticamente gli header di sicurezza usando `getSecurityHeaders()`
- **Logging degli errori**: Logga automaticamente tutti gli errori API per debugging e analytics
- **Gestione centralizzata delle risposte**: Gestisce automaticamente le risposte di successo e errore
- **TypeScript**: Completamente tipizzato con generics

## Installazione

```typescript
import { api } from '@/utils/api';
```

## Utilizzo

### GET Request

```typescript
// Semplice GET
const response = await api.get('users');

// GET con query parameters
const response = await api.get('users', {
  limit: 10,
  page: 1
});

// GET con tipizzazione
interface User {
  id: number;
  name: string;
}

const response = await api.get<User[]>('users');
// response.data è tipizzato come User[]

// GET con gestione manuale degli errori (senza logging automatico)
try {
  const response = await api.get('users', undefined, {
    manualErrorManagement: true
  });
} catch (error) {
  // Gestisci l'errore manualmente
  console.log('Custom error handling:', error);
}
```

### POST Request

**IMPORTANTE**: Di default, tutti i POST usano FormData (come in Angular), non JSON.

```typescript
// Semplice POST (usa FormData automaticamente)
const response = await api.post('consulto', {
  name: 'Mario Rossi',
  email: 'mario@example.com',
  phone: '+39 333 1234567',
  message: 'Richiesta consulto'
});
// Internamente viene convertito in FormData:
// formData.append('name', 'Mario Rossi')
// formData.append('email', 'mario@example.com')
// ecc...

// POST con tipizzazione
interface ConsultoResponse {
  consultationId: string;
  scheduledDate: string;
}

const response = await api.post<ConsultoResponse>('consulto', formData);
// response.data è tipizzato come ConsultoResponse

// POST con query params
const response = await api.post('consulto', formData, {
  queryParams: { urgent: 'true' }
});

// Se hai bisogno di usare JSON invece di FormData (caso raro)
const response = await api.post('endpoint', data, {
  useFormData: false // Usa JSON invece di FormData
});
```

### PUT Request

```typescript
// Aggiorna una risorsa
const response = await api.put('users/123', {
  name: 'Mario Rossi Updated',
  email: 'mario.updated@example.com'
});
```

### DELETE Request

```typescript
// Elimina una risorsa
const response = await api.delete('users/123');

// DELETE con query params
const response = await api.delete('users', { id: 123 });
```

## FormData vs JSON

### Comportamento di Default

**Tutti i POST e PUT usano FormData di default**, esattamente come nell'Angular service:

```typescript
// React Native (questo progetto)
await api.post('endpoint', { field1: 'value1', field2: 'value2' });

// Angular (versione web)
const formData = new FormData();
formData.append('field1', 'value1');
formData.append('field2', 'value2');
this.httpClient.post(url, formData);

// Entrambi inviano la stessa richiesta!
```

### Quando usare JSON

Solo se l'API richiede esplicitamente JSON (caso raro):

```typescript
await api.post('endpoint', data, {
  useFormData: false // Forza l'uso di JSON
});
```

### Conversione Automatica

L'api service converte automaticamente oggetti JavaScript in FormData:

```typescript
// Input
const data = {
  name: 'Mario',
  age: 30,
  active: true
};

await api.post('user', data);

// Viene convertito internamente in:
const formData = new FormData();
formData.append('name', 'Mario');
formData.append('age', '30');
formData.append('active', 'true');
// + token viene aggiunto automaticamente
```

## Formato della Risposta

Tutte le risposte seguono il formato standard:

```typescript
interface APIResponse<T = any> {
  result: 'ok' | 'error';
  count?: number;
  data?: T;
  status: number;
  lastActivity?: number;
  message?: string;
  error?: string;
}
```

### Esempio Risposta di Successo

```json
{
  "result": "ok",
  "count": 1,
  "data": {
    "consultationId": "abc123",
    "scheduledDate": "2025-01-15"
  },
  "status": 200,
  "lastActivity": 1766475954000
}
```

### Esempio Risposta di Errore

```json
{
  "result": "error",
  "message": "Email già registrata",
  "status": 400
}
```

## Gestione Errori

Gli errori vengono automaticamente:
1. Trasformati in un formato standard `APIError`
2. Loggati nella console (in modalità development)
3. Inviati al servizio di analytics (TODO: implementare)

```typescript
interface APIError {
  message: string;
  status?: number;
  statusText?: string;
  url?: string;
  originalError?: any;
}
```

### Esempio Gestione Errori

```typescript
try {
  const response = await api.post('consulto', formData);
  Alert.alert('Successo', 'Richiesta inviata');
} catch (error: any) {
  // L'errore è già stato loggato automaticamente
  Alert.alert('Errore', error.message);
}
```

## Security Headers

Ogni richiesta include automaticamente:
- `X-ipac`: Token di autenticazione (se presente)
- `X-iptc`: Checksum timestamp
- `X-ipts`: Security timestamp

Questi header sono generati usando `getSecurityHeaders()` da `utils/security.ts`.

## Token Management

Il token viene:
1. Recuperato automaticamente da AsyncStorage
2. Aggiunto negli header di sicurezza (`X-ipac`)
3. Incluso nel body delle richieste POST/PUT (se non già presente)

Non è necessario gestire manualmente il token nelle chiamate API.

## Logging

### Development Mode
In modalità development (`__DEV__ === true`), tutte le risposte vengono loggate:

```
[API GET] [users] { result: 'ok', data: [...] }
[API POST] [consulto] { result: 'ok', data: {...} }
```

### Error Logging
Tutti gli errori vengono loggati con informazioni dettagliate:

```
[API POST] [consulto] Error: {
  message: "Network request failed",
  status: 0,
  url: "https://api.tramontosereno.it/api-gateway.php?api=consulto",
  timestamp: "2025-12-23T08:00:00.000Z"
}
```

## Esempi Completi

### Form Submission

```typescript
import { api } from '@/utils/api';

const handleSubmit = async () => {
  if (!formData.email) {
    Alert.alert('Errore', 'Email obbligatoria');
    return;
  }

  try {
    const response = await api.post('consulto', formData);

    Alert.alert('Successo', 'Richiesta inviata con successo');
    setFormData({ name: '', email: '', phone: '', message: '' });
  } catch (error: any) {
    Alert.alert('Errore', error.message || 'Errore durante l\'invio');
  }
};
```

### Data Fetching

```typescript
import { useEffect, useState } from 'react';
import { api } from '@/utils/api';

interface Plan {
  id: string;
  name: string;
  createdAt: string;
}

const MyPlansScreen = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await api.get<Plan[]>('plans');
      setPlans(response.data || []);
    } catch (error: any) {
      Alert.alert('Errore', 'Impossibile caricare i piani');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... render plans
  );
};
```

## Note di Implementazione

- L'utility usa `fetch` nativo di React Native
- Il token viene letto dalla chiave `@tramonto_sereno_auth` in AsyncStorage
- L'URL base è `https://api.tramontosereno.it`
- Tutte le richieste passano attraverso `api-gateway.php`

## TODO

- [ ] Implementare invio errori a servizio di analytics (Sentry, Firebase)
- [ ] Aggiungere retry automatico per errori di rete
- [ ] Implementare caching delle risposte GET
- [ ] Aggiungere support per FormData upload
- [ ] Implementare interceptors per request/response
