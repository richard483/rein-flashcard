import type { RequestHandler } from './$types';
import { authRequest, type AuthApiResponse } from '$lib/server/auth';

export const POST: RequestHandler = async ({ cookies, url, fetch }) => {
	const refreshToken = cookies.get('refresh_token');

	if (!refreshToken) {
		return new Response(JSON.stringify({ message: 'Missing refresh token' }), { status: 401 });
	}

	const payload = await authRequest<
		AuthApiResponse<{ access_token: string; token_type: string; expires_in: number }>
	>('/auth/refresh', { refresh_token: refreshToken }, fetch);

	if (!payload.data) {
		return new Response(JSON.stringify({ message: 'Refresh failed' }), { status: 401 });
	}

	const secure = url.protocol === 'https:';
	cookies.set('access_token', payload.data.access_token, {
		httpOnly: true,
		path: '/',
		sameSite: 'lax',
		secure,
		maxAge: payload.data.expires_in
	});

	return new Response(JSON.stringify({ message: 'Refreshed' }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};
