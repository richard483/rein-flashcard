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

export async function authRequest<T>(
	path: string,
	body: Record<string, unknown>,
	fetcher: typeof fetch = fetch,
	options?: {
		noAuth?: boolean;
	}
) {
	const headers: Record<string, string> = { 'Content-Type': 'application/json' };

	const response = await fetcher(`${baseUrl}${path}`, {
		method: 'POST',
		headers,
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
