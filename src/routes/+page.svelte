<script lang="ts">
  import { links, labels } from '$lib/stores';
  import { onMount } from 'svelte';
  
  // Load mock data on mount
  onMount(async () => {
    await links.refresh();
    await labels.refresh();
  });
</script>

<div class="flex flex-col items-center">
  <div class="max-w-3xl w-full text-center">
    <h1 class="text-3xl md:text-4xl font-bold mb-4">Welcome to LinkedList</h1>
    <p class="text-xl text-gray-600 mb-8">Save, organize, and keep notes on your favorite links</p>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div class="bg-white p-6 rounded-lg shadow-md text-center">
        <div class="text-4xl font-bold text-blue-600 mb-2">{$links.length}</div>
        <div class="text-gray-600">Saved Links</div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-md text-center">
        <div class="text-4xl font-bold text-indigo-600 mb-2">{$links.filter(link => link.isPermanent).length}</div>
        <div class="text-gray-600">Permanent Links</div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-md text-center">
        <div class="text-4xl font-bold text-purple-600 mb-2">{$links.filter(link => !link.isPermanent).length}</div>
        <div class="text-gray-600">Temporal Links</div>
      </div>
    </div>
    
    <div class="flex flex-col md:flex-row gap-4 justify-center mb-16">
      <a href="/links/new" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
        Add New Link
      </a>
      <a href="/links" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors">
        Browse Your Links
      </a>
    </div>
    
    <div class="bg-gray-100 p-8 rounded-lg">
      <h2 class="text-2xl font-semibold mb-4">How it works</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div class="text-3xl mb-2">🔗</div>
          <h3 class="text-lg font-semibold mb-2">Save Links</h3>
          <p class="text-gray-600">Add any URL to your collection, categorize it, and decide if it's permanent or temporal.</p>
        </div>
        
        <div>
          <div class="text-3xl mb-2">📝</div>
          <h3 class="text-lg font-semibold mb-2">Add Notes</h3>
          <p class="text-gray-600">Attach chronological notes to each link, creating a timeline of your thoughts and observations.</p>
        </div>
        
        <div>
          <div class="text-3xl mb-2">🏷️</div>
          <h3 class="text-lg font-semibold mb-2">Organize with Labels</h3>
          <p class="text-gray-600">Tag links with custom labels to create a flexible organization system that works for you.</p>
        </div>
      </div>
    </div>
  </div>
</div>
