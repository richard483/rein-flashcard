<script lang="ts">
	import { goto } from '$app/navigation';
	import AuthFooterSwitch from '$lib/components/login/AuthFooterSwitch.svelte';
	import AuthHero from '$lib/components/login/AuthHero.svelte';
	import AuthModeTabs from '$lib/components/login/AuthModeTabs.svelte';
	import SocialButtons from '$lib/components/login/SocialButtons.svelte';
	import MessageBanner from '$lib/components/MessageBanner.svelte';

	let mode: 'login' | 'register' = 'login';
	let userName = '';
	let password = '';
	let confirmPassword = '';
	let showPassword = false;
	let errorMessage = '';
	let isSubmitting = false;

	async function handleSubmit() {
		errorMessage = '';
		isSubmitting = true;
		try {
			if (mode === 'register' && password !== confirmPassword) {
				errorMessage = 'Passwords do not match.';
				return;
			}

			if (mode === 'register') {
				const response = await fetch('/api/auth/register', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						user_name: userName,
						password,
						confirm_password: confirmPassword
					})
				});
				if (!response.ok) {
					const payload = (await response.json()) as { message?: string };
					throw new Error(payload.message || 'Registration failed.');
				}
			}

			const loginResponse = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ user_name: userName, password })
			});
			if (!loginResponse.ok) {
				const payload = (await loginResponse.json()) as { message?: string };
				throw new Error(payload.message || 'Login failed.');
			}
			await goto('/decks');
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unable to authenticate.';
			errorMessage = message;
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

	<AuthHero />

	<div class="relative z-10 flex flex-1 flex-col px-6 pb-8">
		<AuthModeTabs {mode} on:change={(event) => (mode = event.detail)} />

		<form class="flex w-full flex-col gap-5" on:submit|preventDefault={handleSubmit}>
			<div class="space-y-2">
				<label class="ml-1 text-sm font-medium text-slate-300" for="username">Username</label>
				<div class="relative flex items-center">
					<span class="material-symbols-outlined absolute left-4 text-[20px] text-slate-400"
						>mail</span
					>
					<input
						id="username"
						class="h-12 w-full rounded-lg border border-slate-700 bg-[#1c2936] pr-4 pl-11 text-base text-white placeholder-slate-500 transition-all focus:border-[#137fec] focus:ring-2 focus:ring-[#137fec]/50 focus:outline-none"
						placeholder="Enter your username"
						type="text"
						autocomplete="username"
						bind:value={userName}
						required
					/>
				</div>
			</div>

			<div class="space-y-2">
				<div class="ml-1 flex items-center justify-between">
					<label class="text-sm font-medium text-slate-300" for="password">Password</label>
				</div>
				<div class="relative flex items-center">
					<span class="material-symbols-outlined absolute left-4 text-[20px] text-slate-400"
						>lock</span
					>
					<input
						id="password"
						class="h-12 w-full rounded-lg border border-slate-700 bg-[#1c2936] pr-12 pl-11 text-base text-white placeholder-slate-500 transition-all focus:border-[#137fec] focus:ring-2 focus:ring-[#137fec]/50 focus:outline-none"
						placeholder="Enter your password"
						type={showPassword ? 'text' : 'password'}
						autocomplete={mode === 'register' ? 'new-password' : 'current-password'}
						bind:value={password}
						required
					/>
					<button
						class="absolute right-3 flex items-center justify-center p-1 text-slate-400 hover:text-slate-200"
						type="button"
						on:click={() => (showPassword = !showPassword)}
					>
						<span class="material-symbols-outlined text-[20px]"
							>{showPassword ? 'visibility' : 'visibility_off'}</span
						>
					</button>
				</div>
				{#if mode === 'login'}
					<div class="flex justify-end pt-1">
						<button class="text-sm font-medium text-[#137fec] hover:text-blue-400" type="button">
							Forgot Password?
						</button>
					</div>
				{/if}
			</div>

			{#if mode === 'register'}
				<div class="space-y-2">
					<label class="ml-1 text-sm font-medium text-slate-300" for="confirmPassword"
						>Confirm Password</label
					>
					<div class="relative flex items-center">
						<span class="material-symbols-outlined absolute left-4 text-[20px] text-slate-400"
							>lock</span
						>
						<input
							id="confirmPassword"
							class="h-12 w-full rounded-lg border border-slate-700 bg-[#1c2936] pr-4 pl-11 text-base text-white placeholder-slate-500 transition-all focus:border-[#137fec] focus:ring-2 focus:ring-[#137fec]/50 focus:outline-none"
							placeholder="Confirm your password"
							type={showPassword ? 'text' : 'password'}
							autocomplete="new-password"
							bind:value={confirmPassword}
							required
						/>
					</div>
				</div>
			{/if}

			<MessageBanner message={errorMessage} variant="error" />

			<button
				class="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#137fec] text-white shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
				type="submit"
				disabled={isSubmitting}
			>
				<span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
				<span class="material-symbols-outlined text-[20px]">arrow_forward</span>
			</button>
		</form>

		<SocialButtons />

		<AuthFooterSwitch {mode} on:toggle={() => (mode = mode === 'login' ? 'register' : 'login')} />
	</div>
</div>
