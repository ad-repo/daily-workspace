# Quick Fix: "Can't Provide Secure Connection" Error

## The Problem

Your browser doesn't trust the self-signed SSL certificate yet!

---

## **The Solution (1 Step):**

### **Accept the Certificate and Access the App**

1. **On your mobile**, open Chrome
2. Go to: **`https://192.168.0.186:3000`** (note: HTTPS!)
3. You'll see: **"Your connection is not private"**
4. Tap **"Advanced"**
5. Tap **"Proceed to 192.168.0.186 (unsafe)"**
6. **App loads!** ✅
7. Camera/video buttons should appear!

That's it! Just one URL, one warning to accept.

---

## **Why This Works:**

- Both frontend and backend now use **HTTPS**
- They share the same SSL certificate
- Browser needs to trust the certificate once
- Once trusted, all features work including camera/video!

---

## **On Desktop:**

Same process:

1. Visit: `https://localhost:3000` or `https://192.168.0.186:3000`
2. Accept the warning once
3. App loads! All features work!

---

## **Still Not Working?**

Try this in order:

1. **Clear browser cache** (hold refresh button → "Hard Refresh")
2. **Try incognito/private mode**
3. **Restart browser completely**
4. **Try a different browser** (Firefox, Safari, etc.)

---

## **Alternative: Skip HTTPS (Go Back)**

If you want to revert to all-HTTP (no camera on mobile):

```bash
# Edit docker-compose.yml:
# Backend: command: ./start.sh  (remove SSL flags)
# Frontend: VITE_API_URL=http://192.168.0.186:8000

docker-compose down
docker-compose up -d
```

Then access everything over HTTP (camera won't work on mobile).

---

**Try accessing the backend health URL first, then the frontend!**

