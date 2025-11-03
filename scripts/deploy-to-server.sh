#!/bin/bash
set -e

echo "📤 Deploy Android APK to Server"
echo "==============================="
echo ""

# Check if running from project root
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

APK_PATH="frontend/android/app/build/outputs/apk/debug/app-debug.apk"

# Check if APK exists
if [ ! -f "$APK_PATH" ]; then
    echo "❌ Error: APK not found at $APK_PATH"
    echo ""
    echo "Please build the APK first:"
    echo "  ./scripts/build-android.sh"
    exit 1
fi

# Get APK info
APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
echo "📦 Found APK: $APK_SIZE"
echo ""

# Create static directory if it doesn't exist
mkdir -p backend/static

# Copy APK
cp "$APK_PATH" backend/static/track-the-thing.apk
echo "✅ APK copied to backend/static/track-the-thing.apk"
echo ""

# Create download page
cat > backend/static/download.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Download Track the Thing</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
        }
        .container {
            background: rgba(255, 255, 255, 0.95);
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            margin-top: 50px;
            color: #333;
        }
        h1 {
            font-size: 2.5em;
            margin: 0 0 10px 0;
        }
        .subtitle {
            color: #666;
            margin: 0 0 30px 0;
        }
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
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5);
        }
        .instructions {
            text-align: left;
            background: #f8f9fa;
            padding: 25px;
            border-radius: 15px;
            margin-top: 30px;
            border-left: 4px solid #667eea;
        }
        .instructions h3 {
            color: #667eea;
            margin-top: 0;
        }
        .instructions ol, .instructions ul {
            padding-left: 20px;
        }
        .instructions li {
            margin: 10px 0;
            line-height: 1.6;
        }
        .emoji {
            font-size: 1.5em;
        }
        .badge {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            margin: 10px 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1><span class="emoji">📱</span> Track the Thing</h1>
        <p class="subtitle">For Android</p>
        
        <div>
            <span class="badge">Pixel 7a Optimized</span>
            <span class="badge">Native Camera</span>
            <span class="badge">Voice Dictation</span>
        </div>
        
        <a href="/track-the-thing.apk" class="download-btn">
            ⬇️ Download APK
        </a>
        
        <div class="instructions">
            <h3>📋 Installation Instructions</h3>
            <ol>
                <li><strong>Download</strong> the APK file above</li>
                <li><strong>Open</strong> the downloaded file from your notifications</li>
                <li><strong>Allow</strong> installation from unknown sources if prompted:
                    <br><small>Settings → Security → Install unknown apps → Chrome → Allow</small>
                </li>
                <li><strong>Tap Install</strong> and wait for completion</li>
                <li><strong>Grant permissions</strong> for camera and microphone when asked</li>
                <li><strong>Enjoy!</strong> 🎉</li>
            </ol>
        </div>
        
        <div class="instructions">
            <h3>⚙️ System Requirements</h3>
            <ul>
                <li><strong>Android 7.0+</strong> (API 23 or higher)</li>
                <li><strong>Optimized for</strong> Android 13+ and Pixel 7a</li>
                <li><strong>Storage:</strong> ~50 MB free space</li>
                <li><strong>Network:</strong> Same WiFi as the server</li>
            </ul>
        </div>
        
        <div class="instructions">
            <h3>✨ Features</h3>
            <ul>
                <li>📸 <strong>Native Camera</strong> - Take photos without HTTPS</li>
                <li>🎤 <strong>Voice Dictation</strong> - Real-time speech-to-text</li>
                <li>🎨 <strong>30+ Themes</strong> - Customize your experience</li>
                <li>📊 <strong>Reports & Search</strong> - Find anything instantly</li>
                <li>☁️ <strong>Backup & Restore</strong> - Never lose your data</li>
            </ul>
        </div>
    </div>
</body>
</html>
EOF

echo "✅ Created download page at backend/static/download.html"
echo ""

# Get local IP
if [[ "$OSTYPE" == "darwin"* ]]; then
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -n1 | awk '{print $2}')
else
    LOCAL_IP=$(hostname -I | awk '{print $1}')
fi

echo "🌐 APK and download page are now available at:"
echo ""
echo "  Direct APK:     http://$LOCAL_IP:8000/track-the-thing.apk"
echo "  Download Page:  http://$LOCAL_IP:8000/download.html"
echo ""
echo "📱 Instructions for Pixel 7a:"
echo "  1. Open Chrome on your Pixel 7a"
echo "  2. Navigate to: http://$LOCAL_IP:8000/download.html"
echo "  3. Follow the on-screen instructions"
echo ""
echo "✅ Ensure your backend is running:"
echo "  docker-compose ps"
echo ""

