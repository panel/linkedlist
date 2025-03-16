import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as services from '$lib/server/services';

// POST /api/notes - Create a new note
export const POST: RequestHandler = async ({ request }) => {
  try {
    const noteData = await request.json();
    const newNote = await services.createNote(noteData);
    return json(newNote);
  } catch (error) {
    console.error('Error creating note:', error);
    return json({ error: 'Failed to create note' }, { status: 500 });
  }
};