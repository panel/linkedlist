<script lang="ts">
  import { auth } from '$lib/stores';
  import type { PageData } from './$types';
  
  // Get page data from loader using Svelte 5 approach
  const props = $props();
  let { data } = props;
  
  let error = $state(data.error || '');
  let isLoading = $state(false);
</script>

<div class="flex items-center justify-center min-h-screen bg-gray-100">
  <div class="w-full max-w-md">
    <div class="bg-white rounded-lg shadow-md p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-blue-700 flex items-center justify-center gap-2">
          <span class="text-4xl">🔗</span>
          <span>LinkedList</span>
        </h1>
        <p class="text-gray-600 mt-2">Sign in to manage your links</p>
      </div>
      
      {#if error}
        <div class="bg-red-50 text-red-800 p-4 rounded-lg mb-6 text-sm">
          {error}
        </div>
      {/if}
      
      <div class="flex flex-col space-y-4">
        <a 
          href="/auth/github" 
          class="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span>Continue with GitHub</span>
        </a>
        
        <button 
          disabled 
          class="flex items-center justify-center gap-2 bg-gray-100 text-gray-400 font-medium py-3 px-4 rounded-lg cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 10h-2v2h2v6h3v-6h1.82l.18-2h-2v-.833c0-.478.096-.667.558-.667h1.442v-2.5h-2.404c-1.798 0-2.596.792-2.596 2.308v1.692z"/>
          </svg>
          <span>Bluesky (Coming Soon)</span>
        </button>
        
        <button 
          disabled
          class="flex items-center justify-center gap-2 bg-gray-100 text-gray-400 font-medium py-3 px-4 rounded-lg cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2.5 11.5c.414-1.346 1.048-3.012 2.5-3.5v-1c-.135 0-1.437.102-2.5 1.5-1.063-1.398-2.365-1.5-2.5-1.5v1c1.452.488 2.086 2.154 2.5 3.5zm5.5-3.5c-.135 0-1.437.102-2.5 1.5-1.063-1.398-2.365-1.5-2.5-1.5v1c1.452.488 2.086 2.154 2.5 3.5.414-1.346 1.048-3.012 2.5-3.5v-1z"/>
          </svg>
          <span>Google (Coming Soon)</span>
        </button>
      </div>
      
      <div class="mt-6 text-center text-sm text-gray-500">
        <p>Click "Continue with GitHub" to sign in or create an account</p>
      </div>
    </div>
  </div>
</div>