<script lang="ts">
  import { links, labels } from '$lib/stores';
  import LinkCard from '$lib/components/link/LinkCard.svelte';
  import { onMount } from 'svelte';
  
  // State for filtering links
  let filterType = 'all'; // all, permanent, temporal, public, private
  let selectedLabel = '';
  let searchTerm = '';
  
  // Load data on mount
  onMount(async () => {
    await links.refresh();
    await labels.refresh();
  });
  
  // Derived store for filtered links
  $: filteredLinks = $links.filter(link => {
    // Filter by type
    if (filterType === 'permanent' && !link.isPermanent) return false;
    if (filterType === 'temporal' && link.isPermanent) return false;
    if (filterType === 'public' && !link.isPublic) return false;
    if (filterType === 'private' && link.isPublic) return false;
    
    // Filter by search term
    if (searchTerm && !link.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        (!link.description || !link.description.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }
    
    // For label filtering we would need to check if the link has the selected label
    // In a full implementation, this would work with the labels store
    
    return true;
  });
</script>

<div>
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">My Links</h1>
    <a
      href="/links/new"
      class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
    >
      Add New Link
    </a>
  </div>

  <div class="bg-white p-4 rounded-lg shadow mb-6">
    <div class="flex flex-col md:flex-row gap-4">
      <div class="flex-grow">
        <input
          type="text"
          placeholder="Search links..."
          class="w-full border-gray-300 rounded-lg"
          bind:value={searchTerm}
        />
      </div>
      
      <div class="flex gap-4">
        <select class="border-gray-300 rounded-lg" bind:value={filterType}>
          <option value="all">All Links</option>
          <option value="permanent">Permanent</option>
          <option value="temporal">Temporal</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        
        <select class="border-gray-300 rounded-lg" bind:value={selectedLabel}>
          <option value="">All Labels</option>
          {#each $labels as label}
            <option value={label.id}>{label.name}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>

  {#if filteredLinks.length === 0}
    <div class="text-center py-16">
      <p class="text-gray-500 text-lg">No links found matching your filters.</p>
      <button
        class="mt-4 text-blue-600 hover:text-blue-800"
        on:click={() => {
          filterType = 'all';
          selectedLabel = '';
          searchTerm = '';
        }}
      >
        Clear Filters
      </button>
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-6">
      {#each filteredLinks as link}
        <LinkCard
          link={link}
          labels={$labels.filter(label => 
            // In a real implementation, we would check if link has this label
            // For now, we're just showing some random labels for demonstration
            Math.random() > 0.5
          )}
        />
      {/each}
    </div>
  {/if}
</div>