# Watchflow

A comprehensive watchlist management app for movies, TV shows, and anime.

## About the Project

Watchflow is a modern desktop application that helps you track, organize, and manage your movie, TV show, and anime watching habits. With its user-friendly interface and customizable categories, it gives you full control over your viewing experience.

## Key Features

* **Comprehensive Content Search:** Search for movies, TV shows, and anime
* **Personalized Watchlist:** Categorize content as watched, watching, or want to watch
* **Custom Category System:** Organize content your way using customizable sliders
* **Season & Episode Tracking:** Detailed progress tracking for series and anime
* **Rating System:** Rate watched content on a 1–10 scale
* **Bulk Content Import:** Quickly add items from text-based lists
* **Drag-and-Drop Category Sorting:** Easily rearrange categories
* **Notification System:** Real-time feedback for user actions
* **Multi-language Support:** Supports Turkish and English
* **Theme System:** Choose from 7 different themes
* **Data Backup:** Safely back up and restore your watchlist

## 📦 Download

➡️ [Download the latest release (.exe)](https://github.com/macidko/Watchflow/releases/latest)

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the application:

```bash
npm start
```

For development mode:

```bash
npm run dev
```

## Build

To package the app for different platforms:

```bash
npm run build:win   # Windows
npm run build:mac   # macOS
npm run build:linux # Linux
```

## API Requirements

On first launch, you will be prompted to enter a TMDB API key. This is required to fetch movie and TV show data. You can obtain a key from [themoviedb.org](https://www.themoviedb.org/settings/api).

## Project Structure

```
src/
  main/       # Main process and services
  renderer/   # User interface and CSS files
  preload/    # Preload bridge
  api/        # API services
  data/       # Local storage
  lang/       # Language files
  i18n/       # Translation system
```

## System Requirements

* Node.js 14 or later
* npm 6 or later
* Internet connection (for API requests)
* Windows 7/8/10/11, macOS 10.13+, Linux (Debian-based)

## License

MIT