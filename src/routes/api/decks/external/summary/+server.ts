import type { RequestHandler } from './$types';
import { query } from '$lib/server/db';
import { getBearerUser, jsonResponse } from '$lib/server/externalDecks';

type DeckSummaryRow = {
	deck_id: string;
	name: string;
	source: string | null;
	source_updated_at: string | null;
	card_layout: string;
	card_id: string | null;
	front_text: string | null;
};

type CardIdentifier = {
	card_id: string;
	type: 'kanji' | 'vocab' | 'unknown';
	identifier: string;
};

function parseCardIdentifier(frontText: string | null): CardIdentifier | null {
	if (!frontText) {
		return null;
	}

	const [firstLine = ''] = frontText.split('\n');
	if (firstLine.startsWith('KANJI:')) {
		return {
			card_id: '',
			type: 'kanji',
			identifier: firstLine.slice('KANJI:'.length).trim()
		};
	}

	if (firstLine.startsWith('VOCAB:')) {
		return {
			card_id: '',
			type: 'vocab',
			identifier: firstLine.slice('VOCAB:'.length).trim()
		};
	}

	return {
		card_id: '',
		type: 'unknown',
		identifier: firstLine.trim()
	};
}

export const GET: RequestHandler = async ({ request, fetch, url }) => {
	const user = await getBearerUser(request, fetch);
	if (!user) {
		return jsonResponse({ message: 'Unauthorized' }, 401);
	}

	const source = url.searchParams.get('source')?.trim() || null;
	const rows = await query<DeckSummaryRow>(
		`select d.id as deck_id,
		        d.name,
		        d.source,
		        d.source_updated_at,
		        d.card_layout,
		        c.id as card_id,
		        c.front_text
		 from flashcard_decks d
		 left join flashcards c on c.deck_id = d.id
		 where d.user_id = $1
		   and d.source is not null
		   and ($2::text is null or d.source = $2)
		 order by d.updated_at desc, d.created_at desc, c.position asc`,
		[user.id, source]
	);

	const deckMap = new Map<
		string,
		{
			id: string;
			name: string;
			card_count: number;
			source: string | null;
			source_updated_at: string | null;
			card_layout: string;
			card_identifiers: CardIdentifier[];
		}
	>();

	for (const row of rows) {
		if (!deckMap.has(row.deck_id)) {
			deckMap.set(row.deck_id, {
				id: row.deck_id,
				name: row.name,
				card_count: 0,
				source: row.source,
				source_updated_at: row.source_updated_at,
				card_layout: row.card_layout,
				card_identifiers: []
			});
		}

		if (!row.card_id) {
			continue;
		}

		const deck = deckMap.get(row.deck_id);
		if (!deck) {
			continue;
		}

		deck.card_count += 1;

		const parsed = parseCardIdentifier(row.front_text);
		if (!parsed) {
			continue;
		}

		deck.card_identifiers.push({
			...parsed,
			card_id: row.card_id
		});
	}

	return jsonResponse({ decks: Array.from(deckMap.values()) });
};
