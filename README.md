# FlashCard JP (SvelteKit)

FlashCard JP is a SvelteKit app for importing CSV vocab lists and studying them as flashcards. It supports SSR auth via a Karasu Auth API, server-side deck persistence in PostgreSQL, and a focused study session UI with progress tracking.

## Features

- CSV upload with preview and sample CSV download
- Deck list with rename/delete and per-deck study progress
- Study session flow with easy/hard tracking and persistent progress
- SSR auth with httpOnly cookies and token refresh

## Project structure

- `src/routes` SvelteKit routes (login, decks, import, study, API endpoints)
- `src/lib` shared UI components, server utilities, and assets
- `db/schema.sql` PostgreSQL schema
- `static/flashcards.csv` sample CSV

## Configuration

Auth:
- `PRIVATE_AUTH_BASE_URL` (defaults to `http://222.222.1.104:30025`)

Database:
- `PRIVATE_DB_HOST`
- `PRIVATE_DB_PORT`
- `PRIVATE_DB_NAME`
- `PRIVATE_DB_USER`
- `PRIVATE_DB_PASSWORD`

## Development

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

`npm run preview` serves the production build.
