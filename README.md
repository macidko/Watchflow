# Watchflow

A desktop application for tracking movies, TV shows, and anime.

## Overview

Watchflow helps you organize and monitor your watchlist for movies, series, and anime. You can create custom categories, track your progress, and manage your content in a simple and efficient way.

## Features

- Search for movies, TV shows, and anime
- Create and manage your personal watchlist
- Add custom categories (sliders) for better organization
- Track seasons and episodes for series and anime
- Rate your content
- Bulk add items to your list
- Drag-and-drop category sorting
- Notification system for user feedback
- 
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

## API Key Requirement

On first launch, you will be prompted to enter your TMDB API key. This is required to fetch movie and TV show data. You can obtain a key from [themoviedb.org](https://www.themoviedb.org/settings/api).

## Project Structure

```
src/
  main/       # Main process and services
  renderer/   # UI and CSS files
  preload/    # Preload bridge
  api/        # API services
  data/       # Local storage
```

## Requirements

- Node.js 14 or higher
- npm 6 or higher
- Internet connection (for API requests)

## License

MIT 
