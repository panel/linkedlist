import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as services from '$lib/server/services';

// GET /api/labels/[id]/links - Get all links for a specific label
export const GET: RequestHandler = async ({ params }) => {
  try {
    const links = await services.getLinksByLabel(params.id);
    return json(links);
  } catch (error) {
    console.error(`Error fetching links for label ${params.id}:`, error);
    return json({ error: 'Failed to fetch links for label' }, { status: 500 });
  }
};