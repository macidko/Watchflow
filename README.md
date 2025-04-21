# Watchflow 🎬

Film, dizi ve anime takip uygulaması.

## Ne İşe Yarar?

Watchflow, şunları yapmanızı sağlar:
- Film/dizi/anime araması
- İzleme listesi oluşturma
- Bölüm takibi yapma
- İlerleme durumunu görme

## Başlangıç

```bash
# Kurulum
npm install

# Çalıştırma
npm start
```

## Derleme

```bash
# Windows exe
npm run build:win
```

## API Anahtarları

İlk açılışta şu API'ler için anahtar girmeniz gerekiyor:
- TMDB API: [themoviedb.org](https://www.themoviedb.org/settings/api)  
- OMDB API: [omdbapi.com](https://www.omdbapi.com/apikey.aspx) -kaldırılacak

## Yapı

```
src/
  ├── main/     # Ana süreç
  ├── renderer/ # Arayüz
  ├── preload/  # Köprü
  ├── api/      # Veri
  └── data/     # Depolama
```

## Teknolojiler

- Electron
- Node.js
- TMDB & Jikan API

## Lisans

MIT 