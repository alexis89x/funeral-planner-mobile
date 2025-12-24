# AuthContext - Servizio di Autenticazione

Servizio di autenticazione React Native basato sull'`AuthenticationService` di Angular.

## Caratteristiche Principali

### 1. **Login con Device Info**
Come la versione Angular, il login include automaticamente informazioni sul dispositivo:

```typescript
const login = async (username: string, password: string, role?: number) => {
  const deviceInfo = await getDeviceInfo();

  const loginData = {
    username,
    password,
    role,
    device: "iPhone 14 Pro (iPhone15,2)",
    os: "iOS 17.5",
    browser: "Tramonto Sereno v1.0.0",
    user_agent: "Tramonto Sereno/1.0.0 (ios; iOS 17.5)"
  };

  // ... chiamata API
};
```

### 2. **Gestione Profile Separata**
Il profilo utente viene caricato separatamente dal login, come in Angular:

```typescript
// Dopo login
await login('user@example.com', 'password');

// Profile viene caricato automaticamente
const profile = await getUserProfile();
```

### 3. **Token Validation**
Validazione automatica del token all'avvio dell'app:

```typescript
const validateToken = async (): Promise<boolean> => {
  const response = await api.post('validate-token', { token });
  return response.result === 'ok';
};

// Uso automatico all'avvio
useEffect(() => {
  const isValid = await validateToken();
  if (!isValid) {
    await logout();
  }
}, []);
```

### 4. **Ping per Sessione Attiva**
Mantenimento della sessione attiva:

```typescript
const ping = async (): Promise<void> => {
  await api.get('ping');
};

// Chiamare periodicamente (es. ogni 5 minuti)
useEffect(() => {
  const interval = setInterval(ping, 5 * 60 * 1000);
  return () => clearInterval(interval);
}, [userProfile]);
```

### 5. **Last Activity Tracking**
Tracciamento dell'ultima attività utente:

```typescript
interface AuthContextType {
  lastActivity: number | null; // Unix timestamp
}

// Aggiornato automaticamente durante il login
if (data.lastActivity) {
  setLastActivity(data.lastActivity);
}
```

## Confronto con Angular

### AuthenticationService (Angular)
```typescript
// Angular usa RxJS Observables
public currentUser$: Observable<LoggedUser | null>;
private currentUserSubject: BehaviorSubject<LoggedUser | null>;

// Angular usa localStorage
localStorage.setItem(HEADER_USER_INFO, JSON.stringify(user));

// Angular usa HttpClient con withCredentials
this.httpClient.post(url, formData, { withCredentials: true })
```

### AuthContext (React Native)
```typescript
// React Native usa useState
const [currentUser, setCurrentUser] = useState<LoggedUser | null>(null);

// React Native usa AsyncStorage
await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

// React Native usa fetch/api service
await api.post('login', loginData);
```

## Utilizzo

### Login
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { login } = useAuth();

try {
  await login('username@example.com', 'password', 100); // role = 100 (USER)
  router.replace('/(tabs)');
} catch (error) {
  Alert.alert('Errore', error.message);
}
```

### Accesso ai Dati Utente
```typescript
const { currentUser, userProfile } = useAuth();

// Token per API
const token = currentUser?.token;

// Informazioni base
const role = currentUser?.role;
const status = currentUser?.status;

// Informazioni profilo
const email = userProfile?.user?.email;
const name = userProfile?.user?.name;
const currentPlanId = userProfile?.user?.id_current_plan;
```

### Validazione Token
```typescript
const { validateToken } = useAuth();

const checkSession = async () => {
  const isValid = await validateToken();
  if (!isValid) {
    // Redirect to login
    router.replace('/login');
  }
};
```

### Reload Profile
```typescript
const { reloadProfile } = useAuth();

// Dopo un aggiornamento
const handleSaveProfile = async () => {
  await updateProfileAPI(data);
  await reloadProfile(); // Ricarica profilo aggiornato
};
```

### Logout
```typescript
const { logout } = useAuth();

const handleLogout = async () => {
  await logout(); // Chiama API + pulisce storage locale
  router.replace('/login');
};
```

## Device Info Service

Utility per ottenere informazioni sul dispositivo:

```typescript
import { getDeviceInfo } from '@/utils/device';

const deviceInfo = await getDeviceInfo();
// {
//   device: "iPhone 14 Pro (iPhone15,2)",
//   os: "iOS 17.5",
//   browser: "Tramonto Sereno v1.0.0",
//   userAgent: "Tramonto Sereno/1.0.0 (ios; iOS 17.5)"
// }
```

## Interfacce TypeScript

### LoggedUser
```typescript
export interface LoggedUser {
  token: string;
  role: number;
  status: number;
}
```

### UserProfile
```typescript
export interface UserProfile {
  user: {
    id: number;
    email: string;
    name?: string;
    role: number;
    status: number;
    id_current_plan?: number;
  };
  // Altri campi del profilo
}
```

### AuthContextType
```typescript
interface AuthContextType {
  currentUser: LoggedUser | null;
  userProfile: UserProfile | null;
  setCurrentUser: (user: LoggedUser | null) => void;
  token: string | undefined;
  login: (username: string, password: string, role?: number) => Promise<void>;
  logout: () => Promise<void>;
  validateToken: () => Promise<boolean>;
  getUserProfile: () => Promise<UserProfile | null>;
  reloadProfile: () => Promise<void>;
  isLoading: boolean;
  lastActivity: number | null;
}
```

## Flusso di Autenticazione

1. **App Start**
   ```
   App Start → Load from AsyncStorage → Validate Token
   ├─ Valid → Load Profile → Navigate to Tabs
   └─ Invalid → Clear Storage → Navigate to Login
   ```

2. **Login Flow**
   ```
   Login Screen
   ├─ Get Device Info
   ├─ Call Login API (with device info)
   ├─ Store Token in AsyncStorage
   ├─ Load User Profile
   └─ Navigate to Tabs
   ```

3. **Session Management**
   ```
   Active Session
   ├─ Ping every 5 minutes (optional)
   ├─ Track last activity
   └─ Validate on app resume
   ```

4. **Logout Flow**
   ```
   Logout
   ├─ Call Logout API
   ├─ Clear AsyncStorage
   ├─ Clear Context State
   └─ Navigate to Login
   ```

## Best Practices

1. **Sempre validare il token all'avvio**
   ```typescript
   useEffect(() => {
     if (storedUser) {
       const isValid = await validateToken();
       if (!isValid) await logout();
     }
   }, []);
   ```

2. **Caricare il profilo dopo login riuscito**
   ```typescript
   await login(username, password);
   await getUserProfile(); // Caricato automaticamente
   ```

3. **Usare manualErrorManagement per chiamate di sistema**
   ```typescript
   await api.post('ping', {}, { manualErrorManagement: true });
   ```

4. **Pulire sempre i dati su logout**
   ```typescript
   await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
   setCurrentUser(null);
   setUserProfile(null);
   setLastActivity(null);
   ```

## Migrazioni da Versioni Precedenti

Se stai migrando da una versione precedente di AuthContext:

1. **Aggiungere role al login**
   ```typescript
   // Prima
   await login(username, password);

   // Dopo
   await login(username, password, 100); // USER role
   ```

2. **Usare userProfile invece di currentUser per dati dettagliati**
   ```typescript
   // Prima
   const email = currentUser?.email;

   // Dopo
   const email = userProfile?.user?.email;
   ```

3. **Validare token all'avvio**
   ```typescript
   // Aggiungere in loadStoredAuth
   const isValid = await validateToken();
   if (!isValid) await logout();
   ```

## Testing

```typescript
// Mock per testing
const mockAuth = {
  currentUser: {
    token: 'test-token',
    role: 100,
    status: 310
  },
  userProfile: {
    user: {
      id: 1,
      email: 'test@example.com',
      role: 100,
      status: 310
    }
  },
  login: jest.fn(),
  logout: jest.fn(),
  validateToken: jest.fn(() => Promise.resolve(true)),
  getUserProfile: jest.fn(),
  reloadProfile: jest.fn(),
  isLoading: false,
  lastActivity: Date.now()
};
```
