# 🔐 Firestore Security Rules - Setup Guide

## Adım 1: Firebase CLI Kurulumu

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
```

## Adım 2: Firestore Rules Dosyasını Yerleştir

- **Dosya:** `firestore.rules` (repo'da bulunuyor)
- **Lokasyon:** Proje root'u

## Adım 3: Rules Deploy Et

```bash
# Test et
firebase emulators:start  # (Opsiyonel - lokal test)

# Production'a deploy et
firebase deploy --only firestore:rules
```

## Adım 4: Doğrula

Firebase Console:
1. Firestore Database → Rules tab
2. Rules yüklü olduğunu ve herhangi hata olmadığını kontrol et

---

## 🚨 ÖNEMLİ: Hali hazırda Açık Sistem

**CURRENT STATUS:** Tüm veriler **PUBLIC READ/WRITE**

```firestore
# Şu anki rules (UNSAFE - DEĞİŞTİR!)
match /{document=**} {
  allow read, write: if true;
}
```

Yeni rules deploy etmeden **önce**:
- [ ] Tüm user email'leri doğrula
- [ ] Test kullanıcılarla test et
- [ ] Backup al

---

## Cloud Functions Setup (updatePlayerStats)

```bash
npm install -g firebase-tools
cd functions
npm install firebase-admin firebase-functions
```

**functions/src/index.ts:**
```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const updatePlayerStatsOnGameEnd = functions.firestore
  .document('rooms/{roomId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Sadece winner set edildiyse
    if (!before.winner && after.winner) {
      const { hostEmail, guestEmail, winner } = after;
      
      const hostRef = admin.firestore().doc(`users/${hostEmail}`);
      const guestRef = admin.firestore().doc(`users/${guestEmail}`);
      
      const batch = admin.firestore().batch();
      
      if (winner === 'red') {
        batch.update(hostRef, {
          'stats.wins': admin.firestore.FieldValue.increment(1),
          'stats.points': admin.firestore.FieldValue.increment(50),
        });
        batch.update(guestRef, {
          'stats.losses': admin.firestore.FieldValue.increment(1),
          'stats.points': admin.firestore.FieldValue.increment(-10),
        });
      } else if (winner === 'blue') {
        batch.update(hostRef, {
          'stats.losses': admin.firestore.FieldValue.increment(1),
          'stats.points': admin.firestore.FieldValue.increment(-10),
        });
        batch.update(guestRef, {
          'stats.wins': admin.firestore.FieldValue.increment(1),
          'stats.points': admin.firestore.FieldValue.increment(50),
        });
      } else if (winner === 'draw') {
        batch.update(hostRef, {
          'stats.draws': admin.firestore.FieldValue.increment(1),
        });
        batch.update(guestRef, {
          'stats.draws': admin.firestore.FieldValue.increment(1),
        });
      }
      
      await batch.commit();
    }
  });
```

Deploy:
```bash
firebase deploy --only functions
```

---

## 📋 Checklist

- [ ] `firestore.rules` oluşturuldu
- [ ] Lokal emülatörde test edildi
- [ ] Production'a deploy edildi
- [ ] Cloud Functions setup
- [ ] Frontend `updatePlayerStats` calls kaldırıldı
- [ ] User tests yapıldı
- [ ] Monitoring etkinleştirildi

---

## Faydalı Linkler

- Firebase Rules Documentation: https://firebase.google.com/docs/firestore/security/start
- Cloud Functions: https://firebase.google.com/docs/functions
- Firebase CLI: https://firebase.google.com/docs/cli
