<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	type AuthMode = 'login' | 'register';
	export let mode: AuthMode = 'login';

	const dispatch = createEventDispatcher<{ change: AuthMode }>();
</script>

<div class="mb-6 flex items-center justify-center gap-2 text-sm font-semibold">
	<button
		class={`rounded-full px-4 py-2 transition-colors ${
			mode === 'login'
				? 'bg-[#137fec] text-white shadow-lg shadow-blue-500/20'
				: 'text-slate-400 hover:text-slate-200'
		}`}
		type="button"
		on:click={() => dispatch('change', 'login')}
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
		on:click={() => dispatch('change', 'register')}
	>
		Sign Up
	</button>
</div>
