<script lang="ts">
	export let rowCount = 0;
	export let previewRows: string[][] = [];
</script>

{#if rowCount}
	<div class="rounded-xl border border-slate-700 bg-[#15202b] p-5 shadow-sm">
		<p class="text-sm font-semibold text-slate-300">Preview ({rowCount} rows)</p>
		<div class="mt-3 space-y-2 text-sm text-slate-300">
			{#each previewRows as row}
				<div class="rounded-lg bg-[#1c2936] px-3 py-2">
					{row.join(' | ')}
				</div>
			{/each}
		</div>
	</div>
{/if}
