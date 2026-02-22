<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	type StudyCard = {
		id: string;
		front_text: string;
		back_text: string;
		reading_text: string | null;
		position: number;
	};

	export let card: StudyCard;
	export let flipped = false;

	const dispatch = createEventDispatcher<{ toggle: void }>();

	function splitLines(value: string) {
		return value.replace(/<br\s*\/?>/gi, '\n').split('\n');
	}

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
				>{flipped ? 'Meaning' : 'Word'}</span
			>
		</div>
		<div
			class="custom-scrollbar flex w-full flex-1 items-start justify-center overflow-y-auto pt-16"
		>
			{#if flipped}
				<h1 class="text-4xl font-extrabold text-slate-900 select-text">
					{#each splitLines(card.back_text) as line, index}
						{#if index > 0}
							<br />
						{/if}
						<span class={`block ${index === 0 ? 'text-4xl' : 'mt-3 text-2xl'}`}>{line}</span>
					{/each}
				</h1>
				{#if card.reading_text}
					<p class="text-lg font-medium text-[#137fec] select-text">
						{#each splitLines(card.reading_text) as line, index}
							{#if index > 0}
								<br />
							{/if}
							<span class={`block ${index === 0 ? 'text-lg' : 'mt-2 text-base'}`}>{line}</span>
						{/each}
					</p>
				{/if}
			{:else}
				<h1 class="text-6xl font-extrabold text-slate-900 select-text">
					{#each splitLines(card.front_text) as line, index}
						{#if index > 0}
							<br />
						{/if}
						<span class={`block ${index === 0 ? 'text-6xl' : 'mt-3 text-3xl'}`}>{line}</span>
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
