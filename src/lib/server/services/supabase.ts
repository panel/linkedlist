/**
 * Real data services using Supabase
 * These implementations match the interface of the mock services
 */

import { supabase } from '$lib/server/db';
import type { Link, Note, Label, LinkLabel, LinkWithNotes, LinkWithLabels, LinkFull } from '$lib/types';

// Helper function to ensure Supabase client is available
function getSupabase() {
  if (!supabase) {
    throw new Error('Supabase client is not available. Check your environment configuration.');
  }
  return supabase;
}

// Helper function to convert Supabase dates to JavaScript Date objects
function convertDates<T>(data: any): T {
  if (!data) return data;
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => convertDates<any>(item)) as unknown as T;
  }
  
  // Handle objects
  if (typeof data === 'object' && data !== null) {
    const result: any = { ...data };
    
    // Convert date fields
    if (result.created_at) result.createdAt = new Date(result.created_at);
    if (result.updated_at) result.updatedAt = new Date(result.updated_at);
    
    // Remove original snake_case fields
    if (result.created_at) delete result.created_at;
    if (result.updated_at) delete result.updated_at;
    
    // Convert nested objects
    for (const key in result) {
      if (typeof result[key] === 'object' && result[key] !== null) {
        result[key] = convertDates(result[key]);
      }
    }
    
    return result as T;
  }
  
  return data as T;
}

// Error handling helper
function handleError(error: any): never {
  console.error('Supabase operation failed:', error);
  throw new Error(`Database operation failed: ${error.message || 'Unknown error'}`);
}

// LINK OPERATIONS

export async function getLinks(): Promise<Link[]> {
  const { data, error } = await getSupabase()
    .from('link')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) handleError(error);
  return convertDates<Link[]>(data || []);
}

export async function getLinkById(id: string): Promise<Link | undefined> {
  const { data, error } = await getSupabase()
    .from('link')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error && error.code !== 'PGRST116') handleError(error);
  return data ? convertDates<Link>(data) : undefined;
}

export async function getLinksByUser(userId: string): Promise<Link[]> {
  const { data, error } = await getSupabase()
    .from('link')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) handleError(error);
  return convertDates<Link[]>(data || []);
}

export async function getLinkWithNotes(id: string): Promise<LinkWithNotes | undefined> {
  // Get the link first
  const link = await getLinkById(id);
  if (!link) return undefined;
  
  // Get the notes for this link
  const { data: notesData, error: notesError } = await getSupabase()
    .from('note')
    .select('*')
    .eq('link_id', id)
    .order('created_at', { ascending: true });
    
  if (notesError) handleError(notesError);
  
  // Combine and return
  return {
    ...link,
    notes: convertDates<Note[]>(notesData || [])
  };
}

export async function getLinkWithLabels(id: string): Promise<LinkWithLabels | undefined> {
  // Get the link first
  const link = await getLinkById(id);
  if (!link) return undefined;
  
  // Get label IDs associated with this link
  const { data: linkLabelData, error: linkLabelError } = await getSupabase()
    .from('link_label')
    .select('label_id')
    .eq('link_id', id);
    
  if (linkLabelError) handleError(linkLabelError);
  
  // Extract label IDs
  const labelIds = (linkLabelData || []).map(ll => ll.label_id);
  
  // Get the labels if there are any
  let labels: Label[] = [];
  if (labelIds.length > 0) {
    const { data: labelsData, error: labelsError } = await getSupabase()
      .from('label')
      .select('*')
      .in('id', labelIds);
      
    if (labelsError) handleError(labelsError);
    labels = convertDates<Label[]>(labelsData || []);
  }
  
  // Combine and return
  return {
    ...link,
    labels
  };
}

export async function getFullLink(id: string): Promise<LinkFull | undefined> {
  // Get the link first
  const link = await getLinkById(id);
  if (!link) return undefined;
  
  // Get the notes for this link
  const { data: notesData, error: notesError } = await getSupabase()
    .from('note')
    .select('*')
    .eq('link_id', id)
    .order('created_at', { ascending: true });
    
  if (notesError) handleError(notesError);
  
  // Get label IDs associated with this link
  const { data: linkLabelData, error: linkLabelError } = await getSupabase()
    .from('link_label')
    .select('label_id')
    .eq('link_id', id);
    
  if (linkLabelError) handleError(linkLabelError);
  
  // Extract label IDs
  const labelIds = (linkLabelData || []).map(ll => ll.label_id);
  
  // Get the labels if there are any
  let labels: Label[] = [];
  if (labelIds.length > 0) {
    const { data: labelsData, error: labelsError } = await getSupabase()
      .from('label')
      .select('*')
      .in('id', labelIds);
      
    if (labelsError) handleError(labelsError);
    labels = convertDates<Label[]>(labelsData || []);
  }
  
  // Combine and return
  return {
    ...link,
    notes: convertDates<Note[]>(notesData || []),
    labels
  };
}

export async function createLink(linkData: Omit<Link, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Link> {
  const now = new Date().toISOString();
  const user = await getCurrentUser(); // We'll need to implement this
  
  // Prepare the data to match Supabase column names
  const data = {
    user_id: user.id,
    url: linkData.url,
    title: linkData.title,
    description: linkData.description || null,
    is_permanent: linkData.isPermanent,
    is_public: linkData.isPublic,
    created_at: now,
    updated_at: now
  };
  
  const { data: result, error } = await getSupabase()
    .from('link')
    .insert(data)
    .select()
    .single();
    
  if (error) handleError(error);
  return convertDates<Link>(result);
}

export async function updateLink(id: string, linkData: Partial<Omit<Link, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Link | undefined> {
  // Prepare the data to match Supabase column names
  const data: any = {
    updated_at: new Date().toISOString()
  };
  
  if (linkData.url !== undefined) data.url = linkData.url;
  if (linkData.title !== undefined) data.title = linkData.title;
  if (linkData.description !== undefined) data.description = linkData.description;
  if (linkData.isPermanent !== undefined) data.is_permanent = linkData.isPermanent;
  if (linkData.isPublic !== undefined) data.is_public = linkData.isPublic;
  
  const { data: result, error } = await getSupabase()
    .from('link')
    .update(data)
    .eq('id', id)
    .select()
    .single();
    
  if (error) handleError(error);
  return convertDates<Link>(result);
}

export async function deleteLink(id: string): Promise<boolean> {
  // Delete associated notes first (cascading delete in the database would be better)
  const { error: noteDeleteError } = await getSupabase()
    .from('note')
    .delete()
    .eq('link_id', id);
    
  if (noteDeleteError) handleError(noteDeleteError);
  
  // Delete associated link-label relationships
  const { error: linkLabelDeleteError } = await getSupabase()
    .from('link_label')
    .delete()
    .eq('link_id', id);
    
  if (linkLabelDeleteError) handleError(linkLabelDeleteError);
  
  // Delete the link
  const { error } = await getSupabase()
    .from('link')
    .delete()
    .eq('id', id);
    
  if (error) handleError(error);
  return true;
}

// NOTE OPERATIONS

export async function getNotesByLink(linkId: string): Promise<Note[]> {
  const { data, error } = await getSupabase()
    .from('note')
    .select('*')
    .eq('link_id', linkId)
    .order('created_at', { ascending: true });
    
  if (error) handleError(error);
  return convertDates<Note[]>(data || []);
}

export async function createNote(noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
  const now = new Date().toISOString();
  
  // Prepare the data to match Supabase column names
  const data = {
    link_id: noteData.linkId,
    content: noteData.content,
    is_published: noteData.isPublished,
    created_at: now,
    updated_at: now
  };
  
  const { data: result, error } = await getSupabase()
    .from('note')
    .insert(data)
    .select()
    .single();
    
  if (error) handleError(error);
  return convertDates<Note>(result);
}

export async function updateNote(id: string, noteData: Partial<Omit<Note, 'id' | 'linkId' | 'createdAt' | 'updatedAt'>>): Promise<Note | undefined> {
  // Prepare the data to match Supabase column names
  const data: any = {
    updated_at: new Date().toISOString()
  };
  
  if (noteData.content !== undefined) data.content = noteData.content;
  if (noteData.isPublished !== undefined) data.is_published = noteData.isPublished;
  
  const { data: result, error } = await getSupabase()
    .from('note')
    .update(data)
    .eq('id', id)
    .select()
    .single();
    
  if (error) handleError(error);
  return convertDates<Note>(result);
}

export async function deleteNote(id: string): Promise<boolean> {
  const { error } = await getSupabase()
    .from('note')
    .delete()
    .eq('id', id);
    
  if (error) handleError(error);
  return true;
}

// LABEL OPERATIONS

export async function getLabels(userId: string): Promise<Label[]> {
  const { data, error } = await getSupabase()
    .from('label')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });
    
  if (error) handleError(error);
  return convertDates<Label[]>(data || []);
}

export async function createLabel(name: string): Promise<Label> {
  const user = await getCurrentUser(); // We'll need to implement this
  const now = new Date().toISOString();
  
  // Prepare the data to match Supabase column names
  const data = {
    user_id: user.id,
    name,
    created_at: now
  };
  
  const { data: result, error } = await getSupabase()
    .from('label')
    .insert(data)
    .select()
    .single();
    
  if (error) handleError(error);
  return convertDates<Label>(result);
}

export async function updateLabel(id: string, name: string): Promise<Label | undefined> {
  const { data, error } = await getSupabase()
    .from('label')
    .update({ name })
    .eq('id', id)
    .select()
    .single();
    
  if (error) handleError(error);
  return convertDates<Label>(data);
}

export async function deleteLabel(id: string): Promise<boolean> {
  // Delete associated link-label relationships first
  const { error: linkLabelDeleteError } = await getSupabase()
    .from('link_label')
    .delete()
    .eq('label_id', id);
    
  if (linkLabelDeleteError) handleError(linkLabelDeleteError);
  
  // Delete the label
  const { error } = await getSupabase()
    .from('label')
    .delete()
    .eq('id', id);
    
  if (error) handleError(error);
  return true;
}

// LINK-LABEL OPERATIONS

export async function addLabelToLink(linkId: string, labelId: string): Promise<boolean> {
  // Check if the relationship already exists
  const { data: existingData, error: existingError } = await getSupabase()
    .from('link_label')
    .select('*')
    .eq('link_id', linkId)
    .eq('label_id', labelId);
    
  if (existingError) handleError(existingError);
  
  // If the relationship already exists, we're done
  if (existingData && existingData.length > 0) {
    return true;
  }
  
  // Create the relationship
  const { error } = await getSupabase()
    .from('link_label')
    .insert({ link_id: linkId, label_id: labelId });
    
  if (error) handleError(error);
  return true;
}

export async function removeLabelFromLink(linkId: string, labelId: string): Promise<boolean> {
  const { error } = await getSupabase()
    .from('link_label')
    .delete()
    .eq('link_id', linkId)
    .eq('label_id', labelId);
    
  if (error) handleError(error);
  return true;
}

export async function getLabelsByLink(linkId: string): Promise<Label[]> {
  // Get label IDs associated with this link
  const { data: linkLabelData, error: linkLabelError } = await getSupabase()
    .from('link_label')
    .select('label_id')
    .eq('link_id', linkId);
    
  if (linkLabelError) handleError(linkLabelError);
  
  // Extract label IDs
  const labelIds = (linkLabelData || []).map(ll => ll.label_id);
  
  // If no labels, return empty array
  if (labelIds.length === 0) {
    return [];
  }
  
  // Get the labels
  const { data: labelsData, error: labelsError } = await getSupabase()
    .from('label')
    .select('*')
    .in('id', labelIds);
    
  if (labelsError) handleError(labelsError);
  return convertDates<Label[]>(labelsData || []);
}

export async function getLinksByLabel(labelId: string): Promise<Link[]> {
  // Get link IDs associated with this label
  const { data: linkLabelData, error: linkLabelError } = await getSupabase()
    .from('link_label')
    .select('link_id')
    .eq('label_id', labelId);
    
  if (linkLabelError) handleError(linkLabelError);
  
  // Extract link IDs
  const linkIds = (linkLabelData || []).map(ll => ll.link_id);
  
  // If no links, return empty array
  if (linkIds.length === 0) {
    return [];
  }
  
  // Get the links
  const { data: linksData, error: linksError } = await getSupabase()
    .from('link')
    .select('*')
    .in('id', linkIds)
    .order('created_at', { ascending: false });
    
  if (linksError) handleError(linksError);
  return convertDates<Link[]>(linksData || []);
}

// AUTH & USER OPERATIONS

// Temporary implementation to match the mock service
// This will be replaced with actual Lucia auth implementation
export async function getCurrentUser(): Promise<{ id: string; email: string }> {
  return { id: 'user-1', email: 'demo@example.com' };
}