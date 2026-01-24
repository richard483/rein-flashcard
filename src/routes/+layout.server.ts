import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const accessToken = cookies.get('access_token');
	if (!accessToken) {
		return { user: null };
	}

	const userId = cookies.get('user_id');
	const username = cookies.get('username');

	return {
		user: userId && username ? { id: userId, username } : null
	};
};
