<script lang="ts">
  import type { Link } from '$lib/types';
  import { labels } from '$lib/stores';
  import { onMount } from 'svelte';
  
  let {
    link = null,
    submitLabel = 'Save Link',
    onSubmit
  } = $props<{
    link?: Link | null;
    submitLabel?: string;
    onSubmit: (formData: any) => Promise<void>;
  }>();
  
  // Form state
  let title = $state(link?.title || '');
  let url = $state(link?.url || '');
  let description = $state(link?.description || '');
  let isPermanent = $state(link?.isPermanent || false);
  let isPublic = $state(link?.isPublic || false);
  let selectedLabelIds = $state<string[]>([]); // Would be populated from link.labels in a real implementation
  
  let isSubmitting = $state(false);
  let error = $state('');
  
  onMount(async () => {
    // Load labels if not loaded
    if ($labels.length === 0) {
      await labels.refresh();
    }
    
    // In a real implementation, we would populate selectedLabelIds from link.labels
  });
  
  function toggleLabel(labelId: string) {
    if (selectedLabelIds.includes(labelId)) {
      selectedLabelIds = selectedLabelIds.filter(id => id !== labelId);
    } else {
      selectedLabelIds = [...selectedLabelIds, labelId];
    }
  }
  
  async function handleSubmit() {
    error = '';
    
    // Basic validation
    if (!title.trim()) {
      error = 'Title is required';
      return;
    }
    
    if (!url.trim()) {
      error = 'URL is required';
      return;
    }
    
    try {
      // Validate URL
      new URL(url);
    } catch (e) {
      error = 'Please enter a valid URL';
      return;
    }
    
    isSubmitting = true;
    
    try {
      await onSubmit({
        title,
        url,
        description,
        isPermanent,
        isPublic,
        labelIds: selectedLabelIds
      });
    } catch (e) {
      error = e instanceof Error ? e.message : 'An error occurred';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<form class="space-y-6" on:submit|preventDefault={handleSubmit}>
  {#if error}
    <div class="bg-red-50 text-red-800 p-4 rounded-lg">
      {error}
    </div>
  {/if}
  
  <div>
    <label for="url" class="block text-sm font-medium text-gray-700 mb-1">URL</label>
    <input
      type="url"
      id="url"
      class="w-full border-gray-300 rounded-lg"
      placeholder="https://example.com"
      bind:value={url}
      required
    />
  </div>
  
  <div>
    <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
    <input
      type="text"
      id="title"
      class="w-full border-gray-300 rounded-lg"
      placeholder="Link title"
      bind:value={title}
      required
    />
  </div>
  
  <div>
    <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
    <textarea
      id="description"
      class="w-full border-gray-300 rounded-lg"
      rows="3"
      placeholder="Add a description..."
      bind:value={description}
    ></textarea>
  </div>
  
  <div class="flex flex-col md:flex-row gap-6">
    <div>
      <label class="flex items-center gap-2">
        <input
          type="checkbox"
          class="rounded border-gray-300 text-blue-600"
          bind:checked={isPermanent}
        />
        <span class="text-sm font-medium text-gray-700">Permanent Link</span>
      </label>
      <p class="text-xs text-gray-500 mt-1 ml-6">Permanent links are kept indefinitely. Temporal links may be archived.</p>
    </div>
    
    <div>
      <label class="flex items-center gap-2">
        <input
          type="checkbox"
          class="rounded border-gray-300 text-blue-600"
          bind:checked={isPublic}
        />
        <span class="text-sm font-medium text-gray-700">Public Link</span>
      </label>
      <p class="text-xs text-gray-500 mt-1 ml-6">Public links can be shared with others. Private links are only visible to you.</p>
    </div>
  </div>
  
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">Labels</label>
    <div class="flex flex-wrap gap-2">
      {#each $labels as label}
        <button
          type="button"
          class={`px-3 py-1 text-sm rounded-full transition-colors ${
            selectedLabelIds.includes(label.id)
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
          on:click={() => toggleLabel(label.id)}
        >
          {label.name}
        </button>
      {/each}
      
      {#if $labels.length === 0}
        <p class="text-sm text-gray-500">No labels created yet. You can create labels from the Labels page.</p>
      {/if}
    </div>
  </div>
  
  <div class="flex justify-end gap-4">
    <a
      href="/links"
      class="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
    >
      Cancel
    </a>
    <button
      type="submit"
      class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
      disabled={isSubmitting}
    >
      {isSubmitting ? 'Saving...' : submitLabel}
    </button>
  </div>
</form>