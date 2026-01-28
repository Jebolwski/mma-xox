# EmailJS Setup Guide - Contact Form

Bu rehber, MMA XOX Contact formunda EmailJS kullanarak email göndermeyi ayarlamanız için adımları içerir.

## 📧 EmailJS Nedir?

EmailJS, frontend'den doğrudan email göndermeyi sağlayan bir servistir. Backend'e ihtiyaç yoktur!

## 🚀 Setup Adımları

### 1. EmailJS Hesabı Oluştur

1. [EmailJS Official Website](https://www.emailjs.com/) adresine git
2. **Sign Up** butonuna tıkla (Google, GitHub veya email ile kaydol)
3. Dashboard'a giriş yap

### 2. Email Service Bağla

1. Sol menüde **Email Services** seçeneğine tıkla
2. **Add Service** butonuna tıkla
3. Gmail (veya başka email sağlayıcı) seçeneğini seç
4. Gmail seçersen:
   - Gmail hesabında 2-Step Verification'ı aç
   - "App passwords" oluştur
   - EmailJS'ye bağla

### 3. Email Template Oluştur

1. **Email Templates** seçeneğine tıkla
2. **Create Template** butonuna tıkla
3. Aşağıdaki template'i kullan:

**Template Name:** `contact_form`

**Subject:**

```
Contact Us: {{subject}}
```

**Email Content:**

```
Name: {{from_name}}
Email: {{from_email}}
Subject: {{subject}}

Message:
{{message}}
```

4. **Save** butonuna tıkla

### 4. Bilgilerinizi Al

1. **Account** seçeneğine tıkla
2. **API Keys** bölümünde **Public Key** kopyala
3. **Email Services** bölümünde **Service ID** kopyala
4. **Email Templates** bölümünde **Template ID** kopyala (contact_form)

### 5. Contact.tsx'i Güncelle

`src/pages/Contact.tsx` dosyasını aç ve şu yerleri güncelle:

**Satır ~26 (useEffect'te):**

```tsx
emailjs.init("YOUR_PUBLIC_KEY_HERE"); // Adım 4'te aldığın Public Key
```

**Satır ~58 (handleSubmit'te):**

```tsx
await emailjs.send(
  "YOUR_SERVICE_ID_HERE", // Adım 4'te aldığın Service ID
  "contact_form", // Template name
  {
    from_name: formData.name,
    from_email: formData.email,
    subject: formData.subject || "Contact Form Submission",
    message: formData.message,
    to_email: "mertgkmeen@gmail.com",
  },
);
```

### 6. Paketleri Install Et

Terminal'de:

```bash
npm install
```

## ✅ Test Etme

1. Siteyi çalıştır: `npm run dev`
2. `/contact` sayfasına git
3. Formu doldur ve gönder
4. Email'ını kontrol et

## 🔒 Güvenlik Notları

- **Public Key** halka açık bir bilgidir (sorun değil)
- **Service ID** ve **Template ID** de güvenlidir
- Hassas bilgileri (passwords vs) buraya koyma

## 🆘 Sorun Giderme

### Email gönderilmiyor?

- Public Key, Service ID ve Template ID'yi kontrol et
- Email Service'in aktif olup olmadığını kontrol et
- Tarayıcı konsolunda hata mesajını oku

### "Invalid Service ID"?

- EmailJS dashboard'da Service ID'yi kopyala
- Kopyalarken boşluk veya fazladan karakter eklemedin mi kontrol et

### "Template not found"?

- Template ID'si "contact_form" olduğundan emin ol
- EmailJS'de template oluşturduğunu kontrol et

## 📚 Ek Kaynaklar

- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [EmailJS React Integration](https://www.emailjs.com/docs/sdk/installation/)
