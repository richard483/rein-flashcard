<script lang="ts">
	export let brandName = 'FlashCard JP';
	export let heading = 'Okaeri';
	export let subheading = 'Master Japanese, one card at a time.';
	export let backgroundUrl =
		'https://lh3.googleusercontent.com/aida-public/AB6AXuC0fKQdFf733JKblJGceZMNwh4_nTcXvJxW8a1Y3xX5G7INdnrFoMEf4d105EmwV7Qdwv6pNrDDBREzOxYra8YDmj7GdwJJoeBj6gdIa_f9qf-avvCYRNXVg6OoJr3UziDZl5099LRzxN0lysrKA7twvp6OzekfRoxnmoyuxIB2PxDeYRd29frgiX-arWGu9ibGK3d3nYMpSTd7gHlmkZySmus_O7VZTY0VXUbeCJDmTK3xRKhZwvntJ8rj1L8X9UXsVn3VYOT9kR4';
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
