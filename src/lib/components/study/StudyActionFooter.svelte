<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let disabled = false;

	const dispatch = createEventDispatcher<{ hard: void; easy: void }>();
</script>

<footer class="px-8 pt-4 pb-10">
	<div class="flex items-center justify-center gap-8">
		<div class="flex flex-col items-center gap-3">
			<button
				class="group flex h-16 w-16 items-center justify-center rounded-full bg-red-500 shadow-lg shadow-red-500/20 transition-all hover:bg-red-600 active:scale-95"
				type="button"
				on:click={() => dispatch('hard')}
				{disabled}
			>
				<span class="material-symbols-outlined text-3xl text-white">close</span>
			</button>
			<span class="text-xs font-semibold tracking-wider text-red-400 uppercase">Hard</span>
		</div>
		<div class="flex flex-col items-center gap-3">
			<button
				class="group flex h-16 w-16 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/20 transition-all hover:bg-green-600 active:scale-95"
				type="button"
				on:click={() => dispatch('easy')}
				{disabled}
			>
				<span class="material-symbols-outlined text-3xl text-white">check</span>
			</button>
			<span class="text-xs font-semibold tracking-wider text-green-400 uppercase">Easy</span>
		</div>
	</div>
</footer>
