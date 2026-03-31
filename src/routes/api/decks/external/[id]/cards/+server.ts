import type { RequestHandler } from './$types';
import { pool, query } from '$lib/server/db';
import {
	getBearerUser,
	jsonResponse,
	parseCardBody
} from '$lib/server/externalDecks';

async function getExternalDeck(id: string, userId: string) {
	const rows = await query<{ id: string; source: string | null }>(
		`select id, source
		 from flashcard_decks
		 where id = $1 and user_id = $2`,
		[id, userId]
	);

	return rows[0] ?? null;
}

export const POST: RequestHandler = async ({ request, fetch, params }) => {
	const user = await getBearerUser(request, fetch);
	if (!user) {
		return jsonResponse({ message: 'Unauthorized' }, 401);
	}

	const deck = await getExternalDeck(params.id, user.id);
	if (!deck) {
		return jsonResponse({ message: 'Not found' }, 404);
	}
	if (!deck.source) {
		return jsonResponse({ message: 'Deck is not externally managed' }, 400);
	}

	const payload = await request.json().catch(() => null);
	const body = parseCardBody(payload);
	if (!body) {
		return jsonResponse({ message: 'Invalid payload' }, 400);
	}

	const client = await pool.connect();
	try {
		await client.query('begin');

		const positionRows = await client.query<{ position: number }>(
			`select coalesce(max(position), -1)::int as position
			 from flashcards
			 where deck_id = $1`,
			[params.id]
		);
		const nextPosition = (positionRows.rows[0]?.position ?? -1) + 1;

		const cardRows = await client.query<{ id: string; position: number }>(
			`insert into flashcards (deck_id, front_text, back_text, reading_text, position)
			 values ($1, $2, $3, $4, $5)
			 returning id, position`,
			[params.id, body.front, body.back, body.reading ?? null, nextPosition]
		);

		await client.query(
			`update flashcard_decks
			 set source_updated_at = now(), updated_at = now()
			 where id = $1`,
			[params.id]
		);

		await client.query('commit');

		return jsonResponse({
			card_id: cardRows.rows[0]?.id ?? null,
			position: cardRows.rows[0]?.position ?? nextPosition
		});
	} catch (error) {
		await client.query('rollback');
		const message = error instanceof Error ? error.message : 'Failed to add card';
		return jsonResponse({ message }, 500);
	} finally {
		client.release();
	}
};

export const DELETE: RequestHandler = async ({ request, fetch, params }) => {
	const user = await getBearerUser(request, fetch);
	if (!user) {
		return jsonResponse({ message: 'Unauthorized' }, 401);
	}

	const deck = await getExternalDeck(params.id, user.id);
	if (!deck) {
		return jsonResponse({ message: 'Not found' }, 404);
	}
	if (!deck.source) {
		return jsonResponse({ message: 'Deck is not externally managed' }, 400);
	}

	const payload = (await request.json().catch(() => null)) as { card_id?: string } | null;
	const cardId = payload?.card_id?.trim();
	if (!cardId) {
		return jsonResponse({ message: 'card_id is required' }, 400);
	}

	const client = await pool.connect();
	try {
		await client.query('begin');

		const deletedRows = await client.query<{ id: string }>(
			`delete from flashcards
			 where id = $1 and deck_id = $2
			 returning id`,
			[cardId, params.id]
		);

		if (deletedRows.rows.length === 0) {
			await client.query('rollback');
			return jsonResponse({ message: 'Card not found' }, 404);
		}

		await client.query(
			`update flashcard_decks
			 set source_updated_at = now(), updated_at = now()
			 where id = $1`,
			[params.id]
		);

		await client.query('commit');

		return jsonResponse({ message: 'Deleted' });
	} catch (error) {
		await client.query('rollback');
		const message = error instanceof Error ? error.message : 'Failed to delete card';
		return jsonResponse({ message }, 500);
	} finally {
		client.release();
	}
};
