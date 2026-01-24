import type { PageServerLoad } from './$types';
import { query } from '$lib/server/db';

export const load: PageServerLoad = async ({ cookies }) => {
	const userId = cookies.get('user_id');
	if (!userId) {
		return { decks: [] };
	}

	const decks = await query<{
		id: string;
		name: string;
		created_at: string;
		card_count: number;
	}>(
		`select d.id, d.name, d.created_at, count(c.id)::int as card_count
		 from flashcard_decks d
		 left join flashcards c on c.deck_id = d.id
		 where d.user_id = $1
		 group by d.id
		 order by d.created_at desc`,
		[userId]
	);

	for (let i = decks.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[decks[i], decks[j]] = [decks[j], decks[i]];
	}

	return { decks };
};
