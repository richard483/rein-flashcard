<script lang="ts">
	export let fileName = '';
	export let onChange: (event: Event) => void;
</script>

<label
	for="csvUpload"
	class="group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-[#137fec]/40 bg-[#15202b] px-6 py-12 transition-all hover:border-[#137fec]/70 hover:bg-[#1a2633]"
>
	<div class="flex flex-col items-center gap-3 text-center">
		<div
			class="flex h-16 w-16 items-center justify-center rounded-full bg-[#137fec]/10 text-[#137fec] transition-transform group-hover:scale-110"
		>
			<span class="material-symbols-outlined text-[32px]">cloud_upload</span>
		</div>
		<div class="space-y-1">
			<p class="text-base font-bold text-white">
				{fileName ? 'Replace CSV' : 'Upload CSV'}
			</p>
			<p class="text-sm text-slate-400">Tap to browse or drag CSV file here</p>
		</div>
	</div>
	{#if fileName}
		<div class="rounded-lg border border-slate-700 bg-[#1c2936] px-4 py-2 text-xs text-slate-300">
			Selected: {fileName}
		</div>
	{/if}
	<div
		class="pointer-events-none flex h-10 items-center justify-center rounded-lg bg-[#137fec] px-6 text-sm font-bold text-white shadow-sm"
	>
		Select File
	</div>
	<input id="csvUpload" class="hidden" type="file" accept=".csv" on:change={onChange} />
</label>
