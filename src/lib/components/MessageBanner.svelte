<script lang="ts">
	export let message = '';
	export let variant: 'error' | 'success' = 'error';

	const styles = {
		error: 'border-red-200 bg-red-50 text-red-600',
		success: 'border-green-800 bg-green-900/30 text-green-300'
	} as const;

	$: variantStyle = styles[variant];
</script>

{#if message}
	<p class={`rounded-lg border px-4 py-3 text-sm ${variantStyle}`}>
		{message}
	</p>
{/if}
