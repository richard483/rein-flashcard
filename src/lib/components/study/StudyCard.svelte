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
</script>

<button
	class="relative aspect-[4/5] max-h-[500px] w-full cursor-pointer"
	type="button"
	on:click={() => dispatch('toggle')}
>
	<div
		class="relative flex h-full w-full flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] transition-transform duration-500"
	>
		<div class="absolute top-6 right-6">
			<span
				class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold tracking-wide text-slate-500 uppercase"
				>{flipped ? 'Meaning' : 'Word'}</span
			>
		</div>
		<div class="flex flex-1 flex-col items-center justify-center gap-6">
			{#if flipped}
				<h1 class="mt-4 text-4xl font-extrabold text-slate-900">
					{card.back_text}
				</h1>
				{#if card.reading_text}
					<p class="text-lg font-medium text-[#137fec]">{card.reading_text}</p>
				{/if}
			{:else}
				<h1 class="mt-4 text-6xl font-extrabold text-slate-900">
					{card.front_text}
				</h1>
				<p class="text-lg text-slate-400">Tap to reveal</p>
			{/if}
		</div>
		<div class="absolute bottom-6 flex items-center gap-1 text-sm font-medium text-slate-300">
			<span class="material-symbols-outlined text-base">touch_app</span>
			Tap to flip
		</div>
	</div>
	<div
		class="absolute top-4 left-4 -z-10 h-full w-full rounded-3xl border border-white/5 bg-white/10"
	></div>
	<div
		class="absolute top-8 left-8 -z-20 h-full w-full rounded-3xl border border-white/5 bg-white/5"
	></div>
</button>
