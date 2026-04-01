import { json } from '@sveltejs/kit';
import { getAuthBaseUrl } from '$lib/server/auth';

const AUTH_BASE_URL = getAuthBaseUrl();

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { token } = body;

		if (!token) {
			return json({ message: 'Token is required' }, { status: 400 });
		}

		const response = await fetch(`${AUTH_BASE_URL}/auth/verify-email`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ token })
		});

		const data = await response.json();
		
		return json(data, { status: response.status });
	} catch (error) {
		console.error('Verify email error:', error);
		return json({ message: 'Internal server error' }, { status: 500 });
	}
}
