# Android App - Quick Start Guide

## TL;DR - Get the APK in 5 minutes

### Prerequisites
- Java 17+ installed
- Android Studio installed (or just the command-line tools)

### Quick Build Steps

```bash
# 1. Navigate to frontend
cd frontend

# 2. Build web assets
docker-compose exec -T frontend npm run build

# 3. Sync to Android
docker-compose exec -T frontend npx cap sync android

# 4. Build APK (choose one):

# Option A: With Android Studio
docker-compose exec -T frontend npx cap open android
# Then: Build > Build APK

# Option B: Command line (faster)
cd android
./gradlew assembleDebug
# APK will be at: app/build/outputs/apk/debug/app-debug.apk
```

### Install on Pixel 7a

1. Copy APK to phone or host on your server
2. On phone, enable: **Settings > Security > Install unknown apps > [Your Browser] > Allow**
3. Download and install the APK
4. Grant camera and microphone permissions when prompted
5. Done! 🎉

## What You Get

- ✅ Native camera (no browser HTTPS requirement)
- ✅ Native microphone (voice dictation works everywhere)
- ✅ Optimized UI for Pixel 7a (notch, gestures, OLED)
- ✅ Offline page caching
- ✅ Installable from your own server

## Important Notes

### 1. Update Your Server IP

Before building, update these two files with **your computer's IP** (not 192.168.0.186):

**`frontend/capacitor.config.ts`**:
```typescript
allowNavigation: [
  '192.168.0.186',  // <- Change this to YOUR IP
]
```

**`frontend/android/app/src/main/res/xml/network_security_config.xml`**:
```xml
<domain includeSubdomains="true">192.168.0.186</domain>  <!-- Change this -->
```

### 2. Find Your IP Address

```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr IPv4
```

### 3. Rebuild After IP Change

```bash
cd frontend
docker-compose exec -T frontend npm run build
docker-compose exec -T frontend npx cap sync android
cd android && ./gradlew assembleDebug
```

## Distributing the APK

### Host on Your Server

```bash
# Copy APK to backend static folder
cp frontend/android/app/build/outputs/apk/debug/app-debug.apk backend/static/track-the-thing.apk

# Access from phone
http://YOUR_IP:8000/track-the-thing.apk
```

### Share via Link

Your APK will be available at:
```
http://YOUR_IP:8000/track-the-thing.apk
```

Send this link to your phone and download directly!

## Troubleshooting

### "Command not found: npm"
Run commands inside Docker:
```bash
docker-compose exec -T frontend [command]
```

### "SDK location not found"
```bash
echo "sdk.dir=$ANDROID_HOME" > frontend/android/local.properties
```

### "gradlew: Permission denied"
```bash
cd frontend/android
chmod +x gradlew
```

### Camera/Mic Not Working
1. Check app permissions: **Settings > Apps > Track the Thing > Permissions**
2. Ensure all permissions are **Allowed**
3. Restart the app

### Cannot Connect to Server
1. Verify same WiFi network
2. Check IP address is correct
3. Ensure backend is running: `docker-compose ps`

## Next Steps

For complete documentation, see:
- **[ANDROID_APP.md](./ANDROID_APP.md)** - Full setup guide with all details
- **[README.md](./README.md)** - App features and tech stack

## Updates

To release an update:

1. Increment version in `frontend/android/app/build.gradle`:
   ```gradle
   versionCode 2
   versionName "1.1"
   ```

2. Rebuild and redistribute the APK

3. Users install the new APK (it will update automatically)

---

**Need help?** See the full guide: [ANDROID_APP.md](./ANDROID_APP.md)

