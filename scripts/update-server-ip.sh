#!/bin/bash
set -e

echo "🌐 Update Server IP Address for Android App"
echo "==========================================="
echo ""

# Check if running from project root
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Get current IP
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    CURRENT_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -n1 | awk '{print $2}')
else
    # Linux
    CURRENT_IP=$(hostname -I | awk '{print $1}')
fi

echo "🔍 Detected IP Address: $CURRENT_IP"
echo ""
echo "This IP will be configured in:"
echo "  1. frontend/capacitor.config.ts"
echo "  2. frontend/android/app/src/main/res/xml/network_security_config.xml"
echo ""

# Ask for confirmation or custom IP
read -p "Use this IP? (y/n or enter custom IP): " USER_INPUT

if [[ $USER_INPUT =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    # User entered a custom IP
    SERVER_IP=$USER_INPUT
elif [[ $USER_INPUT =~ ^[Yy]$ ]]; then
    # User confirmed current IP
    SERVER_IP=$CURRENT_IP
else
    echo "❌ Cancelled"
    exit 0
fi

echo ""
echo "📝 Updating configuration files with IP: $SERVER_IP"
echo ""

# Update capacitor.config.ts
CAPACITOR_CONFIG="frontend/capacitor.config.ts"
if [ -f "$CAPACITOR_CONFIG" ]; then
    # Create backup
    cp "$CAPACITOR_CONFIG" "$CAPACITOR_CONFIG.bak"
    
    # Update the IP (replace the first IP in allowNavigation array)
    sed -i.tmp "s/'[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}'/'$SERVER_IP'/g" "$CAPACITOR_CONFIG"
    rm "$CAPACITOR_CONFIG.tmp"
    
    echo "✅ Updated $CAPACITOR_CONFIG"
else
    echo "⚠️  Warning: $CAPACITOR_CONFIG not found"
fi

# Update network_security_config.xml
NETWORK_CONFIG="frontend/android/app/src/main/res/xml/network_security_config.xml"
if [ -f "$NETWORK_CONFIG" ]; then
    # Create backup
    cp "$NETWORK_CONFIG" "$NETWORK_CONFIG.bak"
    
    # Update all IP addresses in domain tags (but not localhost, etc.)
    sed -i.tmp "s/>[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}</>${SERVER_IP}</g" "$NETWORK_CONFIG"
    rm "$NETWORK_CONFIG.tmp"
    
    echo "✅ Updated $NETWORK_CONFIG"
else
    echo "⚠️  Warning: $NETWORK_CONFIG not found"
fi

echo ""
echo "🎉 Configuration updated successfully!"
echo ""
echo "📋 Summary:"
echo "  Server IP: $SERVER_IP"
echo "  Backup files created with .bak extension"
echo ""
echo "Next steps:"
echo "  1. Run: ./scripts/build-android.sh"
echo "  2. Install APK on your Pixel 7a"
echo "  3. Ensure backend is running on $SERVER_IP:8000"
echo ""

