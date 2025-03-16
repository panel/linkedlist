/**
 * Client-side API module for communicating with the server.
 * Provides methods to access server data and services.
 */

import type { Link, Note, Label, LinkFull } from '$lib/types';

// Generic fetch helper with error handling
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(endpoint, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`API error: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// LINK OPERATIONS

export async function getLinks(): Promise<Link[]> {
  return apiFetch<Link[]>('/api/links');
}

export async function getLinkById(id: string): Promise<Link | undefined> {
  return apiFetch<Link | undefined>(`/api/links/${id}`);
}

export async function getFullLink(id: string): Promise<LinkFull | undefined> {
  return apiFetch<LinkFull | undefined>(`/api/links/${id}/full`);
}

export async function createLink(linkData: Omit<Link, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Link> {
  return apiFetch<Link>('/api/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(linkData)
  });
}

export async function updateLink(id: string, linkData: Partial<Omit<Link, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Link | undefined> {
  return apiFetch<Link | undefined>(`/api/links/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(linkData)
  });
}

export async function deleteLink(id: string): Promise<boolean> {
  return apiFetch<boolean>(`/api/links/${id}`, {
    method: 'DELETE'
  });
}

// NOTE OPERATIONS

export async function createNote(noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
  return apiFetch<Note>('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(noteData)
  });
}

export async function updateNote(id: string, noteData: Partial<Omit<Note, 'id' | 'linkId' | 'createdAt' | 'updatedAt'>>): Promise<Note | undefined> {
  return apiFetch<Note | undefined>(`/api/notes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(noteData)
  });
}

export async function deleteNote(id: string): Promise<boolean> {
  return apiFetch<boolean>(`/api/notes/${id}`, {
    method: 'DELETE'
  });
}

// LABEL OPERATIONS

export async function getLabels(): Promise<Label[]> {
  return apiFetch<Label[]>('/api/labels');
}

export async function createLabel(name: string): Promise<Label> {
  return apiFetch<Label>('/api/labels', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
}

export async function updateLabel(id: string, name: string): Promise<Label | undefined> {
  return apiFetch<Label | undefined>(`/api/labels/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
}

export async function deleteLabel(id: string): Promise<boolean> {
  return apiFetch<boolean>(`/api/labels/${id}`, {
    method: 'DELETE'
  });
}

// LINK-LABEL OPERATIONS

export async function addLabelToLink(linkId: string, labelId: string): Promise<boolean> {
  return apiFetch<boolean>(`/api/links/${linkId}/labels/${labelId}`, {
    method: 'PUT'
  });
}

export async function removeLabelFromLink(linkId: string, labelId: string): Promise<boolean> {
  return apiFetch<boolean>(`/api/links/${linkId}/labels/${labelId}`, {
    method: 'DELETE'
  });
}

export async function getLinksByLabel(labelId: string): Promise<Link[]> {
  return apiFetch<Link[]>(`/api/labels/${labelId}/links`);
}