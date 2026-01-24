# FlashCard JP (SvelteKit)

## Project status

- [x] Scaffolded core routes: login, decks, import, study
- [x] Auth wired through SSR API routes with httpOnly cookies
- [x] CSV upload preview + sample CSV download
- [x] PostgreSQL schema + server-side persistence for decks/cards/imports

## Progress log

- Adjusted study session routing to read deck name from query string.
- Added client-side password confirmation check on registration.
- Added server-side auth guard to redirect unauthenticated users to `/login`.
- Implemented server-side PostgreSQL persistence for imported decks and cards.
- Deck list now renders decks from the database; study session reads cards from the database.
- Reset import state when selecting a new file to avoid stale deck links.
- Moved auth to SSR via SvelteKit API routes with httpOnly cookies and server redirects.
- Added server-side deck API endpoints and DB connection setup.
- Added `.env` with auth and database connection defaults.
- Removed unused client-side auth store/API in favor of SSR-only auth flow.
- Removed unused sample deck data now that decks are loaded from the database.
- Added server-side deck rename/delete endpoints and UI actions.
- Added refresh-token handling in the SSR auth guard.
- Escaped `$` in `PRIVATE_DB_PASSWORD` to avoid dotenv expansion issues.
- Added DB connection error logging (sans secrets) to aid auth debugging.
- Updated database password in `.env`.
- Updated database name and user in `.env`.
- Switched app UI to dark mode only.
- Centered import content, removed recent imports, and show selected file inside upload box.
- Randomized deck ordering on load.
- Added study session stash handling with persistent local progress and completion screen.
- Added session reset logic when deck cards change.
- Fixed study session init to wait for deck data before building the shuffled order.
- Improved study session initialization to recover from empty or mismatched state.
- Added automatic session reset when no current card is resolved.
- Added manual session rebuild UI when no card can be resolved.
- Use deck id from server data first when building study session state.
- Added display fallback to show first card when state mismatches occur.
- Reworked study session card resolution to always map by id and avoid stale fallback.
- Added debug panel for study session when no card can be resolved.
- Added self-healing for missing card ids in study session order or stash.
- Removed auto-reset loop to allow manual rebuild and proper card progression.
- Sanitized stored order against current card ids and ensured a visible progress bar.
- Refactored study session to use an explicit id map and cleanly resolve active cards.
- Relaxed study-session card resolution to rely on order/stash even if deck data is late.
- Fixed reactive card resolution by inlining active card selection.

## Routes

- `/login` sign in / sign up UI wired to Karasu Auth API
- `/decks` deck list UI with logout
- `/import` CSV upload + preview, downloads `static/flashcards.csv`
- `/study` flashcard study session UI

## Auth configuration

- Set `PRIVATE_AUTH_BASE_URL` (defaults to `http://222.222.1.104:30025`)
- Uses endpoints: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`

## Database schema

- SQL schema in `db/schema.sql`
- Decks are keyed by `user_id` from the auth service
- Connection uses server-side env vars:
  - `PRIVATE_DB_HOST`
  - `PRIVATE_DB_PORT`
  - `PRIVATE_DB_NAME`
  - `PRIVATE_DB_USER`
  - `PRIVATE_DB_PASSWORD`

## Developing

Install dependencies and start the dev server:

```sh
npm install
npm run dev
```

## Building

```sh
npm run build
```

You can preview the production build with `npm run preview`.
