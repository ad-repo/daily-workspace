# Track the Thing - Android App

## Overview

This Android app is a Capacitor wrapper around the Track the Thing web application, optimized specifically for **Google Pixel 7a** and modern Android devices (Android 13+).

### Features

- ✅ **Native Camera Access** - Take photos directly within the app
- ✅ **Native Microphone Access** - Voice dictation works natively without browser restrictions
- ✅ **Optimized for Pixel 7a** - Display cutout (notch) support, OLED optimization, gesture navigation
- ✅ **Offline Page Caching** - Basic page caching for faster load times
- ✅ **Installable** - Install directly from your server (no Play Store needed)

## Prerequisites

To build the Android app, you need:

1. **Java Development Kit (JDK) 17+**
   ```bash
   java -version  # Should show version 17 or higher
   ```

2. **Android Studio** (includes Android SDK)
   - Download from: https://developer.android.com/studio
   - During setup, install:
     - Android SDK Platform 35 (Android 14)
     - Android SDK Build-Tools
     - Android SDK Command-line Tools
     - Android Emulator (optional, for testing)

3. **Environment Variables**
   Add to your `~/.zshrc` or `~/.bash_profile`:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

## Building the APK

### Option 1: Build with Android Studio (Recommended for first-time)

1. **Build the web assets**:
   ```bash
   cd frontend
   docker-compose exec -T frontend npm run build
   docker-compose exec -T frontend npx cap sync android
   ```

2. **Open in Android Studio**:
   ```bash
   cd frontend
   docker-compose exec -T frontend npx cap open android
   ```
   
3. **In Android Studio**:
   - Wait for Gradle sync to complete
   - Click **Build > Build Bundle(s) / APK(s) > Build APK(s)**
   - APK will be in: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

### Option 2: Build from Command Line (Faster)

1. **Build and generate APK**:
   ```bash
   cd frontend
   docker-compose exec -T frontend npm run build
   docker-compose exec -T frontend npx cap sync android
   cd android
   ./gradlew assembleDebug
   ```

2. **Find your APK**:
   ```bash
   ls -lh app/build/outputs/apk/debug/app-debug.apk
   ```

## Configuring for Your Network

Before building, update your server IP address:

1. **Update Capacitor config** (`frontend/capacitor.config.ts`):
   ```typescript
   server: {
     allowNavigation: [
       '192.168.0.186',  // <- Change to YOUR computer's IP
       'localhost',
     ]
   }
   ```

2. **Update network security config** (`frontend/android/app/src/main/res/xml/network_security_config.xml`):
   ```xml
   <domain includeSubdomains="true">192.168.0.186</domain>  <!-- Change this -->
   ```

3. **Rebuild and sync**:
   ```bash
   cd frontend
   docker-compose exec -T frontend npm run build
   docker-compose exec -T frontend npx cap sync android
   ```

## Distributing from Your Server

### Step 1: Host the APK

1. **Copy APK to your server**:
   ```bash
   cp frontend/android/app/build/outputs/apk/debug/app-debug.apk backend/static/
   mv backend/static/app-debug.apk backend/static/track-the-thing.apk
   ```

2. **Verify it's accessible**:
   ```
   http://192.168.0.186:8000/track-the-thing.apk
   ```

### Step 2: Create Download Page (Optional)

Create `backend/static/download.html`:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Download Track the Thing</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
        }
        .download-btn {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 18px;
            margin: 20px 0;
        }
        .instructions {
            text-align: left;
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <h1>📱 Track the Thing for Android</h1>
    <p>Optimized for Google Pixel 7a</p>
    
    <a href="/track-the-thing.apk" class="download-btn">
        Download APK (v1.0)
    </a>
    
    <div class="instructions">
        <h3>Installation Instructions:</h3>
        <ol>
            <li>Download the APK file</li>
            <li>Open the downloaded file</li>
            <li>Tap "Install" (you may need to allow "Install from unknown sources")</li>
            <li>Open the app and enjoy!</li>
        </ol>
        
        <h3>System Requirements:</h3>
        <ul>
            <li>Android 7.0+ (API 23+)</li>
            <li>Optimized for Android 13+ and Pixel 7a</li>
            <li>~50 MB storage space</li>
        </ul>
    </div>
</body>
</html>
```

### Step 3: Install on Pixel 7a

1. **On your Pixel 7a**, open Chrome and navigate to:
   ```
   http://192.168.0.186:8000/download.html
   ```

2. **Tap "Download APK"**

3. **Enable Unknown Sources** (first time only):
   - Go to: **Settings > Security > Install unknown apps**
   - Select **Chrome**
   - Toggle **Allow from this source**

4. **Install the app**:
   - Open the downloaded APK from notifications
   - Tap **Install**
   - Tap **Open**

5. **Grant permissions**:
   - The app will request camera and microphone permissions
   - Tap **Allow** for full functionality

## Updating the App

To release an update:

1. **Increment version** in `frontend/android/app/build.gradle`:
   ```gradle
   versionCode 2      // Increment this
   versionName "1.1"  // Update this
   ```

2. **Rebuild**:
   ```bash
   cd frontend
   docker-compose exec -T frontend npm run build
   docker-compose exec -T frontend npx cap sync android
   cd android && ./gradlew assembleDebug
   ```

3. **Replace APK on server**:
   ```bash
   cp app/build/outputs/apk/debug/app-debug.apk ../../backend/static/track-the-thing.apk
   ```

4. **Users download and install** the new APK (it will update the existing app)

## Pixel 7a Specific Optimizations

This app includes the following Pixel 7a optimizations:

### Display & UI
- **Display cutout support** - Content properly avoids the punch-hole camera
- **Gesture navigation** - Safe area insets for gesture bars
- **OLED optimization** - True black backgrounds for better battery life
- **High DPI support** - Crisp assets on the 6.1" FHD+ display (429 ppi)

### Performance
- **Hardware acceleration** enabled
- **Network cleartext** allowed for local development
- **Proper keyboard handling** with `adjustResize`

### Features
- **Native camera** via Capacitor Camera plugin
- **Native microphone** via Web APIs with native context
- **File system access** via Capacitor Filesystem plugin
- **Proper permissions** - Runtime permission requests

## Troubleshooting

### Build Errors

**"SDK location not found"**:
```bash
echo "sdk.dir=$ANDROID_HOME" > frontend/android/local.properties
```

**"Command failed: gradlew"**:
```bash
cd frontend/android
chmod +x gradlew
```

**"Java version mismatch"**:
- Install JDK 17: `brew install openjdk@17`
- Update JAVA_HOME: `export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home`

### Installation Errors

**"App not installed"**:
- Uninstall any existing version first
- Check available storage space
- Try: Settings > Apps > Show system > Package Installer > Clear data

**"Parse error"**:
- Re-download the APK (it may be corrupted)
- Ensure your Android version is 7.0+

### Runtime Issues

**Camera/Mic not working**:
- Check permissions: Settings > Apps > Track the Thing > Permissions
- Ensure all permissions are granted
- Restart the app

**Cannot connect to server**:
- Verify you're on the same WiFi network
- Check the IP address is correct in the app config
- Ensure the backend server is running: `docker-compose ps`

## Production Build (Release APK)

For a production build (smaller, optimized, but requires signing):

1. **Generate a keystore** (first time only):
   ```bash
   keytool -genkey -v -keystore track-the-thing.keystore -alias track-the-thing \
     -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure signing** in `frontend/android/app/build.gradle`:
   ```gradle
   android {
       signingConfigs {
           release {
               storeFile file('track-the-thing.keystore')
               storePassword 'your_password'
               keyAlias 'track-the-thing'
               keyPassword 'your_password'
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               minifyEnabled true
               proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
           }
       }
   }
   ```

3. **Build release APK**:
   ```bash
   cd frontend/android
   ./gradlew assembleRelease
   ```

4. **Find signed APK**:
   ```
   app/build/outputs/apk/release/app-release.apk
   ```

## Next Steps

- [ ] Build the debug APK
- [ ] Test on your Pixel 7a
- [ ] Configure for your network
- [ ] Host on your server
- [ ] Create a release build (optional)
- [ ] Consider app signing for updates

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [Distributing Apps Outside Google Play](https://developer.android.com/distribute/marketing-tools/alternative-distribution)

