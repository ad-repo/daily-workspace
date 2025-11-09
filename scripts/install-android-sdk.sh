#!/bin/bash
set -e

echo "🚀 Automated Android SDK Installation"
echo "====================================="
echo ""

# Check if homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew not found. Please install it first:"
    echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
fi

echo "✅ Homebrew found"
echo ""

# Install Android command-line tools
echo "📦 Installing Android command-line tools..."
brew install --cask android-commandlinetools

echo ""
echo "✅ Android tools installed"
echo ""

# Set environment variables for this session
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# Add to ~/.zshrc if not already there
echo "📝 Configuring environment variables..."
if ! grep -q "ANDROID_HOME" ~/.zshrc; then
    echo "" >> ~/.zshrc
    echo "# Android SDK" >> ~/.zshrc
    echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
    echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin' >> ~/.zshrc
    echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.zshrc
    echo "✅ Added to ~/.zshrc"
else
    echo "✅ Already in ~/.zshrc"
fi

echo ""
echo "📦 Installing required SDK packages..."
echo "This will download ~1 GB and may take a few minutes..."
echo ""

# Install required packages
sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"

echo ""
echo "📜 Accepting licenses..."
yes | sdkmanager --licenses

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ANDROID SDK INSTALLATION COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 SDK Location: $ANDROID_HOME"
echo ""

# Verify installation
if [ -d "$ANDROID_HOME" ]; then
    echo "📊 Installed components:"
    ls -1 $ANDROID_HOME
    echo ""
    echo "✅ Verification successful!"
else
    echo "❌ SDK directory not found"
    exit 1
fi

echo ""
echo "🎉 Next steps:"
echo ""
echo "1. Restart your terminal (or run: source ~/.zshrc)"
echo "2. Build the Android app: ./scripts/android-auto.sh"
echo ""

