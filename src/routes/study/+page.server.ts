import type { PageServerLoad } from './$types';
import { query } from '$lib/server/db';

export const load: PageServerLoad = async ({ url, cookies }) => {
	const deckId = url.searchParams.get('deck');
	const userId = cookies.get('user_id');

	if (!deckId || !userId) {
		return { deck: null, cards: [] };
	}

	const deckRows = await query<{
		id: string;
		name: string;
		source: string | null;
		source_updated_at: string | null;
		card_layout: string;
	}>(
		`select id, name, source, source_updated_at, card_layout
		 from flashcard_decks
		 where id = $1 and user_id = $2`,
		[deckId, userId]
	);

	if (deckRows.length === 0) {
		return { deck: null, cards: [] };
	}

	const cards = await query<{
		id: string;
		front_text: string;
		back_text: string;
		reading_text: string | null;
		position: number;
	}>(
		`select id, front_text, back_text, reading_text, position
		 from flashcards
		 where deck_id = $1
		 order by position asc`,
		[deckId]
	);

	return { deck: deckRows[0], cards };
};
