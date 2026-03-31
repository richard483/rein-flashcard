create extension if not exists "uuid-ossp";

create table if not exists flashcard_decks (
	id uuid primary key default uuid_generate_v4(),
	user_id uuid not null,
	name text not null,
	description text,
	source text default null,
	source_updated_at timestamptz not null default now(),
	card_layout text not null default 'character-front',
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table if not exists flashcards (
	id uuid primary key default uuid_generate_v4(),
	deck_id uuid not null references flashcard_decks(id) on delete cascade,
	front_text text not null,
	back_text text not null,
	reading_text text,
	position integer not null default 0,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table if not exists flashcard_imports (
	id uuid primary key default uuid_generate_v4(),
	deck_id uuid not null references flashcard_decks(id) on delete cascade,
	file_name text not null,
	row_count integer not null default 0,
	status text not null default 'success',
	created_at timestamptz not null default now()
);

create index if not exists flashcard_decks_user_id_idx on flashcard_decks(user_id);
create index if not exists flashcard_decks_source_idx on flashcard_decks(source);
create index if not exists flashcards_deck_id_idx on flashcards(deck_id);
