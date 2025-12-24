# FormData Migration Guide

Tutti i POST e PUT ora usano **FormData** di default, come nell'Angular service.

## Cosa è Cambiato

### Prima (JSON)
```typescript
const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ name: 'Mario', email: 'test@example.com' })
});
```

### Adesso (FormData)
```typescript
const response = await api.post('endpoint', {
  name: 'Mario',
  email: 'test@example.com'
});

// Internamente viene convertito in FormData:
// formData.append('name', 'Mario')
// formData.append('email', 'test@example.com')
// formData.append('token', currentToken) // Aggiunto automaticamente
```

## Vantaggi di FormData

1. **Compatibilità con Angular**: Stesso comportamento della versione web
2. **Token automatico**: Il token viene aggiunto automaticamente a ogni richiesta
3. **Security headers**: Gli header di sicurezza vengono aggiunti automaticamente
4. **Upload files**: Supporta upload di file (per funzionalità future)
5. **Standard API**: Tutte le API backend si aspettano FormData

## Esempi di Conversione

### Login (già aggiornato)

**Prima:**
```typescript
const loginData = {
  username: 'user@example.com',
  password: 'password123',
  role: '100'
};

await fetch(url, {
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(loginData)
});
```

**Adesso:**
```typescript
const formData = new FormData();
formData.append('username', 'user@example.com');
formData.append('password', 'password123');
formData.append('role', '100');
formData.append('device', deviceInfo.device);
// ... altri campi device

await fetch(url, {
  body: formData
  // Nessun Content-Type header - viene impostato automaticamente
});
```

### Form Servizi (già aggiornati)

I form servizi **non richiedono modifiche** perché usano `api.post()` che ora usa FormData di default:

```typescript
// Questo codice funziona automaticamente con FormData
await api.post('consulto', {
  name: formData.name,
  email: formData.email,
  phone: formData.phone,
  message: formData.message
});
```

### Validate Token

```typescript
// Prima
await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: userToken })
});

// Adesso (automatico con api service)
await api.post('validate-token', {
  token: userToken
});
```

## Headers Automatici

### FormData Request
```
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
X-ipac: <token>
X-iptc: <checksum_timestamp>
X-ipts: <security_timestamp>
```

### JSON Request (se useFormData: false)
```
Content-Type: application/json
X-ipac: <token>
X-iptc: <checksum_timestamp>
X-ipts: <security_timestamp>
```

## Files Modificati

Tutti questi file sono stati aggiornati per usare FormData:

1. ✅ `utils/api.ts` - POST e PUT usano FormData di default
2. ✅ `contexts/AuthContext.tsx` - Login usa FormData
3. ✅ `app/(tabs)/services/consulto-psicologico.tsx` - Usa api.post (FormData automatico)
4. ✅ `app/(tabs)/services/pianificazione-lisa.tsx` - Usa api.post (FormData automatico)

## Compatibilità Angular

Il comportamento è identico all'Angular service:

### Angular
```typescript
// Angular (versione web)
const formData = new FormData();
formData.append('username', username);
formData.append('password', password);
formData.append('role', role);

this.httpClient.post<APIResponse>(
  getAPIGatewayUrl('login'),
  formData,
  { withCredentials: true }
)
```

### React Native
```typescript
// React Native (questo progetto)
const formData = new FormData();
formData.append('username', username);
formData.append('password', password);
formData.append('role', role);

await fetch(
  'https://api.tramontosereno.it/api-gateway.php?api=login',
  {
    method: 'POST',
    body: formData
  }
)
```

## Debugging FormData

### Browser/DevTools
In React Native Web, puoi vedere il contenuto di FormData in DevTools:

```typescript
// Log FormData content (development only)
if (__DEV__) {
  for (let pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }
}
```

### Esempio Output
```
username: user@example.com
password: ********
role: 100
token: EQRMwCvZm0/HoDmUa7x6+VhxBNyX5WUroWjRZgcvp+NsE3o0BvJESaWobidr9W4z...
device: iPhone 14 Pro (iPhone15,2)
os: iOS 17.5
```

## Note Importanti

1. **Non impostare Content-Type manualmente** per FormData - il browser lo imposta automaticamente con il boundary corretto
2. **Tutti i valori sono stringhe** - FormData converte automaticamente tutti i valori in stringhe
3. **Token sempre incluso** - Il token viene aggiunto automaticamente a tutti i POST/PUT
4. **Security headers sempre inclusi** - getSecurityHeaders() viene chiamato automaticamente

## Caso d'Uso Speciale: JSON

Se un endpoint richiede esplicitamente JSON (caso molto raro):

```typescript
await api.post('special-endpoint', data, {
  useFormData: false // Forza JSON
});
```

## Testing

### Test con FormData
```typescript
// Mock fetch per test
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ result: 'ok', data: {...} }),
  })
);

await api.post('endpoint', { field: 'value' });

// Verifica che FormData sia stato usato
expect(global.fetch).toHaveBeenCalledWith(
  expect.any(String),
  expect.objectContaining({
    method: 'POST',
    body: expect.any(FormData)
  })
);
```

## Troubleshooting

### Problema: "Network request failed"
**Causa**: Headers Content-Type impostato manualmente per FormData
**Soluzione**: Non impostare Content-Type per FormData, lascia che il browser lo faccia

### Problema: Token non inviato
**Causa**: Token non salvato in AsyncStorage
**Soluzione**: Verifica che il login salvi correttamente il token

### Problema: API restituisce errore 400
**Causa**: Backend si aspetta FormData ma riceve JSON (o viceversa)
**Soluzione**: Verifica che `useFormData` sia impostato correttamente

## Migrazione Checklist

- [x] `utils/api.ts` - POST usa FormData di default
- [x] `utils/api.ts` - PUT usa FormData di default
- [x] `contexts/AuthContext.tsx` - Login usa FormData
- [x] Form servizi - Usano api.post() (automatico)
- [x] Documentazione aggiornata
- [ ] Test E2E con API reale
- [ ] Verifica upload file (quando necessario)
