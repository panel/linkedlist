<script lang="ts">
  let {
    title = 'LinkedList',
    children,
    showSidebar = true
  } = $props<{
    title?: string;
    children: any;
    showSidebar?: boolean;
  }>();
</script>

<div class="min-h-screen bg-gray-50">
  <header class="bg-blue-700 text-white shadow-md">
    <div class="container mx-auto px-4 py-4 flex justify-between items-center">
      <h1 class="text-2xl font-bold">
        <a href="/" class="flex items-center gap-2">
          <span class="text-3xl">🔗</span>
          <span>{title}</span>
        </a>
      </h1>
      <nav>
        <ul class="flex gap-6">
          <li><a href="/" class="hover:underline">Home</a></li>
          <li><a href="/links" class="hover:underline">My Links</a></li>
          <li><a href="/labels" class="hover:underline">Labels</a></li>
        </ul>
      </nav>
    </div>
  </header>
  
  <main class="container mx-auto px-4 py-8">
    {#if showSidebar}
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside class="md:col-span-1">
          <div class="bg-white rounded-lg shadow p-4">
            <h2 class="text-lg font-semibold mb-4">Quick Links</h2>
            <ul class="space-y-2">
              <li><a href="/links/new" class="text-blue-600 hover:underline">Add New Link</a></li>
              <li><a href="/links?filter=permanent" class="text-blue-600 hover:underline">Permanent Links</a></li>
              <li><a href="/links?filter=temporal" class="text-blue-600 hover:underline">Temporal Links</a></li>
              <li><a href="/links?filter=public" class="text-blue-600 hover:underline">Public Links</a></li>
            </ul>
            
            <h2 class="text-lg font-semibold mt-6 mb-4">Labels</h2>
            <ul class="space-y-2">
              <!-- We'll dynamically render labels here later -->
              <li><a href="/links?label=svelte" class="text-blue-600 hover:underline">Svelte</a></li>
              <li><a href="/links?label=framework" class="text-blue-600 hover:underline">Framework</a></li>
              <li><a href="/links?label=css" class="text-blue-600 hover:underline">CSS</a></li>
              <li><a href="/links?label=favorites" class="text-blue-600 hover:underline">Favorites</a></li>
            </ul>
          </div>
        </aside>
        
        <div class="md:col-span-3">
          {@render children()}
        </div>
      </div>
    {:else}
      {@render children()}
    {/if}
  </main>
  
  <footer class="bg-gray-200 py-6 mt-12">
    <div class="container mx-auto px-4 text-center text-gray-600">
      <p>LinkedList - Save and organize your links with notes</p>
    </div>
  </footer>
</div>