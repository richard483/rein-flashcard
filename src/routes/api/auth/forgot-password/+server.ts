import { json } from '@sveltejs/kit';
import { getAuthBaseUrl } from '$lib/server/auth';

const AUTH_BASE_URL = getAuthBaseUrl();

	export async function POST({ request }) {
	try {
		const body = await request.json();
		const { email, redirect_url } = body;

		if (!email) {
			return json({ message: 'Email is required' }, { status: 400 });
		}

		const payload: Record<string, string> = { email };
		if (typeof redirect_url === 'string' && redirect_url.length > 0) {
			payload.redirect_url = redirect_url;
		}

		const response = await fetch(`${AUTH_BASE_URL}/auth/forgot-password`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		const data = await response.json();
		
		return json(data, { status: response.status });
	} catch (error) {
		console.error('Forgot password error:', error);
		return json({ message: 'Internal server error' }, { status: 500 });
	}
}
