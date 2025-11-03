# Mobile Camera & Image Issues - Diagnosis & Solutions

## Issue Summary

### 1. **Images Not Showing**
Old images uploaded before the IP address fix still have `http://localhost:8000` URLs embedded in the HTML content stored in the database.

### 2. **Camera Not Working on Mobile**
Modern browsers (Chrome, Safari) require **HTTPS (secure context)** for camera/microphone access when accessing from IP addresses (not localhost).

---

## Why Camera Doesn't Work Over HTTP

### Browser Security Requirements:
- ✅ `http://localhost` - Camera works (localhost is considered secure)
- ✅ `https://your-ip` - Camera works (HTTPS is secure)
- ❌ `http://192.168.0.186` - Camera BLOCKED (HTTP over network is insecure)

**Error you'll see in mobile console:**
```
NotAllowedError: Permission denied
getUserMedia() requires HTTPS or localhost
```

---

## Solutions

### **Option 1: Fix Old Image URLs (Migration Script)**

Create a migration to update old localhost URLs to use relative paths:

```python
# backend/migrations/010_fix_localhost_urls.py
from sqlalchemy import text

def upgrade(conn):
    """Replace localhost URLs with relative paths"""
    # Update image URLs in content
    conn.execute(text("""
        UPDATE note_entries 
        SET content = REPLACE(
            REPLACE(content, 'http://localhost:8000/api/', '/api/'),
            'src="http://localhost:8000', 'src="'
        )
        WHERE content LIKE '%localhost:8000%'
    """))
    
def downgrade(conn):
    """No downgrade needed - relative paths work everywhere"""
    pass
```

### **Option 2: Enable HTTPS (Recommended for Camera)**

#### A. Self-Signed Certificate (Quick & Dirty)

```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout backend/data/key.pem \
  -out backend/data/cert.pem \
  -subj "/CN=192.168.0.186"
```

Update `docker-compose.yml`:
```yaml
services:
  backend:
    # ... existing config
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --ssl-keyfile=/app/data/key.pem --ssl-certfile=/app/data/cert.pem
    ports:
      - "8000:8000"

  frontend:
    # ... existing config
    environment:
      - VITE_API_URL=https://192.168.0.186:8000  # Note: HTTPS
```

**Downside**: Mobile browser will show "Not Secure" warning, you'll need to accept it.

#### B. mkcert (Better - Trusted Certificate)

```bash
# Install mkcert (Mac)
brew install mkcert

# Install local CA
mkcert -install

# Generate certificate for your IP
mkcert 192.168.0.186 localhost

# This creates:
# - 192.168.0.186+1.pem (certificate)
# - 192.168.0.186+1-key.pem (key)
```

Then update docker-compose.yml as above.

#### C. Disable Camera Features on Mobile (Easiest)

Update `RichTextEditor.tsx`:
```typescript
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const isSecureContext = window.isSecureContext;
const showCameraButtons = !isMobile || isSecureContext;

// Then conditionally render camera/video buttons
{showCameraButtons && (
  <>
    <ToolbarButton onClick={openCamera} title="Camera">
      <Camera className="h-4 w-4" />
    </ToolbarButton>
    <ToolbarButton onClick={openVideoRecorder} title="Video">
      <Video className="h-4 w-4" />
    </ToolbarButton>
  </>
)}
```

---

## Quick Fixes You Can Do Now

### **Fix 1: Update Old Image URLs (Run SQL)**

```bash
# Connect to your database
docker exec -it track-the-thing-backend sqlite3 /app/data/daily_notes.db

# Run this SQL
UPDATE note_entries 
SET content = REPLACE(content, 'http://localhost:8000/api/', '/api/')
WHERE content LIKE '%localhost:8000%';

# Exit
.exit
```

### **Fix 2: Hide Camera on Mobile (Quick)**

Let me update RichTextEditor.tsx to only show camera buttons on desktop or HTTPS.

---

## What Would You Like To Do?

1. **Run SQL migration** to fix old image URLs
2. **Set up HTTPS** with self-signed cert (camera will work, but with warning)
3. **Hide camera on mobile** when not secure (easiest)
4. **All of the above**

Let me know and I'll implement it!

