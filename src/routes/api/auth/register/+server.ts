import type { RequestHandler } from './$types';
import { authRequest, type AuthApiResponse } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, fetch }) => {
	const body = (await request.json()) as {
		user_name: string;
		password: string;
		confirm_password: string;
	};
	const payload = await authRequest<AuthApiResponse<{ user_id: string }>>(
		'/auth/register',
		body,
		fetch
	);

	return new Response(JSON.stringify(payload), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};
