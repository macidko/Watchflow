
# Watchflow - İçerik Takip Uygulaması

Modern ve kullanıcı dostu bir Electron uygulaması ile film, dizi ve anime içeriklerini takip edin.

## 🚀 Özellikler

- **Çoklu Platform Desteği**: Film, Dizi ve Anime içerikleri
- **Gelişmiş Arama**: AniList, Kitsu, TMDB ve Jikan API entegrasyonları
- **Sürükle-Bırak**: Kolay içerik yönetimi
- **Kişisel Takvim**: Yayın takvimi ve hatırlatmalar
- **Döküman İçe/Çıkarma**: Verilerinizi yedekleyin ve geri yükleyin
- **Koyu/Açık Tema**: Göz yorucu olmayan arayüz
- **Responsive Tasarım**: Tüm ekran boyutlarında mükemmel görünüm

## 🛠️ Teknoloji Stack

- **Frontend**: React 19, Vite
- **Desktop**: Electron
- **State Management**: Zustand
- **Styling**: Tailwind CSS, CSS Variables
- **API**: AniList, Kitsu, TMDB, Jikan
- **Build**: Vite, Electron Builder

## 📦 Kurulum

### Ön Gereksinimler

- Node.js 18+
- npm veya yarn

### Development

```bash
# Bağımlılıkları yükle
npm install

# Development modunda çalıştır
npm run dev
```

### Production Build

```bash
# React uygulamasını build et
npm run build

# Electron uygulamasını başlat
npm start

# Veya tam executable oluştur
npm run electron-build
```

## 🌐 Web Demo (Netlify Deploy)

### Netlify'ya Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/macidko/Watchflow)

#### Manuel Deploy:

```bash
# 1. Build al
npm run build

# 2. Netlify CLI ile deploy (ilk defa)
npx netlify-cli deploy --prod

# 3. Veya GitHub'a push et, Netlify otomatik deploy eder
git push origin main
```

#### Netlify Yapılandırması:

- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Node Version**: `18`

**Not**: `.env.production` dosyasında API proxy path'leri ayarlıdır. CORS sorunlarını önlemek için Netlify proxy kullanılır.

**TMDB API Key**: Netlify Dashboard > Site Settings > Environment Variables'dan `VITE_TMDB_API_KEY` ekleyin.

### Netlify'da Çalışan Özellikler:

✅ Tüm sayfalarda navigasyon (SPA routing)  
✅ API proxy ile CORS bypass  
✅ LocalStorage ile veri persistance  
✅ Responsive tasarım  
✅ Takvim ve bildirimler  

### Netlify'da Çalışmayan Özellikler:

❌ Electron API'leri (window management, native notifications)  
❌ Dosya sistemi işlemleri (native import/export)  

---

## 📁 Proje Yapısı

```
src/
├── components/          # Yeniden kullanılabilir bileşenler
│   ├── Card.jsx        # İçerik kartı bileşeni
│   ├── Navbar.jsx      # Navigasyon çubuğu
│   └── ...
├── pages/              # Sayfa bileşenleri
│   ├── Home.jsx        # Ana sayfa
│   ├── Film.jsx        # Film sayfası
│   └── ...
├── contexts/           # React context'ler
├── hooks/              # Özel hook'lar
├── services/           # İş mantığı servisleri
├── config/             # Yapılandırma dosyaları
├── css/                # Stil dosyaları
└── api/                # API entegrasyonları
```

## 🔧 Yapılandırma

### API Anahtarları

API anahtarlarını environment variables olarak ayarlayın:

```bash
# .env dosyası
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_ANILIST_CLIENT_ID=your_anilist_client_id
```

### Tema Yapılandırması

`src/css/variables.css` dosyasından tema değişkenlerini özelleştirin.

## 🧪 Test

```bash
# Lint kontrolü
npm run lint

# Build testi
npm run build
```

## 📋 API Entegrasyonları

- **AniList**: Anime verileri
- **Kitsu**: Anime ve manga verileri
- **TMDB**: Film ve dizi verileri
- **Jikan**: MyAnimeList API wrapper

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👥 Geliştirici

**Macid Koçak** - [GitHub](https://github.com/macidko)

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
