<script lang="ts">
	export let deckName = '';
	export let inputId = 'deckName';
	export let placeholder = 'e.g. JLPT N5 Core';
</script>

<div class="rounded-xl border border-slate-700 bg-[#15202b] p-5 shadow-sm">
	<label class="text-sm font-semibold text-slate-300" for={inputId}>Deck name</label>
	<input
		id={inputId}
		class="mt-2 h-11 w-full rounded-lg border border-slate-700 bg-[#1c2936] px-4 text-sm text-white placeholder-slate-500 focus:border-[#137fec] focus:ring-2 focus:ring-[#137fec]/50 focus:outline-none"
		{placeholder}
		type="text"
		bind:value={deckName}
		required
	/>
</div>
