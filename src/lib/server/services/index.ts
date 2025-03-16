/**
 * Service layer for LinkedList
 * This module decides whether to use mock or real Supabase services
 * based on the environment configuration.
 */

import * as mockServices from '$lib/mock/service';
import * as supabaseServices from './supabase';
import { useRealData } from '$lib/server/db';
import { getCurrentUser as getMockUser } from '$lib/mock/data';

// Log which service implementation we're using
console.log(`Using ${useRealData ? 'Supabase' : 'mock'} data services`);

// Export all service methods, choosing the appropriate implementation
// based on the useRealData flag

// LINK OPERATIONS
export const getLinks = useRealData 
  ? supabaseServices.getLinks 
  : mockServices.getLinks;

export const getLinkById = useRealData 
  ? supabaseServices.getLinkById 
  : mockServices.getLinkById;

export const getLinksByUser = useRealData 
  ? supabaseServices.getLinksByUser 
  : mockServices.getLinksByUser;

export const getLinkWithNotes = useRealData 
  ? supabaseServices.getLinkWithNotes 
  : mockServices.getLinkWithNotes;

export const getLinkWithLabels = useRealData 
  ? supabaseServices.getLinkWithLabels 
  : mockServices.getLinkWithLabels;

export const getFullLink = useRealData 
  ? supabaseServices.getFullLink 
  : mockServices.getFullLink;

export const createLink = useRealData 
  ? supabaseServices.createLink 
  : mockServices.createLink;

export const updateLink = useRealData 
  ? supabaseServices.updateLink 
  : mockServices.updateLink;

export const deleteLink = useRealData 
  ? supabaseServices.deleteLink 
  : mockServices.deleteLink;

// NOTE OPERATIONS
export const getNotesByLink = useRealData 
  ? supabaseServices.getNotesByLink 
  : mockServices.getNotesByLink;

export const createNote = useRealData 
  ? supabaseServices.createNote 
  : mockServices.createNote;

export const updateNote = useRealData 
  ? supabaseServices.updateNote 
  : mockServices.updateNote;

export const deleteNote = useRealData 
  ? supabaseServices.deleteNote 
  : mockServices.deleteNote;

// LABEL OPERATIONS
export const getLabels = useRealData 
  ? supabaseServices.getLabels 
  : mockServices.getLabels;

export const createLabel = useRealData 
  ? supabaseServices.createLabel 
  : mockServices.createLabel;

export const updateLabel = useRealData 
  ? supabaseServices.updateLabel 
  : mockServices.updateLabel;

export const deleteLabel = useRealData 
  ? supabaseServices.deleteLabel 
  : mockServices.deleteLabel;

// LINK-LABEL OPERATIONS
export const addLabelToLink = useRealData 
  ? supabaseServices.addLabelToLink 
  : mockServices.addLabelToLink;

export const removeLabelFromLink = useRealData 
  ? supabaseServices.removeLabelFromLink 
  : mockServices.removeLabelFromLink;

export const getLabelsByLink = useRealData 
  ? supabaseServices.getLabelsByLink 
  : mockServices.getLabelsByLink;

export const getLinksByLabel = useRealData 
  ? supabaseServices.getLinksByLabel 
  : mockServices.getLinksByLabel;

// AUTH & USER OPERATIONS
// The mock service imports getCurrentUser but doesn't export it
// so we create an async wrapper for consistency with the Supabase implementation
export const getCurrentUser = useRealData 
  ? supabaseServices.getCurrentUser 
  : async () => getMockUser();