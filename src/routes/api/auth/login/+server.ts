import type { RequestHandler } from './$types';
import { authRequest, type AuthApiResponse, type AuthLoginData } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies, url, fetch }) => {
	const body = (await request.json()) as { user_name: string; password: string };
	const payload = await authRequest<AuthApiResponse<AuthLoginData>>('/auth/login', body, fetch);

	if (!payload.data) {
		return new Response(JSON.stringify({ message: 'Login failed' }), { status: 401 });
	}

	const secure = url.protocol === 'https:';
	const accessMaxAge = payload.data.expires_in;
	const refreshMaxAge = 60 * 60 * 24 * 7;

	cookies.set('access_token', payload.data.access_token, {
		httpOnly: true,
		path: '/',
		sameSite: 'lax',
		secure,
		maxAge: accessMaxAge
	});
	cookies.set('refresh_token', payload.data.refresh_token, {
		httpOnly: true,
		path: '/',
		sameSite: 'lax',
		secure,
		maxAge: refreshMaxAge
	});
	cookies.set('session_id', payload.data.session_id, {
		httpOnly: true,
		path: '/',
		sameSite: 'lax',
		secure,
		maxAge: refreshMaxAge
	});
	cookies.set('user_id', payload.data.user.id, {
		httpOnly: true,
		path: '/',
		sameSite: 'lax',
		secure,
		maxAge: refreshMaxAge
	});
	cookies.set('username', payload.data.user.username, {
		httpOnly: true,
		path: '/',
		sameSite: 'lax',
		secure,
		maxAge: refreshMaxAge
	});

	return new Response(
		JSON.stringify({
			user: payload.data.user
		}),
		{
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		}
	);
};
