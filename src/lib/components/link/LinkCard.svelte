<script lang="ts">
  import type { Link, Label } from '$lib/types';
  
  let { 
    link,
    labels = [],
    showActions = true,
    showNoteCount = true
  } = $props<{
    link: Link;
    labels?: Label[];
    showActions?: boolean;
    showNoteCount?: boolean;
  }>();
  
  // Format date to readable string
  function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  // Truncate text if it's too long
  function truncate(text: string, length = 120): string {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
  }
</script>

<div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
  <div class="p-5">
    <div class="flex justify-between items-start mb-2">
      <h3 class="text-xl font-semibold text-blue-800">
        <a href={link.url} target="_blank" rel="noopener noreferrer" class="hover:underline">
          {link.title}
        </a>
      </h3>
      <div class="flex gap-2">
        {#if link.isPermanent}
          <span class="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">Permanent</span>
        {:else}
          <span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Temporal</span>
        {/if}
        
        {#if link.isPublic}
          <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Public</span>
        {:else}
          <span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Private</span>
        {/if}
      </div>
    </div>
    
    {#if link.description}
      <p class="text-gray-600 mb-4">{truncate(link.description)}</p>
    {/if}
    
    <div class="flex flex-wrap gap-2 mb-4">
      {#each labels as label}
        <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{label.name}</span>
      {/each}
    </div>
    
    <div class="flex justify-between items-center text-sm text-gray-500">
      <div>Added {formatDate(link.createdAt)}</div>
      
      {#if showNoteCount}
        <div class="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <span>3 notes</span> <!-- This will be dynamic in a real implementation -->
        </div>
      {/if}
    </div>
    
    {#if showActions}
      <div class="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
        <a href={`/links/${link.id}`} class="text-blue-600 hover:text-blue-800 text-sm font-medium">
          View Details
        </a>
        <a href={`/links/${link.id}/edit`} class="text-gray-600 hover:text-gray-800 text-sm font-medium">
          Edit
        </a>
      </div>
    {/if}
  </div>
</div>