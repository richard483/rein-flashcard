import type { Handle } from '@sveltejs/kit';
import { authRequest, type AuthApiResponse } from '$lib/server/auth';

const publicPaths = ['/login', '/reset-password'];

export const handle: Handle = async ({ event, resolve }) => {
	const pathname = event.url.pathname;

	if (
		pathname.startsWith('/_app') ||
		pathname.startsWith('/api/auth') ||
		pathname === '/' ||
		pathname === '/flashcards.csv' ||
		pathname === '/favicon.ico'
	) {
		return resolve(event);
	}

	if (!publicPaths.includes(pathname)) {
		let accessToken = event.cookies.get('access_token');
		const refreshToken = event.cookies.get('refresh_token');

		if (!accessToken && refreshToken && !pathname.startsWith('/api/auth')) {
			try {
				const payload = await authRequest<
					AuthApiResponse<{ access_token: string; token_type: string; expires_in: number }>
				>('/auth/refresh', { refresh_token: refreshToken }, event.fetch);

				if (payload.data) {
					accessToken = payload.data.access_token;
					const secure = event.url.protocol === 'https:';
					event.cookies.set('access_token', payload.data.access_token, {
						httpOnly: true,
						path: '/',
						sameSite: 'lax',
						secure,
						maxAge: payload.data.expires_in
					});
				}
			} catch {
				// Ignore refresh errors and fall through to redirect.
			}
		}

		if (!accessToken) {
			if (pathname.startsWith('/api/')) {
				return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
			}
			return new Response(null, {
				status: 303,
				headers: { location: '/login' }
			});
		}
	}

	return resolve(event);
};
