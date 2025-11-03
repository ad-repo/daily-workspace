# Android SDK Setup Guide

## Prerequisites Installation

Before building the Android app, you need to install the Android SDK. Here are your options:

### Option 1: Install Android Studio (Recommended - GUI)

1. **Download Android Studio**:
   - Visit: https://developer.android.com/studio
   - Download for macOS
   - Open the `.dmg` file and drag to Applications

2. **Run Android Studio**:
   ```bash
   open -a "Android Studio"
   ```

3. **Initial Setup Wizard**:
   - Click "Next" through the welcome screens
   - Choose "Standard" installation
   - Accept licenses
   - Wait for SDK components to download (~3-5 GB)

4. **Verify Installation**:
   ```bash
   ls ~/Library/Android/sdk
   # Should show: build-tools, platforms, tools, etc.
   ```

5. **Set Environment Variables** (add to `~/.zshrc`):
   ```bash
   echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
   echo 'export PATH=$PATH:$ANDROID_HOME/tools' >> ~/.zshrc
   echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.zshrc
   source ~/.zshrc
   ```

6. **Verify**:
   ```bash
   echo $ANDROID_HOME
   # Should show: /Users/ad/Library/Android/sdk
   ```

### Option 2: Command Line Tools Only (Smaller, No GUI)

1. **Download Command Line Tools**:
   - Visit: https://developer.android.com/studio#command-tools
   - Download "Command line tools only" for Mac
   - Extract to `~/Android/sdk/cmdline-tools/latest/`

2. **Create SDK Directory**:
   ```bash
   mkdir -p ~/Library/Android/sdk/cmdline-tools
   cd ~/Downloads
   unzip commandlinetools-mac-*.zip
   mv cmdline-tools ~/Library/Android/sdk/cmdline-tools/latest
   ```

3. **Set Environment Variables**:
   ```bash
   echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
   echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin' >> ~/.zshrc
   echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.zshrc
   source ~/.zshrc
   ```

4. **Install Required Packages**:
   ```bash
   sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"
   sdkmanager --licenses  # Accept all licenses
   ```

## Verify Your Setup

Run this command to check everything is configured:

```bash
echo "ANDROID_HOME: $ANDROID_HOME"
ls $ANDROID_HOME 2>/dev/null && echo "✅ SDK found" || echo "❌ SDK not found"
which java && java -version
```

You should see:
- ✅ ANDROID_HOME set to your SDK path
- ✅ SDK directory exists with files
- ✅ Java version 17 or higher

## Common Issues

### Issue: "ANDROID_HOME not set"

**Solution**: Add to `~/.zshrc` and restart terminal:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### Issue: "SDK location not found"

**Solution**: Create `local.properties`:
```bash
echo "sdk.dir=$ANDROID_HOME" > frontend/android/local.properties
```

### Issue: "java: command not found"

**Solution**: Install Java 17:
```bash
brew install openjdk@17
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
```

### Issue: "License not accepted"

**Solution**: Accept all licenses:
```bash
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses
```

## Next Steps

Once setup is complete, run:

```bash
# Automated build and deploy
./scripts/android-auto.sh

# Or step-by-step
./scripts/update-server-ip.sh
./scripts/build-android.sh
./scripts/deploy-to-server.sh
```

## Quick Test

To verify everything works before building the full app:

```bash
cd frontend/android
./gradlew tasks  # Should list available tasks without errors
```

## Disk Space

Make sure you have:
- **~5 GB** for Android SDK
- **~500 MB** for Gradle cache
- **~100 MB** for APK build artifacts

Total: **~6 GB free space**

## Time Estimates

- Android Studio download: 5-10 minutes
- Initial setup: 5 minutes
- SDK component download: 10-15 minutes
- **Total: ~30 minutes**

- Command line tools: 2-3 minutes
- SDK packages: 5-10 minutes
- **Total: ~15 minutes**

First APK build: 2-5 minutes
Subsequent builds: 30-60 seconds

---

**Ready?** After installing Android SDK, run:
```bash
./scripts/android-auto.sh
```

