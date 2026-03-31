alter table flashcard_decks
	add column if not exists card_layout text not null default 'character-front';
