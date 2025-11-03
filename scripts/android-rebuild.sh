#!/bin/bash
set -e

echo "🔄 Android APK Rebuild Script"
echo "============================="
echo ""

cd /Users/ad/Projects/daily-notes

# Step 1: Build web assets in Docker
echo "📦 Building web assets..."
cd frontend
docker-compose exec -T frontend npm run build

# Step 2: Sync to Android
echo "🔄 Syncing to Android..."
docker-compose exec -T frontend npx cap sync android

# Step 3: Build APK with Java 21
echo "🏗️  Building APK..."
cd android
export JAVA_HOME=/opt/homebrew/opt/openjdk@21
export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"
./gradlew assembleDebug

# Step 4: Deploy
echo "📤 Deploying..."
cd ../../..
mkdir -p backend/static
cp frontend/android/app/build/outputs/apk/debug/app-debug.apk backend/static/track-the-thing.apk

APK_SIZE=$(du -h backend/static/track-the-thing.apk | cut -f1)

echo ""
echo "✅ SUCCESS! APK ready: $APK_SIZE"
echo ""
echo "📱 Download at: http://192.168.0.186:8000/track-the-thing.apk"
echo "🌐 Download page: http://192.168.0.186:8000/download.html"
echo ""

