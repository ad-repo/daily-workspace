#!/bin/bash
set -e

echo "🤖 Fully Automated Android App Build & Deploy"
echo "=============================================="
echo ""

# Check if running from project root
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Show current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current branch: $CURRENT_BRANCH"
echo ""

# Auto-detect IP
if [[ "$OSTYPE" == "darwin"* ]]; then
    SERVER_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -n1 | awk '{print $2}')
else
    SERVER_IP=$(hostname -I | awk '{print $1}')
fi

echo "🔍 Auto-detected IP: $SERVER_IP"
echo ""

# Update configuration files
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1/5: Updating Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Update capacitor.config.ts
CAPACITOR_CONFIG="frontend/capacitor.config.ts"
if [ -f "$CAPACITOR_CONFIG" ]; then
    sed -i.bak "s/'[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}'/'$SERVER_IP'/g" "$CAPACITOR_CONFIG"
    echo "✅ Updated $CAPACITOR_CONFIG"
fi

# Update network_security_config.xml
NETWORK_CONFIG="frontend/android/app/src/main/res/xml/network_security_config.xml"
if [ -f "$NETWORK_CONFIG" ]; then
    sed -i.bak "s/>[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}</>${SERVER_IP}</g" "$NETWORK_CONFIG"
    echo "✅ Updated $NETWORK_CONFIG"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2/5: Building Web Assets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd frontend
docker-compose exec -T frontend npm run build

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3/5: Syncing to Android"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

docker-compose exec -T frontend npx cap sync android

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 4/5: Building APK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd android

# Check for Android SDK
if [ -z "$ANDROID_HOME" ]; then
    # Try default location
    if [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
        echo "✅ Found Android SDK at $ANDROID_HOME"
    else
        echo "❌ Android SDK not found!"
        echo ""
        echo "Please install Android SDK first:"
        echo "  1. See ANDROID_SETUP.md for installation guide"
        echo "  2. Or install Android Studio: https://developer.android.com/studio"
        echo ""
        echo "Quick setup:"
        echo "  export ANDROID_HOME=\$HOME/Library/Android/sdk"
        echo "  echo 'export ANDROID_HOME=\$HOME/Library/Android/sdk' >> ~/.zshrc"
        exit 1
    fi
fi

# Create local.properties
echo "sdk.dir=$ANDROID_HOME" > local.properties
echo "✅ Created local.properties with SDK path"

if [ ! -f "gradlew" ]; then
    echo "❌ Error: gradlew not found"
    exit 1
fi

chmod +x gradlew
./gradlew assembleDebug

APK_PATH="app/build/outputs/apk/debug/app-debug.apk"

if [ ! -f "$APK_PATH" ]; then
    echo "❌ Build failed - APK not found"
    exit 1
fi

APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
echo ""
echo "✅ APK built successfully! Size: $APK_SIZE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 5/5: Deploying to Server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd ../../../
mkdir -p backend/static
cp "frontend/android/$APK_PATH" backend/static/track-the-thing.apk
echo "✅ APK copied to backend/static/"

# Create download page
cat > backend/static/download.html << 'HTMLEOF'
<!DOCTYPE html>
<html>
<head>
    <title>Download Track the Thing</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            color: white;
        }
        .container {
            max-width: 600px;
            margin: 50px auto;
            background: rgba(255, 255, 255, 0.95);
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            color: #333;
            text-align: center;
        }
        h1 { font-size: 2.5em; margin-bottom: 10px; }
        .subtitle { color: #666; margin-bottom: 30px; }
        .download-btn {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 18px 40px;
            border-radius: 50px;
            text-decoration: none;
            font-size: 20px;
            font-weight: bold;
            margin: 20px 0;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
            transition: all 0.2s;
        }
        .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5);
        }
        .badge {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            margin: 5px;
        }
        .instructions {
            text-align: left;
            background: #f8f9fa;
            padding: 25px;
            border-radius: 15px;
            margin-top: 30px;
            border-left: 4px solid #667eea;
        }
        .instructions h3 { color: #667eea; margin-bottom: 15px; }
        .instructions ol, .instructions ul { padding-left: 20px; }
        .instructions li { margin: 10px 0; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📱 Track the Thing</h1>
        <p class="subtitle">For Android</p>
        
        <div>
            <span class="badge">Pixel 7a Optimized</span>
            <span class="badge">Native Camera</span>
            <span class="badge">Voice Dictation</span>
        </div>
        
        <a href="/track-the-thing.apk" class="download-btn">⬇️ Download APK</a>
        
        <div class="instructions">
            <h3>📋 Installation</h3>
            <ol>
                <li>Download the APK above</li>
                <li>Open from notifications</li>
                <li>Allow "Install from unknown sources" if prompted</li>
                <li>Tap Install</li>
                <li>Grant camera & mic permissions</li>
                <li>Enjoy! 🎉</li>
            </ol>
        </div>
        
        <div class="instructions">
            <h3>✨ Features</h3>
            <ul>
                <li>📸 Native Camera (no HTTPS needed)</li>
                <li>🎤 Real-time Voice Dictation</li>
                <li>🎨 30+ Customizable Themes</li>
                <li>📊 Reports & Advanced Search</li>
                <li>☁️ Backup & Restore</li>
            </ul>
        </div>
    </div>
</body>
</html>
HTMLEOF

echo "✅ Created download page"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📦 APK: backend/static/track-the-thing.apk ($APK_SIZE)"
echo ""
echo "🌐 Access from Pixel 7a:"
echo "   http://$SERVER_IP:8000/download.html"
echo ""
echo "📱 Quick Install:"
echo "   1. Open Chrome on Pixel 7a"
echo "   2. Visit the URL above"
echo "   3. Follow on-screen instructions"
echo ""
echo "✅ Backend status:"
docker-compose ps | grep -E "NAME|backend|frontend"
echo ""

