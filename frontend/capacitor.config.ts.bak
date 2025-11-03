import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.trackthething.app',
  appName: 'Track the Thing',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: [
      '192.168.0.186',
      'localhost',
      '127.0.0.1'
    ]
  },
  android: {
    // Pixel 7a optimizations
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    // Handle display cutout (punch-hole camera)
    layoutFillScreen: true,
    // Optimize for gesture navigation
    overrideUserAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7a) AppleWebKit/537.36',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#000000', // True black for OLED
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000', // True black for OLED
      overlaysWebView: false,
    },
  },
};

export default config;

