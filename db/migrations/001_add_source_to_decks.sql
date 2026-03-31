alter table flashcard_decks add column if not exists source text default null;
alter table flashcard_decks add column if not exists source_updated_at timestamptz not null default now();

create index if not exists flashcard_decks_source_idx on flashcard_decks(source);
