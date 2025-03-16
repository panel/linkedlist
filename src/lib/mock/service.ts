/**
 * Mock data service
 * This mimics the API interactions we'll eventually have with Supabase
 */

import { v4 as uuidv4 } from 'uuid';
import { links, notes, labels, linkLabels, getCurrentUser } from './data';
import type { Link, Note, Label, LinkLabel, LinkWithNotes, LinkWithLabels, LinkFull } from '$lib/types';

// Helper function to create a deep copy of an object
function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Mock delay to simulate network requests
async function delay(ms = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// LINK OPERATIONS

export async function getLinks(): Promise<Link[]> {
  await delay();
  return clone(links);
}

export async function getLinkById(id: string): Promise<Link | undefined> {
  await delay();
  return clone(links.find(link => link.id === id));
}

export async function getLinksByUser(userId: string): Promise<Link[]> {
  await delay();
  return clone(links.filter(link => link.userId === userId));
}

export async function getLinkWithNotes(id: string): Promise<LinkWithNotes | undefined> {
  await delay();
  const link = links.find(link => link.id === id);
  if (!link) return undefined;
  
  const linkNotes = notes.filter(note => note.linkId === id);
  return {
    ...clone(link),
    notes: clone(linkNotes)
  };
}

export async function getLinkWithLabels(id: string): Promise<LinkWithLabels | undefined> {
  await delay();
  const link = links.find(link => link.id === id);
  if (!link) return undefined;
  
  const labelIds = linkLabels
    .filter(ll => ll.linkId === id)
    .map(ll => ll.labelId);
  
  const linkLabelsData = labels.filter(label => labelIds.includes(label.id));
  
  return {
    ...clone(link),
    labels: clone(linkLabelsData)
  };
}

export async function getFullLink(id: string): Promise<LinkFull | undefined> {
  await delay();
  const link = links.find(link => link.id === id);
  if (!link) return undefined;
  
  const linkNotes = notes.filter(note => note.linkId === id);
  const labelIds = linkLabels
    .filter(ll => ll.linkId === id)
    .map(ll => ll.labelId);
  
  const linkLabelsData = labels.filter(label => labelIds.includes(label.id));
  
  return {
    ...clone(link),
    notes: clone(linkNotes),
    labels: clone(linkLabelsData)
  };
}

export async function createLink(linkData: Omit<Link, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Link> {
  await delay();
  const user = getCurrentUser();
  const now = new Date();
  
  const newLink: Link = {
    id: `link-${uuidv4()}`,
    userId: user.id,
    ...linkData,
    createdAt: now,
    updatedAt: now
  };
  
  links.push(newLink);
  return clone(newLink);
}

export async function updateLink(id: string, linkData: Partial<Omit<Link, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Link | undefined> {
  await delay();
  const linkIndex = links.findIndex(link => link.id === id);
  if (linkIndex === -1) return undefined;
  
  links[linkIndex] = {
    ...links[linkIndex],
    ...linkData,
    updatedAt: new Date()
  };
  
  return clone(links[linkIndex]);
}

export async function deleteLink(id: string): Promise<boolean> {
  await delay();
  const linkIndex = links.findIndex(link => link.id === id);
  if (linkIndex === -1) return false;
  
  // Delete associated notes
  const linkNoteIndices = notes
    .map((note, index) => note.linkId === id ? index : -1)
    .filter(index => index !== -1)
    .sort((a, b) => b - a); // Sort in descending order to avoid index shifting
  
  linkNoteIndices.forEach(index => {
    notes.splice(index, 1);
  });
  
  // Delete associated link-label relationships
  const linkLabelIndices = linkLabels
    .map((ll, index) => ll.linkId === id ? index : -1)
    .filter(index => index !== -1)
    .sort((a, b) => b - a);
  
  linkLabelIndices.forEach(index => {
    linkLabels.splice(index, 1);
  });
  
  // Delete the link
  links.splice(linkIndex, 1);
  return true;
}

// NOTE OPERATIONS

export async function getNotesByLink(linkId: string): Promise<Note[]> {
  await delay();
  return clone(notes.filter(note => note.linkId === linkId));
}

export async function createNote(noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
  await delay();
  const now = new Date();
  
  const newNote: Note = {
    id: `note-${uuidv4()}`,
    ...noteData,
    createdAt: now,
    updatedAt: now
  };
  
  notes.push(newNote);
  return clone(newNote);
}

export async function updateNote(id: string, noteData: Partial<Omit<Note, 'id' | 'linkId' | 'createdAt' | 'updatedAt'>>): Promise<Note | undefined> {
  await delay();
  const noteIndex = notes.findIndex(note => note.id === id);
  if (noteIndex === -1) return undefined;
  
  notes[noteIndex] = {
    ...notes[noteIndex],
    ...noteData,
    updatedAt: new Date()
  };
  
  return clone(notes[noteIndex]);
}

export async function deleteNote(id: string): Promise<boolean> {
  await delay();
  const noteIndex = notes.findIndex(note => note.id === id);
  if (noteIndex === -1) return false;
  
  notes.splice(noteIndex, 1);
  return true;
}

// LABEL OPERATIONS

export async function getLabels(userId: string): Promise<Label[]> {
  await delay();
  return clone(labels.filter(label => label.userId === userId));
}

export async function createLabel(name: string): Promise<Label> {
  await delay();
  const user = getCurrentUser();
  
  const newLabel: Label = {
    id: `label-${uuidv4()}`,
    userId: user.id,
    name,
    createdAt: new Date()
  };
  
  labels.push(newLabel);
  return clone(newLabel);
}

export async function updateLabel(id: string, name: string): Promise<Label | undefined> {
  await delay();
  const labelIndex = labels.findIndex(label => label.id === id);
  if (labelIndex === -1) return undefined;
  
  labels[labelIndex] = {
    ...labels[labelIndex],
    name
  };
  
  return clone(labels[labelIndex]);
}

export async function deleteLabel(id: string): Promise<boolean> {
  await delay();
  const labelIndex = labels.findIndex(label => label.id === id);
  if (labelIndex === -1) return false;
  
  // Delete associated link-label relationships
  const linkLabelIndices = linkLabels
    .map((ll, index) => ll.labelId === id ? index : -1)
    .filter(index => index !== -1)
    .sort((a, b) => b - a);
  
  linkLabelIndices.forEach(index => {
    linkLabels.splice(index, 1);
  });
  
  // Delete the label
  labels.splice(labelIndex, 1);
  return true;
}

// LINK-LABEL OPERATIONS

export async function addLabelToLink(linkId: string, labelId: string): Promise<boolean> {
  await delay();
  // Check if link and label exist
  const linkExists = links.some(link => link.id === linkId);
  const labelExists = labels.some(label => label.id === labelId);
  
  if (!linkExists || !labelExists) return false;
  
  // Check if the relationship already exists
  const relationshipExists = linkLabels.some(ll => ll.linkId === linkId && ll.labelId === labelId);
  if (relationshipExists) return true;
  
  // Add the relationship
  linkLabels.push({ linkId, labelId });
  return true;
}

export async function removeLabelFromLink(linkId: string, labelId: string): Promise<boolean> {
  await delay();
  const index = linkLabels.findIndex(ll => ll.linkId === linkId && ll.labelId === labelId);
  if (index === -1) return false;
  
  linkLabels.splice(index, 1);
  return true;
}

export async function getLabelsByLink(linkId: string): Promise<Label[]> {
  await delay();
  const labelIds = linkLabels
    .filter(ll => ll.linkId === linkId)
    .map(ll => ll.labelId);
  
  return clone(labels.filter(label => labelIds.includes(label.id)));
}

export async function getLinksByLabel(labelId: string): Promise<Link[]> {
  await delay();
  const linkIds = linkLabels
    .filter(ll => ll.labelId === labelId)
    .map(ll => ll.linkId);
  
  return clone(links.filter(link => linkIds.includes(link.id)));
}