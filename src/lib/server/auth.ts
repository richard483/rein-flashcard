import { env } from '$env/dynamic/private';

const DEFAULT_AUTH_BASE_URL = 'https://auth.nephren.xyz';
const LEGACY_INTERNAL_AUTH_BASE_URL = 'http://222.222.1.104:30025';

export function getAuthBaseUrl() {
	const configuredUrl = (env.PRIVATE_AUTH_BASE_URL || '').replace(/\/$/, '');
	if (!configuredUrl || configuredUrl === LEGACY_INTERNAL_AUTH_BASE_URL) {
		return DEFAULT_AUTH_BASE_URL;
	}

	return configuredUrl;
}

const baseUrl = getAuthBaseUrl();

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
		email?: string;
		email_verified?: boolean;
		is_active?: boolean;
	};
};

export type RegisterData = {
	user_id: string;
	username: string;
	email: string;
	message: string;
};

export type VerifyEmailResponse = {
	message: string;
	email_verified: boolean;
};

export type ForgotPasswordResponse = {
	message: string;
};

export type ResetPasswordResponse = {
	message: string;
	password_reset: boolean;
};

type JsonRecord = Record<string, unknown>;

function getMessage(payload: unknown) {
	if (payload && typeof payload === 'object' && 'message' in payload) {
		return String((payload as { message?: string }).message ?? 'Request failed');
	}
	return 'Request failed';
}

async function readJsonResponse<T>(response: Response) {
	const text = await response.text();

	if (!text) {
		return null as T | null;
	}

	try {
		return JSON.parse(text) as T;
	} catch {
		return text as T;
	}
}

async function requestJson<T>(
	path: string,
	init: RequestInit,
	fetcher: typeof fetch = fetch
) {
	const response = await fetcher(`${baseUrl}${path}`, init);
	const payload = await readJsonResponse<T>(response);

	if (!response.ok) {
		throw new Error(getMessage(payload));
	}

	return payload;
}

export async function authRequest<T>(
	path: string,
	body: Record<string, unknown>,
	fetcher: typeof fetch = fetch
) {
	return requestJson<T>(
		path,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		},
		fetcher
	);
}

export async function register(
	username: string,
	password: string,
	confirmPassword: string,
	email: string,
	fetcher: typeof fetch = fetch
) {
	return authRequest<AuthApiResponse<RegisterData>>(
		'/auth/register',
		{
			user_name: username,
			password,
			confirm_password: confirmPassword,
			email
		},
		fetcher
	);
}

export async function verifyEmail(token: string, fetcher: typeof fetch = fetch) {
	return authRequest<AuthApiResponse<VerifyEmailResponse>>('/auth/verify-email', { token }, fetcher);
}

export async function resendVerification(email: string, fetcher: typeof fetch = fetch) {
	return authRequest<AuthApiResponse<{ message: string }>>(
		'/auth/resend-verification',
		{ email },
		fetcher
	);
}

export async function forgotPassword(
	email: string,
	redirectUrl?: string,
	fetcher: typeof fetch = fetch
) {
	const body: Record<string, string> = { email };
	if (redirectUrl) {
		body.redirect_url = redirectUrl;
	}

	return authRequest<AuthApiResponse<ForgotPasswordResponse>>(
		'/auth/forgot-password',
		body,
		fetcher
	);
}

export async function resetPassword(token: string, newPassword: string, fetcher: typeof fetch = fetch) {
	return authRequest<AuthApiResponse<ResetPasswordResponse>>(
		'/auth/reset-password',
		{ token, password: newPassword, confirm_password: newPassword },
		fetcher
	);
}

function extractUser(payload: unknown): { id: string; username: string } | null {
	const candidate = (() => {
		if (!payload || typeof payload !== 'object') {
			return null;
		}

		const record = payload as JsonRecord;
		if (record.data && typeof record.data === 'object') {
			const data = record.data as JsonRecord;
			if (data.user && typeof data.user === 'object') {
				return data.user as JsonRecord;
			}
			return data;
		}

		if (record.user && typeof record.user === 'object') {
			return record.user as JsonRecord;
		}

		return record;
	})();

	if (!candidate) {
		return null;
	}

	const id = candidate.id ?? candidate.user_id;
	const username = candidate.username ?? candidate.user_name;

	if (typeof id !== 'string' || typeof username !== 'string' || !id || !username) {
		return null;
	}

	return { id, username };
}

export async function validateToken(
	accessToken: string,
	fetcher: typeof fetch = fetch
): Promise<{ id: string; username: string } | null> {
	if (!accessToken.trim()) {
		return null;
	}

	try {
		const payload = await requestJson<unknown>(
			'/auth/me',
			{
				method: 'GET',
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			},
			fetcher
		);

		return extractUser(payload);
	} catch {
		return null;
	}
}
