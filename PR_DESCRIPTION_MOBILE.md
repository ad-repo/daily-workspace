# Mobile Support & Day Section Background Match

## Overview
This PR adds comprehensive mobile support for Android devices while maintaining full desktop functionality. It also matches the day section background color to card backgrounds for visual consistency.

## 🎯 Key Features

### Mobile Responsive Design
- Increased editor height for better mobile experience (450px desktop, 300px mobile)
- Toolbar wraps to multiple rows instead of horizontal scroll
- Responsive padding, fonts, and spacing throughout
- Hidden wide mode/sidebar toggles on mobile (not needed)
- Android-specific optimizations (PWA support, touch targets, performance)

### Mobile Data Access
- Fixed API URL configuration for network access (IP instead of localhost)
- Images and videos now load correctly on mobile devices
- Migration to fix old localhost URLs in existing content
- Runtime URL conversion for relative paths

### Camera/Video/Mic Features
- Camera/video buttons intelligently hidden on mobile HTTP (browser security requirement)
- Microphone works on all platforms with proper error handling
- Desktop: Full camera/video/mic support
- Mobile HTTP: All features except camera/video
- Optional HTTPS setup documented for full mobile camera support

### Day Section Styling
- Day section background now matches card background color
- Improved visual consistency across the interface

## 📱 Mobile Access

### Setup Instructions
See `MOBILE_ACCESS.md` for complete setup guide:
1. Find your computer's IP address
2. Update `docker-compose.yml` with IP address
3. Restart Docker
4. Access from mobile: `http://YOUR-IP:3000`

### Current Limitations on Mobile HTTP
- Camera button hidden (requires HTTPS - browser security)
- Video button hidden (requires HTTPS - browser security)
- All other features work perfectly!

### Optional: Enable Camera on Mobile
See `HTTPS_SETUP.md` for instructions to set up self-signed SSL certificates.
- Enables camera/video on mobile
- Requires accepting certificate warning once

## 🔧 Technical Changes

### Frontend
- `RichTextEditor.tsx`: Mobile context detection, dynamic button visibility, improved media handling
- `Navigation.tsx`: Responsive styles, hidden toggles on mobile
- `DailyView.tsx`: Responsive padding and font sizes, background color match
- `index.css`: Mobile-specific styles, Android optimizations, responsive breakpoints
- `index.html`: Android PWA meta tags
- `manifest.json`: PWA configuration
- `vite.config.ts`: Configurable HTTPS support

### Backend
- `docker-compose.yml`: Configurable API URL for network access
- `migrations/010_fix_localhost_urls.py`: Fix existing localhost URLs in content
- `fix_localhost_urls.py`: Helper script for manual URL fixes
- Optional SSL certificate support

### Documentation
- `MOBILE_ACCESS.md`: Complete mobile setup guide
- `MOBILE_CAMERA_FIX.md`: Camera/mic requirements explained
- `RESET_BROWSER_PERMISSIONS.md`: Permission troubleshooting
- `FIX_MIC_ACCESS.md`: Microphone-specific issues
- `HTTPS_SETUP.md`: Optional HTTPS configuration
- `QUICK_FIX_SSL.md`: SSL certificate acceptance guide
- `TEST_MIC.html`: Standalone diagnostic tool

## 🧪 Testing Checklist

- [x] Desktop: All features work (camera, video, mic, images, text)
- [x] Mobile: Data loads correctly
- [x] Mobile: Images and videos display
- [x] Mobile: Text editing and formatting work
- [x] Mobile: File uploads work
- [x] Mobile: Navigation responsive
- [x] Mobile: Camera/video buttons appropriately hidden
- [x] Desktop: No regressions
- [x] Migration runs successfully on existing databases
- [x] Day section background matches card background

## 🚀 Deployment Notes

### Required
1. Update `VITE_API_URL` in `docker-compose.yml` to use your server's IP address
2. Run `docker-compose down && docker-compose up -d` to apply changes

### Optional (for mobile camera support)
1. Generate SSL certificates: `openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout backend/data/key.pem -out backend/data/cert.pem -subj "/CN=YOUR-IP"`
2. Update docker-compose.yml to use SSL (see HTTPS_SETUP.md)
3. Restart containers

## 📊 Stats
- **Commits:** 15
- **Files Changed:** 30+
- **New Documentation:** 7 guides
- **Database Migrations:** 1 (backward compatible)

## ⚠️ Breaking Changes
None! All changes are backward compatible. Existing installations work without modification.

## 🎉 Benefits
- Full mobile support for viewing and editing
- Better user experience across all devices
- Optional camera support on mobile with HTTPS
- Comprehensive documentation
- No desktop functionality compromised

## 🔗 Related Issues
- Fixes mobile data access issues
- Resolves image/video loading on network devices
- Implements responsive design improvements
- Adds camera/video feature parity (optional HTTPS)

