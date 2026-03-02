import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// This page should be accessible without authentication
	return {};
};
