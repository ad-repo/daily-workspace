# HTTPS Setup Complete! 🔒

Your application is now running with HTTPS, which enables camera and video access on mobile!

---

## **✅ What Changed:**

- Backend: `https://192.168.0.186:8000` (was http)
- Frontend: `https://192.168.0.186:3000` (was http)
- SSL certificates generated and loaded

---

## **📱 How to Access on Mobile:**

### **Step 1: Access the App**
On your Android phone, open Chrome and go to:
```
https://192.168.0.186:3000
```
*Note: **https** not http!*

### **Step 2: Accept Security Warning**

You'll see a warning: **"Your connection is not private"** or **"NET::ERR_CERT_AUTHORITY_INVALID"**

This is **normal** because it's a self-signed certificate.

**To proceed:**

#### **Chrome (Android):**
1. Tap **"Advanced"**
2. Tap **"Proceed to 192.168.0.186 (unsafe)"**
3. Done! You only need to do this once.

#### **Safari (iOS):**
1. Tap **"Show Details"**
2. Tap **"visit this website"**
3. Confirm **"Visit Website"**
4. Done!

### **Step 3: Test Camera Access**

1. Open a note card to edit
2. You should now see **📷 Camera** and **🎥 Video** buttons!
3. Click camera button
4. Browser will ask: **"Allow camera access?"**
5. Click **"Allow"**
6. Take a photo! 📸

---

## **🖥️ Desktop Access:**

On desktop, use:
```
https://localhost:3000
```
or
```
https://192.168.0.186:3000
```

You'll get the same security warning - just accept it once.

---

## **🎉 What Now Works:**

| Feature | Before (HTTP) | After (HTTPS) |
|---------|---------------|---------------|
| 📷 Camera on Mobile | ❌ Blocked | ✅ Works |
| 🎥 Video on Mobile | ❌ Blocked | ✅ Works |
| 🎤 Mic on Mobile | ⚠️ Unreliable | ✅ Works |
| 🖼️ Images | ✅ Works | ✅ Works |
| All other features | ✅ Works | ✅ Works |

---

## **⚠️ About the "Not Secure" Warning:**

The certificate is **self-signed**, which means:
- ✅ Connection is **encrypted** (secure)
- ✅ Data is **protected**
- ❌ Certificate is **not verified** by a Certificate Authority

This is **perfectly fine** for local network use!

**Why the warning?**
- Browsers show it because they can't verify who issued the certificate
- For a public website, you'd use Let's Encrypt or similar
- For local network use, self-signed is standard

---

## **🔄 Certificate Renewal:**

Certificates are valid for **365 days** (until Nov 2, 2025).

To renew when expired:
```bash
cd backend/data
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout key.pem -out cert.pem \
  -subj "/CN=192.168.0.186"
docker-compose restart
```

---

## **🆘 Troubleshooting:**

### **"Page won't load on mobile"**
- Make sure you're using **https://** (not http://)
- Make sure you accepted the security warning
- Try clearing browser cache

### **"Still no camera/video buttons"**
- Hard refresh the page (hold refresh button)
- Check console log for debug info
- Make sure you're on `https://192.168.0.186:3000` (not http or localhost)

### **"Certificate error on desktop"**
- Normal! Click "Advanced" → "Proceed anyway"
- This is safe for localhost/local network

### **"Camera permission denied"**
- Click the 🔒 lock icon in address bar
- Change Camera to "Allow"
- Refresh page

---

## **🎊 Try It Now!**

1. **On mobile:** Go to `https://192.168.0.186:3000`
2. **Accept warning** (one time)
3. **Open a note**
4. **See camera/video buttons!**
5. **Click and allow** when prompted
6. **Take photos and videos!** 📸🎥

---

## **Optional: Remove HTTPS (Go Back to HTTP)**

If you want to revert:

1. Edit `docker-compose.yml`:
   - Backend command: Change back to `./start.sh`
   - Frontend: Change `https://` to `http://`

2. Restart:
```bash
docker-compose down
docker-compose up -d
```

Camera/video won't work on mobile, but everything else will.

---

**Enjoy your fully-functional mobile app with camera access!** 🎉📱

