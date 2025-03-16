import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as services from '$lib/server/services';

// PUT /api/links/[id]/labels/[labelId] - Add a label to a link
export const PUT: RequestHandler = async ({ params }) => {
  try {
    const success = await services.addLabelToLink(params.id, params.labelId);
    
    if (!success) {
      return json({ error: 'Failed to add label to link' }, { status: 400 });
    }
    
    return json({ success: true });
  } catch (error) {
    console.error(`Error adding label ${params.labelId} to link ${params.id}:`, error);
    return json({ error: 'Failed to add label to link' }, { status: 500 });
  }
};

// DELETE /api/links/[id]/labels/[labelId] - Remove a label from a link
export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const success = await services.removeLabelFromLink(params.id, params.labelId);
    
    if (!success) {
      return json({ error: 'Failed to remove label from link' }, { status: 400 });
    }
    
    return json({ success: true });
  } catch (error) {
    console.error(`Error removing label ${params.labelId} from link ${params.id}:`, error);
    return json({ error: 'Failed to remove label from link' }, { status: 500 });
  }
};