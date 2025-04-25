# Watchflow 🎬

A tracking application for movies, TV shows, and anime.

## Features

Watchflow lets you:
- Search for movies, TV shows, and anime
- Create and manage watchlists
- Track episodes and progress
- Visualize your watching progress

## Getting Started

```bash
# Installation
npm install

# Run the application
npm start
```

## Build

```bash
# Windows executable
npm run build:win
```

## API Keys

On first launch, you'll need to enter API keys for:
- TMDB API: [themoviedb.org](https://www.themoviedb.org/settings/api)

## Project Structure

```
src/
  ├── main/     # Main process
  ├── renderer/ # UI components
  ├── preload/  # Preload bridge
  ├── api/      # Data services
  └── data/     # Local storage
```

## Technologies

- Electron
- Node.js
- TMDB & Jikan APIs

## License

MIT 