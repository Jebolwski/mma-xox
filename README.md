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

## 🔧 Teknik Detaylar

## 🎯 Gelecek Planları

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
