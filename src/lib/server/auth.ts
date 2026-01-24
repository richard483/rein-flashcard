import { env } from '$env/dynamic/private';

const baseUrl = (env.PRIVATE_AUTH_BASE_URL || 'http://222.222.1.104:30025').replace(/\/$/, '');

export type AuthApiResponse<T> = {
	status: number;
	message: string;
	data?: T;
};

export type AuthLoginData = {
	access_token: string;
	refresh_token: string;
	token_type: string;
	expires_in: number;
	session_id: string;
	user: {
		id: string;
		username: string;
		is_active?: boolean;
	};
};

export async function authRequest<T>(
	path: string,
	body: Record<string, unknown>,
	fetcher: typeof fetch = fetch
) {
	const response = await fetcher(`${baseUrl}${path}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});

	const payload = (await response.json()) as T;

	if (!response.ok) {
		const message =
			payload && typeof payload === 'object' && 'message' in payload
				? String((payload as { message?: string }).message ?? 'Request failed')
				: 'Request failed';
		throw new Error(message);
	}

	return payload;
}
