# Fix Microphone Access Issue

## Error: "Failed to access microphone. Check browser permissions."

This means your browser has either:
1. Blocked microphone access for this site
2. Never been asked for permission (glitch)
3. Requires HTTPS for mic access (mobile only)

---

## **Quick Fix (Most Common)**

### **Desktop (Chrome/Edge):**
1. Look at the **address bar** - do you see a 🎤 with an X through it?
2. Click the **🔒 lock icon** (or ⓘ) next to the URL
3. Find **"Microphone"** in the dropdown
4. Change it to **"Allow"**
5. **Refresh the page** (F5 or Cmd+R)

### **Desktop (Safari):**
1. Click **Safari** in menu bar → **Settings for This Website**
2. Find **"Microphone"**
3. Change to **"Allow"**
4. Refresh the page

### **Desktop (Firefox):**
1. Click the **🔒 lock icon** in the address bar
2. Click arrow next to "Connection Secure"
3. Click **"More Information"**
4. Go to **"Permissions"** tab
5. Find **"Use the Microphone"**
6. Uncheck "Use default" and check **"Allow"**
7. Refresh

---

## **Mobile Issues**

### **Android Chrome over HTTP:**
If you're accessing via `http://192.168.0.186:3000` (not localhost):

⚠️ **Chrome may block microphone on HTTP mobile connections**

**Quick Test:**
1. Open Chrome on your Android
2. Go to: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
3. Add: `http://192.168.0.186:3000`
4. Relaunch Chrome
5. Try again

**Better Solution:** Use desktop for voice features OR set up HTTPS (see `MOBILE_CAMERA_FIX.md`)

### **iOS Safari:**
1. Go to iPhone **Settings** → **Safari** → **Camera & Microphone**
2. Ensure it's set to **"Ask"** or **"Allow"**
3. Close Safari completely (swipe up from app switcher)
4. Reopen and try again

---

## **Clear ALL Site Data (Nuclear Option)**

If nothing else works:

### **Chrome:**
1. Go to `chrome://settings/content/siteDetails?site=http://localhost:3000` (or your IP)
2. Click **"Clear data"** button
3. Refresh the page
4. Allow microphone when prompted

### **Safari:**
1. Safari → Settings → Privacy → Manage Website Data
2. Search for your site
3. Remove it
4. Refresh and try again

---

## **Test in Browser Console**

Open Developer Console (F12) and run:

```javascript
// Test microphone directly
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('✅ Microphone works!', stream);
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => {
    console.error('❌ Microphone blocked:', err.name, err.message);
  });
```

**Possible errors:**
- `NotAllowedError` = You blocked it (reset permissions above)
- `NotFoundError` = No microphone found
- `NotSupportedError` = HTTPS required (mobile)

---

## **Check Your Microphone is Working**

### **Mac:**
1. System Settings → Sound → Input
2. Speak and watch the input level bars
3. Should move when you talk

### **Windows:**
1. Settings → System → Sound → Input
2. Test your microphone
3. Should show activity

### **Chrome:**
Visit: `chrome://settings/content/microphone`
- Is your mic detected?
- Is the site in the "Block" list? Remove it!

---

## **Still Not Working?**

### **1. Try a Different Browser**
- If Chrome doesn't work, try Firefox or Edge
- This helps identify if it's browser-specific

### **2. Check System Permissions (Mac)**
1. System Settings → Privacy & Security → Microphone
2. Make sure **Chrome** (or your browser) is checked
3. Might need to restart browser after enabling

### **3. Check System Permissions (Windows)**
1. Settings → Privacy → Microphone
2. Enable "Let apps access your microphone"
3. Restart browser

---

## **Expected Behavior After Fix**

1. Click mic button 🎤
2. Browser shows popup: **"Allow localhost to use your Microphone?"**
3. Click **"Allow"**
4. Mic button turns red and pulses
5. Start talking - text appears in editor
6. Click mic again to stop

---

## **For Mobile Users**

If you're on mobile and keep having issues:

**Reality Check:**
- 📱 Mobile microphone access over HTTP is **unreliable**
- 🖥️ Desktop microphone access works great
- 🔒 Mobile HTTPS would fix it (requires setup)

**Recommendation:** Use desktop for voice features, mobile for everything else!

---

**After fixing permissions, close the error message and click the mic button again!**

