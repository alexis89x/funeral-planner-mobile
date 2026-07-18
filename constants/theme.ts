/**
 * Design System — Multi-theme configuration
 *
 * COME CAMBIARE TEMA
 * ──────────────────
 * Cambia ACTIVE_THEME con uno dei valori disponibili:
 *   'tramonto'      → Tramonto Sereno   (arancione, consumer B2C)
 *   'studio3a'      → Studio 3A         (arancione, white-label Studio 3A)
 *   'mazzini'       → Gruppo Mazzini    (blu navy #25346d)
 *   'taddiagroup'   → Taddia Group      (bordeaux #a40046)
 *   'alc'           → Testamento Biologico (Associazione Luca Coscioni, blu #1495e4)
 *   'archivio-sereno' → Archivio Sereno     (documenti + contatti di emergenza, tab ridotte)
 *
 * NB: 'archivio-sereno' non è solo un brand diverso: ha anche un diverso layout dei tab,
 * che riduce la tab bar a sole 2 tab (vedi app/(tabs)/_layout.tsx e AGENTS.md § "Progetto Archivio Sereno").
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * COSA CAMBIARE PER OGNI TEMA (manuale)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ┌─ app.json ─────────────────────────────────────────────────────────────────
 * │
 * │  expo.name
 * │    tramonto      → "Tramonto Sereno"
 * │    studio3a      → "Studio 3A"
 * │    mazzini       → "Gruppo Mazzini"
 * │    archivio-sereno → "Archivio Sereno"
 * │
 * │  expo.ios.bundleIdentifier / expo.android.package
 * │    tramonto      → it.nanuktechnology.tramontosereno
 * │    studio3a      → it.nanuktechnology.tramontosereno.studio
 * │    mazzini       → it.nanuktechnology.mazzini
 * │    archivio-sereno → it.nanuktechnology.archiviosereno
 * │
 * │  expo.android.adaptiveIcon.backgroundColor  →  ThemeConfig.splashColor
 * │  expo.plugins[expo-splash-screen].backgroundColor (light + dark)  →  idem
 * │
 * │  expo.icon / expo.splash / expo.android.adaptiveIcon
 * │    → aggiornare i path per puntare alla cartella del tema:
 * │      "./assets/images/themes/{tema}/icon.png"
 * │      "./assets/images/themes/{tema}/splash-icon.png"
 * │      "./assets/images/themes/{tema}/android-icon-*.png"
 * │
 * │  Stringhe di permesso (NSCamera…, NSPhoto…, NSMicrophone…, NSLocation…,
 * │  expo-location.locationWhenInUsePermission, expo-image-picker.*)
 * │    → sostituire il nome brand nel testo
 * │      (es. "Tramonto Sereno" → "Gruppo Mazzini")
 * │
 * └────────────────────────────────────────────────────────────────────────────
 *
 * ┌─ eas.json ─────────────────────────────────────────────────────────────────
 * │  Aggiungere un profilo build dedicato al nuovo cliente.
 * │  Vedi profilo "studio" come riferimento.
 * └────────────────────────────────────────────────────────────────────────────
 *
 * ┌─ Assets ───────────────────────────────────────────────────────────────────
 * │
 * │  Gli asset specifici per ogni tema sono in:
 * │    assets/images/themes/{tema}/
 * │
 * │  File attesi in ogni cartella tema:
 * │    logo.png                  → logo principale (usato in-app)
 * │    logo-horizontal.png       → logo orizzontale (loading screen, login)
 * │    icon.png                  → icona app (1024x1024 quadrata)
 * │    splash-icon.png           → immagine splash
 * │    favicon.png               → favicon web
 * │    android-icon-foreground.png
 * │    android-icon-background.png
 * │    android-icon-monochrome.png
 * │
 * │  Prima di ogni build, copiare i file del tema attivo in assets/images/:
 * │    cp assets/images/themes/mazzini/* assets/images/
 * │
 * │  Tutti i file (logo in-app e asset di build) sono referenziati direttamente
 * │  dalla cartella del tema — nessuna copia manuale necessaria.
 * └────────────────────────────────────────────────────────────────────────────
 */

import { Platform } from 'react-native';

// ─── Tipi ────────────────────────────────────────────────────────────────────

export type ThemeName = 'tramonto' | 'studio3a' | 'mazzini' | 'taddiagroup' | 'alc' | 'archivio-sereno';

export interface ThemeConfig {
  /** Nome visualizzato (= expo.name in app.json) */
  displayName: string;
  /** Colore primario brand */
  main: string;
  /** Variante scura del colore primario */
  mainDark: string;
  /** Variante chiara del colore primario */
  mainLight: string;
  /** Sfondo tinta primaria molto leggero */
  mainLightest: string;
  /** Sfondo tinta primaria quasi bianco */
  mainLightestest: string;
  /**
   * Usato per splash screen e sfondo icona Android adattiva.
   * Corrisponde a:
   *   expo.android.adaptiveIcon.backgroundColor
   *   expo.plugins[expo-splash-screen].backgroundColor
   */
  splashColor: string;
  /**
   * Comportamento del tab "funeral-home" nella tab bar.
   *
   * 'always-visible':
   *   Il tab è sempre visibile. Il titolo e l'icona cambiano in base al
   *   profilo utente (ha un partner referral → "La mia onoranza" con icona
   *   edificio; altrimenti → "Cerca onoranze funebri" con lente). Usato da
   *   Tramonto Sereno per il flusso B2C.
   *
   * 'hide-without-partner':
   *   Il tab viene nascosto se l'utente non ha un partner referral.
   *   La ricerca onoranze è accessibile tramite la sezione Servizi.
   *   Usato da Studio 3A e Gruppo Mazzini.
   */
  funeralHomeTab: 'always-visible' | 'hide-without-partner';
  /**
   * Logo principale (require statico, risolto a build time).
   * File: assets/images/themes/{tema}/logo.png
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logo: any;
  /**
   * Logo orizzontale (require statico, risolto a build time).
   * File: assets/images/themes/{tema}/logo-horizontal.png
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logoHorizontal: any;
  /** Larghezza del logo orizzontale in px (usata nei componenti login/welcome/loading) */
  logoHorizontalWidth: number;
  /**
   * Rapporto height/width del logo orizzontale (dalle dimensioni naturali dell'immagine).
   * L'altezza viene calcolata automaticamente: logoHorizontalWidth × logoHorizontalAspectRatio.
   */
  logoHorizontalAspectRatio: number;
  /** Se true, il pulsante "Accedi con Google" è visibile nella schermata di login */
  googleLoginEnabled: boolean;
}

// ─── Definizione temi ─────────────────────────────────────────────────────────

export const THEMES: Record<ThemeName, ThemeConfig> = {
  /**
   * Tramonto Sereno — app consumer B2C
   * bundle: it.nanuktechnology.tramontosereno
   * Asset: assets/images/themes/tramonto/
   */
  tramonto: {
    displayName: 'Tramonto Sereno',
    main: '#bf9574',
    mainDark: '#ab8668',
    mainLight: '#d6b89c',
    mainLightest: '#f6f0eb',
    mainLightestest: '#faf7f4',
    splashColor: '#bf9574',
    funeralHomeTab: 'always-visible',
    logo: require('@/assets/images/themes/tramonto/logo.png'),
    logoHorizontal: require('@/assets/images/themes/tramonto/logo-horizontal.png'),
    logoHorizontalWidth: 280,
    logoHorizontalAspectRatio: 1016 / 2931, // ~0.3467
    googleLoginEnabled: true,
  },

  /**
   * Studio 3A — white-label per Studio 3A
   * bundle: it.nanuktechnology.tramontosereno.studio
   * Asset: assets/images/themes/studio3a/
   */
  studio3a: {
    displayName: 'Studio 3A',
    main: '#ff7f13',
    mainDark: '#cc6200',
    mainLight: '#ffa040',
    mainLightest: '#fff3e8',
    mainLightestest: '#fff8f3',
    splashColor: '#ff7f13',
    funeralHomeTab: 'hide-without-partner',
    logo: require('@/assets/images/themes/studio3a/logo.png'),
    logoHorizontal: require('@/assets/images/themes/studio3a/logo-horizontal.png'),
    logoHorizontalWidth: 280,
    logoHorizontalAspectRatio: 205 / 800, // ~0.2563
    googleLoginEnabled: false,
  },

  /**
   * Gruppo Mazzini — Padova, https://www.gruppomazzini.it/
   * bundle: it.nanuktechnology.mazzini
   * Asset: assets/images/themes/mazzini/
   * TODO: sostituire android-icon-*.png e favicon.png con versioni brandizzate Mazzini
   */
  mazzini: {
    displayName: 'Gruppo Mazzini',
    main: '#25346d',
    mainDark: '#1a2450',
    mainLight: '#3d4f8f',
    mainLightest: '#e8eaf5',
    mainLightestest: '#f3f4fa',
    splashColor: '#25346d',
    funeralHomeTab: 'hide-without-partner',
    logo: require('@/assets/images/themes/mazzini/logo.png'),
    logoHorizontal: require('@/assets/images/themes/mazzini/logo-horizontal.png'),
    logoHorizontalWidth: 280,
    logoHorizontalAspectRatio: 166 / 500, // 0.332
    googleLoginEnabled: false,
  },

  /**
   * Taddia Group
   * bundle: it.nanuktechnology.taddiagroup
   * Asset: assets/images/themes/taddiagroup/
   */
  taddiagroup: {
    displayName: 'Taddia Group',
    main: '#a40046',
    mainDark: '#7b0034',
    mainLight: '#bf4d7d',
    mainLightest: '#f6e6ed',
    mainLightestest: '#fbf5f8',
    splashColor: '#a40046',
    funeralHomeTab: 'hide-without-partner',
    logo: require('@/assets/images/themes/taddiagroup/logo.png'),
    logoHorizontal: require('@/assets/images/themes/taddiagroup/logo-horizontal.png'),
    logoHorizontalWidth: 280,
    logoHorizontalAspectRatio: 120 / 300, // 0.4
    googleLoginEnabled: false,
  },

  /**
   * Testamento Biologico — Associazione Luca Coscioni
   * bundle: it.nanuktechnology.alc
   * Asset: assets/images/themes/alc/
   * NB: icon/logo (quadrati) generati dal marchio "alc-no-text.svg" (solo simbolo, senza wordmark).
   * logo-horizontal.png generato da "Logo_Coscioni_scelto (3).svg" (simbolo + wordmark "Associazione Luca Coscioni").
   */
  alc: {
    displayName: 'Testamento Biologico',
    main: '#1495e4',
    mainDark: '#0e6ba4',
    mainLight: '#56b5f0',
    mainLightest: '#e3f3fd',
    mainLightestest: '#f1f9fe',
    splashColor: '#1495e4',
    funeralHomeTab: 'hide-without-partner',
    logo: require('@/assets/images/themes/alc/logo.png'),
    logoHorizontal: require('@/assets/images/themes/alc/logo-horizontal.png'),
    logoHorizontalWidth: 280,
    logoHorizontalAspectRatio: 554 / 1886, // ~0.2937
    googleLoginEnabled: false,
  },

  /**
   * Archivio Sereno — app separata, stesso codice/backend di Tramonto Sereno
   * (l'utente ha sempre un piano Tramonto Sereno dietro le quinte), ma con un layout diverso.
   * bundle: it.nanuktechnology.archiviosereno (impostato anche in app.json).
   * Asset: assets/images/themes/archivio-sereno/ — grafica definitiva del brand.
   * NB: manca ancora un client OAuth Google dedicato al bundle id di Archivio Sereno
   * (il plugin google-signin in app.json usa ancora l'iosUrlScheme di Tramonto Sereno).
   */
  'archivio-sereno': {
    displayName: 'Archivio sereno',
    main: '#5FA8D3',
    mainDark: '#3D7FA8',
    mainLight: '#BFE3F5',
    mainLightest: '#EAF6FF',
    mainLightestest: '#F5FBFF',
    splashColor: '#5FA8D3',
    funeralHomeTab: 'hide-without-partner',
    logo: require('@/assets/images/themes/archivio-sereno/logo.png'),
    logoHorizontal: require('@/assets/images/themes/archivio-sereno/logo-horizontal.png'),
    logoHorizontalWidth: 280,
    logoHorizontalAspectRatio: 1016 / 2931, // ~0.3467
    googleLoginEnabled: true,
  },
};

// ─── Tema attivo ──────────────────────────────────────────────────────────────

/**
 * Cambia questo valore per switchare tema.
 * Ricorda di aggiornare anche app.json e di copiare gli asset (vedi istruzioni).
 */
export const ACTIVE_THEME: ThemeName = 'alc';

const activeTheme = THEMES[ACTIVE_THEME];

/** Logo principale dell'app — usa questo nei componenti invece di require() diretto. */
export const AppLogo = activeTheme.logo;

/** Logo orizzontale dell'app — usa questo nei componenti invece di require() diretto. */
export const AppLogoHorizontal = activeTheme.logoHorizontal;
export const AppLogoHorizontalWidth = activeTheme.logoHorizontalWidth;
export const AppLogoHorizontalHeight = Math.round(activeTheme.logoHorizontalWidth * activeTheme.logoHorizontalAspectRatio);
export const AppGoogleLoginEnabled = activeTheme.googleLoginEnabled;

// ─── Colori base ──────────────────────────────────────────────────────────────

export const BaseColors = {
  // Black shades
  blackMedium: '#292F36',
  black: '#050505',

  // Utility
  blue: '#0091ff',
  greenDark: '#005742',
  greenLight: '#e5f4f0',
  greenLightest: '#f7fbfa',
  green: '#b2ded3',

  // Grey shades
  greyDark: '#b7bcc3',
  greyLight: '#e0e3e8',
  greyLightest: '#f5f5f5',
  greyMedium: '#585858',
  grey: '#999999',

  // Accent colors
  orange: '#FF6A00',
  red: '#CC0000',
  white: '#FFFFFF',
  yellow: '#ffc107',

  // Main brand palette (dal tema attivo)
  main: activeTheme.main,
  mainDark: activeTheme.mainDark,
  mainLight: activeTheme.mainLight,
  mainLightest: activeTheme.mainLightest,
  mainLightestest: activeTheme.mainLightestest,

  // Status colors
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107',

  // Border colors
  border: '#585858',
  borderLight: 'rgba(29, 51, 74, 0.1)',
};

const tintColorLight = BaseColors.main;
const tintColorDark = BaseColors.mainLight;

export const Colors = {
  light: {
    text: BaseColors.black,
    background: BaseColors.white,
    cardBackground: BaseColors.greyLightest,
    tint: tintColorLight,
    icon: BaseColors.greyMedium,
    tabIconDefault: BaseColors.greyMedium,
    tabIconSelected: tintColorLight,
    border: BaseColors.borderLight,
    success: BaseColors.success,
    danger: BaseColors.danger,
    warning: BaseColors.warning,
  },
  dark: {
    text: BaseColors.white,
    background: BaseColors.blackMedium,
    cardBackground: BaseColors.black,
    tint: tintColorDark,
    icon: BaseColors.greyDark,
    tabIconDefault: BaseColors.greyDark,
    tabIconSelected: tintColorDark,
    border: BaseColors.borderLight,
    success: BaseColors.success,
    danger: BaseColors.danger,
    warning: BaseColors.warning,
  },
};

// ─── Font ─────────────────────────────────────────────────────────────────────

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
