<script lang="ts">
	import '../app.css';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	let { children } = $props();
</script>

<AppLayout>
	{@render children()}
</AppLayout>
