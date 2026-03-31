import type { RequestHandler } from './$types';
import { pool, query } from '$lib/server/db';
import {
	getBearerUser,
	jsonResponse,
	parseCreateDeckBody
} from '$lib/server/externalDecks';

export const GET: RequestHandler = async ({ request, fetch, url }) => {
	const user = await getBearerUser(request, fetch);
	if (!user) {
		return jsonResponse({ message: 'Unauthorized' }, 401);
	}

	const source = url.searchParams.get('source')?.trim() || null;
	const decks = await query<{
		id: string;
		name: string;
		card_count: number;
		source: string | null;
		source_updated_at: string | null;
	}>(
		`select d.id, d.name, d.source, d.source_updated_at, count(c.id)::int as card_count
		 from flashcard_decks d
		 left join flashcards c on c.deck_id = d.id
		 where d.user_id = $1
		   and d.source is not null
		   and ($2::text is null or d.source = $2)
		 group by d.id
		 order by d.updated_at desc, d.created_at desc`,
		[user.id, source]
	);

	return jsonResponse({ decks });
};

export const POST: RequestHandler = async ({ request, fetch }) => {
	const user = await getBearerUser(request, fetch);
	if (!user) {
		return jsonResponse({ message: 'Unauthorized' }, 401);
	}

	const payload = await request.json().catch(() => null);
	const body = parseCreateDeckBody(payload);
	if (!body) {
		return jsonResponse({ message: 'Invalid payload' }, 400);
	}

	const client = await pool.connect();
	try {
		await client.query('begin');

		const deckResult = await client.query<{
			id: string;
			source_updated_at: string;
		}>(
			`insert into flashcard_decks (user_id, name, source)
			 values ($1, $2, $3)
			 returning id, source_updated_at`,
			[user.id, body.name, body.source]
		);

		const deckId = deckResult.rows[0]?.id;
		if (!deckId) {
			throw new Error('Failed to create deck');
		}

		for (let index = 0; index < body.cards.length; index += 1) {
			const card = body.cards[index];
			await client.query(
				`insert into flashcards (deck_id, front_text, back_text, reading_text, position)
				 values ($1, $2, $3, $4, $5)`,
				[deckId, card.front, card.back, card.reading ?? null, index]
			);
		}

		await client.query(
			`insert into flashcard_imports (deck_id, file_name, row_count, status)
			 values ($1, $2, $3, $4)`,
			[deckId, body.source, body.cards.length, 'success']
		);

		await client.query('commit');

		return jsonResponse(
			{
				deck_id: deckId,
				card_count: body.cards.length,
				source_updated_at: deckResult.rows[0]?.source_updated_at ?? null
			},
			200
		);
	} catch (error) {
		await client.query('rollback');
		const message = error instanceof Error ? error.message : 'Failed to create deck';
		return jsonResponse({ message }, 500);
	} finally {
		client.release();
	}
};
