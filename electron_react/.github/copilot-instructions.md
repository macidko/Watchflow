<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This project is an Electron app with a React frontend (Vite). The main process is managed by Electron, and the renderer is a React app served by Vite during development and as static files in production.

- Use Electron APIs only in the main/preload process.
- Use React for all UI in the renderer process.
- For development, use `npm run dev` to launch both Vite and Electron together.
