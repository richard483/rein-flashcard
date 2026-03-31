import type { RequestHandler } from './$types';
import { pool } from '$lib/server/db';
import { validateToken } from '$lib/server/auth';

type DeckCard = {
	front: string;
	back: string;
	reading?: string;
};

type ExternalDeckBody = {
	name: string;
	cards: DeckCard[];
	source?: string;
};

function json(message: Record<string, unknown>, status: number) {
	return new Response(JSON.stringify(message), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

function normalizeText(value: unknown) {
	return typeof value === 'string' ? value.trim() : '';
}

function parseBody(body: unknown): ExternalDeckBody | null {
	if (!body || typeof body !== 'object') {
		return null;
	}

	const record = body as Record<string, unknown>;
	const name = normalizeText(record.name);
	const source = normalizeText(record.source);

	if (!name || !Array.isArray(record.cards) || record.cards.length === 0) {
		return null;
	}

	const cards: DeckCard[] = [];
	for (const item of record.cards) {
		if (!item || typeof item !== 'object') {
			return null;
		}

		const card = item as Record<string, unknown>;
		const front = normalizeText(card.front);
		const back = normalizeText(card.back);
		const reading = normalizeText(card.reading);

		if (!front || !back) {
			return null;
		}

		cards.push({
			front,
			back,
			...(reading ? { reading } : {})
		});
	}

	return {
		name,
		cards,
		...(source ? { source } : {})
	};
}

export const POST: RequestHandler = async ({ request, fetch }) => {
	const authorization = request.headers.get('authorization');
	const tokenMatch = authorization?.match(/^Bearer\s+(.+)$/i);
	if (!tokenMatch) {
		return json({ message: 'Unauthorized' }, 401);
	}

	const user = await validateToken(tokenMatch[1], fetch);
	if (!user) {
		return json({ message: 'Unauthorized' }, 401);
	}

	const payload = await request.json().catch(() => null);
	const body = parseBody(payload);
	if (!body) {
		return json({ message: 'Invalid payload' }, 400);
	}

	const client = await pool.connect();
	try {
		await client.query('begin');

		const deckResult = await client.query<{ id: string }>(
			`insert into flashcard_decks (user_id, name)
			 values ($1, $2)
			 returning id`,
			[user.id, body.name]
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
			[deckId, body.source || 'external-import', body.cards.length, 'success']
		);

		await client.query('commit');

		return json({ deck_id: deckId, card_count: body.cards.length }, 200);
	} catch (error) {
		await client.query('rollback');
		const message = error instanceof Error ? error.message : 'Failed to create deck';
		return json({ message }, 500);
	} finally {
		client.release();
	}
};
