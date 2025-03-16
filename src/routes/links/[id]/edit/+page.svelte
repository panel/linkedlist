<script lang="ts">
  import { page } from '$app/stores';
  import { links, activeLink } from '$lib/stores';
  import LinkForm from '$lib/components/link/LinkForm.svelte';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  let loading = $state(true);
  let error = $state('');
  
  onMount(async () => {
    try {
      // Load the link based on the ID in the URL
      const linkId = $page.params.id;
      await activeLink.load(linkId);
      
      if (!$activeLink) {
        error = 'Link not found';
      }
      
      loading = false;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load link';
      loading = false;
    }
  });
  
  async function handleSubmit(formData: any) {
    if (!$activeLink) return;
    
    // Update the link using the store
    await links.update($activeLink.id, {
      url: formData.url,
      title: formData.title,
      description: formData.description,
      isPermanent: formData.isPermanent,
      isPublic: formData.isPublic
    });
    
    // In a real implementation, we would also update the selected labels
    
    // Navigate to the link details page
    goto(`/links/${$activeLink.id}`);
  }
</script>

<div>
  <div class="flex items-center gap-4 mb-6">
    <a href={`/links/${$page.params.id}`} class="text-blue-600 hover:underline flex items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
      Back to Link
    </a>
    <h1 class="text-2xl font-bold">Edit Link</h1>
  </div>
  
  {#if loading}
    <div class="text-center py-8">
      <p class="text-gray-500">Loading link details...</p>
    </div>
  {:else if error}
    <div class="bg-red-50 text-red-800 p-4 rounded-lg">
      {error}
    </div>
  {:else if $activeLink}
    <div class="bg-white rounded-lg shadow-md p-6">
      <LinkForm
        link={$activeLink}
        submitLabel="Update Link"
        onSubmit={handleSubmit}
      />
    </div>
  {/if}
</div>