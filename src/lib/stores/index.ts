/**
 * Application state stores using Svelte 5's built-in reactivity
 */

import { readable, writable, derived } from 'svelte/store';
import type { User, Link, Note, Label, LinkFull } from '$lib/types';
// Import our API layer which will access either mock or real data based on environment settings
import * as api from '$lib/api';
import { goto } from '$app/navigation';

// User store - will be updated with actual user information through hooks
export const user = writable<User | null>(null);

// Authentication store
function createAuthStore() {
  const { subscribe, set, update } = writable({
    isAuthenticated: false,
    isLoading: true
  });

  return {
    subscribe,
    check: async () => {
      set({ isAuthenticated: false, isLoading: true });
      
      try {
        // Call API endpoint to check if user is authenticated
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        set({
          isAuthenticated: !!data.authenticated,
          isLoading: false
        });
        
        return data.authenticated;
      } catch (error) {
        console.error('Error checking authentication:', error);
        set({ isAuthenticated: false, isLoading: false });
        return false;
      }
    },
    logout: async () => {
      set({ isAuthenticated: false, isLoading: true });
      
      try {
        // Use our logout endpoint
        await fetch('/auth/logout');
        set({ isAuthenticated: false, isLoading: false });
        goto('/login');
      } catch (error) {
        console.error('Error during logout:', error);
        set({ isAuthenticated: false, isLoading: false });
      }
    }
  };
}

export const auth = createAuthStore();

// Links store
function createLinksStore() {
  const { subscribe, set, update } = writable<Link[]>([]);

  return {
    subscribe,
    refresh: async () => {
      const links = await api.getLinks();
      set(links);
    },
    add: async (linkData: Omit<Link, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      const newLink = await api.createLink(linkData);
      update(links => [...links, newLink]);
      return newLink;
    },
    update: async (id: string, linkData: Partial<Omit<Link, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
      const updatedLink = await api.updateLink(id, linkData);
      if (updatedLink) {
        update(links => links.map(link => link.id === id ? updatedLink : link));
      }
      return updatedLink;
    },
    remove: async (id: string) => {
      const success = await api.deleteLink(id);
      if (success) {
        update(links => links.filter(link => link.id !== id));
      }
      return success;
    }
  };
}

export const links = createLinksStore();

// Active link store for detailed view
function createActiveLinkStore() {
  const { subscribe, set, update } = writable<LinkFull | null>(null);

  return {
    subscribe,
    load: async (id: string) => {
      const link = await api.getFullLink(id);
      set(link || null);
      return link;
    },
    clear: () => set(null),
    addNote: async (content: string) => {
      let linkId = '';
      
      const unsubscribe = subscribe(link => {
        if (link) linkId = link.id;
      });
      unsubscribe();
      
      if (!linkId) return null;
      
      const newNote = await api.createNote({
        linkId,
        content,
        isPublished: false
      });
      
      if (newNote) {
        update((link: LinkFull | null) => link && ({
          ...link,
          notes: [...link.notes, newNote]
        }));
      }
      
      return newNote;
    },
    updateNote: async (noteId: string, content: string) => {
      const updatedNote = await api.updateNote(noteId, { content });
      
      if (updatedNote) {
        update((link: LinkFull | null) => {
          if (!link) return null;
          
          return {
            ...link,
            notes: link.notes.map((note: Note) =>
              note.id === noteId ? updatedNote : note
            )
          };
        });
      }
      
      return updatedNote;
    },
    deleteNote: async (noteId: string) => {
      const success = await api.deleteNote(noteId);
      
      if (success) {
        update((link: LinkFull | null) => {
          if (!link) return null;
          
          return {
            ...link,
            notes: link.notes.filter((note: Note) => note.id !== noteId)
          };
        });
      }
      
      return success;
    },
    addLabel: async (labelId: string) => {
      let linkId = '';
      
      const unsubscribe = subscribe(link => {
        if (link) linkId = link.id;
      });
      unsubscribe();
      
      if (!linkId) return false;
      
      const success = await api.addLabelToLink(linkId, labelId);
      
      if (success) {
        // Reload the link to get the updated labels
        const updatedLink = await api.getFullLink(linkId);
        if (updatedLink) {
          set(updatedLink);
        }
      }
      
      return success;
    },
    removeLabel: async (labelId: string) => {
      let linkId = '';
      
      const unsubscribe = subscribe(link => {
        if (link) linkId = link.id;
      });
      unsubscribe();
      
      if (!linkId) return false;
      
      const success = await api.removeLabelFromLink(linkId, labelId);
      
      if (success) {
        update((link: LinkFull | null) => {
          if (!link) return null;
          
          return {
            ...link,
            labels: link.labels.filter((label: Label) => label.id !== labelId)
          };
        });
      }
      
      return success;
    }
  };
}

export const activeLink = createActiveLinkStore();

// Labels store
function createLabelsStore() {
  const { subscribe, set, update } = writable<Label[]>([]);

  return {
    subscribe,
    refresh: async () => {
      const labels = await api.getLabels();
      set(labels);
    },
    add: async (name: string) => {
      const newLabel = await api.createLabel(name);
      update(labels => [...labels, newLabel]);
      return newLabel;
    },
    update: async (id: string, name: string) => {
      const updatedLabel = await api.updateLabel(id, name);
      if (updatedLabel) {
        update(labels => labels.map(label => label.id === id ? updatedLabel : label));
      }
      return updatedLabel;
    },
    remove: async (id: string) => {
      const success = await api.deleteLabel(id);
      if (success) {
        update(labels => labels.filter(label => label.id !== id));
      }
      return success;
    }
  };
}

export const labels = createLabelsStore();

// Create a store for selected label IDs
export const selectedLabelIds = writable<string[]>([]);

// Filtered links store
function createFilteredLinksStore() {
  const { subscribe, set } = writable<Link[]>([]);
  let currentLinks: Link[] = [];
  let currentLabelIds: string[] = [];
  
  // Update the filtered links whenever the links or selected labels change
  links.subscribe(newLinks => {
    currentLinks = newLinks;
    updateFilteredLinks();
  });
  
  selectedLabelIds.subscribe(newLabelIds => {
    currentLabelIds = newLabelIds;
    updateFilteredLinks();
  });
  
  // Function to fetch and update filtered links
  async function updateFilteredLinks() {
    // If no labels selected, use all links
    if (currentLabelIds.length === 0) {
      set(currentLinks);
      return;
    }
    
    try {
      // Get links for each selected label
      const labelLinkPromises = currentLabelIds.map(labelId =>
        api.getLinksByLabel(labelId)
      );
      
      const labelLinksArrays = await Promise.all(labelLinkPromises);
      
      // Combine all links and remove duplicates by ID
      const allLinks: Link[] = [];
      const seenIds = new Set<string>();
      
      for (const linkArray of labelLinksArrays) {
        for (const link of linkArray) {
          if (!seenIds.has(link.id)) {
            seenIds.add(link.id);
            allLinks.push(link);
          }
        }
      }
      
      set(allLinks);
    } catch (error) {
      console.error('Error filtering links by labels:', error);
      set(currentLinks); // Fall back to all links if there's an error
    }
  }
  
  return {
    subscribe,
    refresh: updateFilteredLinks
  };
}

export const filteredLinks = createFilteredLinksStore();