<script lang="ts">
  import { page } from '$app/stores';
  import { activeLink } from '$lib/stores';
  import { onMount } from 'svelte';
  
  // Note form state
  let newNote = $state('');
  let isAddingNote = $state(false);
  let noteError = $state('');
  
  // Load the link based on the ID in the URL
  onMount(async () => {
    const linkId = $page.params.id;
    await activeLink.load(linkId);
  });
  
  // Format date to readable string
  function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  }
  
  async function addNote() {
    if (!newNote.trim()) {
      noteError = 'Note content cannot be empty';
      return;
    }
    
    noteError = '';
    isAddingNote = true;
    
    try {
      await activeLink.addNote(newNote);
      newNote = '';
    } catch (e) {
      noteError = e instanceof Error ? e.message : 'Failed to add note';
    } finally {
      isAddingNote = false;
    }
  }
</script>

<div>
  {#if $activeLink}
    <div class="mb-8">
      <div class="flex items-center gap-4 mb-4">
        <a href="/links" class="text-blue-600 hover:underline flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Links
        </a>
        <h1 class="text-2xl font-bold">{$activeLink.title}</h1>
      </div>
      
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <a 
                href={$activeLink.url} 
                target="_blank" 
                rel="noopener noreferrer"
                class="text-blue-600 hover:underline flex items-center gap-1"
              >
                {$activeLink.url}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
              
              {#if $activeLink.description}
                <p class="text-gray-600 mt-2">{$activeLink.description}</p>
              {/if}
            </div>
            
            <div class="flex gap-2">
              {#if $activeLink.isPermanent}
                <span class="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">Permanent</span>
              {:else}
                <span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Temporal</span>
              {/if}
              
              {#if $activeLink.isPublic}
                <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Public</span>
              {:else}
                <span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Private</span>
              {/if}
            </div>
          </div>
          
          <div class="flex flex-wrap gap-2 mb-4">
            {#each $activeLink.labels as label}
              <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{label.name}</span>
            {/each}
          </div>
          
          <div class="text-sm text-gray-500 flex justify-between">
            <div>Added {formatDate($activeLink.createdAt)}</div>
            <div>Last updated {formatDate($activeLink.updatedAt)}</div>
          </div>
          
          <div class="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
            <a href={`/links/${$activeLink.id}/edit`} class="text-gray-600 hover:text-gray-800 text-sm font-medium">
              Edit Link
            </a>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Notes Section -->
    <div class="mt-8">
      <h2 class="text-xl font-semibold mb-4">Notes</h2>
      
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-medium mb-3">Add a Note</h3>
        
        {#if noteError}
          <div class="bg-red-50 text-red-800 p-3 rounded mb-3 text-sm">
            {noteError}
          </div>
        {/if}
        
        <textarea
          class="w-full border-gray-300 rounded-lg"
          rows="3"
          placeholder="Add a note about this link..."
          bind:value={newNote}
        ></textarea>
        
        <div class="flex justify-end mt-3">
          <button
            class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
            on:click={addNote}
            disabled={isAddingNote}
          >
            {isAddingNote ? 'Adding...' : 'Add Note'}
          </button>
        </div>
      </div>
      
      {#if $activeLink.notes.length === 0}
        <p class="text-gray-500 text-center py-8">No notes yet. Add your first note above.</p>
      {:else}
        <div class="space-y-4">
          {#each $activeLink.notes as note}
            <div class="bg-white rounded-lg shadow-md p-5">
              <div class="mb-3 whitespace-pre-wrap">{note.content}</div>
              
              <div class="flex justify-between items-center text-sm text-gray-500">
                <div>
                  {formatDate(note.createdAt)}
                </div>
                <div class="flex gap-4">
                  {#if note.isPublished}
                    <span class="text-green-600 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Published
                    </span>
                  {:else}
                    <button class="text-blue-600 hover:text-blue-800">Publish</button>
                  {/if}
                  <button class="text-blue-600 hover:text-blue-800">Edit</button>
                  <button class="text-red-600 hover:text-red-800">Delete</button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {:else}
    <div class="text-center py-16">
      <p class="text-gray-500 text-lg">Loading link details...</p>
    </div>
  {/if}
</div>