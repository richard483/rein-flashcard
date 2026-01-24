<script lang="ts">
	import { goto } from '$app/navigation';
	import { parseCsv } from '$lib/utils/csv';

	let deckName = '';
	let fileName = '';
	let rowCount = 0;
	let previewRows: string[][] = [];
	let parsedRows: string[][] = [];
	let createdDeckId: string | null = null;
	let errorMessage = '';
	let successMessage = '';
	let isReady = false;

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		errorMessage = '';
		successMessage = '';
		isReady = false;
		createdDeckId = null;

		if (!file) {
			fileName = '';
			rowCount = 0;
			previewRows = [];
			parsedRows = [];
			return;
		}

		fileName = file.name;
		if (!deckName) {
			deckName = file.name.replace(/\.csv$/i, '');
		}
		const reader = new FileReader();
		reader.onload = () => {
			const contents = typeof reader.result === 'string' ? reader.result : '';
			const rows = parseCsv(contents).filter((row) => row.some((cell) => cell.length > 0));
			if (rows.length === 0) {
				errorMessage = 'No rows found in CSV.';
				rowCount = 0;
				previewRows = [];
				parsedRows = [];
				return;
			}
			rowCount = rows.length;
			parsedRows = rows;
			previewRows = rows.slice(0, 3);
			isReady = true;
		};
		reader.onerror = () => {
			errorMessage = 'Unable to read the file.';
		};
		reader.readAsText(file);
	}

	async function handleImport() {
		if (!isReady) {
			errorMessage = 'Select a CSV file first.';
			return;
		}
		if (!deckName.trim()) {
			errorMessage = 'Deck name is required.';
			return;
		}

		const cards = parsedRows
			.map((row) => {
				if (row.length >= 3) {
					return { front: row[0], reading: row[1], back: row[2] };
				}
				if (row.length >= 2) {
					return { front: row[0], back: row[1] };
				}
				return null;
			})
			.filter(Boolean);

		if (cards.length === 0) {
			errorMessage = 'CSV needs at least two columns per row.';
			return;
		}

		try {
			const response = await fetch('/api/decks', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: deckName.trim(),
				cards,
				sourceFile: fileName
			})
			});
			if (!response.ok) {
				const payload = (await response.json()) as { message?: string };
				throw new Error(payload.message || 'Import failed.');
			}
			const payload = (await response.json()) as { deck_id: string };
			createdDeckId = payload.deck_id;
			successMessage = `Imported ${cards.length} cards into "${deckName}".`;
			errorMessage = '';
			isReady = false;
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Import failed.';
		}
	}

	function handleStartStudy() {
		if (createdDeckId) {
			goto(`/study?deck=${createdDeckId}`);
		}
	}
</script>

<div class="flex min-h-screen flex-col bg-[#101922] text-white">
	<div
		class="sticky top-0 z-50 flex items-center justify-between border-b border-slate-800 bg-[#101922]/95 px-4 py-3 backdrop-blur-sm"
	>
		<div class="flex items-center gap-3">
			<a
				class="flex items-center justify-center rounded-full p-2 text-white transition-colors hover:bg-slate-800"
				href="/decks"
			>
				<span class="material-symbols-outlined">arrow_back</span>
			</a>
			<h1 class="text-lg font-bold leading-tight tracking-tight">Import Flashcards</h1>
		</div>
		<button
			class="flex items-center justify-center rounded-full p-2 text-white transition-colors hover:bg-slate-800"
			type="button"
		>
			<span class="material-symbols-outlined">help</span>
		</button>
	</div>

	<main class="flex w-full max-w-lg flex-1 flex-col gap-6 p-4 mx-auto">
		<div class="rounded-xl border border-slate-700 bg-[#15202b] p-5 shadow-sm">
			<label class="text-sm font-semibold text-slate-300">Deck name</label>
			<input
				class="mt-2 h-11 w-full rounded-lg border border-slate-700 bg-[#1c2936] px-4 text-sm text-white placeholder-slate-500 focus:border-[#137fec] focus:outline-none focus:ring-2 focus:ring-[#137fec]/50"
				placeholder="e.g. JLPT N5 Core"
				type="text"
				bind:value={deckName}
				required
			/>
		</div>

		<div class="flex flex-col">
			<label
				for="csvUpload"
				class="group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-[#137fec]/40 bg-[#15202b] px-6 py-12 transition-all hover:border-[#137fec]/70 hover:bg-[#1a2633]"
			>
				<div class="flex flex-col items-center gap-3 text-center">
					<div
						class="flex h-16 w-16 items-center justify-center rounded-full bg-[#137fec]/10 text-[#137fec] transition-transform group-hover:scale-110"
					>
						<span class="material-symbols-outlined text-[32px]">cloud_upload</span>
					</div>
					<div class="space-y-1">
						<p class="text-base font-bold text-white">
							{fileName ? 'Replace CSV' : 'Upload CSV'}
						</p>
						<p class="text-sm text-slate-400">Tap to browse or drag CSV file here</p>
					</div>
				</div>
				{#if fileName}
					<div class="rounded-lg border border-slate-700 bg-[#1c2936] px-4 py-2 text-xs text-slate-300">
						Selected: {fileName}
					</div>
				{/if}
				<div
					class="pointer-events-none flex h-10 items-center justify-center rounded-lg bg-[#137fec] px-6 text-sm font-bold text-white shadow-sm"
				>
					Select File
				</div>
				<input id="csvUpload" class="hidden" type="file" accept=".csv" on:change={handleFileChange} />
			</label>
		</div>

		<div class="rounded-xl border border-slate-700 bg-[#15202b] p-5 shadow-sm">
			<div class="flex flex-col gap-4">
				<div class="flex items-start gap-3">
					<span class="material-symbols-outlined text-[#137fec]">info</span>
					<div class="flex flex-col gap-1">
						<p class="text-base font-bold text-white">Formatting Requirements</p>
						<p class="text-sm leading-relaxed text-slate-400">
							Your CSV should contain at least two columns. We recommend three columns in this
							order:
						</p>
						<ul class="ml-1 mt-1 list-inside list-disc space-y-1 text-sm text-slate-400">
							<li>Column 1: <strong>Word</strong> (Kanji)</li>
							<li>Column 2: <strong>Reading</strong> (Kana)</li>
							<li>Column 3: <strong>Meaning</strong> (English)</li>
						</ul>
					</div>
				</div>
				<div class="h-px w-full bg-slate-700"></div>
				<a
					class="group flex items-center justify-between text-sm font-bold text-[#137fec] transition-colors hover:text-blue-500"
					href="/flashcards.csv"
					download
				>
					<span>Download Sample CSV</span>
					<span class="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1"
						>arrow_forward</span
					>
				</a>
			</div>
		</div>

		{#if rowCount}
			<div class="rounded-xl border border-slate-700 bg-[#15202b] p-5 shadow-sm">
				<p class="text-sm font-semibold text-slate-300">Preview ({rowCount} rows)</p>
				<div class="mt-3 space-y-2 text-sm text-slate-300">
					{#each previewRows as row}
						<div class="rounded-lg bg-[#1c2936] px-3 py-2">
							{row.join(' | ')}
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if errorMessage}
			<p class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
				{errorMessage}
			</p>
		{/if}

		{#if successMessage}
			<p class="rounded-lg border border-green-800 bg-green-900/30 px-4 py-3 text-sm text-green-300">
				{successMessage}
			</p>
		{/if}

		<button
			class="flex h-12 w-full items-center justify-center rounded-xl bg-[#137fec] text-base font-bold text-white shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
			type="button"
			on:click={handleImport}
			disabled={!isReady}
		>
			Import File
		</button>

		{#if createdDeckId}
			<button
				class="flex h-12 w-full items-center justify-center rounded-xl border border-[#137fec] bg-[#15202b] text-base font-bold text-[#137fec] shadow-sm transition-all hover:bg-[#1a2633]"
				type="button"
				on:click={handleStartStudy}
			>
				Start Study Session
			</button>
		{/if}

		<div class="h-12"></div>
	</main>
</div>
