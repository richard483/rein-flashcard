<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';

	let isLoggingOut = false;

	async function handleLogout() {
		isLoggingOut = true;
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
		} catch {
			// Ignore logout errors for now.
		} finally {
			isLoggingOut = false;
			await goto('/login');
		}
	}

	async function handleRename(deckId: string, currentName: string) {
		const nextName = window.prompt('Rename deck', currentName);
		if (!nextName || nextName.trim() === currentName) {
			return;
		}

		const response = await fetch(`/api/decks/${deckId}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: nextName.trim() })
		});

		if (response.ok) {
			await invalidateAll();
		}
	}

	async function handleDelete(deckId: string, name: string) {
		const confirmed = window.confirm(`Delete "${name}"? This cannot be undone.`);
		if (!confirmed) {
			return;
		}

		const response = await fetch(`/api/decks/${deckId}`, { method: 'DELETE' });
		if (response.ok) {
			await invalidateAll();
		}
	}
</script>

<div class="flex min-h-screen flex-col bg-[#101922] text-white">
	<header class="sticky top-0 z-50 border-b border-slate-800 bg-[#101922]/80 backdrop-blur-md">
		<div class="flex h-16 items-center justify-between px-5">
			<div>
				<h1 class="text-xl font-bold tracking-tight">My Decks</h1>
				{#if $page.data.user}
					<p class="text-xs text-slate-400">Welcome, {$page.data.user.username}</p>
				{/if}
			</div>
			<div class="flex items-center gap-2">
				<a
					aria-label="Import CSV"
					class="flex h-10 w-10 items-center justify-center rounded-full text-[#137fec] transition-colors hover:bg-slate-800"
					href="/import"
				>
					<span class="material-symbols-outlined text-[24px]">file_upload</span>
				</a>
				<button
					aria-label="Logout"
					class="flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800"
					on:click={handleLogout}
					disabled={isLoggingOut}
				>
					<span class="material-symbols-outlined text-[20px]">logout</span>
					<span>{isLoggingOut ? '...' : 'Logout'}</span>
				</button>
			</div>
		</div>
	</header>

	<main class="flex-1 px-4 pb-24 pt-4">
		<div
			class="mb-6 flex items-start gap-3 rounded-xl border border-[#137fec]/20 bg-gradient-to-r from-[#137fec]/10 to-transparent p-4"
		>
			<div class="shrink-0 rounded-lg bg-[#137fec]/20 p-2 text-[#137fec]">
				<span class="material-symbols-outlined">lightbulb</span>
			</div>
			<div>
				<h3 class="text-sm font-semibold text-slate-100">Quick Tip</h3>
				<p class="mt-1 text-xs text-slate-400">
					Import your CSV vocabulary lists to create decks in seconds.
				</p>
			</div>
		</div>

		{#if $page.data.decks.length === 0}
			<div class="rounded-2xl border border-dashed border-slate-700 bg-[#15202b] p-6 text-center">
				<p class="text-sm font-semibold text-slate-200">No decks yet</p>
				<p class="mt-2 text-xs text-slate-400">
					Import a CSV file to create your first deck.
				</p>
				<a
					class="mt-4 inline-flex items-center justify-center rounded-full bg-[#137fec] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-600"
					href="/import"
				>
					Import CSV
				</a>
			</div>
		{:else}
			<div class="flex flex-col gap-4">
				{#each $page.data.decks as deck}
					<div class="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#15202b] shadow-sm transition-all hover:shadow-md active:scale-[0.98]">
						<a class="block p-5" href={`/study?deck=${deck.id}`}>
							<div class="mb-2 flex items-start justify-between">
								<div>
									<h2 class="text-lg font-bold text-white leading-tight">{deck.name}</h2>
									<p class="mt-1 text-sm text-slate-400">{deck.card_count} Cards</p>
								</div>
								<span class="material-symbols-outlined text-[20px] text-slate-500">more_horiz</span>
							</div>
							<div class="mt-4 flex items-center gap-3">
								<div class="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
									<div class="h-full rounded-full bg-[#137fec]" style="width: 0%;"></div>
								</div>
								<span class="text-sm font-medium text-[#137fec]">0%</span>
							</div>
						</a>
						<div class="flex items-center gap-2 px-5 pb-5">
							<button
								class="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-200"
								type="button"
								on:click={() => handleRename(deck.id, deck.name)}
							>
								<span class="material-symbols-outlined text-[18px]">edit</span>
								Rename
							</button>
							<button
								class="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-500"
								type="button"
								on:click={() => handleDelete(deck.id, deck.name)}
							>
								<span class="material-symbols-outlined text-[18px]">delete</span>
								Delete
							</button>
						</div>
						<div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
					</div>
				{/each}
			</div>
		{/if}

		<div class="h-24"></div>
	</main>

	<div class="fixed bottom-6 right-6 z-50">
		<a
			aria-label="Create New Deck"
			class="group flex h-14 w-14 items-center justify-center rounded-full bg-[#137fec] text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:bg-blue-600 active:scale-95"
			href="/import"
		>
			<span class="material-symbols-outlined text-[32px] transition-transform group-hover:rotate-90"
				>add</span
			>
		</a>
	</div>
</div>
