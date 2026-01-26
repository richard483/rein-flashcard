<script lang="ts">
	import { goto } from '$app/navigation';
	import { parseCsv } from '$lib/utils/csv';
	import CsvUploadBox from '$lib/components/import/CsvUploadBox.svelte';
	import DeckNameCard from '$lib/components/import/DeckNameCard.svelte';
	import ImportGuidelines from '$lib/components/import/ImportGuidelines.svelte';
	import ImportHeader from '$lib/components/import/ImportHeader.svelte';
	import PreviewCard from '$lib/components/import/PreviewCard.svelte';
	import MessageBanner from '$lib/components/MessageBanner.svelte';

	let deckName = '';
	let fileName = '';
	let rowCount = 0;
	let previewRows: string[][] = [];
	let parsedRows: string[][] = [];
	let createdDeckId: string | null = null;
	let errorMessage = '';
	let successMessage = '';
	let isReady = false;
	let isParsing = false;
	let isUploading = false;

	type DraftCard = { front: string; back: string; reading?: string };

	function buildCards(rows: string[][]): DraftCard[] {
		const cards: DraftCard[] = [];
		for (const row of rows) {
			const trimmed = row.map((cell) => cell.trim());
			if (trimmed.length >= 3) {
				const [front, reading, back] = trimmed;
				if (front && back) {
					cards.push({ front, reading: reading || undefined, back });
				}
				continue;
			}
			if (trimmed.length >= 2) {
				const [front, back] = trimmed;
				if (front && back) {
					cards.push({ front, back });
				}
			}
		}
		return cards;
	}

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		errorMessage = '';
		successMessage = '';
		isReady = false;
		createdDeckId = null;
		isParsing = false;

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
		isParsing = true;
		reader.onload = () => {
			const contents = typeof reader.result === 'string' ? reader.result : '';
			const rows = parseCsv(contents).filter((row) => row.some((cell) => cell.length > 0));
			if (rows.length === 0) {
				errorMessage = 'No rows found in CSV.';
				rowCount = 0;
				previewRows = [];
				parsedRows = [];
				isParsing = false;
				return;
			}
			rowCount = rows.length;
			parsedRows = rows;
			previewRows = rows.slice(0, 3);
			isReady = true;
			isParsing = false;
		};
		reader.onerror = () => {
			errorMessage = 'Unable to read the file.';
			isParsing = false;
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

		const cards = buildCards(parsedRows);

		if (cards.length === 0) {
			errorMessage = 'CSV needs at least two columns per row.';
			return;
		}

		isUploading = true;
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
		} finally {
			isUploading = false;
		}
	}

	function handleStartStudy() {
		if (createdDeckId) {
			goto(`/study?deck=${createdDeckId}`);
		}
	}
</script>

<div class="flex min-h-screen flex-col bg-[#101922] text-white">
	<ImportHeader title="Import Flashcards" on:back={() => goto('/decks')} />

	<main class="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 p-4">
		<DeckNameCard bind:deckName />

		<div class="flex flex-col">
			<CsvUploadBox {fileName} isLoading={isParsing} onChange={handleFileChange} />
		</div>

		<ImportGuidelines />

		<PreviewCard {rowCount} {previewRows} />

		<MessageBanner message={errorMessage} variant="error" />
		<MessageBanner message={successMessage} variant="success" />

		<button
			class="flex h-12 w-full items-center justify-center rounded-xl bg-[#137fec] text-base font-bold text-white shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
			type="button"
			on:click={handleImport}
			disabled={!isReady || isParsing || isUploading}
		>
			{#if isUploading}
				<span class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
				Uploading...
			{:else}
				Import File
			{/if}
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
