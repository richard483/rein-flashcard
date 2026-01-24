import type { RequestHandler } from './$types';
import { query } from '$lib/server/db';

export const GET: RequestHandler = async ({ cookies, params }) => {
	const userId = cookies.get('user_id');
	if (!userId) {
		return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
	}

	const deckRows = await query<{ id: string; name: string }>(
		`select id, name from flashcard_decks where id = $1 and user_id = $2`,
		[params.id, userId]
	);

	if (deckRows.length === 0) {
		return new Response(JSON.stringify({ message: 'Not found' }), { status: 404 });
	}

	const cardRows = await query<{
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

	return new Response(
		JSON.stringify({
			deck: deckRows[0],
			cards: cardRows
		}),
		{
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		}
	);
};

export const PUT: RequestHandler = async ({ cookies, params, request }) => {
	const userId = cookies.get('user_id');
	if (!userId) {
		return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
	}

	const body = (await request.json()) as { name?: string };
	const name = body.name?.trim();

	if (!name) {
		return new Response(JSON.stringify({ message: 'Name is required' }), { status: 400 });
	}

	const rows = await query<{ id: string }>(
		`update flashcard_decks set name = $1, updated_at = now()
		 where id = $2 and user_id = $3
		 returning id`,
		[name, params.id, userId]
	);

	if (rows.length === 0) {
		return new Response(JSON.stringify({ message: 'Not found' }), { status: 404 });
	}

	return new Response(JSON.stringify({ message: 'Updated' }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const DELETE: RequestHandler = async ({ cookies, params }) => {
	const userId = cookies.get('user_id');
	if (!userId) {
		return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
	}

	const rows = await query<{ id: string }>(
		`delete from flashcard_decks where id = $1 and user_id = $2 returning id`,
		[params.id, userId]
	);

	if (rows.length === 0) {
		return new Response(JSON.stringify({ message: 'Not found' }), { status: 404 });
	}

	return new Response(JSON.stringify({ message: 'Deleted' }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};
