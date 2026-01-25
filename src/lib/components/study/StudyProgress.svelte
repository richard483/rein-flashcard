<script lang="ts">
	export let completedCount = 0;
	export let cardCount = 0;
	export let stashCount = 0;
	export let sessionPhase: 'main' | 'stash' | 'done' = 'main';

	$: progressValue =
		cardCount === 0 ? 0 : Math.min(100, Math.round((completedCount / cardCount) * 100));
	$: progressWidth = progressValue === 0 ? 0 : Math.max(4, progressValue);
</script>

<div class="flex flex-col gap-2 px-6 py-2">
	<div class="flex items-end justify-between">
		<span class="text-xs font-medium tracking-wider text-slate-400 uppercase">Session Progress</span
		>
		<span class="text-sm font-bold text-green-400">{completedCount}/{cardCount}</span>
	</div>
	<div class="h-3 w-full overflow-hidden rounded-full bg-slate-800">
		<div
			class="h-full rounded-full bg-green-500 transition-[width] duration-300"
			style={`width: ${progressWidth}%;`}
		></div>
	</div>
	{#if stashCount > 0 && sessionPhase !== 'done'}
		<p class="text-xs text-slate-500">Stash queued: {stashCount}</p>
	{/if}
</div>
