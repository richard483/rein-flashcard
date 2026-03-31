import { json } from '@sveltejs/kit';
import { getAuthBaseUrl } from '$lib/server/auth';

const AUTH_BASE_URL = getAuthBaseUrl();

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { email } = body;

		if (!email) {
			return json({ message: 'Email is required' }, { status: 400 });
		}

		const response = await fetch(`${AUTH_BASE_URL}/auth/resend-verification`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email })
		});

		const data = await response.json();
		
		return json(data, { status: response.status });
	} catch (error) {
		console.error('Resend verification error:', error);
		return json({ message: 'Internal server error' }, { status: 500 });
	}
}
