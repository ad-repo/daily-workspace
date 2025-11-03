# Quick Fix: "Can't Provide Secure Connection" Error

## The Problem

Your browser doesn't trust the self-signed SSL certificate yet!

---

## **The Solution (2 Steps):**

### **Step 1: Accept Backend Certificate First**

Before accessing the app, you need to tell your browser to trust the backend certificate:

1. **On your mobile**, open Chrome
2. Go to: **`https://192.168.0.186:8000/health`**
3. You'll see: **"Your connection is not private"**
4. Tap **"Advanced"**
5. Tap **"Proceed to 192.168.0.186 (unsafe)"**
6. You should see: `{"status":"healthy"}`

✅ **Done!** Browser now trusts the backend.

### **Step 2: Access the App**

Now go to the app:
1. Go to: **`http://192.168.0.186:3000`** (yes, HTTP not HTTPS!)
2. App should load normally
3. Camera/video buttons should appear!

---

## **Why This Works:**

- Frontend serves on **HTTP** (no SSL needed)
- Backend uses **HTTPS** (required for camera access)
- Browser needs to trust the backend certificate first
- Once trusted, HTTP frontend can talk to HTTPS backend

---

## **On Desktop:**

Same process:

1. Visit: `https://localhost:8000/health` or `https://192.168.0.186:8000/health`
2. Accept the warning
3. Then visit: `http://localhost:3000` or `http://192.168.0.186:3000`

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

