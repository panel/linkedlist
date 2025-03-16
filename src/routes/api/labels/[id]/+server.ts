import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as services from '$lib/server/services';

// PATCH /api/labels/[id] - Update a specific label
export const PATCH: RequestHandler = async ({ params, request }) => {
  try {
    const { name } = await request.json();
    const updatedLabel = await services.updateLabel(params.id, name);
    
    if (!updatedLabel) {
      return json({ error: 'Label not found' }, { status: 404 });
    }
    
    return json(updatedLabel);
  } catch (error) {
    console.error(`Error updating label ${params.id}:`, error);
    return json({ error: 'Failed to update label' }, { status: 500 });
  }
};

// DELETE /api/labels/[id] - Delete a specific label
export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const success = await services.deleteLabel(params.id);
    
    if (!success) {
      return json({ error: 'Failed to delete label' }, { status: 400 });
    }
    
    return json({ success: true });
  } catch (error) {
    console.error(`Error deleting label ${params.id}:`, error);
    return json({ error: 'Failed to delete label' }, { status: 500 });
  }
};