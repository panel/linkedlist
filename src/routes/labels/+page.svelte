<script lang="ts">
  import { labels } from '$lib/stores';
  import { onMount } from 'svelte';
  
  // State for the new label form
  let newLabelName = $state('');
  let isCreating = $state(false);
  let error = $state('');
  
  // State for editing
  let editingLabelId = $state<string | null>(null);
  let editingLabelName = $state('');
  
  // Load labels on mount
  onMount(async () => {
    await labels.refresh();
  });
  
  async function createLabel() {
    if (!newLabelName.trim()) {
      error = 'Label name cannot be empty';
      return;
    }
    
    error = '';
    isCreating = true;
    
    try {
      await labels.add(newLabelName);
      newLabelName = '';
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to create label';
    } finally {
      isCreating = false;
    }
  }
  
  function startEditing(labelId: string, name: string) {
    editingLabelId = labelId;
    editingLabelName = name;
  }
  
  async function saveEdit() {
    if (!editingLabelId) return;
    
    if (!editingLabelName.trim()) {
      error = 'Label name cannot be empty';
      return;
    }
    
    error = '';
    
    try {
      await labels.update(editingLabelId, editingLabelName);
      editingLabelId = null;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to update label';
    }
  }
  
  async function deleteLabel(labelId: string) {
    if (!confirm('Are you sure you want to delete this label? This action cannot be undone.')) {
      return;
    }
    
    try {
      await labels.remove(labelId);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to delete label';
    }
  }
</script>

<div>
  <h1 class="text-2xl font-bold mb-6">Manage Labels</h1>
  
  {#if error}
    <div class="bg-red-50 text-red-800 p-4 rounded-lg mb-6">
      {error}
    </div>
  {/if}
  
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
    <!-- New Label Form -->
    <div class="md:col-span-1">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-semibold mb-4">Create New Label</h2>
        
        <form on:submit|preventDefault={createLabel} class="space-y-4">
          <div>
            <label for="labelName" class="block text-sm font-medium text-gray-700 mb-1">Label Name</label>
            <input
              type="text"
              id="labelName"
              class="w-full border-gray-300 rounded-lg"
              placeholder="Enter label name"
              bind:value={newLabelName}
              required
            />
          </div>
          
          <button
            type="submit"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : 'Create Label'}
          </button>
        </form>
      </div>
    </div>
    
    <!-- Labels List -->
    <div class="md:col-span-2">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-semibold mb-4">Your Labels</h2>
        
        {#if $labels.length === 0}
          <p class="text-gray-500 text-center py-8">You haven't created any labels yet.</p>
        {:else}
          <ul class="space-y-4">
            {#each $labels as label}
              <li class="border border-gray-200 rounded-lg p-4">
                {#if editingLabelId === label.id}
                  <form on:submit|preventDefault={saveEdit} class="flex gap-2">
                    <input
                      type="text"
                      class="flex-grow border-gray-300 rounded-lg"
                      bind:value={editingLabelName}
                      required
                    />
                    <button
                      type="submit"
                      class="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-3 rounded"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-3 rounded"
                      on:click={() => editingLabelId = null}
                    >
                      Cancel
                    </button>
                  </form>
                {:else}
                  <div class="flex justify-between items-center">
                    <div class="flex items-center gap-2">
                      <span class="font-medium">{label.name}</span>
                      <span class="text-xs text-gray-500">Created {new Date(label.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div class="flex gap-2">
                      <button
                        class="text-blue-600 hover:text-blue-800"
                        on:click={() => startEditing(label.id, label.name)}
                      >
                        Edit
                      </button>
                      <button
                        class="text-red-600 hover:text-red-800"
                        on:click={() => deleteLabel(label.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  </div>
</div>