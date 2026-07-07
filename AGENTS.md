# AGENTS.md

## Project Overview

This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Documentation Resources

When working on this project, **always consult the official Expo documentation** available at:

- **https://docs.expo.dev/llms.txt** - Index of all available documentation files
- **https://docs.expo.dev/llms-full.txt** - Complete Expo documentation including Expo Router, Expo Modules API, development process
- **https://docs.expo.dev/llms-eas.txt** - Complete EAS (Expo Application Services) documentation
- **https://docs.expo.dev/llms-sdk.txt** - Complete Expo SDK documentation
- **https://reactnative.dev/docs/getting-started** - Complete React Native documentation

These documentation files are specifically formatted for AI agents and should be your **primary reference** for:

- Expo APIs and best practices
- Expo Router navigation patterns
- EAS Build, Submit, and Update workflows
- Expo SDK modules and their usage
- Development and deployment processes

## Project Structure

```
/
├── app/                   # Expo Router file-based routing
│   ├── (tabs)/            # Tab-based navigation screens
│   │   ├── index.tsx      # Home screen
│   │   ├── explore.tsx    # Explore screen
│   │   └── _layout.tsx    # Tabs layout
│   ├── _layout.tsx        # Root layout with theme provider
│   └── modal.tsx          # Modal screen example
├── components/            # Reusable React components
│   ├── ui/                # UI primitives (IconSymbol, Collapsible)
│   └── ...                # Feature components (themed, haptic, parallax)
├── constants/             # App-wide constants (theme, colors)
├── hooks/                 # Custom React hooks (color scheme, theme)
├── assets/                # Static assets (images, fonts)
├── scripts/               # Utility scripts (reset-project)
├── .eas/workflows/        # EAS Workflows (CI/CD automation)
├── app.json               # Expo configuration
├── eas.json               # EAS Build/Submit configuration
└── package.json           # Dependencies and scripts
```

## Essential Commands

### Development

```bash
npx expo start                  # Start dev server
npx expo start --clear          # Clear cache and start dev server
npx expo install <package>      # Install packages with compatible versions
npx expo install --check        # Check which installed packages need to be updated
npx expo install --fix          # Automatically update any invalid package versions
npm run development-builds      # Create development builds (workflow)
npm run reset-project           # Reset to blank template
```

### Building & Testing

```bash
npx expo doctor      # Check project health and dependencies
npx expo lint        # Run ESLint
npm run draft        # Publish preview update and website (workflow)
```

### Production

```bash
npx eas-cli@latest build --platform ios -s          # Use EAS to build for iOS platform and submit to App Store
npx eas-cli@latest build --platform android -s      # Use EAS to build for Android platform and submit to Google Play Store
npm run deploy                                      # Deploy to production (workflow)
```

## Development Guidelines

### Code Style & Standards

- **TypeScript First**: Use TypeScript for all new code with strict type checking
- **Naming Conventions**: Use meaningful, descriptive names for variables, functions, and components
- **Self-Documenting Code**: Write clear, readable code that explains itself; only add comments for complex business logic or design decisions
- **React 19 Patterns**: Follow modern React patterns including:
  - Function components with hooks
  - Enable React Compiler
  - Proper dependency arrays in useEffect
  - Memoization when appropriate (useMemo, useCallback)
  - Error boundaries for better error handling

### Navigation & Routing

- Use **Expo Router** for all navigation
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`
- Docs: https://docs.expo.dev/router/introduction/

### Recommended Libraries

- **Navigation**: `expo-router` for navigation
- **Images**: `expo-image` for optimized image handling and caching
- **Animations**: `react-native-reanimated` for performant animations on native thread
- **Gestures**: `react-native-gesture-handler` for native gesture recognition
- **Storage**: Use `expo-sqlite` for persistent storage, `expo-sqlite/kv-store` for simple key-value storage

## Debugging & Development Tools

### DevTools Integration

- **React Native DevTools**: Use MCP `open_devtools` command to launch debugging tools
- **Network Inspection**: Monitor API calls and network requests in DevTools
- **Element Inspector**: Debug component hierarchy and styles
- **Performance Profiler**: Identify performance bottlenecks
- **Logging**: Use `console.log` for debugging (remove before production), `console.warn` for deprecation notices, `console.error` for actual errors, and implement error boundaries for production error handling

### Testing & Quality Assurance

#### Automated Testing with MCP Tools

Developers can configure the Expo MCP server with the following doc: https://docs.expo.dev/eas/ai/mcp/

- **Component Testing**: Add `testID` props to components for automation
- **Visual Testing**: Use MCP `automation_take_screenshot` to verify UI appearance
- **Interaction Testing**: Use MCP `automation_tap_by_testid` to simulate user interactions
- **View Verification**: Use MCP `automation_find_view_by_testid` to validate component rendering

## EAS Workflows CI/CD

This project is pre-configured with **EAS Workflows** for automating development and release processes. Workflows are defined in `.eas/workflows/` directory.

When working with EAS Workflows, **always refer to**:

- https://docs.expo.dev/eas/workflows/ for workflow examples
- The `.eas/workflows/` directory for existing workflow configurations
- You can check that a workflow YAML is valid using the workflows schema: https://exp.host/--/api/v2/workflows/schema

### Build Profiles (eas.json)

- **development**: Development builds with dev client
- **development-simulator**: Development builds for iOS simulator
- **preview**: Internal distribution preview builds
- **production**: Production builds with auto-increment

## Progetto "Archivio Sereno" (multi-app: stesso codice, feature-set diverso)

> Sezione in italiano perché nasce da una conversazione in italiano con il product owner (branch `archivio-sereno`). Quando in conversazione si parla di "Archivio Sereno" o di "un'altra app oltre a Tramonto", ci si riferisce a quanto descritto qui.

### Concetto

Oggi il repo gestisce un multi-brand a livello di **branding** (vedi `constants/theme.ts`, `THEMES` / `ACTIVE_THEME`): tramonto, studio3a, mazzini, taddiagroup, alc condividono tutti lo stesso set di tab/feature e cambiano solo colori, loghi e nome.

"Archivio Sereno" è una **nuova voce di `THEMES`**, non un asse separato: riusa lo stesso codice/backend di Tramonto Sereno (stesso login, stesso concetto di "Piano" dietro le quinte — l'utente ha sempre un piano Tramonto Sereno anche se in quest'app non lo vede mai), ma con **branding proprio** (nome app, bundle id, icone/splash, colori) **e un layout di tab ridotto**, esposto come app installabile a sé stante (build EAS dedicata, come già avviene per studio3a/mazzini).

**Implementato**: `ThemeConfig` in `constants/theme.ts` ha un campo `tabLayout: 'full' | 'documenti-contatti'` (tipo `TabLayout`), letto da `app/(tabs)/_layout.tsx` per decidere quali `Tabs.Screen` mostrare (`href: null` su quelle nascoste) e da `services/index.tsx` / `emergenza/index.tsx` per fare `<Redirect>` diretto alla schermata utile. Ogni tema/app resta un'unica voce di `THEMES` che porta insieme branding + layout, così è immediato aggiungere altre app in futuro allo stesso modo. Tema attivo su questo branch: `ACTIVE_THEME = 'archivio-sereno'`.

### Tab bar di Archivio Sereno (solo queste tre, nient'altro)

1. **Documenti caricati** — tab `services`; `app/(tabs)/services/index.tsx` fa `<Redirect href="/(tabs)/services/uploads" />`, quindi si apre direttamente la lista/upload documenti (`uploads.tsx` / `upload-form.tsx`), senza passare dall'indice "Servizi".
2. **Contatti di emergenza** — tab `emergenza`; `app/(tabs)/emergenza/index.tsx` fa `<Redirect href="/(tabs)/emergenza/contatti" />`, quindi si apre direttamente `contatti.tsx`, senza passare dal menu "Numeri utili / Contatti".
3. **Altro** — tab `altro` invariata (`app/(tabs)/altro/index.tsx`: Profilo, FAQ, Guide, Elimina account, Logout), tranne la voce "I miei piani" che viene filtrata via (`MENU_ITEMS`) perché Archivio Sereno non espone mai il concetto di Piano in UI.

Le tre tab **non sono unite/mergiate** in un'unica schermata: restano tre `Tabs.Screen` distinte. Nessun'altra tab visibile (niente "Il mio piano", "La mia onoranza", "Servizi" come lista prodotti, "Cerca") — nascoste con `href: null` in `app/(tabs)/_layout.tsx` quando `tabLayout === 'documenti-contatti'`.

### Assegnazione documenti ai contatti di emergenza

**Questa feature esiste già**, non va costruita da zero: in `upload-form.tsx` il campo "Visibile a" (componente `ContactsPicker` da `@/components/document-pickers`) permette di scegliere se un documento è visibile a tutti i contatti di emergenza del piano o solo ad alcuni (`selectedContactIds`, inviato come `visibility` nel form-data di `upload-item`). Per Archivio Sereno va solo resa più esplicita/prominente nel flusso, non progettata ex novo.

### Piano

Il concetto di "Piano" (`id_plan`, `PlanSwitcher`, `owned_plans`) resta invariato lato dati: Archivio Sereno è sempre, dietro le quinte, un piano Tramonto Sereno. La UI semplicemente non mostra mai piano/onoranza/servizi all'utente — i documenti restano scoped su `currentPlan` come oggi.

Nota: se un account Archivio Sereno avesse più piani attivi (`hasMultiplePlans`), `PlanSwitcher` verrebbe comunque mostrato (in `contatti.tsx` e `uploads.tsx`) e permetterebbe di navigare verso `/(tabs)/my-plans` — un caso limite non ancora gestito esplicitamente, da rivedere se capita in pratica.

### Redirect post-login e fallback verso "Documenti caricati"

Tutti i punti che di default portavano l'utente sulla tab "Il mio piano"/"I miei piani" sono stati aggiornati per portare invece su "Documenti caricati" quando `tabLayout === 'documenti-contatti'`:
- `utils/plans.ts` → `resolvePostLoginRoute()`: primo controllo è sul `tabLayout`, se ridotto ritorna `/(tabs)/services` a prescindere dal numero di piani. Usata da `app/_layout.tsx` (redirect post-login generico) e `app/login-email.tsx`.
- `app/login-google.tsx`: il redirect esplicito nel success-callback di `googleLogin` ora usa `resolvePostLoginRoute(null)` invece di `router.replace('/(tabs)/my-plans')` hardcoded.
- `app/webview.tsx` (`onRefreshUser`): dopo il refresh del profilo da una webview generica, va su `/(tabs)/services` invece che su `/(tabs)/my-plans` quando il layout è ridotto.

Punti **non toccati** perché raggiungibili solo tramite UI di piano ormai non esposta in Archivio Sereno (tab "Il mio piano"/"I miei piani" nascoste, quindi questi flussi sono di fatto irraggiungibili): `hooks/use-new-plan-handler.ts`, `components/PlanSwitcher.tsx`, gli header-button in `app/(tabs)/_layout.tsx` per `my-plan`/`my-plans`.

### Tutorial al primo accesso

`components/ArchivioSerenoTutorial.tsx`: modal fullscreen a 2 step (documenti caricati → contatti di emergenza), mostrato una sola volta grazie al flag AsyncStorage `@domani_sicuro_tutorial_seen`. Montato in `app/(tabs)/_layout.tsx` solo quando `isReducedLayout` è vero. Pulsante "Salta" sempre disponibile.

### Banner upgrade spazio ("Hai bisogno di più spazio?")

`components/UpgradeSpaceBanner.tsx`: mostrato in cima a `services/uploads.tsx` quando `tabLayout === 'documenti-contatti'` e il piano corrente non è di tipo `free` (`currentPlan?.type !== 'free'`, in `uploads.tsx`). Al tap apre `https://app.tramontosereno.it` nella webview esistente (`/(tabs)/services/webview`). Pattern ricalcato da `components/Studio3ABanner.tsx` (banner condizionale già esistente per il tema studio3a in `emergenza/index.tsx`).

### App installabile separata

Archivio Sereno va trattato come le altre voci "cliente" di `THEMES` (vedi `studio3a`, `mazzini`): proprio `expo.name`, `bundleIdentifier`/`package`, `scheme`, icone/splash, e un proprio profilo di build in `eas.json` (profilo `archivio-sereno`, creato sul modello del profilo `studio`).

Stato attuale:
- `assets/images/themes/archivio-sereno/` esiste già ma contiene **una copia identica degli asset di Tramonto Sereno** (placeholder temporaneo, richiesto esplicitamente per poter buildare/testare da subito). Vanno sostituiti con la grafica definitiva del brand prima di un build di produzione.
- `bundleIdentifier`/`package`/`scheme` definitivi **non ancora decisi** (placeholder in `constants/theme.ts`: `it.nanuktechnology.archiviosereno`).
- `app.json` **non è stato modificato**: come per gli altri temi, va aggiornato manualmente (nome, bundle id, path icone) solo al momento di fare un build per questo brand specifico — segue lo stesso processo manuale già in uso per studio3a/mazzini (vedi commento in testa a `constants/theme.ts`).

## Troubleshooting

### Expo Go Errors & Development Builds

If there are errors in **Expo Go** or the project is not running, create a **development build**. **Expo Go** is a sandbox environment with a limited set of native modules. To create development builds, run `eas build:dev`. Additionally, after installing new packages or adding config plugins, new development builds are often required.

## AI Agent Instructions

When working on this project:

1. **Always start by consulting the appropriate documentation**:

   - For general Expo questions: https://docs.expo.dev/llms-full.txt
   - For EAS/deployment questions: https://docs.expo.dev/llms-eas.txt
   - For SDK/API questions: https://docs.expo.dev/llms-sdk.txt

2. **Understand before implementing**: Read the relevant docs section before writing code

3. **Follow existing patterns**: Look at existing components and screens for patterns to follow
