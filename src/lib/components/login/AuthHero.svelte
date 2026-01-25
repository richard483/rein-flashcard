<script lang="ts">
	import heroImage from '$lib/assets/flashcard-mountain.png';

	export let brandName = 'FlashCard JP';
	export let heading = 'Okaeri';
	export let subheading = 'Master Japanese, one card at a time.';
	export let backgroundUrl = heroImage;
</script>

<div class="relative z-10 px-4 pt-4 pb-2">
	<div
		class="relative h-48 w-full overflow-hidden rounded-xl bg-cover bg-center shadow-lg"
		style={`background-image: url("${backgroundUrl}")`}
	>
		<div class="absolute inset-0 bg-gradient-to-t from-[#101922]/80 to-transparent"></div>
		<div class="absolute bottom-4 left-4 flex items-center gap-2">
			<span class="material-symbols-outlined text-3xl text-white">style</span>
			<span class="text-lg font-bold tracking-wide text-white/90">{brandName}</span>
		</div>
	</div>
</div>

<div class="relative z-10 px-6 pt-4">
	<div class="mb-8 text-center">
		<h1 class="mb-2 text-3xl font-bold tracking-tight text-white">{heading}</h1>
		<p class="text-base font-normal text-slate-400">{subheading}</p>
	</div>
</div>
