import type { RequestHandler } from './$types';
import { authRequest, type AuthApiResponse } from '$lib/server/auth';

export const POST: RequestHandler = async ({ cookies, url, fetch }) => {
	const refreshToken = cookies.get('refresh_token');

	if (refreshToken) {
		try {
			await authRequest<AuthApiResponse<null>>(
				'/auth/logout',
				{ refresh_token: refreshToken },
				fetch
			);
		} catch {
			// Ignore logout errors to ensure cookies are cleared.
		}
	}

	const secure = url.protocol === 'https:';
	const options = {
		httpOnly: true,
		path: '/',
		sameSite: 'lax' as const,
		secure,
		maxAge: 0
	};

	cookies.set('access_token', '', options);
	cookies.set('refresh_token', '', options);
	cookies.set('session_id', '', options);
	cookies.set('user_id', '', options);
	cookies.set('username', '', options);

	return new Response(JSON.stringify({ message: 'Logged out' }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};
