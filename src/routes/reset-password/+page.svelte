<script lang="ts">
	import { onMount } from 'svelte';
	import MessageBanner from '$lib/components/MessageBanner.svelte';

	let token = '';
	let newPassword = '';
	let confirmPassword = '';
	let isSubmitting = false;
	let errorMessage = '';
	let successMessage = '';

	onMount(() => {
		const url = new URL(window.location.href);
		token = url.searchParams.get('token')?.trim() ?? '';
	});

	async function handleSubmit() {
		errorMessage = '';
		successMessage = '';

		if (!token) {
			errorMessage = 'Reset token is missing. Please use the password reset link from your email.';
			return;
		}

		if (!newPassword) {
			errorMessage = 'Please enter a new password.';
			return;
		}

		if (newPassword !== confirmPassword) {
			errorMessage = 'Passwords do not match.';
			return;
		}

		isSubmitting = true;

		try {
			const response = await fetch('/api/auth/reset-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token, password: newPassword, confirm_password: newPassword })
			});

			if (!response.ok) {
				const payload = (await response.json()) as { message?: string };
				throw new Error(payload.message || 'Failed to reset password.');
			}

			successMessage = 'Password reset successful. You can now log in with your new password.';
			newPassword = '';
			confirmPassword = '';
		} catch (error) {
			errorMessage =
				error instanceof Error ? error.message : 'Failed to reset password. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div
	class="relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-[#101922] shadow-2xl"
>
	<div
		class="pointer-events-none absolute top-0 left-0 h-[300px] w-full opacity-20"
		style="background: radial-gradient(circle at 50% 0%, #137fec 0%, transparent 60%)"
	></div>

	<div class="relative z-10 flex flex-1 flex-col justify-center px-6 pb-8">
		<div class="mb-8 text-center">
			<h1 class="text-3xl font-semibold text-white">Set a New Password</h1>
			<p class="mt-3 text-sm text-slate-300">Create a new password for your account.</p>
		</div>

		<form class="flex w-full flex-col gap-5" on:submit|preventDefault={handleSubmit}>
			<div class="space-y-2">
				<label class="ml-1 text-sm font-medium text-slate-300" for="newPassword">New Password</label>
				<input
					id="newPassword"
					class="h-12 w-full rounded-lg border border-slate-700 bg-[#1c2936] px-4 text-base text-white placeholder-slate-500 transition-all focus:border-[#137fec] focus:ring-2 focus:ring-[#137fec]/50 focus:outline-none"
					placeholder="Enter your new password"
					type="password"
					autocomplete="new-password"
					bind:value={newPassword}
					required
				/>
			</div>

			<div class="space-y-2">
				<label class="ml-1 text-sm font-medium text-slate-300" for="confirmPassword"
					>Confirm New Password</label
				>
				<input
					id="confirmPassword"
					class="h-12 w-full rounded-lg border border-slate-700 bg-[#1c2936] px-4 text-base text-white placeholder-slate-500 transition-all focus:border-[#137fec] focus:ring-2 focus:ring-[#137fec]/50 focus:outline-none"
					placeholder="Confirm your new password"
					type="password"
					autocomplete="new-password"
					bind:value={confirmPassword}
					required
				/>
			</div>

			{#if errorMessage}
				<MessageBanner message={errorMessage} variant="error" />
			{/if}

			{#if successMessage}
				<MessageBanner message={successMessage} variant="success" />
			{/if}

			<button
				class="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#137fec] text-white shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
				type="submit"
				disabled={isSubmitting || !token}
			>
				<span>{isSubmitting ? 'Resetting...' : 'Reset Password'}</span>
			</button>

			{#if successMessage}
				<a class="text-center text-sm font-medium text-[#137fec] hover:text-blue-400" href="/login">
					Go to Login
				</a>
			{/if}
		</form>
	</div>
</div>
