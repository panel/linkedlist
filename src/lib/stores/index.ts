/**
 * Application state stores using Svelte 5's built-in reactivity
 */

import { readable, writable, derived } from 'svelte/store';
import type { User, Link, Note, Label, LinkFull } from '$lib/types';
import { getCurrentUser } from '$lib/mock/data';
import * as mockService from '$lib/mock/service';

// User store
export const user = readable<User>(getCurrentUser());

// Links store
function createLinksStore() {
  const { subscribe, set, update } = writable<Link[]>([]);

  return {
    subscribe,
    refresh: async () => {
      const links = await mockService.getLinks();
      set(links);
    },
    add: async (linkData: Omit<Link, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      const newLink = await mockService.createLink(linkData);
      update(links => [...links, newLink]);
      return newLink;
    },
    update: async (id: string, linkData: Partial<Omit<Link, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
      const updatedLink = await mockService.updateLink(id, linkData);
      if (updatedLink) {
        update(links => links.map(link => link.id === id ? updatedLink : link));
      }
      return updatedLink;
    },
    remove: async (id: string) => {
      const success = await mockService.deleteLink(id);
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
      const link = await mockService.getFullLink(id);
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
      
      const newNote = await mockService.createNote({
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
      const updatedNote = await mockService.updateNote(noteId, { content });
      
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
      const success = await mockService.deleteNote(noteId);
      
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
      
      const success = await mockService.addLabelToLink(linkId, labelId);
      
      if (success) {
        const label = (await mockService.getLabels(getCurrentUser().id))
          .find(l => l.id === labelId);
        
        if (label) {
          update((link: LinkFull | null) => {
            if (!link) return null;
            
            return {
              ...link,
              labels: [...link.labels, label]
            };
          });
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
      
      const success = await mockService.removeLabelFromLink(linkId, labelId);
      
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
      const userLabels = await mockService.getLabels(getCurrentUser().id);
      set(userLabels);
    },
    add: async (name: string) => {
      const newLabel = await mockService.createLabel(name);
      update(labels => [...labels, newLabel]);
      return newLabel;
    },
    update: async (id: string, name: string) => {
      const updatedLabel = await mockService.updateLabel(id, name);
      if (updatedLabel) {
        update(labels => labels.map(label => label.id === id ? updatedLabel : label));
      }
      return updatedLabel;
    },
    remove: async (id: string) => {
      const success = await mockService.deleteLabel(id);
      if (success) {
        update(labels => labels.filter(label => label.id !== id));
      }
      return success;
    }
  };
}

export const labels = createLabelsStore();

// Filtered links store
export const filteredLinks = derived(
  [links, writable<string[]>([])], 
  ([$links, $selectedLabelIds]) => {
    if ($selectedLabelIds.length === 0) return $links;
    
    return $links.filter(link => {
      // We would do a proper check here if we had the labels for each link
      // For now, we'll simulate this functionality
      return mockService.getLabelsByLink(link.id).then(linkLabels => {
        const linkLabelIds = linkLabels.map(label => label.id);
        return $selectedLabelIds.some(labelId => linkLabelIds.includes(labelId));
      });
    });
  }
);

// Authentication store (mock)
function createAuthStore() {
  const { subscribe, set } = writable({
    isAuthenticated: true,
    isLoading: false
  });

  return {
    subscribe,
    login: async (email: string, password: string) => {
      set({ isAuthenticated: false, isLoading: true });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      set({ isAuthenticated: true, isLoading: false });
      return true;
    },
    logout: async () => {
      set({ isAuthenticated: false, isLoading: true });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set({ isAuthenticated: false, isLoading: false });
    }
  };
}

export const auth = createAuthStore();