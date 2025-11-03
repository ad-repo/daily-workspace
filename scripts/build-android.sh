#!/bin/bash
set -e

echo "🤖 Automated Android APK Build Script"
echo "======================================"
echo ""

# Check if running from project root
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Step 1: Build web assets
echo "📦 Step 1/4: Building web assets..."
cd frontend
docker-compose exec -T frontend npm run build

# Step 2: Sync to Android
echo "🔄 Step 2/4: Syncing to Android project..."
docker-compose exec -T frontend npx cap sync android

# Step 3: Check for Android SDK
echo "🔍 Step 3/4: Checking for Android SDK..."
cd android

if [ ! -f "gradlew" ]; then
    echo "❌ Error: gradlew not found. Android SDK not properly set up."
    echo ""
    echo "Please install Android Studio and run this command manually:"
    echo "  cd frontend/android && ./gradlew assembleDebug"
    exit 1
fi

# Make gradlew executable
chmod +x gradlew

# Step 4: Build APK
echo "🏗️  Step 4/4: Building APK..."
echo "This may take a few minutes on first build..."
./gradlew assembleDebug

# Check if APK was created
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    echo ""
    echo "✅ SUCCESS! APK built successfully!"
    echo "📍 Location: frontend/android/$APK_PATH"
    echo ""
    
    # Get APK size
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo "📊 APK Size: $APK_SIZE"
    echo ""
    
    # Ask if user wants to copy to backend
    echo "Would you like to copy the APK to backend/static/ for distribution?"
    echo "(This will make it available at http://YOUR_IP:8000/track-the-thing.apk)"
    read -p "Copy APK? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd ../../../
        mkdir -p backend/static
        cp "frontend/android/$APK_PATH" backend/static/track-the-thing.apk
        echo "✅ APK copied to backend/static/track-the-thing.apk"
        echo ""
        
        # Get local IP
        if [[ "$OSTYPE" == "darwin"* ]]; then
            LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -n1 | awk '{print $2}')
        else
            LOCAL_IP=$(hostname -I | awk '{print $1}')
        fi
        
        echo "📱 Download URL: http://$LOCAL_IP:8000/track-the-thing.apk"
    fi
else
    echo "❌ Build failed - APK not found"
    exit 1
fi

echo ""
echo "🎉 All done!"

