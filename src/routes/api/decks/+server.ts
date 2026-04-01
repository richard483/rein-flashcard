import type { RequestHandler } from './$types';
import { pool, query } from '$lib/server/db';

export const GET: RequestHandler = async ({ cookies }) => {
	const userId = cookies.get('user_id');
	if (!userId) {
		return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
	}

	const rows = await query<{
		id: string;
		name: string;
		created_at: string;
		card_count: number;
		source: string | null;
		source_updated_at: string | null;
	}>(
		`select d.id, d.name, d.created_at, d.source, d.source_updated_at, count(c.id)::int as card_count
		 from flashcard_decks d
		 left join flashcards c on c.deck_id = d.id
		 where d.user_id = $1
		 group by d.id
		 order by d.created_at desc`,
		[userId]
	);

	return new Response(JSON.stringify({ decks: rows }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	const userId = cookies.get('user_id');
	if (!userId) {
		return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
	}

	const body = (await request.json()) as {
		name: string;
		cards: { front: string; back: string; reading?: string }[];
		sourceFile?: string;
	};

	if (!body.name || !Array.isArray(body.cards) || body.cards.length === 0) {
		return new Response(JSON.stringify({ message: 'Invalid payload' }), { status: 400 });
	}

	const client = await pool.connect();
	try {
		await client.query('begin');
		const deckResult = await client.query<{ id: string }>(
			`insert into flashcard_decks (user_id, name, source)
			 values ($1, $2, null)
			 returning id`,
			[userId, body.name]
		);

		const deckId = deckResult.rows[0]?.id;
		if (!deckId) {
			throw new Error('Failed to create deck.');
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
			[deckId, body.sourceFile ?? 'upload.csv', body.cards.length, 'success']
		);

		await client.query('commit');

		return new Response(JSON.stringify({ deck_id: deckId }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		await client.query('rollback');
		const message = error instanceof Error ? error.message : 'Import failed';
		return new Response(JSON.stringify({ message }), { status: 500 });
	} finally {
		client.release();
	}
};
