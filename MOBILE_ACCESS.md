# Mobile Access Guide 📱 (Android Optimized)

## Accessing Track the Thing from Your Android Phone

### The Problem
When running locally with Docker, the app uses `http://localhost:3000` which only works on the same computer. Your phone can't access "localhost" because it refers to the phone itself.

### The Solution
Use your computer's local network IP address instead of localhost.

## Android-Specific Features

The app is optimized for Android with:
- ✅ Android Chrome theme color matching your app theme
- ✅ Add to Home Screen support (PWA)
- ✅ Hardware-accelerated animations
- ✅ Touch-optimized buttons and inputs
- ✅ No auto-zoom on input focus (16px font minimum)
- ✅ Disabled tap highlights for native app feel
- ✅ Smooth scrolling optimizations

## Setup Steps

### 1. Find Your Computer's IP Address

**On Mac:**
```bash
ipconfig getifaddr en0
# or
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```bash
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

**On Linux:**
```bash
hostname -I
# or
ip addr show
```

You'll get something like: `192.168.1.100` (your IP will be different)

### 2. Update Docker Compose

Edit `docker-compose.yml` and update the frontend environment:

```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
  container_name: track-the-thing-frontend
  ports:
    - "3000:3000"
  environment:
    - VITE_API_URL=http://YOUR_COMPUTER_IP:8000  # Change this!
  volumes:
    - ./frontend:/app
    - /app/node_modules
  depends_on:
    - backend
  restart: unless-stopped
```

**Example:**
If your computer's IP is `192.168.1.100`, use:
```yaml
- VITE_API_URL=http://192.168.1.100:8000
```

### 3. Restart Docker

```bash
docker-compose down
docker-compose up --build -d
```

### 4. Access from Your Android Phone

1. Make sure your Android device is on the **same WiFi network** as your computer
2. Open **Chrome** on your Android (recommended for best compatibility)
3. Navigate to: `http://YOUR_COMPUTER_IP:3000`
   - Example: `http://192.168.1.100:3000`
4. **(Optional) Add to Home Screen:**
   - Tap the Chrome menu (three dots)
   - Tap "Add to Home screen"
   - The app will open like a native Android app!

## Troubleshooting

### Can't connect from phone

**Check same network:**
- Phone and computer must be on the same WiFi
- Some networks isolate devices (guest networks, work networks)

**Check firewall:**
```bash
# Mac: Allow ports in System Settings → Network → Firewall
# Windows: Check Windows Firewall settings
# Linux: Check iptables/ufw rules
```

**Verify backend is accessible:**
```bash
# From your phone's browser, try:
http://YOUR_COMPUTER_IP:8000/health

# Should return: {"status": "healthy"}
```

### Data loads but images/uploads don't work

Images and file URLs are also served from the backend. Make sure:
1. Backend is accessible from phone (test `/health` endpoint)
2. CORS is enabled (already configured to allow all origins)
3. All uploaded files are accessed via the correct IP

### Android-specific issues

**Chrome showing "Can't reach this page":**
- Ensure Chrome has network permissions
- Try disabling "Data Saver" mode in Chrome settings
- Clear Chrome cache and cookies

**Text inputs zoom in automatically:**
- Fixed! All inputs use 16px minimum font size to prevent Android auto-zoom

**Buttons feel unresponsive:**
- The app uses touch-optimized 44px minimum touch targets
- Hardware acceleration is enabled for better performance

**App doesn't work after adding to home screen:**
- Make sure you're on the same WiFi network
- The IP address might have changed - check and update docker-compose.yml

### IP Address Changes

If your computer's IP address changes (common with DHCP):
1. Find the new IP address (step 1 above)
2. Update `docker-compose.yml`
3. Rebuild: `docker-compose up --build`

**Tip**: Set a static IP on your computer to avoid this.

## Production Deployment

For proper mobile access in production:
1. Deploy to a server with a public IP or domain name
2. Use HTTPS with SSL certificates
3. Update `VITE_API_URL` to your production API URL
4. Consider authentication for security

## Alternative: Local Development

For local development without Docker:

**Frontend `.env`:**
```env
VITE_API_URL=http://YOUR_COMPUTER_IP:8000
```

Then run:
```bash
cd frontend
npm run dev -- --host
```

This allows Vite to accept connections from other devices on your network.

## Quick Reference

```bash
# 1. Get IP
ipconfig getifaddr en0  # Mac

# 2. Update docker-compose.yml
VITE_API_URL=http://192.168.1.100:8000

# 3. Restart
docker-compose down && docker-compose up --build -d

# 4. Access from phone
http://192.168.1.100:3000
```

---

**Note**: The mobile-responsive UI is optimized for phones and tablets. The desktop version remains unchanged when accessed from larger screens.

