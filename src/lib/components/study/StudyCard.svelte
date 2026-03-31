<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	type CardLayout = 'character-front' | 'meaning-front' | 'reading-front';

	type StudyCard = {
		id: string;
		front_text: string;
		back_text: string;
		reading_text: string | null;
		position: number;
	};

	export let card: StudyCard;
	export let flipped = false;
	export let layout: CardLayout = 'character-front';

	const dispatch = createEventDispatcher<{ toggle: void }>();

	function splitLines(value: string) {
		return value.replace(/<br\s*\/?>/gi, '\n').split('\n');
	}

	function stripCardPrefix(line: string) {
		return line.replace(/^(KANJI|VOCAB):/, '').trim();
	}

	function getFrontLabel(frontText: string) {
		const firstLine = splitLines(frontText)[0] ?? '';
		if (firstLine.startsWith('KANJI:')) {
			return 'Kanji';
		}
		if (firstLine.startsWith('VOCAB:')) {
			return 'Vocab';
		}
		return 'Word';
	}

	function isStructuredCard(frontText: string) {
		const firstLine = splitLines(frontText)[0] ?? '';
		return firstLine.startsWith('KANJI:') || firstLine.startsWith('VOCAB:');
	}

	function parseCardFields(card: StudyCard) {
		if (!isStructuredCard(card.front_text)) {
			return {
				label: 'Word',
				character: card.front_text,
				meaning: card.back_text,
				reading: card.reading_text ?? ''
			};
		}

		const [firstLine = '', ...frontRemainder] = splitLines(card.front_text);
		const frontMeaning = frontRemainder.map((line) => line.trim()).filter(Boolean).join('\n');

		return {
			label: getFrontLabel(card.front_text),
			character: stripCardPrefix(firstLine),
			meaning: frontMeaning || card.back_text || '',
			reading: frontMeaning ? card.back_text || card.reading_text || '' : card.reading_text || ''
		};
	}

	function joinSections(values: string[]) {
		return values.filter(Boolean).join('\n\n');
	}

	$: parsedCard = parseCardFields(card);
	$: useLayout = isStructuredCard(card.front_text);
	$: frontLabel = useLayout
		? layout === 'character-front'
			? parsedCard.label
			: layout === 'meaning-front'
				? 'Meaning'
				: 'Reading'
		: getFrontLabel(card.front_text);
	$: backLabel = 'Answer';
	$: frontContent = useLayout
		? layout === 'character-front'
			? parsedCard.character
			: layout === 'meaning-front'
				? parsedCard.meaning
				: parsedCard.reading
		: card.front_text;
	$: backContent = useLayout
		? layout === 'character-front'
			? joinSections([parsedCard.meaning, parsedCard.reading])
			: layout === 'meaning-front'
				? joinSections([parsedCard.character, parsedCard.reading])
				: joinSections([parsedCard.character, parsedCard.meaning])
		: card.back_text;
	$: supplementalReading = useLayout ? '' : card.reading_text ?? '';

	function handleToggle() {
		const selection = globalThis.getSelection?.();
		if (selection && selection.toString().trim().length > 0) {
			return;
		}
		dispatch('toggle');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			dispatch('toggle');
		}
	}
</script>

<div
	class="relative aspect-[4/5] max-h-[500px] w-full cursor-pointer"
	role="button"
	tabindex="0"
	on:click={handleToggle}
	on:keydown={handleKeydown}
>
	<div
		class="relative flex h-full w-full flex-col rounded-3xl border border-slate-100 bg-white p-8 pb-16 text-left shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] transition-transform duration-500"
	>
		<div class="absolute top-6 right-6 z-10">
			<span
				class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold tracking-wide text-slate-500 uppercase"
				>{flipped ? backLabel : frontLabel}</span
			>
		</div>
		<div
			class="custom-scrollbar flex w-full flex-1 items-start justify-center overflow-y-auto pt-16"
		>
			{#if flipped}
				<h1 class="text-4xl font-extrabold text-slate-900 select-text">
					{#each splitLines(backContent) as line, index}
						{#if index > 0}
							<br />
						{/if}
						<span class={`block ${index === 0 ? 'text-4xl' : 'mt-3 text-2xl'}`}>{line}</span>
					{/each}
				</h1>
				{#if supplementalReading}
					<p class="text-lg font-medium text-[#137fec] select-text">
						{#each splitLines(supplementalReading) as line, index}
							{#if index > 0}
								<br />
							{/if}
							<span class={`block ${index === 0 ? 'text-lg' : 'mt-2 text-base'}`}>{line}</span>
						{/each}
					</p>
				{/if}
			{:else}
				<h1 class="text-6xl font-extrabold text-slate-900 select-text">
					{#each splitLines(frontContent) as line, index}
						{#if index > 0}
							<br />
						{/if}
						<span class={`block ${index === 0 ? 'text-6xl' : 'mt-3 text-3xl'}`}>
							{!useLayout && index === 0 ? stripCardPrefix(line) : line}
						</span>
					{/each}
				</h1>
			{/if}
		</div>
		<div
			class="absolute right-0 bottom-6 left-0 flex items-center justify-center"
		>
			<button
				class="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
				type="button"
				on:click|stopPropagation={() => dispatch('toggle')}
			>
				Flip card
			</button>
		</div>
	</div>
	<div
		class="absolute top-4 left-4 -z-10 h-full w-full rounded-3xl border border-white/5 bg-white/10"
	></div>
	<div
		class="absolute top-8 left-8 -z-20 h-full w-full rounded-3xl border border-white/5 bg-white/5"
	></div>
</div>
