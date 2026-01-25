<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	type AuthMode = 'login' | 'register';

	export let mode: AuthMode = 'login';

	const dispatch = createEventDispatcher<{ toggle: void }>();
</script>

<div class="mt-auto pt-8 text-center">
	<p class="text-sm text-slate-400">
		{mode === 'login' ? "Don't have an account?" : 'Already registered?'}
		<button
			type="button"
			class="ml-1 font-semibold text-[#137fec] hover:text-blue-400"
			on:click={() => dispatch('toggle')}
		>
			{mode === 'login' ? 'Sign Up' : 'Sign In'}
		</button>
	</p>
</div>
