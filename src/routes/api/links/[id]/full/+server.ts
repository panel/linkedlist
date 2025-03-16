import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as services from '$lib/server/services';

// GET /api/links/[id]/full - Get full link details including notes and labels
export const GET: RequestHandler = async ({ params }) => {
  try {
    const link = await services.getFullLink(params.id);
    
    if (!link) {
      return json({ error: 'Link not found' }, { status: 404 });
    }
    
    return json(link);
  } catch (error) {
    console.error(`Error fetching full link ${params.id}:`, error);
    return json({ error: 'Failed to fetch link details' }, { status: 500 });
  }
};