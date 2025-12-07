# MMA XOX - Online Game

[![CI/CD Pipeline](https://github.com/Jebolwski/mma-xox/actions/workflows/ci.yml/badge.svg)](https://github.com/Jebolwski/mma-xox/actions/workflows/ci.yml)

MMA temalı XOX (Tic-Tac-Toe) oyunu. Firebase ile gerçek zamanlı çok oyunculu oyun deneyimi.

## 🎮 Özellikler

- **Gerçek Zamanlı Oyun**: Firebase Firestore ile canlı oyun deneyimi
- **MMA Teması**: Gerçek MMA dövüşçüleri ile oynayın
- **Filtre Sistemi**: Zorluk seviyelerine göre dövüşçü filtreleme
- **Zamanlayıcı**: Opsiyonel zaman sınırı
- **Tema Desteği**: Açık/koyu tema seçenekleri
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu

## 💰 Gelir Modeli

Bu proje aşağıdaki gelir kaynakları ile desteklenmektedir:

### 1. Google AdSense Reklamları

- **Ana Sayfa Banner**: Üst kısımda reklam banner'ı
- **Oyun Sonu Reklamları**: Oyun bittiğinde gösterilen reklamlar
- **Akıllı Reklam Yönetimi**: Kullanıcı deneyimini bozmayan reklam yerleşimi

### 2. Premium Üyelik Sistemi

- **Reklamsız Deneyim**: Premium üyeler için reklam yok
- **Özel Temalar**: Premium kullanıcılara özel tema seçenekleri
- **Gelişmiş İstatistikler**: Detaylı oyun istatistikleri
- **Öncelikli Destek**: Premium kullanıcı desteği

### 3. Reklam Ayarları

- **Kullanıcı Kontrolü**: Reklamları açma/kapama seçeneği
- **Sıklık Ayarı**: Reklam gösterim sıklığını ayarlama
- **Şeffaf Yönetim**: Kullanıcılar reklam ayarlarını kontrol edebilir

## 🚀 Kurulum

1. **Bağımlılıkları yükleyin:**

```bash
npm install
```

2. **Firebase yapılandırması:**

- `src/firebase.ts` dosyasında Firebase yapılandırmanızı güncelleyin

3. **Google AdSense:**

- `public/index.html` dosyasında `YOUR_PUBLISHER_ID` yerine gerçek AdSense Publisher ID'nizi ekleyin
- `src/components/AdBanner.tsx` dosyasında `YOUR_PUBLISHER_ID` yerine gerçek ID'nizi ekleyin

4. **Geliştirme sunucusunu başlatın:**

```bash
npm run dev
```

## 📊 Gelir Optimizasyonu

### Reklam Yerleşimi Stratejileri

- **Ana Sayfa**: Giriş deneyimini bozmayan üst banner
- **Oyun Sonu**: Doğal reklam yerleşimi ile kullanıcı deneyimini koruma
- **Akıllı Zamanlama**: Minimum 1 dakika aralıklarla reklam gösterimi

### Premium Dönüşüm Stratejileri

- **Freemium Model**: Temel özellikler ücretsiz, premium özellikler ücretli
- **Değer Önerisi**: Reklamsız deneyim + ek özellikler
- **Esnek Fiyatlandırma**: Aylık $4.99 premium üyelik

## 🔧 Teknik Detaylar

## 🎯 Gelecek Planları

- [ ] **Stripe Entegrasyonu**: Güvenli ödeme sistemi
- [ ] **Analytics**: Detaylı kullanıcı analizi
- [ ] **A/B Testing**: Reklam yerleşimi optimizasyonu
- [ ] **Push Notifications**: Kullanıcı etkileşimi artırma
- [ ] **Sosyal Medya**: Viral paylaşım özellikleri

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit yapın (`git commit -m 'Add some AmazingFeature'`)
4. Push yapın (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📞 İletişim

Proje hakkında sorularınız için: [mertgkmeen@gmail.com]

---

**Not**: Bu proje eğitim amaçlıdır. Gerçek gelir elde etmek için Google AdSense onayı ve premium ödeme sistemi entegrasyonu gereklidir.
