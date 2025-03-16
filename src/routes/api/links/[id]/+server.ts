import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as services from '$lib/server/services';

// GET /api/links/[id] - Get a specific link
export const GET: RequestHandler = async ({ params }) => {
  try {
    const link = await services.getLinkById(params.id);
    
    if (!link) {
      return json({ error: 'Link not found' }, { status: 404 });
    }
    
    return json(link);
  } catch (error) {
    console.error(`Error fetching link ${params.id}:`, error);
    return json({ error: 'Failed to fetch link' }, { status: 500 });
  }
};

// PATCH /api/links/[id] - Update a specific link
export const PATCH: RequestHandler = async ({ params, request }) => {
  try {
    const linkData = await request.json();
    const updatedLink = await services.updateLink(params.id, linkData);
    
    if (!updatedLink) {
      return json({ error: 'Link not found' }, { status: 404 });
    }
    
    return json(updatedLink);
  } catch (error) {
    console.error(`Error updating link ${params.id}:`, error);
    return json({ error: 'Failed to update link' }, { status: 500 });
  }
};

// DELETE /api/links/[id] - Delete a specific link
export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const success = await services.deleteLink(params.id);
    
    if (!success) {
      return json({ error: 'Failed to delete link' }, { status: 400 });
    }
    
    return json({ success: true });
  } catch (error) {
    console.error(`Error deleting link ${params.id}:`, error);
    return json({ error: 'Failed to delete link' }, { status: 500 });
  }
};