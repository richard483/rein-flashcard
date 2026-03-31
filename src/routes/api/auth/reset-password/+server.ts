import { json } from '@sveltejs/kit';
import { getAuthBaseUrl } from '$lib/server/auth';

const AUTH_BASE_URL = getAuthBaseUrl();

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { token, password, confirm_password } = body;

		if (!token || !password || !confirm_password) {
			return json({ message: 'Token and new password are required' }, { status: 400 });
		}

		const response = await fetch(`${AUTH_BASE_URL}/auth/reset-password`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ token, password, confirm_password })
		});

		const data = await response.json();
		
		return json(data, { status: response.status });
	} catch (error) {
		console.error('Reset password error:', error);
		return json({ message: 'Internal server error' }, { status: 500 });
	}
}
