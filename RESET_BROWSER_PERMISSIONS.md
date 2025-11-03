# Reset Browser Permissions for Mic & Camera

If mic or camera buttons don't prompt for permissions despite being set to "ask", the browser might have cached a previous denial. Here's how to reset:

---

## **Chrome (Desktop & Android)**

### Desktop Chrome:
1. Click the **🔒 lock icon** (or ⓘ info icon) in the address bar next to the URL
2. Find **Camera** and **Microphone** in the list
3. Change both to **"Ask (default)"** or **"Allow"**
4. **Refresh the page** (F5 or Cmd+R)

### Android Chrome:
1. Tap the **ⓘ info icon** or **🔒 lock icon** next to the URL
2. Tap **"Permissions"**
3. Find **Camera** and **Microphone**
4. Set to **"Ask"** or **"Allow"**
5. Refresh the page

### Alternative (Desktop Chrome):
1. Go to `chrome://settings/content/camera`
2. Remove your site from the "Block" list if it's there
3. Go to `chrome://settings/content/microphone`
4. Remove your site from the "Block" list
5. Refresh your app

---

## **Safari (Mac & iOS)**

### Mac Safari:
1. Click **Safari** in the menu bar → **Settings for This Website**
2. Find **Camera** and **Microphone**
3. Change to **"Ask"** or **"Allow"**
4. Refresh the page

### iOS Safari:
1. Go to iPhone **Settings** → **Safari**
2. Scroll to **Settings for Websites**
3. Tap **Camera** and **Microphone**
4. Ensure they're set to **"Ask"**
5. Refresh the page in Safari

---

## **Firefox (Desktop)**

1. Click the **🔒 lock icon** in the address bar
2. Click the **arrow** next to "Connection Secure"
3. Click **"More Information"**
4. Go to the **"Permissions"** tab
5. Find **"Use the Camera"** and **"Use the Microphone"**
6. Uncheck **"Use default"** if checked
7. Check **"Allow"** for both
8. Close and refresh the page

---

## **Edge (Desktop)**

1. Click the **🔒 lock icon** in the address bar
2. Click **"Permissions for this site"**
3. Find **Camera** and **Microphone**
4. Change to **"Ask"** or **"Allow"**
5. Refresh the page

---

## **Still Not Working?**

### **Check if you're on HTTP (not HTTPS):**

If accessing from mobile over the network (e.g., `http://192.168.0.186:3000`):

- ❌ **Camera/Video will NOT work** (requires HTTPS on mobile)
- ✅ **Mic may work** (depends on browser - Chrome usually works, Safari might not)

**Why:** Browsers block camera/microphone access over insecure HTTP connections (except on localhost).

**Solutions:**
1. **Use desktop** for camera/video features (works on `http://localhost`)
2. **Set up HTTPS** (see `MOBILE_CAMERA_FIX.md` for instructions)
3. **Accept that camera/video won't work on mobile HTTP** (this is normal browser security)

---

## **Verify Permissions in Browser Console**

Open your browser's developer console (F12) and run:

```javascript
// Check if APIs are available
console.log('Speech Recognition:', !!(window.SpeechRecognition || window.webkitSpeechRecognition));
console.log('getUserMedia:', !!navigator.mediaDevices?.getUserMedia);
console.log('Secure Context:', window.isSecureContext);
console.log('Location:', window.location.href);

// Try to request permissions
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(() => console.log('✅ Microphone access granted'))
  .catch(err => console.error('❌ Microphone error:', err.message));

navigator.mediaDevices.getUserMedia({ video: true })
  .then(() => console.log('✅ Camera access granted'))
  .catch(err => console.error('❌ Camera error:', err.message));
```

This will show you exactly what's available and what's being blocked.

---

## **Quick Test URLs**

- ✅ **Desktop:** `http://localhost:3000` - Everything should work
- ⚠️ **Mobile:** `http://192.168.0.186:3000` - Images/text work, camera/video don't (HTTP)
- ✅ **Mobile HTTPS:** `https://192.168.0.186:3000` - Everything works (need to set up HTTPS)

---

## **Expected Behavior**

| Feature | Desktop HTTP | Mobile HTTP | Mobile HTTPS |
|---------|-------------|-------------|--------------|
| Voice Dictation (Mic) | ✅ | ⚠️ (usually works) | ✅ |
| Camera | ✅ | ❌ Hidden* | ✅ |
| Video | ✅ | ❌ Hidden* | ✅ |
| Image Upload | ✅ | ✅ | ✅ |
| All other features | ✅ | ✅ | ✅ |

\* Buttons are automatically hidden on mobile HTTP to avoid confusion

---

**Still having issues?** Check the browser console (F12) for error messages!

