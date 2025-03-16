/**
 * Mock data for development
 * This will be used until we integrate with Supabase
 */

import type { User, Link, Note, Label, LinkLabel } from '$lib/types';

// Mock Users
export const users: User[] = [
  {
    id: 'user-1',
    email: 'demo@example.com',
    createdAt: new Date('2025-01-01')
  }
];

// Mock Links
export const links: Link[] = [
  {
    id: 'link-1',
    userId: 'user-1',
    url: 'https://svelte.dev',
    title: 'Svelte - Cybernetically enhanced web apps',
    description: 'Svelte is a radical new approach to building user interfaces',
    isPermanent: true,
    isPublic: true,
    createdAt: new Date('2025-02-01'),
    updatedAt: new Date('2025-02-01')
  },
  {
    id: 'link-2',
    userId: 'user-1',
    url: 'https://kit.svelte.dev',
    title: 'SvelteKit',
    description: 'The fastest way to build Svelte apps',
    isPermanent: true,
    isPublic: true,
    createdAt: new Date('2025-02-02'),
    updatedAt: new Date('2025-02-02')
  },
  {
    id: 'link-3',
    userId: 'user-1',
    url: 'https://tailwindcss.com',
    title: 'Tailwind CSS',
    description: 'A utility-first CSS framework',
    isPermanent: false,
    isPublic: false,
    createdAt: new Date('2025-02-03'),
    updatedAt: new Date('2025-02-03')
  }
];

// Mock Notes
export const notes: Note[] = [
  {
    id: 'note-1',
    linkId: 'link-1',
    content: 'Svelte is really easy to use compared to other frameworks',
    isPublished: true,
    createdAt: new Date('2025-02-01T10:00:00'),
    updatedAt: new Date('2025-02-01T10:00:00')
  },
  {
    id: 'note-2',
    linkId: 'link-1',
    content: 'The reactivity system in Svelte is amazing, very intuitive',
    isPublished: false,
    createdAt: new Date('2025-02-01T11:30:00'),
    updatedAt: new Date('2025-02-01T11:30:00')
  },
  {
    id: 'note-3',
    linkId: 'link-2',
    content: 'SvelteKit makes building full-stack applications much simpler',
    isPublished: true,
    createdAt: new Date('2025-02-02T09:15:00'),
    updatedAt: new Date('2025-02-02T09:15:00')
  },
  {
    id: 'note-4',
    linkId: 'link-3',
    content: 'Tailwind makes styling so much faster once you learn the utility classes',
    isPublished: false,
    createdAt: new Date('2025-02-03T14:20:00'),
    updatedAt: new Date('2025-02-03T14:20:00')
  }
];

// Mock Labels
export const labels: Label[] = [
  {
    id: 'label-1',
    userId: 'user-1',
    name: 'Svelte',
    createdAt: new Date('2025-01-15')
  },
  {
    id: 'label-2',
    userId: 'user-1',
    name: 'Framework',
    createdAt: new Date('2025-01-15')
  },
  {
    id: 'label-3',
    userId: 'user-1',
    name: 'CSS',
    createdAt: new Date('2025-01-16')
  },
  {
    id: 'label-4',
    userId: 'user-1',
    name: 'Favorites',
    createdAt: new Date('2025-01-17')
  }
];

// Mock Link-Label relationships
export const linkLabels: LinkLabel[] = [
  { linkId: 'link-1', labelId: 'label-1' },
  { linkId: 'link-1', labelId: 'label-2' },
  { linkId: 'link-1', labelId: 'label-4' },
  { linkId: 'link-2', labelId: 'label-1' },
  { linkId: 'link-2', labelId: 'label-2' },
  { linkId: 'link-3', labelId: 'label-3' }
];

// Helper function to get current logged-in user (for mock purposes)
export function getCurrentUser(): User {
  return users[0];
}