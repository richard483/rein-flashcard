<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let title: string;

	const dispatch = createEventDispatcher<{ exit: void; shuffle: void }>();
</script>

<header class="flex items-center justify-between px-4 pt-6 pb-2">
	<div class="flex w-12 justify-start">
		<button
			class="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10"
			type="button"
			on:click={() => dispatch('exit')}
		>
			<span class="material-symbols-outlined">close</span>
		</button>
	</div>
	<h2 class="flex-1 text-center text-lg font-bold tracking-tight text-white">{title}</h2>
	<div class="flex w-12 justify-end">
		<button
			class="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10"
			type="button"
			on:click={() => dispatch('shuffle')}
		>
			<span class="material-symbols-outlined">shuffle</span>
		</button>
	</div>
</header>
