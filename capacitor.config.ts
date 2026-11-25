import { KeyboardResize } from '@capacitor/keyboard';

// Minimaler Typ statt Import aus '@capacitor/cli': Die Capacitor-CLI ist keine
// Runtime-Abhängigkeit mehr (nur für native Builds on demand installiert).
interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  server?: Record<string, unknown>;
  plugins?: Record<string, Record<string, unknown>>;
  android?: Record<string, unknown>;
  ios?: Record<string, unknown>;
}

const config: CapacitorConfig = {
  appId: 'com.ebookreader.pro',
  appName: 'eBook Reader Pro',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0a0a0a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#0a0a0a',
    },
    Keyboard: {
      resize: KeyboardResize.Body,
      resizeOnFullScreen: true,
    },
    Haptics: {
      selectionStartDuration: 10,
    },
  },
  android: {
    // Aus Sicherheitsgründen deaktiviert: erlaubte gemischte Inhalte
    // (HTTP-Ressourcen in HTTPS-Kontext) öffnen eine Angriffsfläche.
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: '#0a0a0a',
  },
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: false,
    scrollEnabled: true,
    backgroundColor: '#0a0a0a',
  },
};

export default config;
