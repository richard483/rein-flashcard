<script lang="ts">
	export let title: string;
	export let description: string;

	$: hasAction = Boolean($$slots.action);
</script>

<div class="rounded-2xl border border-dashed border-slate-700 bg-[#15202b] p-6 text-center">
	<p class="text-sm font-semibold text-slate-200">{title}</p>
	<p class="mt-2 text-xs text-slate-400">{description}</p>
	{#if hasAction}
		<div class="mt-4 inline-flex items-center justify-center">
			<slot name="action"></slot>
		</div>
	{/if}
</div>
