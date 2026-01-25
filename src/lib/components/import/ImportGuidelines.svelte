<script lang="ts">
	export let sampleHref = '/flashcards.csv';
</script>

<div class="rounded-xl border border-slate-700 bg-[#15202b] p-5 shadow-sm">
	<div class="flex flex-col gap-4">
		<div class="flex items-start gap-3">
			<span class="material-symbols-outlined text-[#137fec]">info</span>
			<div class="flex flex-col gap-1">
				<p class="text-base font-bold text-white">Formatting Requirements</p>
				<p class="text-sm leading-relaxed text-slate-400">
					Your CSV should contain at least two columns. We recommend three columns in this order:
				</p>
				<ul class="mt-1 ml-1 list-inside list-disc space-y-1 text-sm text-slate-400">
					<li>Column 1: <strong>Word</strong> (Kanji)</li>
					<li>Column 2: <strong>Reading</strong> (Kana)</li>
					<li>Column 3: <strong>Meaning</strong> (English)</li>
				</ul>
			</div>
		</div>
		<div class="h-px w-full bg-slate-700"></div>
		<a
			class="group flex items-center justify-between text-sm font-bold text-[#137fec] transition-colors hover:text-blue-500"
			href={sampleHref}
			download
		>
			<span>Download Sample CSV</span>
			<span
				class="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1"
				>arrow_forward</span
			>
		</a>
	</div>
</div>
