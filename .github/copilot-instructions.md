# Copilot Instructions for RAapp

## What is RAapp

RAapp (pronounced like "rap" with extended vowels) is a symptom tracker for people with Rheumatoid Arthritis. Users log which joints are swollen and/or painful each day, track medications, and write narrative notes. This data is critical for conversations with rheumatologists about treatment effectiveness.

## Stack

- **Platform**: Progressive Web App (PWA) — installable on iPhone/desktop, works offline
- **Frontend**: Vanilla HTML, CSS, and JavaScript — no framework, no build step, no bundler
- **Storage**: IndexedDB via [Dexie.js](https://dexie.org/) for structured client-side data
- **Hosting**: Static files only. No backend server for MVP

There is no `npm install`, no `package.json`, no build command. To run locally, serve the directory with any static file server (e.g., `python -m http.server` or the VS Code Live Server extension). The service worker requires HTTPS or localhost.

## Data Schema

Each record represents one day. The core data model:

- **Date** (primary key): ISO date string `YYYY-MM-DD`
- **Joint statuses**: Each joint has two independent severity ratings:
  - `swollen`: integer from -1 to 3 (-1=unknown, 0=none, 1=slight, 2=moderate, 3=severe)
  - `painful`: integer from -1 to 3 (same scale)
- **Medications**: Array of objects `[{ name, time, dose }]` — variable length, 0 to N per day
- **Notes**: Freeform text field for subjective narrative
- **Photos**: Not in MVP. Future addition — plan for a schema that can accommodate optional photo references (pre-designated shots: back of each hand, top of each foot, plus user-defined)

### Joint Groups (52 joints total)

| Group | Joints | Count |
|-------|--------|-------|
| PIP (fingers) | One per finger, both hands | 10 |
| MCP (fingers) | One per finger, both hands | 10 |
| CMC (thumbs) | One per thumb | 2 |
| MTP (toes) | One per toe, both feet | 10 |
| IP (big toes) | One per big toe | 2 |
| PIP (lesser toes) | One per toe (not big toes), both feet | 8 |
| Wrists | Left, Right | 2 |
| Elbows | Left, Right | 2 |
| Shoulders | Left, Right | 2 |
| Ankles | Left, Right | 2 |
| Knees | Left, Right | 2 |
| Hips | Left, Right | 2 |

Joints should be stored with consistent string keys (e.g., `left_index_pip`, `right_knee`). Use a canonical joint list defined in one place so the UI and data layer stay in sync.

## Key Behaviors

- **Date-aware**: The app knows today's date and defaults to showing/editing today's entry.
- **Pre-populate from yesterday**: When opening a new day, copy yesterday's joint statuses as defaults. The user edits from there rather than starting blank.
- **CSV export**: Users can export all data as a CSV file for sharing with their doctor or as a backup.
- **CSV import**: Users can import a previously exported CSV to restore data.
- **Offline-first**: The service worker caches all assets. The app must work without network connectivity.

## Architecture Conventions

- **Single source of truth for joints**: Define the full joint list (names, keys, body group) in one JS module. The UI and data export both consume this list — never hardcode joint names in multiple places.
- **Data access layer**: All IndexedDB/Dexie operations go through a small data module (e.g., `db.js`). The UI code never calls Dexie directly. This keeps the door open for swapping in cloud sync later without touching UI code. The data module should expose a clean async interface (e.g., `saveDay()`, `getDay()`, `getAllDays()`, `exportCSV()`, `importCSV()`) so that the storage backend is fully swappable.
- **No build step**: All JS uses plain `<script>` tags with a shared `window.RAapp` namespace. No ES modules, no transpilation, no bundling. Dexie.js is loaded from CDN. The app works by opening `index.html` directly in a browser (file:// or served).
- **Mobile-first UI**: The primary use case is on an iPhone. Design for small screens first. The joint entry UI should be thumb-friendly — big tap targets, minimal typing.
- **Service worker**: Register a service worker for offline caching and PWA installability. Include a `manifest.json` with app name, icons, and `display: standalone`.

## Data Durability Strategy

IndexedDB is the primary data store. It is durable on desktop browsers and on iOS when the app is installed to the Home Screen and used regularly. No `navigator.storage.persist()` — it's a no-op on iOS Safari.

Backup strategy:
- **CSV export button**: Prominent in the UI, frictionless to use. Exports all data as a CSV file the user can save to iCloud Files, email, etc. This is both the "share with my doctor" feature and the durable offsite backup.
- **CSV import**: Restore from a previously exported CSV.
- **Backup reminder**: If it's been more than 7 days since the last CSV export, show a gentle non-blocking nudge prompting the user to back up.

The app should track `lastExportDate` in IndexedDB to power the reminder.

## Future Considerations (Not MVP)

These are explicitly deferred but should not be designed out:

- **Auto-save on change**: Currently requires manual Save button click. A future improvement would save automatically on any change event (joint tap, text blur) with debouncing, and repurpose the Save button for export or remove it entirely.

- **Cloud sync**: The data access layer should make it straightforward to add a sync endpoint later. IndexedDB remains the local cache; cloud becomes the durable backup.
- **Photos**: Schema should be extensible to include optional photo references per day. Storage TBD (likely cloud blob storage when implemented).
- **Charts/plots**: Visualizing joint status trends over time. The CSV export format should be clean enough to also serve as chart input data.
- **Multi-user / public deployment**: Currently single-user, local-only. A future version could add auth and a hosted backend.
