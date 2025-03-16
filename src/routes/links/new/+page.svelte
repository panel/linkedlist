<script lang="ts">
  import { links } from '$lib/stores';
  import LinkForm from '$lib/components/link/LinkForm.svelte';
  import { goto } from '$app/navigation';
  
  async function handleSubmit(formData: any) {
    // Create new link using the store
    const newLink = await links.add({
      url: formData.url,
      title: formData.title,
      description: formData.description,
      isPermanent: formData.isPermanent,
      isPublic: formData.isPublic
    });
    
    // In a real implementation, we would also add the selected labels
    
    // Navigate to the links list
    goto('/links');
  }
</script>

<div>
  <h1 class="text-2xl font-bold mb-6">Add New Link</h1>
  
  <div class="bg-white rounded-lg shadow-md p-6">
    <LinkForm submitLabel="Add Link" onSubmit={handleSubmit} />
  </div>
</div>