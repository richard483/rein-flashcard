import type { RequestHandler } from './$types';
import { query } from '$lib/server/db';
import {
	getBearerUser,
	jsonResponse,
	parseRenameDeckBody
} from '$lib/server/externalDecks';

async function getDeck(id: string, userId: string) {
	const rows = await query<{
		id: string;
		name: string;
		source: string | null;
		source_updated_at: string | null;
		card_layout: string;
	}>(
		`select id, name, source, source_updated_at, card_layout
		 from flashcard_decks
		 where id = $1 and user_id = $2 and source is not null`,
		[id, userId]
	);

	return rows[0] ?? null;
}

export const GET: RequestHandler = async ({ request, fetch, params }) => {
	const user = await getBearerUser(request, fetch);
	if (!user) {
		return jsonResponse({ message: 'Unauthorized' }, 401);
	}

	const deck = await getDeck(params.id, user.id);
	if (!deck) {
		return jsonResponse({ message: 'Not found' }, 404);
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
		[params.id]
	);

	return jsonResponse({ deck, cards });
};

export const PUT: RequestHandler = async ({ request, fetch, params }) => {
	const user = await getBearerUser(request, fetch);
	if (!user) {
		return jsonResponse({ message: 'Unauthorized' }, 401);
	}

	const payload = await request.json().catch(() => null);
	const body = parseRenameDeckBody(payload);
	if (!body) {
		return jsonResponse({ message: 'At least one valid update is required' }, 400);
	}

	const rows = await query<{ id: string }>(
		`update flashcard_decks
		 set name = coalesce($1, name),
		     card_layout = coalesce($2, card_layout),
		     updated_at = now()
		 where id = $3 and user_id = $4 and source is not null
		 returning id`,
		[body.name ?? null, body.card_layout ?? null, params.id, user.id]
	);

	if (rows.length === 0) {
		return jsonResponse({ message: 'Not found' }, 404);
	}

	return jsonResponse({ message: 'Updated' });
};

export const DELETE: RequestHandler = async ({ request, fetch, params }) => {
	const user = await getBearerUser(request, fetch);
	if (!user) {
		return jsonResponse({ message: 'Unauthorized' }, 401);
	}

	const rows = await query<{ id: string }>(
		`delete from flashcard_decks
		 where id = $1 and user_id = $2 and source is not null
		 returning id`,
		[params.id, user.id]
	);

	if (rows.length === 0) {
		return jsonResponse({ message: 'Not found' }, 404);
	}

	return jsonResponse({ message: 'Deleted' });
};
