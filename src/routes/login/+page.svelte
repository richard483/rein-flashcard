<script lang="ts">
	import { goto } from '$app/navigation';

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

<div class="relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-[#101922] shadow-2xl">
	<div
		class="pointer-events-none absolute left-0 top-0 h-[300px] w-full opacity-20"
		style="background: radial-gradient(circle at 50% 0%, #137fec 0%, transparent 60%)"
	></div>

	<div class="relative z-10 px-4 pt-4 pb-2">
		<div
			class="relative h-48 w-full overflow-hidden rounded-xl bg-cover bg-center shadow-lg"
			style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuC0fKQdFf733JKblJGceZMNwh4_nTcXvJxW8a1Y3xX5G7INdnrFoMEf4d105EmwV7Qdwv6pNrDDBREzOxYra8YDmj7GdwJJoeBj6gdIa_f9qf-avvCYRNXVg6OoJr3UziDZl5099LRzxN0lysrKA7twvp6OzekfRoxnmoyuxIB2PxDeYRd29frgiX-arWGu9ibGK3d3nYMpSTd7gHlmkZySmus_O7VZTY0VXUbeCJDmTK3xRKhZwvntJ8rj1L8X9UXsVn3VYOT9kR4");'
		>
			<div class="absolute inset-0 bg-gradient-to-t from-[#101922]/80 to-transparent"></div>
			<div class="absolute bottom-4 left-4 flex items-center gap-2">
				<span class="material-symbols-outlined text-3xl text-white">style</span>
				<span class="text-lg font-bold tracking-wide text-white/90">FlashCard JP</span>
			</div>
		</div>
	</div>

	<div class="relative z-10 flex flex-1 flex-col px-6 pt-4 pb-8">
		<div class="mb-8 text-center">
			<h1 class="mb-2 text-3xl font-bold tracking-tight text-white">Okaeri</h1>
			<p class="text-base font-normal text-slate-400">Master Japanese, one card at a time.</p>
		</div>

		<div class="mb-6 flex items-center justify-center gap-2 text-sm font-semibold">
			<button
				class={`rounded-full px-4 py-2 transition-colors ${
					mode === 'login'
						? 'bg-[#137fec] text-white shadow-lg shadow-blue-500/20'
						: 'text-slate-400 hover:text-slate-200'
				}`}
				type="button"
				on:click={() => (mode = 'login')}
			>
				Sign In
			</button>
			<button
				class={`rounded-full px-4 py-2 transition-colors ${
					mode === 'register'
						? 'bg-[#137fec] text-white shadow-lg shadow-blue-500/20'
						: 'text-slate-400 hover:text-slate-200'
				}`}
				type="button"
				on:click={() => (mode = 'register')}
			>
				Sign Up
			</button>
		</div>

		<form class="flex w-full flex-col gap-5" on:submit|preventDefault={handleSubmit}>
			<div class="space-y-2">
				<label class="ml-1 text-sm font-medium text-slate-300" for="username">Username</label>
				<div class="relative flex items-center">
					<span class="material-symbols-outlined absolute left-4 text-[20px] text-slate-400"
						>mail</span
					>
					<input
						id="username"
						class="h-12 w-full rounded-lg border border-slate-700 bg-[#1c2936] pl-11 pr-4 text-base text-white placeholder-slate-500 transition-all focus:border-[#137fec] focus:outline-none focus:ring-2 focus:ring-[#137fec]/50"
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
						class="h-12 w-full rounded-lg border border-slate-700 bg-[#1c2936] pl-11 pr-12 text-base text-white placeholder-slate-500 transition-all focus:border-[#137fec] focus:outline-none focus:ring-2 focus:ring-[#137fec]/50"
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
						<button
							class="text-sm font-medium text-[#137fec] hover:text-blue-400"
							type="button"
						>
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
							class="h-12 w-full rounded-lg border border-slate-700 bg-[#1c2936] pl-11 pr-4 text-base text-white placeholder-slate-500 transition-all focus:border-[#137fec] focus:outline-none focus:ring-2 focus:ring-[#137fec]/50"
							placeholder="Confirm your password"
							type={showPassword ? 'text' : 'password'}
							autocomplete="new-password"
							bind:value={confirmPassword}
							required
						/>
					</div>
				</div>
			{/if}

			{#if errorMessage}
				<p class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
					{errorMessage}
				</p>
			{/if}

			<button
				class="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#137fec] text-white shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
				type="submit"
				disabled={isSubmitting}
			>
				<span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
				<span class="material-symbols-outlined text-[20px]">arrow_forward</span>
			</button>
		</form>

			<div class="mt-8 flex flex-col items-center gap-4">
			<div class="flex w-full items-center gap-4">
				<div class="h-px flex-1 bg-slate-700"></div>
				<span class="text-xs font-medium uppercase tracking-wider text-slate-500"
					>Or continue with</span
				>
				<div class="h-px flex-1 bg-slate-700"></div>
			</div>
			<div class="flex w-full gap-4">
				<button
					class="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-[#1c2936] transition-colors hover:bg-[#253646]"
					type="button"
				>
					<span class="font-medium text-slate-200">Google</span>
				</button>
				<button
					class="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-[#1c2936] transition-colors hover:bg-[#253646]"
					type="button"
				>
					<span class="font-medium text-slate-200">Apple</span>
				</button>
			</div>
		</div>

		<div class="mt-auto pt-8 text-center">
			<p class="text-sm text-slate-400">
				{mode === 'login' ? "Don't have an account?" : 'Already registered?'}
				<button
					type="button"
					class="ml-1 font-semibold text-[#137fec] hover:text-blue-400"
					on:click={() => (mode = mode === 'login' ? 'register' : 'login')}
				>
					{mode === 'login' ? 'Sign Up' : 'Sign In'}
				</button>
			</p>
		</div>
	</div>
</div>
