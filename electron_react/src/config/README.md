This folder contains configuration and data helpers for the Watchflow app.

Current recommended data source
- The canonical runtime state is now managed by the Zustand store in `src/config/initialData.js`.
- Prefer using the `useContentStore()` hook exported by `initialData.js` for reads and writes.

Legacy module: `dataUtils.js`
- `src/config/dataUtils.js` is a legacy, localStorage-backed helper that loads `sliders.json` and exposes helpers like `getSliderData`, `getPageSliders`, `saveSliderDataNow`, etc.
- It remains in the repo for backward compatibility and tools, but it is considered deprecated for UI code.

Migration guidance
- Replace direct calls to `getSliderData()` or other `dataUtils` helpers with the corresponding Zustand API:
  - Reads: `getPages()`, `getStatusesByPage(pageId)`, `getContentsByPageAndStatus(pageId, statusId)`
  - Writes: `addStatus`, `updateStatus`, `deleteStatus`, `toggleStatusVisibility`, `reorderStatuses`, `moveContentBetweenStatuses`, etc.
- If a file is an old/experimental variant (contains `_old`, `_new`, or `_fixed` in its name), prefer keeping only the canonical version and remove the legacy variants after migration.

If you want, I can perform the migration for the remaining page variants that still use `getSliderData()` (I already located them)."
