import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ cookies }) => {
	const accessToken = cookies.get('access_token');
	if (accessToken) {
		throw redirect(303, '/decks');
	}
	throw redirect(303, '/login');
};
