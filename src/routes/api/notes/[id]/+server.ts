import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as services from '$lib/server/services';

// PATCH /api/notes/[id] - Update a specific note
export const PATCH: RequestHandler = async ({ params, request }) => {
  try {
    const noteData = await request.json();
    const updatedNote = await services.updateNote(params.id, noteData);
    
    if (!updatedNote) {
      return json({ error: 'Note not found' }, { status: 404 });
    }
    
    return json(updatedNote);
  } catch (error) {
    console.error(`Error updating note ${params.id}:`, error);
    return json({ error: 'Failed to update note' }, { status: 500 });
  }
};

// DELETE /api/notes/[id] - Delete a specific note
export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const success = await services.deleteNote(params.id);
    
    if (!success) {
      return json({ error: 'Failed to delete note' }, { status: 400 });
    }
    
    return json({ success: true });
  } catch (error) {
    console.error(`Error deleting note ${params.id}:`, error);
    return json({ error: 'Failed to delete note' }, { status: 500 });
  }
};