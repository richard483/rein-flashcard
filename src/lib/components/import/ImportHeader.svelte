<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let title = 'Import Flashcards';

	const dispatch = createEventDispatcher<{ back: void }>();
</script>

<div
	class="sticky top-0 z-50 flex items-center justify-between border-b border-slate-800 bg-[#101922]/95 px-4 py-3 backdrop-blur-sm"
>
	<div class="flex items-center gap-3">
		<button
			class="flex items-center justify-center rounded-full p-2 text-white transition-colors hover:bg-slate-800"
			type="button"
			on:click={() => dispatch('back')}
		>
			<span class="material-symbols-outlined">arrow_back</span>
		</button>
		<h1 class="text-lg leading-tight font-bold tracking-tight">{title}</h1>
	</div>
	<button
		class="flex items-center justify-center rounded-full p-2 text-white transition-colors hover:bg-slate-800"
		type="button"
	>
		<span class="material-symbols-outlined">help</span>
	</button>
</div>
