
# Electron + React (Vite)

This project is a minimal Electron app with a React frontend, powered by Vite.

## Getting Started

### Development

To start the app in development mode (runs Vite and Electron together):

```sh
npm run dev
```

### Production Build

To build the React app:

```sh
npm run build
```

Then start Electron with the built files:

```sh
npm start
```

## Project Structure

- `electron-main.js`: Electron main process
- `preload.js`: Preload script for secure context bridging
- `src/`: React app source code (renderer)

---
For more details, see `.github/copilot-instructions.md`.
