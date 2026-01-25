# FlashCard JP (SvelteKit)

## Project status

- [x] Scaffolded core routes: login, decks, import, study
- [x] Auth wired through SSR API routes with httpOnly cookies
- [x] CSV upload preview + sample CSV download
- [x] PostgreSQL schema + server-side persistence for decks/cards/imports

## Progress log

- Refactored CSV import card parsing into a helper and cleaned up the fetch payload formatting.
- Simplified deck progress reload logic to depend only on deck data changes.
- Fixed DB query error logging to use the configured env values safely.
- Added pg type definitions and tightened deck/study page typing fallbacks for svelte-check.
- Constrained DB query typing to pg rows and tightened deck/study card typings for checks.
- Extracted shared empty-state panel and split study UI into smaller components.
- Split login/import pages into reusable UI components and added shared message banner.
- Switched login hero and favicon to the flashcard-mountain asset.
- Generated a 32x32 favicon PNG from the mountain image and wired it in.
- Removed unused `favicon.svg` asset.
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
- Use deck id from server data first when building study session state.
- Reworked study session card resolution to always map by id and avoid stale fallback.
- Added self-healing for missing card ids in study session order or stash.
- Removed auto-reset loop to allow manual rebuild and proper card progression.
- Sanitized stored order against current card ids and ensured a visible progress bar.
- Refactored study session to use an explicit id map and cleanly resolve active cards.
- Relaxed study-session card resolution to rely on order/stash even if deck data is late.
- Fixed reactive card resolution by inlining active card selection.
- Removed stale resolveActiveId reference and added loading state for initial study card.
- Persisted easy/hard progress in localStorage and surfaced progress on deck list.
- Switched study progress bar to green and animated width changes.
- Removed reactive skip-easy loop to fix Svelte reactive cycle on study page.
- Broke study card derivation into an explicit update function to avoid reactive cycles.
- Ensured active card updates when order/index changes for immediate card rendering.
- Reloaded persisted study progress on re-entry to keep session progress in sync.
- Load persisted progress on each study render once card data is available.
- Switched study progress tracking to array-based lists for reliable reactivity.
- Removed study progress debug logging.
- Added multi-stage Dockerfile and .dockerignore for container builds.
- Delayed progress load until card map is ready to avoid clearing saved progress.
- Fixed a11y label associations and removed invalid href in login/import forms.
- Removed erroneous Dockerfile copy of `.svelte-kit` tsconfig (generated at build time).
- Switched auth env loading to dynamic private env for Docker builds.
- Added `npm run prepare` in Docker build to generate `.svelte-kit` before build.
- Restored `.svelte-kit` to `.dockerignore`.
- Switched DB env loading to dynamic private env for Docker/Kubernetes builds.

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
